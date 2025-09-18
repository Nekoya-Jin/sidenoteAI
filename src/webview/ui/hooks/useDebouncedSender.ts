import { useEffect, useRef } from "react";
import type { VSCodeApi } from "../App";

export function useDebouncedSender(
  vscode: VSCodeApi,
  content: string,
  delay = 300,
) 
{
  const timeoutRef = useRef<any>(null);

  useEffect(() => 
{
    if (timeoutRef.current) 
{
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => 
{
      vscode.postMessage({ command: "updateNote", content });
    }, delay);

    return () => 
{
      if (timeoutRef.current) 
{
        clearTimeout(timeoutRef.current);
      }
    };
  }, [vscode, content, delay]);

  const flush = () => 
{
    if (timeoutRef.current) 
{
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    vscode.postMessage({ command: "updateNote", content });
  };

  return flush;
}
