/**
 * 애플리케이션 전역 상수 정의
 * - 노트 관련 제한, 기본값 등을 중앙에서 관리
 */

// 노트 관련 상수
export const NOTE_CONSTANTS =
    {
        MAX_NOTES: 10,              // 최대 노트 개수
        DEFAULT_NOTE_NAME: "note",  // 기본 노트 이름
        DEFAULT_CONTENT: "",        // 기본 노트 내용
    } as const;

// UI 관련 상수
export const UI_CONSTANTS =
    {
        DEBOUNCE_DELAY: 500,        // 디바운스 딜레이 (ms)
        CONTEXT_MENU_DEBOUNCE: 150, // 컨텍스트 메뉴 디바운스 (ms)
    } as const;

// 스토리지 키 (workspaceState/globalState)
export const STORAGE_KEYS =
    {
        NOTES_LIST: "sidenoteAI.notes.list",
        CURRENT_NOTE_ID: "sidenoteAI.notes.currentId",
        NOTE_CONTENT_PREFIX: "sidenoteAI.note.content.",
    } as const;

// Secrets 키
export const SECRET_KEYS =
    {
        GEMINI_API_KEY: "sidenoteAI.geminiApiKey",
    } as const;

// 명령어 ID
export const COMMAND_IDS =
    {
        OPEN_MEMO: "sidenoteAI.openMemo",
        CLEAR_MEMO: "sidenoteAI.clearMemo",
        TOGGLE_PREVIEW: "sidenoteAI.togglePreview",
        SUMMARIZE: "sidenoteAI.summarize",
        SETTINGS: "sidenoteAI.settings",
    } as const;

// 뷰 ID
export const VIEW_IDS =
    {
        MEMO_VIEW: "sidenoteAI.memoView",
    } as const;
