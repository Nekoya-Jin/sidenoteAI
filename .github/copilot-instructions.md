<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Overview
SideMemo is a VS Code extension that provides a sidebar memo functionality with markdown support.

## Key Features
- Sidebar memo view with markdown editor
- Real-time preview mode
- Auto-save functionality
- Project-specific memo storage
- Clean, VS Code-themed UI

## Architecture
- Main extension file: `src/extension.ts`
- Webview provider: `src/memoViewProvider.ts`
- Frontend assets: `media/` directory
- Configuration: `package.json` with views and commands contribution

## Development Guidelines
- Follow VS Code extension best practices
- Use TypeScript for type safety
- Maintain VS Code theme compatibility
- Handle null checks for DOM elements
- Use proper disposal patterns for resources
