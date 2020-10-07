import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import * as utils from './utils';

const configInit = vscode.workspace.getConfiguration("dltxt");
const translatedPrefixRegex = configInit.get('core.translatedTextPrefixRegex');
const INT_MAX = Number.MAX_SAFE_INTEGER;

export function getCurrentLine() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document)
    return "";
  const position = editor.selection.active;
  if (!position)
    return "";
  return editor.document.getText(
    new vscode.Range(
      new vscode.Position(position.line, 0),
      position
    )
  );
}

export function nextLine() {
  const editor = vscode.window.activeTextEditor;
    if (editor && editor.selection.isEmpty) {
			const sStart = editor.selection.start.with(editor.selection.start.line + 1, 0);
			const sEnd = editor.selection.start.with(editor.selection.start.line + 16);
			const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
			
			const idx = searchTxt.search(new RegExp(`(?<=${translatedPrefixRegex}).*`,'m'))
			if (idx >= 0) {
				let m = utils.countCharBeforeNewline(searchTxt, idx);
				m += utils.countStartingUnimportantChar(searchTxt, idx);
        let n = utils.countLineUntil(searchTxt, idx);
				utils.setCursorAndScroll(editor, n, m);
			}
    }
}


export function prevLine() {
  const editor = vscode.window.activeTextEditor;
		if (editor && editor.selection.isEmpty) {
			const startLine = Math.max(0, editor.selection.start.line - 16);
			const endLine = Math.max(0, editor.selection.start.line - 1);
			const sStart = editor.selection.start.with(startLine, 0);
			const sEnd = editor.selection.start.with(endLine, 100);
			const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
			const pattern = new RegExp(`(?<=${translatedPrefixRegex}).*`, 'm');
			let startIdx = utils.findLastMatchIndex(pattern, searchTxt);
			if (startIdx != -1) {
				let m = utils.countCharBeforeNewline(searchTxt, startIdx);
				m += utils.countStartingUnimportantChar(searchTxt, startIdx);
        let n = utils.countLineFrom(searchTxt, startIdx);
				utils.setCursorAndScroll(editor, -n, m);
			}
		}
}

const skipChars = new Set<string>();
skipChars.add(" ").add("\t").add("　");

export function moveToNextLine() {
  const editor = vscode.window.activeTextEditor;
  if (!editor)
    return;
  const pattern = new RegExp(`(?<=${translatedPrefixRegex}).*`, 'm');
  const curLine = getCurrentLine();
  if (curLine.search(pattern) == -1)
    return;
  const sStart = editor.selection.start.with(editor.selection.start.line + 1, 0);
  const sEnd = editor.selection.start.with(editor.selection.start.line + 16);
  const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
  
  const idx = searchTxt.search(pattern);
  if (idx >= 0) {
    let m = utils.countCharBeforeNewline(searchTxt, idx);
    m += utils.countStartingUnimportantChar(searchTxt, idx, skipChars);
    let n = utils.countLineUntil(searchTxt, idx);
    const position = editor.selection.active;
    const toMove = new vscode.Range(
      position.with(position.line, position.character),
      position.with(position.line, INT_MAX))
    const toInsert = new vscode.Position(
      position.line + n, m
    );
    let sline = editor.document.getText(toMove);
    editor.edit((editbuilder) => {
      editbuilder.delete(toMove);
      editbuilder.insert(toInsert, sline);
    });
  }
}

export function moveToPrevLine() {
  const editor = vscode.window.activeTextEditor;
  if (!editor)
    return;
    const startLine = Math.max(0, editor.selection.start.line - 16);
    const endLine = Math.max(0, editor.selection.start.line - 1);
    const sStart = editor.selection.start.with(startLine, 0);
    const sEnd = editor.selection.start.with(endLine, INT_MAX);
    const searchTxt = editor.document.getText(new vscode.Range(sStart, sEnd));
    const pattern = new RegExp(`(?<=${translatedPrefixRegex}).*`, 'm');
    let idx = utils.findLastMatchIndex(pattern, searchTxt);
    if (idx != -1) {
      let n = utils.countLineFrom(searchTxt, idx);
      const position = editor.selection.active;
      const strThisLine = getCurrentLine();
      let t = strThisLine.search(pattern);
      if (t == -1)
        return;
      t += utils.countStartingUnimportantChar(strThisLine, t);
      const toMove = new vscode.Range(
        position.with(position.line, t),
        position.with(position.line, position.character))
      const toInsert = new vscode.Position(
        position.line - n, INT_MAX
    );
    let sline = editor.document.getText(toMove);
    editor.edit((editbuilder) => {
      editbuilder.delete(toMove);
      editbuilder.insert(toInsert, sline);
    });
  }
}