import * as vscode from 'vscode';
import { toDBC } from './utils';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

function getRegex() {
  const config = vscode.workspace.getConfiguration("dltxt");
  const jPreStr = config.get('core.originalTextPrefixRegex') as string;
  const cPreStr = config.get('core.translatedTextPrefixRegex') as string;
  if (!jPreStr || !cPreStr) {
    return [undefined, undefined];
  }
  const jreg = new RegExp(`^(${jPreStr})(?<white>\\s*[「]?)(?<text>.*?)(?<suffix>[」]?)$`);
  const creg = new RegExp(`^(?<prefix>${cPreStr})(?<white>\\s*[「]?)(?<text>.*?)(?<suffix>[」]?)$`);
  return [jreg, creg];
}

function editTranslation(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  ops: Array<CallableFunction>,
  lines?: Array<number>
) {
  const [jreg, creg] = getRegex();
  if (!jreg || !creg)
    return [];
  const result = [];
  if (!lines) {
    lines = [...Array(document.lineCount).keys()];
  }
  for (let i of lines) {
    const line = document.lineAt(i);
    const jmatch = jreg.exec(line.text);
    if (jmatch && i + 1 < document.lineCount) {
      const jgrps = jmatch.groups;
      const nextLine = document.lineAt(i + 1);
      let nextLineText = nextLine.text;
      for (let op of ops) {
        const cmatch = creg.exec(nextLineText);
        const cgrps = cmatch?.groups;
        if (!jgrps || !cgrps)
          break;
        const r = op(jgrps, cgrps);
        if (r)
          nextLineText = r;
      }
      result.push(vscode.TextEdit.replace(nextLine.range, nextLineText));
    }
  }
  return result;
}

export function formatter(context: vscode.ExtensionContext, document: vscode.TextDocument): vscode.TextEdit[] {
  const config = vscode.workspace.getConfiguration("dltxt");
  const ops: Array<CallableFunction> = [];
  const padding = (jgrps: any, cgrps: any) => {
    return `${cgrps?.prefix}${jgrps?.white}${cgrps?.text}${jgrps?.suffix}`;
  };
  if(config.get("formatter.a.padding"))
    ops.push(padding);

  const ellipsis = (jgrps: any, cgrps: any) => {
    let text: string = cgrps.text as string;
    text = text.replace(/\.{2,}/g, '……');
    text = text.replace(/。{2,}/g, '……');
    return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
  };
  if(config.get("formatter.a.ellipsis"))
    ops.push(ellipsis);

  const wave = (jgrps: any, cgrps: any) => {
    let text: string = cgrps.text as string;
    text = text.replace(/[~∼〜～]/g, '～');
    return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
  };
  if(config.get("formatter.a.wave"))
    ops.push(wave);

  const horizontalLine = (jgrps: any, cgrps: any) => {
    let text: string = cgrps.text as string;
    text = text.replace(/[ー－\-]/g, '—');
    text = text.replace(/(?<!—)—(?!—)/g, '——');
    return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
  };
  if(config.get("formatter.a.horizontalLine"))
    ops.push(horizontalLine);


  const puncMap: Array<Array<any>> = [
    ['\\,', '，'],
    ['\\.', '。'],
    ['\\:', '：'],
    ['\\;', '；'],
    ['\\!', '！'],
    ['\\?', '？'],
    ['\\(', '（'],
    ['\\)', '）'],
    ['『', '“'],
    ['』', '”'],
    ['\\s', '　'],
  ];
  for (let entry of puncMap) {
    let reg = new RegExp(entry[0], 'g');
    entry.push(reg);
  }
  const h2fPunc = (jgrps: any, cgrps: any) => {
    let text: string = cgrps.text as string;
    for (const [key, val, reg] of puncMap) {
      text = text.replace(reg, val);
    }
    return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
  };
  if(config.get("formatter.b.h2fPunc"))
    ops.push(h2fPunc);

  const h2fAlpha = (jgrps: any, cgrps: any) => {
    let text: string = cgrps.text as string;
    let regAplha = /[0-9a-zA-Z]/g;
    let match;
    while (match = regAplha.exec(text)) {
      text = text.replace(match[0], toDBC(match[0]));
    }
    return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
  };
  if(config.get("formatter.b.h2fAlpha"))
  ops.push(h2fAlpha);
  
  function fixReversedQuote(qStart: string, qEnd: string, qAlter?: string) {
    return (jgrps: any, cgrps: any) => {
      let text: string = cgrps.text as string;
      let state = false;
      let possibleText = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === qStart || text[i] === qEnd || text[i] === qAlter) {
          possibleText += state ? qEnd : qStart;
          state = !state;
        } else {
          possibleText += text[i];
        }
      }
      if (!state) {
        text = possibleText;
      }
      return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
    };
  }
  if (config.get("formatter.b.fixReversedQuote")) {
    ops.push(fixReversedQuote('“', '”', '"'));
    ops.push(fixReversedQuote('‘', '’', "'"));
  }

  const omitPeriod = (jgrps: any, cgrps: any) => {
    let text: string = cgrps.text as string;
    if (cgrps?.suffix === '」' || cgrps?.suffix === '』') {
      text = text.replace(/(?<![\.。])[\.。]$/g, '');
    } 
    return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
  };
  if(config.get("formatter.c.omitPeriod"))
    ops.push(omitPeriod);

  return editTranslation(context, document, ops);
}

export function copyOriginalToTranslation(context: vscode.ExtensionContext, document: vscode.TextDocument, editBuilder: vscode.TextEditorEdit){
  const ops: Array<CallableFunction> = [];
  const copy = (jgrps: any, cgrps: any) => {
    if (!cgrps?.text) {
      return `${cgrps?.prefix}${jgrps?.white}${jgrps?.text}${jgrps?.suffix}`;
    }
  };
  ops.push(copy);
  editTranslation(context, document, ops).forEach(edit => {
    editBuilder.replace(edit.range, edit.newText);
  });
}
export function repeatFirstChar(context: vscode.ExtensionContext, editor: vscode.TextEditor, editBuilder: vscode.TextEditorEdit){

  const document = editor.document;
  const cur = editor.selection.start;
	const curLine = document.lineAt(editor.selection.start.line)
  let curChar = cur.character;
  const rep = (jgrps: any, cgrps: any) => {
    let text: string = cgrps.text as string;
    let i = curChar - cgrps?.prefix.length - cgrps?.white.length;
    while (i > 0 && i - 1 < text.length && text[i - 1].match(/[^，。、？！…—；：“”‘’~～「」「」\[\]\(\)（）【】]/)) {
      i--;
    }
    if (i < text.length) {
      text = text.substr(0, i) + text.substr(i, 1) + '、' + text.substr(i);
    }
    return `${cgrps?.prefix}${cgrps?.white}${text}${cgrps?.suffix}`;
  }
  editTranslation(context, document, [rep], [curLine.lineNumber - 1])
    .forEach(edit => { editBuilder.replace(edit.range, edit.newText) });
}


