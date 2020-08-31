
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