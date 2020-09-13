import * as vscode from "vscode";
export function findLastMatchIndex(pattern: RegExp, text: string): number {
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
  
export function countCharBeforeNewline(text: string, startIdx: number) : number{
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

export function setCursorAndScroll(editor: vscode.TextEditor, dn: number, m: number, scroll: boolean = true) {
  const position = editor.selection.active;
  const targetLine = position.line + dn;
  const newPosition = position.with(targetLine, m);
  editor.selection = new vscode.Selection(newPosition, newPosition);
  if (scroll) {
    const curRange = editor.visibleRanges[0];
    const halfHeight = Math.floor((curRange.end.line - curRange.start.line)) / 2;
    const pStart = curRange.start.with(Math.max(0, targetLine - halfHeight));
    const pEnd = curRange.start.with(Math.max(0, targetLine + halfHeight));
    editor.revealRange(curRange.with(pStart, pEnd));
  }
};

const dictionary = new Set();
dictionary.add(" ").add("\t").add("　").add("「").add("『");
export function countStartingUnimportantChar(txt: string, start: number) : number {
  let n = 0;
  for (let i = start; i < txt.length; i++) {
    if (dictionary.has(txt[i]))
      n++;
    else
      break;
  }
  return n;
};

export function toDBC(txtstring: string) { 
  var tmp = ""; 
  for(var i=0;i<txtstring.length;i++) { 
      if(txtstring.charCodeAt(i)==32){ 
          tmp= tmp+ String.fromCharCode(12288); 
      } 
      if(txtstring.charCodeAt(i)<127){ 
          tmp=tmp+String.fromCharCode(txtstring.charCodeAt(i)+65248); 
      } 
  } 
  return tmp; 
}