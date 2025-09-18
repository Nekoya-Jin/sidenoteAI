import { useEffect, useRef } from "react";
import type { VSCodeApi } from "../App";

export function useMessageBus(
  vscode: VSCodeApi,
  handlers: Record<string, (m: any) => void>,
) 
{
  const handlersRef = useRef(handlers);

  // Keep latest handlers in a ref
  useEffect(() => 
{
    handlersRef.current = handlers;
  }, [handlers]);

  // Subscribe once
  useEffect(() => 
{
    const onMessage = (event: MessageEvent) => 
{
      const m = (event?.data ?? {}) as any;
      const cmd = m?.command;
      if (!cmd) 
{
        return;
      }
      const handler = handlersRef.current[cmd];
      if (handler) 
{
        handler(m);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [vscode]);
}
