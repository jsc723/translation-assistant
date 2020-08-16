// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import { send } from 'process';
import { start } from 'repl';

/*
(;\\[[a-z0-9]+\\])|((☆|●)[a-z0-9]+(☆|●))|(<\\d+>(?!//))|(//.*\n)
*/
var testreg = /(\/\/[^\n]*\n).*/m;
var testreg = /(<=?<\d>).*/g;
//？！：；…—
//https://blog.csdn.net/yuan892173701/article/details/8731490
/((☆|●)[a-z0-9]+(☆|●))(?=[^\u3000-\u303F\uFF1F\uFF01\uFF1A\uFF1B\u2026\u2014\uFF0C]*\n)/g;
/((☆|●)[a-z0-9]+(☆|●))(?![^\u3000-\u303F\uFF1F\uFF01\uFF1A\uFF1B\u2026\u2014\uFF0C]*\n)/g;

let BASE_URL = "https://jsccsj.com/"

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration("dltxt");
	const translatedPrefixRegex = config.get('translatedTextPrefixRegex');
	
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
		const pStart = curRange.start.with(Math.max(0, curRange.start.line + dn));
		const pEnd = curRange.start.with(Math.max(0, curRange.end.line + dn));
		editor.revealRange(curRange.with(pStart, pEnd));
	};
	let countCharBeforeNewline = function(text: string, startIdx: number) : number{
		let m = 0;
		for (let i = startIdx - 1; i >= 0; i--) {
			if (text[i] === '\n') {
				break;
			} else {
				m++;
			}
		}
		return m;
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
      
			const sStart = editor.selection.start.with(editor.selection.start.line + 1, 0);
			const sEnd = editor.selection.start.with(editor.selection.start.line + 16);
			const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
			
			const idx = searchTxt.search(new RegExp(`(?<=${translatedPrefixRegex}).*`,'m'))
			if (idx >= 0) {
				const startIdx = searchTxt.search(new RegExp(`${translatedPrefixRegex}.*`,'m'));
				let m = countCharBeforeNewline(searchTxt, idx);
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

	function findLastMatchIndex(pattern: RegExp, text: string): number {
		let match: RegExpExecArray | null;
		let cur = text;
		let result = -1;
		while ((match = pattern.exec(cur)) != null) {
			if (result == -1)
				result = match.index;
			else
				result += match.index;
			cur = cur.slice(match.index);
		}
		return result;
	}

	let prevLine = vscode.commands.registerCommand('Extension.dltxt.prev', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor && editor.selection.isEmpty) {
			const startLine = Math.max(0, editor.selection.start.line - 16);
			const endLine = Math.max(0, editor.selection.start.line - 1);
			const sStart = editor.selection.start.with(startLine, 0);
			const sEnd = editor.selection.start.with(endLine, 100);
			const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
			const pattern = new RegExp(`(?<=${translatedPrefixRegex}).*`, 'm');
			let match: RegExpExecArray | null;
			let startIdx = findLastMatchIndex(pattern, searchTxt);
			//const matches = searchTxt.match(new RegExp(`(?<=${translatedPrefixRegex}).*`,'gm'))
			if (startIdx != -1) {
				let m = countCharBeforeNewline(searchTxt, startIdx);
				m += countStartingUnimportantChar(searchTxt, startIdx);
				let n: number = 1;
				for (let i = startIdx; i < searchTxt.length; i++) {
					if (searchTxt[i] === '\n')
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
1. syntax highlight for more format [DONE]
2. let user configure format [DONE]
3. hotkey for all format [DONE]
4. highlight for name
-- v1.0
1. highlight keywords (decoration)
2. codelens for each keyword
-- v1.1
1. auto preprocess based on database
	- update database on load
	- command to preprocess
	- command to force update

	"end" : "((☆|●)\\d+(☆|●)|;\\[0x[0-9a-f]+\\])(.*)",


*/