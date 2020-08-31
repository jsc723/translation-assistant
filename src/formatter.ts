import * as vscode from 'vscode';

export function formatter(context: vscode.ExtensionContext, document: vscode.TextDocument): vscode.TextEdit[] {
  const config = vscode.workspace.getConfiguration("dltxt");
  const jPreStr = config.get('originalTextPrefixRegex') as string;
  const cPreStr = config.get('translatedTextPrefixRegex') as string;
  if (!jPreStr || !cPreStr) {
    return [];
  }
  const jreg = new RegExp(`^(${jPreStr})(?<white>\\s*[「『]?)(?<text>.*?)(?<suffix>[」』]?)$`);
  const creg = new RegExp(`^(?<prefix>${cPreStr})(?<white>\\s*[「『]?)(?<text>.*?)(?<suffix>[」』]?)$`);
  const result = [];
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const jmatch = jreg.exec(line.text);
    if (jmatch && i + 1 < document.lineCount) {
      const jgrps = jmatch.groups;
      const nextLine = document.lineAt(++i);
      const cmatch = creg.exec(nextLine.text);
      const cgrps = cmatch?.groups;
      const replacedLine = `${cgrps?.prefix}${jgrps?.white}${cgrps?.text}${jgrps?.suffix}`;
      result.push(vscode.TextEdit.replace(nextLine.range, replacedLine));
    }
  }
  return result;
}