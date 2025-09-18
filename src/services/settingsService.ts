import * as vscode from 'vscode';

export interface SettingsData
{
  hasApiKey: boolean;
  prompt: string;
  defaultPrompt: string;
}

export class SettingsService
{
  constructor(private context: vscode.ExtensionContext, private readonly defaultPrompt: string)
  {}

  async getSettings(): Promise<SettingsData>
  {
    const apiKey = await this.context.secrets.get('sidenoteAI.geminiApiKey');
    const prompt = this.context.globalState.get<string>('sidenoteAI.prompt', this.defaultPrompt);
    return {
      hasApiKey: !!apiKey,
      prompt,
      defaultPrompt: this.defaultPrompt,
    };
  }

  async saveSettings(apiKey?: string, prompt?: string): Promise<void>
  {
    if (typeof apiKey === 'string' && apiKey.trim().length > 0)
    {
      await this.context.secrets.store('sidenoteAI.geminiApiKey', apiKey.trim());
    }
    if (typeof prompt === 'string')
    {
      await this.context.globalState.update('sidenoteAI.prompt', prompt);
    }
  }

  async resetAll(): Promise<SettingsData>
  {
    // Delete secret
    await this.context.secrets.delete('sidenoteAI.geminiApiKey');

    // Clear all globalState entries starting with 'sidenoteAI'
    const g: any = this.context.globalState as any;
    const allKeys: string[] = typeof g.keys === 'function' ? g.keys() : [];
    if (Array.isArray(allKeys) && allKeys.length)
    {
      for (const key of allKeys)
      {
        if (typeof key === 'string' && key.startsWith('sidenoteAI'))
        {
          await this.context.globalState.update(key, undefined);
        }
      }
    }
    else
    {
      await this.context.globalState.update('sidenoteAI.prompt', undefined);
    }

    return {
      hasApiKey: false,
      prompt: this.defaultPrompt,
      defaultPrompt: this.defaultPrompt,
    };
  }

  // New: delete only the API key, preserve prompt
  async resetApiKey(): Promise<SettingsData>
  {
    await this.context.secrets.delete('sidenoteAI.geminiApiKey');
    const prompt = this.context.globalState.get<string>('sidenoteAI.prompt', this.defaultPrompt);
    return {
      hasApiKey: false,
      prompt,
      defaultPrompt: this.defaultPrompt,
    };
  }
}
