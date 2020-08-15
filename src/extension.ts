// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import { send } from 'process';

let BASE_URL = "https://jsccsj.com/"

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	// vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
	// 	e.contentChanges.forEach((value) => {
	// 		console.log(value);
	// 	})
	// 	console.log(e.document.fileName);
	// })

	let newContextMenu_Insert = vscode.commands.registerCommand('Extension.dltxt.context_menu_insert', function () {
		let GameTitle: string = context.workspaceState.get("game") as string
		vscode.window.showInputBox({ placeHolder: '(' + GameTitle + ')输入翻译文本' })
			.then((translate: string | undefined) => {
				let editor = vscode.window.activeTextEditor;
				if (editor && !editor.selection.isEmpty) {
					const raw_text = editor.document.getText(editor.selection);
					var msg = raw_text + "->" + translate;
					const API_Query: string = BASE_URL + "api/insert";
					let fullURL = API_Query + "/" + raw_text + "/" + translate + "/" + GameTitle;
					fullURL = encodeURI(fullURL);
					axios.get(fullURL)
						.then(response => {
							if (response.data.Result === 'True')
								vscode.window.showInformationMessage("Insert Success!\n" + msg);
							else
								vscode.window.showInformationMessage("unexpected json returned:\n" + response.data.Message);
						})
						.catch(error => {
							vscode.window.showInformationMessage("unexpected error:\n" + error);
						})
				}
			})
	});
	let newContextMenu_Update = vscode.commands.registerCommand('Extension.dltxt.context_menu_update',　function () {
		let GameTitle: string = context.workspaceState.get("game") as string
		vscode.window.showInputBox({ placeHolder: '(' + GameTitle + ')输入翻译文本' })
			.then((translate: string | undefined) => {
				let editor = vscode.window.activeTextEditor;
				// editor?.edit((editBuilder: vscode.TextEditorEdit) => {
				// 	if(editor)
				// 		editBuilder.insert(editor.selection.active, "aaa");
				// })
				if (editor && !editor.selection.isEmpty) {
					const raw_text = editor.document.getText(editor.selection);
					var msg = raw_text + "->" + translate;
					const API_Query: string =  BASE_URL + "api/update";
					let fullURL = API_Query + "/" + raw_text + "/" + translate + "/" + GameTitle;
					fullURL = encodeURI(fullURL);
					axios.get(fullURL)
						.then(response => {
							if (response.data.Result === 'True')
								vscode.window.showInformationMessage("Update Success!\n" + msg);
							else
								vscode.window.showInformationMessage("unexpected json returned:\n" + response.data.Message);
						})
						.catch(error => {
							vscode.window.showInformationMessage("unexpected error:\n" + error);
						})
				}
			})
	});
	let setGame = vscode.commands.registerCommand('Extension.dltxt.setGame', () => {
		vscode.window.showInputBox({ placeHolder: '输入游戏名' })
			.then((value: string | undefined) => {
				if (value === undefined) {
					value = ""
				}
				context.workspaceState.update("game", value);
			})
	});
	let setCursorAndScroll = (editor: vscode.TextEditor, dn: number, m: number) => {
		const position = editor.selection.active;
		const newPosition = position.with(position.line + dn, m);
		editor.selection = new vscode.Selection(newPosition, newPosition);
		const curRange = editor.visibleRanges[0];
		const pStart = curRange.start.with(curRange.start.line + dn);
		const pEnd = curRange.start.with(curRange.end.line + dn);
		editor.revealRange(curRange.with(pStart, pEnd));
	};
	const dictionary = new Set();
	dictionary.add(" ").add("\t").add("　").add("「").add("『");
	let countStartingUnimportantChar = (txt: string, start: number) => {
		let n = 0;
		for (let i = start; i < txt.length; i++) {
			if (dictionary.has(txt[i]))
				n++;
			else
				break;
		}
		return n;
	};
	let nextLine = vscode.commands.registerCommand('Extension.dltxt.next', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.selection.isEmpty) {
      
			const sStart = editor.selection.start.with(editor.selection.start.line + 1);
			const sEnd = editor.selection.start.with(editor.selection.start.line + 16);
			const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
			
			const idx = searchTxt.search(/(?<=☆[a-z0-9]+☆).*/i);
			if (idx >= 0) {
				const startIdx = searchTxt.search(/☆[a-z0-9]+☆/i);
				let m = idx - startIdx;
				m += countStartingUnimportantChar(searchTxt, idx);
				let n: number = 1;
				for (let i = 0; i < idx; i++) {
					if (searchTxt[i] == '\n')
						n++;
				}
				setCursorAndScroll(editor, n, m);
			}
    }
	});

	let prevLine = vscode.commands.registerCommand('Extension.dltxt.prev', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor && editor.selection.isEmpty) {
			const startLine = Math.max(0, editor.selection.start.line - 16);
			const endLine = Math.max(0, editor.selection.start.line - 1);
			const sStart = editor.selection.start.with(startLine, 0);
			const sEnd = editor.selection.start.with(endLine, 100);
			const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
			const matches = searchTxt.match(/☆[a-z0-9]+☆.*/g)
			if (matches && matches.length > 0) {
				const last : string = matches.pop() as string;
				const startIdx = searchTxt.search(last);
				let m = searchTxt.slice(startIdx).search(/(?<=☆[a-z0-9]+☆).*/i);
				m += countStartingUnimportantChar(searchTxt, startIdx + m);
				let n: number = 1;
				for (let i = startIdx; i < searchTxt.length; i++) {
					if (searchTxt[i] == '\n')
						n++;
				}
				setCursorAndScroll(editor, -n, m);
			}
		}
		
	});

	context.subscriptions.push(
		newContextMenu_Insert,
		newContextMenu_Update,
		setGame,
		nextLine,
		prevLine
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }

/*
TODO:
-- v0.1
1. key-binding to next position to edit [DONE]
2. highlight for other format [DONE]
-- v0.2
1. partial replace
2. auto preprocess based on database
	- update database on load
	- command to preprocess
	- command to force update

*/