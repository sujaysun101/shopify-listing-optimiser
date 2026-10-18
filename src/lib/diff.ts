export type DiffPart = { type: "same" | "add" | "del"; text: string };

function tokenize(value: string) {
  return value.split(/(\s+)/).filter((part) => part.length > 0);
}

export function diffWords(from: string, to: string): { before: DiffPart[]; after: DiffPart[] } {
  const a = tokenize(from);
  const b = tokenize(to);
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[] = new Array(rows * cols).fill(0);
  const at = (r: number, c: number) => table[r * cols + c] ?? 0;
  for (let r = a.length - 1; r >= 0; r -= 1) {
    for (let c = b.length - 1; c >= 0; c -= 1) {
      table[r * cols + c] =
        a[r] === b[c] ? at(r + 1, c + 1) + 1 : Math.max(at(r + 1, c), at(r, c + 1));
    }
  }
  const before: DiffPart[] = [];
  const after: DiffPart[] = [];
  let r = 0;
  let c = 0;
  const push = (list: DiffPart[], type: DiffPart["type"], text: string) => {
    const last = list[list.length - 1];
    if (last && last.type === type) last.text += text;
    else list.push({ type, text });
  };
  while (r < a.length && c < b.length) {
    if (a[r] === b[c]) {
      push(before, "same", a[r] ?? "");
      push(after, "same", b[c] ?? "");
      r += 1;
      c += 1;
    } else if (at(r + 1, c) >= at(r, c + 1)) {
      push(before, "del", a[r] ?? "");
      r += 1;
    } else {
      push(after, "add", b[c] ?? "");
      c += 1;
    }
  }
  while (r < a.length) {
    push(before, "del", a[r] ?? "");
    r += 1;
  }
  while (c < b.length) {
    push(after, "add", b[c] ?? "");
    c += 1;
  }
  return { before, after };
}
