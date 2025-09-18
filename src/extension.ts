import * as vscode from 'vscode';
import { MemoViewProvider } from './memoViewProvider';

export function activate(context: vscode.ExtensionContext)
{
	console.log('SideNoteAI extension is now active!');

	// Create memo view provider
	const memoViewProvider = new MemoViewProvider(context);
	
	// Register webview view provider
	const webviewProvider = vscode.window.registerWebviewViewProvider(
		'sidenoteAI.memoView',
		memoViewProvider,
		{
			webviewOptions: {
				retainContextWhenHidden: true
			}
		}
	);

	// Register commands
	const openMemoCommand = vscode.commands.registerCommand('sidenoteAI.openMemo', () =>
	{
		memoViewProvider.openMemo();
	});

	const clearMemoCommand = vscode.commands.registerCommand('sidenoteAI.clearMemo', () =>
	{
		memoViewProvider.clearMemo();
	});

	const togglePreviewCommand = vscode.commands.registerCommand('sidenoteAI.togglePreview', () =>
	{
		memoViewProvider.postToWebview({ command: 'togglePreview' });
	});

	const summarizeCommand = vscode.commands.registerCommand('sidenoteAI.openSummarize', () =>
	{
		memoViewProvider.postToWebview({ command: 'openSummarize' });
	});

	const settingsCommand = vscode.commands.registerCommand('sidenoteAI.openSettings', () =>
	{
		memoViewProvider.postToWebview({ command: 'openSettings' });
	});

	// Add to subscriptions
	context.subscriptions.push(
		webviewProvider,
		openMemoCommand,
		clearMemoCommand,
		togglePreviewCommand,
		summarizeCommand,
		settingsCommand
	);
}

export function deactivate()
{}
