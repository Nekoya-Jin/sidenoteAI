import * as vscode from 'vscode';
import { MemoViewProvider } from './memoViewProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('SideMemo extension is now active!');

	// Create memo view provider
	const memoViewProvider = new MemoViewProvider(context);
	
	// Register webview view provider
	const webviewProvider = vscode.window.registerWebviewViewProvider(
		'sidememo.memoView',
		memoViewProvider,
		{
			webviewOptions: {
				retainContextWhenHidden: true
			}
		}
	);

	// Register commands
	const openMemoCommand = vscode.commands.registerCommand('sidememo.openMemo', () => {
		memoViewProvider.openMemo();
	});

	const clearMemoCommand = vscode.commands.registerCommand('sidememo.clearMemo', () => {
		memoViewProvider.clearMemo();
	});

	const togglePreviewCommand = vscode.commands.registerCommand('sidememo.togglePreview', () => {
		memoViewProvider.postToWebview({ command: 'togglePreview' });
	});

	const summarizeCommand = vscode.commands.registerCommand('sidememo.openSummarize', () => {
		memoViewProvider.postToWebview({ command: 'openSummarize' });
	});

	const settingsCommand = vscode.commands.registerCommand('sidememo.openSettings', () => {
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

export function deactivate() {}
