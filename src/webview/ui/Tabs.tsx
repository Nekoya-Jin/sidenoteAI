import React, { useEffect, useRef, useState } from "react";
import { NOTE_CONSTANTS } from "../constants";

/*
  Tabs 컴포넌트
  - 역할: 노트 탭 목록 표시, 컨텍스트 메뉴(우클릭) 처리, 탭 이름 변경(인라인 편집) 제공
  - 핵심 포인트:
    1) 우클릭 메뉴 Rename 클릭 시 포커스/이벤트 순서 문제로 인해 입력창이 즉시 blur 되는 현상을 방지해야 함
       - onMouseDown에서 기본 동작/전파를 막아 메뉴 아이템이 포커스를 빼앗지 않게 함
       - 메뉴를 닫은 뒤 setTimeout(0) → blur → requestAnimationFrame 순서로 rename 시작을 지연시켜 안전하게 입력창을 표시
    2) rename 입력창이 렌더링된 직후 ref로 focus/select를 보장
    3) Enter/blur 시 저장, Escape 시 취소. blur와 Enter가 동시에 들어올 수 있어 commitLockRef로 중복 실행 방지
    4) 탭 더블클릭으로도 인라인 rename 시작 지원
*/

type Note = { id: string; name: string };

// Tabs에서 부모로부터 받는 콜백들: 노트 생성/전환/이름변경/삭제
// notes: 노트 목록, currentNoteId: 현재 활성 노트 ID
// onRename에서는 실제 이름 저장 로직(확장 호스트로 postMessage 등)을 수행함

