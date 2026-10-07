import type { Frame, ListSpec } from "@/components/viz";

/* Frame builders for the sentinel-list station. The list is shown as: sentinel ("dummy") then the real data. */

export const COUNT_CODE = `public int count(String target) {
    int c = 0;
    StrNode p = sen.next;
    while (p != null) {
        if (p.head.equals(target)) {
            c++;
        }
        p = p.next;
    }
    return c;
}`;

export const REMOVE_CODE = `public void removeFirst() {
    if (sen.next != null) {
        sen.next = sen.next.next;
    }
}`;

export const ISEMPTY_CODE = `public boolean isEmpty() {
    return sen.next == null;
}`;

const nodesOf = (items: string[], hiIdx?: number) => [
  { v: "dummy", sentinel: true } as const,
  ...items.map((v, i) => ({ v, hi: hiIdx === i + 1 })),
];

function spec(items: string[], ptrs: Record<string, number>, meta?: Record<string, string | number>, hiIdx?: number): ListSpec {
  return { nodes: nodesOf(items, hiIdx).map((n) => ({ ...n })), ptrs, meta };
}

export function countFrames(items: string[], target: string): Frame[] {
  const N = items.length + 1; // index N means null
  const fr: Frame[] = [];
  const tg = `"${target}"`;
  let c = 0;
  fr.push({ line: 2, lists: [spec(items, { sen: 0 }, { c, target: tg })], note: "c is the tally. It starts at 0." });
  fr.push({
    line: 3,
    lists: [spec(items, { sen: 0, p: Math.min(1, N) }, { c, target: tg })],
    note: items.length
      ? "p starts at sen.next: the FIRST REAL node. (Starting at sen would also read the dummy node, which is not part of the list.)"
      : "The list is empty, so sen.next is null and p starts as null.",
  });
  for (let k = 0; k < items.length; k++) {
    const idx = k + 1;
    fr.push({ line: 4, lists: [spec(items, { sen: 0, p: idx }, { c, target: tg })], note: "p != null is true, so there is a node to look at." });
    const hit = items[k] === target;
    fr.push({
      line: 5,
      lists: [spec(items, { sen: 0, p: idx }, { c, target: tg }, idx)],
      note: hit ? `"${items[k]}".equals(${tg}) is true.` : `"${items[k]}".equals(${tg}) is false, so skip the increment.`,
    });
    if (hit) {
      c++;
      fr.push({ line: 6, lists: [spec(items, { sen: 0, p: idx }, { c, target: tg }, idx)], note: `Found one. c becomes ${c}.` });
    }
    fr.push({
      line: 8,
      lists: [spec(items, { sen: 0, p: idx + 1 }, { c, target: tg })],
      note: idx + 1 === N ? "p = p.next walks off the end: p is now null." : "p = p.next moves one node along. This line runs EVERY iteration (not only on a match), or the loop never ends.",
    });
  }
  fr.push({ line: 4, lists: [spec(items, { sen: 0, p: N }, { c, target: tg })], note: "p != null is false, so the loop stops. We visited every node exactly once." });
  fr.push({ line: 10, lists: [spec(items, { sen: 0, p: N }, { c, target: tg })], out: `returns ${c}`, note: `return c gives ${c}. The list was only read, never changed.` });
  return fr;
}

export function removeFirstFrames(items: string[]): Frame[] {
  if (items.length === 0) {
    return [
      { line: 2, lists: [spec(items, { sen: 0 })], note: "The list is empty, so sen.next is null and the condition sen.next != null is FALSE. We skip the body." },
      { line: 5, lists: [spec(items, { sen: 0 })], note: "Nothing happens, exactly what the spec asks. Without the if-guard, sen.next.next would be null.next, a NullPointerException." },
    ];
  }
  const rest = items.slice(1);
  return [
    { line: 2, lists: [spec(items, { sen: 0 }, undefined, 1)], note: `sen.next points at "${items[0]}", which is not null, so there is something to remove.` },
    {
      line: 3,
      lists: [spec(rest, { sen: 0 })],
      note: `sen.next = sen.next.next: the sentinel now points at whatever "${items[0]}" pointed at. That is ONE pointer change, and no special case, because the sentinel is always there.`,
    },
    { line: 5, lists: [spec(rest, { sen: 0 })], note: `"${items[0]}" still exists in memory, but nothing points to it any more, so Java will garbage-collect it. Done.` },
  ];
}

export function isEmptyFrames(): Frame[] {
  return [
    { line: 2, lists: [spec([], { sen: 0 })], out: "returns true", note: "Empty list: sen.next is null, so sen.next == null is true. The sentinel itself is NOT counted as an item." },
    { line: 2, lists: [spec(["a", "b"], { sen: 0 })], out: "returns false", note: 'Non-empty list: sen.next points at "a", so sen.next == null is false. Note we only READ; isEmpty must not modify the list.' },
  ];
}

/* ---------- sandbox operations (pure) ---------- */
export const sbAddFirst = (items: string[], x: string) => [x, ...items];
export const sbRemoveFirst = (items: string[]) => items.slice(1);
export const sbIsEmpty = (items: string[]) => items.length === 0;
export const sbCount = (items: string[], t: string) => items.filter((v) => v === t).length;
