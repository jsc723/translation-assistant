// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
var open = require('open');
import {
	findLastMatchIndex,
	countCharBeforeNewline,
	countStartingUnimportantChar,
	setCursorAndScroll
} from './utils';
import * as fs from "fs"; 
import * as path from "path";
import { formatter, copyOriginalToTranslation } from "./formatter";
/*
(;\\[[a-z0-9]+\\])|((☆|●)[a-z0-9]+(☆|●))|(<\\d+>(?!//))|(//.*\n)
*/
//？！：；…—
//https://blog.csdn.net/yuan892173701/article/details/8731490
//https://gist.github.com/ryanmcgrath/982242
// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	let timeout: NodeJS.Timer | undefined = undefined;

	// create a decorator type that we use to decorate small numbers
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
	});

	// create a decorator type that we use to decorate large numbers
	const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		// use a themable color. See package.json for the declaration and default values.
		backgroundColor: { id: 'myextension.largeNumberBackground' }
	});

	let activeEditor = vscode.window.activeTextEditor;
	const configInit = vscode.workspace.getConfiguration("dltxt");
	const translatedPrefixRegex = configInit.get('core.translatedTextPrefixRegex');
	
	function updateDecorations() {
		const config = vscode.workspace.getConfiguration("dltxt");
		if (!config.get('appearance.showKeywordHighlight'))
			return;
		const game : string | undefined = context.workspaceState.get('game');
		if (!activeEditor || !game) {
			return;
		}
		const keywords = context.workspaceState.get(`${game}.dict`) as Array<any>;
		const testArray: Array<String> = [];
		for (let i = 0; i < keywords.length; i++) {
			let v = keywords[i];
			let vr = v['raw'];
			if(vr)
				testArray.push(vr);
		}
		const regStr = testArray.join('|')
		if (!regStr)
			return
		const regEx = new RegExp(regStr, "g");
		let dict = new Map<String, string>();
		keywords.forEach(v => {
			dict.set(v['raw'], v['translate']);
		});
		const text = activeEditor.document.getText();
		const keywordsDecos: vscode.DecorationOptions[] = [];
		let match;
		while (keywordsDecos.length < 10000 && (match = regEx.exec(text))) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = {
				range: new vscode.Range(startPos, endPos),
				hoverMessage: dict.get(match[0]),
				renderOptions: {
					// after: {
					// 	contentText: ""
					// }
				}
			};
			keywordsDecos.push(decoration);
		}
		activeEditor.setDecorations(largeNumberDecorationType, keywordsDecos);
	}

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}
	setInterval(() => {
		if (vscode.window.activeTextEditor && context.workspaceState.get('game')) {
			vscode.commands.executeCommand('Extension.dltxt.sync_database');
		}
	}, 1000);

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	let syncDatabaseCommand = vscode.commands.registerCommand('Extension.dltxt.sync_database', function () {
		const config = vscode.workspace.getConfiguration("dltxt");
		const username: string = config.get("simpleTM.username") as string;
		const apiToken: string = config.get("simpleTM.apiToken") as string;
		if (!username || !apiToken) {
			return;
		}
		const BASE_URL = config.get('simpleTM.remoteHost');
		let GameTitle: string = context.workspaceState.get("game") as string;
		if (!GameTitle) {
			vscode.commands.executeCommand('Extension.dltxt.setGame');
			GameTitle = context.workspaceState.get("game") as string;
		}
		if (GameTitle) {
			let fullURL = BASE_URL + "/api/querybygame/" + GameTitle;
			axios.get(fullURL, {
				auth: {
					username: username, password: apiToken
				}
			}).then(result => {
				console.log(result);
				if (result) {
					context.workspaceState.update(`${GameTitle}.dict`, result.data);
					updateDecorations();
				}
			});
		}
	});
	
	let newContextMenu_Insert = vscode.commands.registerCommand('Extension.dltxt.context_menu_insert', function () {
		const config = vscode.workspace.getConfiguration("dltxt");
		const username: string = config.get("simpleTM.username") as string;
		const apiToken: string = config.get("simpleTM.apiToken") as string;
		if (!username || !apiToken) {
			vscode.window.showErrorMessage("请在设置中填写账号与API Token后再使用同步功能");
			return;
		}
		const BASE_URL = config.get('simpleTM.remoteHost');
		let GameTitle: string = context.workspaceState.get("game") as string;
		vscode.window.showInputBox({ placeHolder: '(' + GameTitle + ')输入翻译文本' })
			.then((translate: string | undefined) => {
				let editor = vscode.window.activeTextEditor;
				if (editor && !editor.selection.isEmpty) {
					const raw_text = editor.document.getText(editor.selection);
					var msg = raw_text + "->" + translate;
					const API_Query: string = BASE_URL + "/api/insert";
					let fullURL = API_Query + "/" + GameTitle + "/" + raw_text + "/" + translate;
					fullURL = encodeURI(fullURL);
					axios.get(fullURL, {
						auth: {
							username: username, password: apiToken
						}
					}).then(response => {
							if (response.data.Result === 'True') {
								vscode.window.showInformationMessage("Insert Success!\n" + msg);
							}
							else
								vscode.window.showInformationMessage("unexpected json returned:\n" + response.data.Message);
						})
						.catch(error => {
							vscode.window.showInformationMessage("unexpected error:\n" + error);
						});
					} 
			})
	});
	let newContextMenu_Update = vscode.commands.registerCommand('Extension.dltxt.context_menu_update',　function () {
		const config = vscode.workspace.getConfiguration("dltxt");
		const username: string = config.get("simpleTM.username") as string;
		const apiToken: string = config.get("simpleTM.apiToken") as string;
		if (!username || !apiToken) {
			vscode.window.showErrorMessage("请在设置中填写账号与API Token后再使用同步功能");
			return;
		}
		const BASE_URL = config.get('simpleTM.remoteHost');
		let GameTitle: string = context.workspaceState.get("game") as string;
		vscode.window.showInputBox({ placeHolder: '(' + GameTitle + ')输入翻译文本' })
			.then((translate: string | undefined) => {
				let editor = vscode.window.activeTextEditor;
				if (editor && !editor.selection.isEmpty) {
					const raw_text = editor.document.getText(editor.selection);
					var msg = raw_text + "->" + translate;
					const API_Query: string = BASE_URL + "/api/update";
					let fullURL = API_Query + "/" + GameTitle + "/" + raw_text + "/" + translate;
					fullURL = encodeURI(fullURL);
					axios.get(fullURL, {
						auth: {
							username: username, password: apiToken
						}
					}).then(response => {
							if (response.data.Result === 'True')
								vscode.window.showInformationMessage("Update Success!\n" + msg);
							else
								vscode.window.showInformationMessage("unexpected json returned:\n" + response.data.Message);
						})
						.catch(error => {
							vscode.window.showInformationMessage("unexpected error:\n" + error);
						});
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
			});
	});

	let dlEditor: vscode.TextEditor | undefined = undefined;
	let extractSingleline = vscode.commands.registerCommand('Extension.dltxt.extract_single_line', () => {
		console.log('extract single line');
		const document = vscode.window.activeTextEditor?.document;
		if (!document) return;
		const filePath: string = vscode.window.activeTextEditor?.document.uri.fsPath as string;
		if (!filePath) return;
		let prefixRegStr = translatedPrefixRegex;
		vscode.window.showInputBox({ placeHolder: '输入译文行首的正则表达式，如不输入则默认使用设置文件中的值' })
			.then(val => {
				if (val) {
					prefixRegStr = val;
				}
			})
			.then(() => {
				if (!prefixRegStr) {
					vscode.window.showErrorMessage('请提供译文行首的正则表达式');
					return;
				}
				const dirPath = path.dirname(filePath);
				const fileName = path.basename(filePath);
				const tempDirPath = dirPath + '\\.dltxt'
				if (!fs.existsSync(tempDirPath)) {
					fs.mkdirSync(tempDirPath);
				}
				const lines = [];
				const prefixReg = new RegExp(`^${prefixRegStr}` as string);
				for (let i = 0; i < document.lineCount; i++) {
					const line = document.lineAt(i).text;
					if (prefixReg.test(line))
						lines.push(line);
				}
				const slFilePath = tempDirPath + '\\' + fileName + '.sl';
				const refFilePath = tempDirPath + '\\' + fileName + '.ref';
				const data = lines.join('\r\n');
				fs.writeFileSync(slFilePath, data);
				fs.writeFileSync(refFilePath, prefixRegStr);
				let setting: vscode.Uri = vscode.Uri.file(slFilePath);
				dlEditor = vscode.window.activeTextEditor;
				vscode.workspace.openTextDocument(setting)
					.then((d: vscode.TextDocument) => {
						vscode.window.showTextDocument(d, vscode.ViewColumn.Beside, false);
					}, (err) => {
						console.error(err);
					});
			});
		
	});
	
	let mergeIntoDoubleLine = vscode.commands.registerCommand('Extension.dltxt.merge_into_double_line', async function(){
		if (!vscode.window.activeTextEditor) {
			vscode.window.showErrorMessage('请先选中需要更改的双行文本');
			return;
		}
		let curFilePath: string = vscode.window.activeTextEditor?.document.uri.fsPath as string;
		let dlFilePath: string;
		let slFilePath: string;
		let refFilePath: string;
		const m = curFilePath.match(/(.*)\.dltxt\\(.*)\.sl/);
		if (m) { //sl
			dlFilePath = m[1] + m[2];
			slFilePath = curFilePath;
			if (!dlEditor || !dlEditor?.document)
			{
				vscode.window.showErrorMessage('请先选中需要更改的双行文本');
				return;
			}
			await vscode.window.activeTextEditor.document.save();
			refFilePath = `${m[1]}.dltxt\\${m[2]}.ref`;
		} else { //dl
			dlFilePath = curFilePath;
			let dirPath = path.dirname(curFilePath);
			const dlFileName = path.basename(curFilePath);
			const tempDirPath = dirPath + '\\.dltxt';
			slFilePath = tempDirPath + '\\' + dlFileName + '.sl';
			if (fs.existsSync(slFilePath)) {
				dlEditor = vscode.window.activeTextEditor;
				refFilePath = tempDirPath + '\\' + dlFileName + '.ref';
			} else {
				vscode.window.showErrorMessage('请先提取译文');
				return;
			}
			let slDocument = await vscode.workspace.openTextDocument(slFilePath);
			await slDocument.save();
		}
		let prefixRegStr: string;
		try {
		  prefixRegStr = fs.readFileSync(refFilePath, 'utf8') as string;
			if (!prefixRegStr)
				throw new Error();
		} catch {
			vscode.window.showErrorMessage('译文提取时的信息被删除，请重新提取');
			return;
		}
		const prefixReg = new RegExp(`^(${prefixRegStr})`);
		const replacedLines = fs.readFileSync(slFilePath, 'utf8').split(/\r?\n/);
		let dlDocument = dlEditor.document;
		dlEditor?.edit(editBuilder => {
			let j = 0;
			for (let i = 0; i < dlDocument.lineCount; i++) {
				const line = dlDocument.lineAt(i);
				if (prefixReg.test(line.text)) {
					editBuilder.replace(line.range, replacedLines[j++]);
				}
			}
		});
	});

	let copyOriginalCmd = vscode.commands.registerCommand('Extension.dltxt.copy_original', () => {
		const editor = vscode.window.activeTextEditor;
		const document = editor?.document;
		if (!editor || !document) {
			vscode.window.showErrorMessage('请先选中需要更改的双行文本');
			return;
		}
		editor.edit(editBuilder => {
			copyOriginalToTranslation(context, document, editBuilder);
		});
	});

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

	let searchWord1 = vscode.commands.registerCommand('Extension.dltxt.searchWord1', () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor || !editor.selection)
			return;
		let word = editor.document.getText(editor.selection);
		const config = vscode.workspace.getConfiguration("dltxt.query");
		let base_url = config.get("search1");
		open(`${base_url}${encodeURI(word)}`);
	});
	let searchWord2 = vscode.commands.registerCommand('Extension.dltxt.searchWord2', () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor || !editor.selection)
			return;
		let word = editor.document.getText(editor.selection);
		const config = vscode.workspace.getConfiguration("dltxt.query");
		let base_url = config.get("search2");
		open(`${base_url}${encodeURI(word)}`);
	});

	context.subscriptions.push(
		syncDatabaseCommand,
		newContextMenu_Insert,
		newContextMenu_Update,
		setGame,
		nextLine,
		prevLine,
		copyOriginalCmd,
		mergeIntoDoubleLine,
		extractSingleline,
		searchWord1,
		searchWord2
	);
	vscode.languages.registerDocumentFormattingEditProvider('dltxt', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			return formatter(context, document);
		}
	});
	vscode.commands.executeCommand('Extension.dltxt.sync_database');

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
4. highlight for name [DONE]
-- v1.0
1. highlight keywords [DONE]
	- highlight and hover [DONE]
	- switch highlight off [DONE]
2. backend [DONE]
	- login 
	- delete
	- database:
		user table (*id, name, password_hash),
		game table (*game id, %owner id, game title), 
		term table (*game id, *term id, raw, translate) 
		permission (*user id, *game id, permission level (read, write, admin))
3. Chinese Readme [DONE]
4. auto scroll to middle on hotkey [DONE]
5. update request format to fit remote update [DONE]
-- v2.0
- Auto format (configurable)
 -　... -> …… [DONE]
 -　引号 []
 -　半角－＞全角 [DONE]
 -　文本末尾句号 [DONE]
 -　破折号 [DONE]
 -　波浪号 [DONE]
-- v2.1
 - 右键菜单 [DONE]
 - 优化提取、应用译文功能[DONE]
-- v2.2
 - 查词
-- v2.3
 - 浅色主题
 - 测试正则表达式




*/