type Props = {
  notes: Note[];
  currentNoteId: string;
  onAdd: () => void;
  onSwitch: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function Tabs({
  notes,
  currentNoteId,
  onAdd,
  onSwitch,
  onRename,
  onDelete,
}: Props) 
{
  // 컨텍스트 메뉴 상태: 열림 여부/좌표/타깃 탭 ID
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [targetId, setTargetId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 인라인 rename 편집 상태: 어떤 탭을 수정 중인지(id)와 임시 입력값(tempName)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  // 우클릭 오픈 디바운스용(동일 이벤트 중복 방지)
  const lastOpenRef = useRef<number>(0);

  // blur와 Enter가 동시에 오는 경우를 대비해 커밋 중복 실행 방지
  const commitLockRef = useRef(false);

  // 입력창 포커스를 명확히 보장하기 위한 ref
  const editingInputRef = useRef<HTMLInputElement | null>(null);

  // editingId가 설정되면 다음 프레임에 입력창에 포커스 및 전체 선택
  useEffect(() => 
{
    if (editingId) 
{
      requestAnimationFrame(() => 
{
        const el = editingInputRef.current;
        if (el) 
{
          el.focus();
          el.select();
        }
      });
    }
  }, [editingId]);

  // 컨텍스트 메뉴를 주어진 좌표(x,y)에 열고, 대상 탭 ID를 기록
  // 동일 이벤트에서 중복 호출되는 것을 lastOpenRef로 간단히 디바운스
  const openMenuAt = (id: string, x: number, y: number) => 
{
    const now = Date.now();
    if (now - lastOpenRef.current < 150) 
{
      return;
    } // 중복 이벤트 디바운스
    lastOpenRef.current = now;
    setTargetId(id);
    setMenuPos({ x, y });
    setMenuOpen(true);
  };

  // 기본 우클릭(contextmenu) 이벤트를 가로채어 우리 메뉴를 표시
  useEffect(() => 
{
    const el = containerRef.current;
    if (!el) 
{
      return;
    }

    const onCtx = (e: MouseEvent) => 
{
      const target = e.target as HTMLElement | null;
      const tabBtn = target?.closest?.(
        "button[data-id]",
      ) as HTMLButtonElement | null;
      if (!tabBtn) 
{
        return;
      }
      e.preventDefault(); // 브라우저 기본 컨텍스트 메뉴 차단
      const id = tabBtn.getAttribute("data-id");
      if (!id) 
{
        return;
      }
      openMenuAt(id, e.clientX, e.clientY);
    };

    el.addEventListener("contextmenu", onCtx, true);

    return () => 
{
      el.removeEventListener("contextmenu", onCtx, true);
    };
  }, []);

  // 일부 환경에서 contextmenu가 동작하지 않는 경우를 대비한 우클릭(mousedown button=2) 폴백 처리
  useEffect(() => 
{
    const el = containerRef.current;
    if (!el) 
{
      return;
    }

    const onMouseDown = (e: MouseEvent) => 
{
      if (e.button !== 2) 
{
        // 오른쪽 버튼만 처리
        return;
      }
      const target = e.target as HTMLElement | null;
      const tabBtn = target?.closest?.(
        "button[data-id]",
      ) as HTMLButtonElement | null;
      if (!tabBtn) 
{
        return;
      }
      e.preventDefault(); // 기본 동작 취소(필요한 경우)
      const id = tabBtn.getAttribute("data-id");
      if (!id) 
{
        return;
      }
      openMenuAt(id, e.clientX, e.clientY);
    };

    el.addEventListener("mousedown", onMouseDown, true);

    return () => 
{
      el.removeEventListener("mousedown", onMouseDown, true);
    };
  }, []);

  // 메뉴 외부 클릭 또는 ESC로 메뉴 닫기
  useEffect(() => 
{
    const onDocClick = (e: MouseEvent) => 
{
      if (!menuOpen) 
{
        return;
      }
      if (menuRef.current && menuRef.current.contains(e.target as any)) 
{
        return;
      } // 메뉴 내부 클릭은 무시
      setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => 
{
      if (e.key === "Escape") 
{
        setMenuOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKeyDown);
    return () => 
{
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // rename 시작: 편집 대상 ID와 현재 이름을 세팅해 인라인 입력창을 나타나게 함
  const startRename = (id: string, current: string) => 
{
    setEditingId(id);
    setTempName(current);
  };

  // rename 확정: Enter/blur에서 호출. 공백 제거 후 기존 이름과 다를 때만 onRename 호출
  // blur와 Enter가 동시에 올 수 있어 commitLockRef로 중복 호출을 방지
  const commitRename = (id: string, originalName: string) => 
{
    if (commitLockRef.current) 
{
      return; // 이미 커밋 처리 중이면 무시
    }
    commitLockRef.current = true;
    const name = (tempName ?? "").trim();
    setEditingId(null);
    if (name && name !== originalName) 
{
      onRename(id, name);
    }
    // 바로 락을 풀면 blur와 Enter가 연달아 들어왔을 때 중복 실행 위험이 있어
    // 다음 틱(setTimeout 0) 이후에 해제
    setTimeout(() => 
{
      commitLockRef.current = false;
    }, 0);
  };

  // rename 취소: 입력창 닫기
  const cancelRename = () => 
{
    setEditingId(null);
  };

  // 삭제 가능 여부(노트가 2개 이상일 때만 삭제 허용), 최대 노트 수 제한
  const canDelete = notes.length > 1;
  const maxReached = notes.length >= NOTE_CONSTANTS.MAX_NOTES;

  return (
    <div
      ref={containerRef}
      className="tabs-list"
      id="notesTabs"
      style={{ position: "relative" }}
    >
      {notes.map((n) => (
        <div key={n.id} style={{ display: "inline-block" }}>
          {editingId === n.id ? (
            // 인라인 이름 편집 입력창: 변경 시 tempName 갱신, Enter/blur로 확정, ESC로 취소
            <input
              ref={editingInputRef}
              className="tab-rename-input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => commitRename(n.id, n.name)}
              onKeyDown={(e) => 
{
                if (e.key === "Enter") 
{
                  commitRename(n.id, n.name);
                }
                else if (e.key === "Escape") 
{
                  cancelRename();
                }
              }}
              style={{
                width: Math.max(60, ((tempName || n.name).length + 2) * 8),
              }}
              autoFocus
            />
          ) : (
            // 일반 탭 버튼: 클릭 시 해당 노트로 전환, 더블클릭 시 이름 변경 시작
            <button
              className={"tab-btn" + (n.id === currentNoteId ? " active" : "")}
              onClick={() => onSwitch(n.id)}
              onDoubleClick={(e) => 
{
                e.preventDefault();
                // 더블클릭 시 즉시 인라인 rename 시작
                startRename(n.id, n.name);
              }}
              data-id={n.id}
              title={n.name}
            >
              {n.name}
            </button>
          )}
        </div>
      ))}

      {!maxReached && (
        // 최대 노트 개수에 도달하지 않았을 때만 추가 버튼 노출
        <button
          id="addNoteBtn"
          className="toolbar-btn"
          title="Add Note"
          onClick={onAdd}
        >
          +
        </button>
      )}

      {menuOpen && (
        // 컨텍스트 메뉴: 메뉴 내부 클릭은 버블링 차단, 브라우저 기본 컨텍스트 메뉴도 차단
        <div
          ref={menuRef}
          className="context-menu"
          style={{
            position: "fixed",
            left: menuPos.x,
            top: menuPos.y,
            display: "block",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="context-menu-item"
            // 메뉴 항목이 포커스를 가져가 입력창이 즉시 blur되는 문제 방지를 위해 mousedown에서 기본 동작 차단
            onMouseDown={(e) => 
{
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => 
{
              const id = targetId;
              if (!id) 
{
                return;
              }
              const current = notes.find((n) => n.id === id)?.name ?? "";
              setMenuOpen(false);
              // 메뉴가 언마운트되고 클릭 사이클이 완전히 끝난 다음 rename을 시작
              // setTimeout(0) → 현재 활성 요소 blur → 다음 프레임에 startRename
              setTimeout(() => 
{
                (document.activeElement as HTMLElement | null)?.blur?.();
                requestAnimationFrame(() => startRename(id, current));
              }, 0);
            }}
          >
            Rename
          </div>
          {canDelete && (
            <div
              className="context-menu-item"
              onClick={() => 
{
                const id = targetId;
                setMenuOpen(false);
                if (id) 
{
                  onDelete(id);
                }
              }}
            >
              Delete
            </div>
          )}
        </div>
      )}
    </div>
  );
}
