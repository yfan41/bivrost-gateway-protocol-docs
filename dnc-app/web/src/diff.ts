export interface DiffLine {
  kind: 'same' | 'add' | 'del';
  text: string;
}

/** Simple LCS line diff — plenty for NC programs. */
export function diffLines(a: string, b: string): DiffLine[] {
  const al = a.replace(/\r\n?/g, '\n').split('\n');
  const bl = b.replace(/\r\n?/g, '\n').split('\n');
  const n = al.length;
  const m = bl.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] = al[i] === bl[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (al[i] === bl[j]) {
      out.push({ kind: 'same', text: al[i]! });
      i++; j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      out.push({ kind: 'del', text: al[i]! });
      i++;
    } else {
      out.push({ kind: 'add', text: bl[j]! });
      j++;
    }
  }
  while (i < n) out.push({ kind: 'del', text: al[i++]! });
  while (j < m) out.push({ kind: 'add', text: bl[j++]! });
  return out;
}
