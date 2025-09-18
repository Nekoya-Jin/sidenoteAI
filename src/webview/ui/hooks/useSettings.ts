import { useState } from "react";
import { useMessageBus } from "./useMessageBus";
import type { VSCodeApi } from "../App";

export type SettingsState = {
  hasApiKey: boolean;
  prompt: string;
  defaultPrompt: string;
};

export function useSettings(vscode: VSCodeApi) 
{
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useMessageBus(vscode, {
    openSettings: () => 
{
      setShowSettings(true);
      vscode.postMessage({ command: "getSettings" });
    },
    settingsData: (m) => 
{
      const data = m.data ?? null;
      setSettings(data);
      setApiKeyInput("");
    },
    settingsSaved: () => 
{
      setSavingSettings(false);
      vscode.postMessage({ command: "getSettings" });
      setApiKeyInput("");
    },
  });

  const onClose = () => setShowSettings(false);
  const onReset = () => vscode.postMessage({ command: "resetApiKey" });
  const onSave = () => 
{
    setSavingSettings(true);
    vscode.postMessage({ command: "saveSettings", apiKey: apiKeyInput });
  };

  return {
    showSettings,
    settings,
    apiKeyInput,
    setApiKeyInput,
    savingSettings,
    onClose,
    onReset,
    onSave,
  } as const;
}
