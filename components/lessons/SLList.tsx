"use client";
import { useState } from "react";
import { Callout, Check, Code, I, Reveal, Row, Panel, Sec } from "../ui";
import { Frame, ListNode, ListViz, Trace } from "../viz";

type Op = { kind: "addFirst" | "addLast" | "removeFirst" | "insert"; x?: number; k?: number };

const nodes = (vals: number[], hi: number[] = [], fresh: number[] = []): ListNode[] => [
  { v: "", sentinel: true, hi: hi.includes(0) },
  ...vals.map((v, i) => ({ v, hi: hi.includes(i + 1), fresh: fresh.includes(i + 1) })),
];

const CODE: Record<Op["kind"], string> = {
  addFirst: `public void addFirst(int x) {
    sentinel.next = new IntNode(x, sentinel.next);
    size++;
}`,
  addLast: `public void addLast(int x) {
    IntNode p = sentinel;
    while (p.next != null) {
        p = p.next;
    }
    p.next = new IntNode(x, null);
    size++;
}`,
  removeFirst: `public void removeFirst() {
    if (size == 0) return;
    sentinel.next = sentinel.next.next;
    size--;
}`,
  insert: `public void insert(int x, int k) {
    IntNode p = sentinel;
    while (k > 0 && p.next != null) {
        p = p.next;
        k--;
    }
    p.next = new IntNode(x, p.next);
    size++;
}`,
};

function run(op: Op, vals: number[]): { frames: Frame[]; after: number[] } {
  const F: Frame[] = [];
  const meta = (s: number) => ({ size: s });
  const L = (ns: ListNode[], ptrs: Record<string, number>, size: number) => [{ nodes: ns, ptrs: { sentinel: 0, ...ptrs }, meta: meta(size) }];
  const n = vals.length;

  if (op.kind === "addFirst") {
    const x = op.x!;
    F.push({ line: 2, lists: [...L(nodes(vals), {}, n), { title: "the new node (its next copies sentinel.next, i.e. the old first node)", nodes: [{ v: x, fresh: true }], ptrs: {} }], note: <>Build a new node holding {x} whose <I>next</I> is the old first node ({n ? vals[0] : "null, the list is empty"}). Do this <em>before</em> touching any arrow.</> });
    const after = [x, ...vals];
    F.push({ line: 2, lists: L(nodes(after, [1], [1]), {}, n), note: <>Then point <I>sentinel.next</I> at it. Two arrows were set; nothing was walked. <strong>Constant time.</strong></> });
    F.push({ line: 3, lists: L(nodes(after, [1]), {}, n + 1), note: "size++ keeps the counter honest." });
    return { frames: F, after };
  }
  if (op.kind === "addLast") {
    const x = op.x!;
    let p = 0;
    F.push({ line: 2, lists: L(nodes(vals, [0]), { p }, n), note: <>Start <I>p</I> at the <strong>sentinel</strong>, not at first. That&apos;s what removes the empty-list special case.</> });
    while (p < n) {
      F.push({ line: 3, lists: L(nodes(vals, [p]), { p }, n), note: <>p.next is not null, so p isn&apos;t the last node yet.</> });
      p++;
      F.push({ line: 4, lists: L(nodes(vals, [p]), { p }, n), note: "Hop." });
    }
    F.push({ line: 3, lists: L(nodes(vals, [p]), { p }, n), note: <>p.next == null: p is the last node{n === 0 ? " (which is the sentinel itself: an empty list needed no special case!)" : ""}.</> });
    const after = [...vals, x];
    F.push({ line: 6, lists: L(nodes(after, [n + 1], [n + 1]), { p }, n), note: <>p.next = new node. <strong>Time grows with n</strong> because we had to walk (we keep no reference to the last node).</> });
    F.push({ line: 7, lists: L(nodes(after), { p }, n + 1), note: "size++." });
    return { frames: F, after };
  }
  if (op.kind === "removeFirst") {
    F.push({ line: 2, lists: L(nodes(vals), {}, n), note: n === 0 ? <>size == 0: nothing to remove, so return. Without this guard, <I>sentinel.next.next</I> would dereference null (NullPointerException).</> : <>size is {n}, so there is something to remove.</> });
    if (n === 0) return { frames: F, after: vals };
    const after = vals.slice(1);
    F.push({ line: 3, lists: L(nodes(after, [0]), {}, n), note: <>Skip over the first node: sentinel.next = sentinel.next.next. The old first node ({vals[0]}) now has no arrows pointing to it, so Java&apos;s garbage collector can reclaim it. Constant time.</> });
    F.push({ line: 4, lists: L(nodes(after), {}, n - 1), note: "size--." });
    return { frames: F, after };
  }
  // insert
  const x = op.x!;
  let k = Math.max(0, op.k ?? 0);
  let p = 0;
  F.push({ line: 2, lists: L(nodes(vals, [0]), { p }, n), vars: { k }, note: <>p starts at the sentinel. To insert at position k we need the node <em>just before</em> position k. For k = 0 that is the sentinel itself.</> });
  while (k > 0 && p < n) {
    F.push({ line: 3, lists: L(nodes(vals, [p]), { p }, n), vars: { k }, note: <>k = {k} &gt; 0 and p.next exists: keep walking.</> });
    p++;
    k--;
    F.push({ line: 5, lists: L(nodes(vals, [p]), { p }, n), vars: { k }, note: <>Hop, then k-- ({k} left).</> });
  }
  F.push({ line: 3, lists: L(nodes(vals, [p]), { p }, n), vars: { k }, note: k === 0 ? "k reached 0: p is the node before the insertion point." : "We ran off the end before k reached 0 (k was larger than size). Design choice: we insert at the end." });
  const at = p + 1;
  const after = [...vals.slice(0, at - 1), x, ...vals.slice(at - 1)];
  F.push({ line: 7, lists: L(nodes(after, [at], [at]), { p }, n), vars: { k }, note: <>New node takes <I>p.next</I> as its own next, <em>then</em> p.next points at it. Both arrows use the old p.next first, so nothing is lost.</> });
  F.push({ line: 8, lists: L(nodes(after), { p }, n + 1), vars: { k }, note: "size++." });
  return { frames: F, after };
}

function Playground() {
  const [vals, setVals] = useState<number[]>([3, 7, 9]);
  const [snap, setSnap] = useState<number[]>([3, 7, 9]);
  const [op, setOp] = useState<Op | null>(null);
  const [id, setId] = useState(0);
  const [x, setX] = useState(5);
  const [k, setK] = useState(1);
  const go = (o: Op) => {
    setSnap(vals);
    setVals(run(o, vals).after);
    setOp(o);
    setId((v) => v + 1);
  };
  const input = { background: "var(--panel)", borderColor: "var(--line)" };
  return (
    <div className="card card-pad my-4">
      <div className="mb-2 text-sm muted">Perform operations on an SLList (with sentinel). Each operation is animated below, one pointer change at a time.</div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label>x = <input type="number" value={x} onChange={(e) => setX(+e.target.value || 0)} className="mono ml-1 w-16 rounded border px-1" style={input} /></label>
        <label>k = <input type="number" min={0} value={k} onChange={(e) => setK(Math.max(0, +e.target.value || 0))} className="mono ml-1 w-14 rounded border px-1" style={input} /></label>
        <button className="btn" onClick={() => go({ kind: "addFirst", x })}>addFirst(x)</button>
        <button className="btn" onClick={() => go({ kind: "addLast", x })}>addLast(x)</button>
        <button className="btn" onClick={() => go({ kind: "removeFirst" })}>removeFirst()</button>
        <button className="btn" onClick={() => go({ kind: "insert", x, k })}>insert(x, k)</button>
        <button className="btn" onClick={() => { setVals([]); setSnap([]); setOp(null); setId((v) => v + 1); }}>empty it</button>
      </div>
      {op ? (
        <Trace key={id} title={`Last operation: ${op.kind}${op.kind === "removeFirst" ? "()" : op.kind === "insert" ? `(${op.x}, ${op.k})` : `(${op.x})`}`} code={CODE[op.kind]} frames={run(op, snap).frames} />
      ) : (
        <div className="mt-3">
          <ListViz spec={{ nodes: nodes(vals), ptrs: { sentinel: 0 }, meta: { size: vals.length } }} />
          <p className="text-sm muted">Pick an operation above.</p>
        </div>
      )}
    </div>
  );
}

export default function SLListLesson() {
  return (
    <>
      <p className="text-lg muted">The skill here: <strong>change the right arrows in the right order</strong>. Get that from drawing, not from memorising code.</p>

      <Sec id="design" kicker="Part 1" title="The design: a wrapper + a dummy node">
        <Code code={`public class SLList {\n    private class IntNode {\n        int head;\n        IntNode next;\n        IntNode(int h, IntNode n) { head = h; next = n; }\n    }\n\n    private IntNode sentinel;   // dummy first node, never holds real data\n    private int size;           // kept up to date so size() is instant\n\n    public SLList() {\n        sentinel = new IntNode(-1, null);   // the value is irrelevant\n        size = 0;\n    }\n    public SLList(int x) {\n        sentinel = new IntNode(-1, null);\n        sentinel.next = new IntNode(x, null);\n        size = 1;\n    }\n}`} />
        <Row>
          <Panel title="Why a wrapper class?">Users call <I>list.addFirst(5)</I> and never touch nodes. The bookkeeping (<I>size</I>, first node) is hidden by <I>private</I>.</Panel>
          <Panel title="Why a sentinel?">Every real node has a node <em>before</em> it, even the first. So &quot;insert/append at the front, or into an empty list&quot; is no longer a special case.</Panel>
        </Row>
        <Callout kind="key" title="Sentinel = one extra node, zero special cases">
          Compare <I>addLast</I> on an empty list without and with a sentinel.
        </Callout>
        <Row>
          <div>
            <div className="mb-1 text-sm font-semibold">Without sentinel</div>
            <Code code={`public void addLast(int x) {\n    if (first == null) {          // special case!\n        first = new IntNode(x, null);\n        return;\n    }\n    IntNode p = first;\n    while (p.next != null)\n        p = p.next;\n    p.next = new IntNode(x, null);\n}`} />
          </div>
          <div>
            <div className="mb-1 text-sm font-semibold">With sentinel</div>
            <Code code={`public void addLast(int x) {\n    IntNode p = sentinel;         // start at sentinel\n    while (p.next != null)\n        p = p.next;\n    p.next = new IntNode(x, null);\n    size++;\n}`} />
          </div>
        </Row>
      </Sec>

      <Sec id="play" kicker="Part 2" title="Playground">
        <Playground />
        <Callout kind="tip" title="Try these on purpose">
          <ul>
            <li>Click <strong>empty it</strong>, then <strong>addLast</strong>: p never has to move.</li>
            <li>On an empty list, click <strong>removeFirst</strong>: see the guard.</li>
            <li><strong>insert</strong> with k = 0, k = size, and k larger than size.</li>
          </ul>
        </Callout>
      </Sec>

      <Sec id="order" kicker="Part 3" title="Order of pointer changes">
        <p>The most common bug in linked-list code is overwriting an arrow <em>before</em> you use it.</p>
        <Check
          q="What's wrong with this addFirst?"
          code={`IntNode n = new IntNode(x, null);\nsentinel.next = n;\nn.next = sentinel.next;`}
          options={["Nothing: it works", "n.next ends up pointing at n itself (a cycle) and the old list is lost", "It throws NullPointerException", "It doesn't compile"]}
          answer={1}
          why="After line 2, sentinel.next is n, so line 3 makes n.next = n. The old first node was overwritten in line 2 before we saved it. Correct: `new IntNode(x, sentinel.next)` reads the old arrow first."
        />
        <Check
          q="What happens if removeFirst omits the `if (size == 0) return;` guard and is called on an empty list?"
          options={["Nothing", "NullPointerException at sentinel.next.next", "size becomes -1 silently only", "Infinite loop"]}
          answer={1}
          why="sentinel.next is null when empty, so `sentinel.next.next` follows a null arrow."
        />
        <Check
          q="removeFirst forgets `size--`. What breaks?"
          options={["Nothing visible", "size() returns a wrong (too large) number, but the nodes are right", "The list becomes cyclic", "The removed node isn't garbage collected"]}
          answer={1}
          why="size is separate bookkeeping. If you don't update it you get a wrong size() but the chain itself is fine. Every mutator must maintain every invariant: here, 'size equals the number of real nodes'."
        />
      </Sec>

      <Sec id="cost" kicker="Part 4" title="How fast is each method?">
        <div className="card my-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr style={{ background: "var(--panel2)" }}><th className="px-3 py-2">Method</th><th className="px-3 py-2">Cost</th><th className="px-3 py-2">Why</th></tr></thead>
            <tbody>
              {[
                ["addFirst", "constant", "two arrow changes, no walking"],
                ["removeFirst", "constant", "one arrow change"],
                ["getFirst", "constant", "sentinel.next.head"],
                ["size()", "constant", "we store size (no walking)"],
                ["addLast / getLast", "grows with n", "no reference to the last node, so walk the whole chain"],
                ["get(i), insert(x, k)", "grows with i / k", "must hop that many times"],
              ].map(([a, b, c]) => (
                <tr key={a} className="border-t" style={{ borderColor: "var(--line)" }}><td className="mono px-3 py-2">{a}</td><td className="px-3 py-2 font-medium">{b}</td><td className="px-3 py-2 muted">{c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <Reveal q="If we added a `last` field pointing at the final node, which method gets faster, and what new thing must every mutator maintain?">
          <p><I>addLast</I> becomes constant time (no walking). But now <I>every</I> operation that could change the last node (addLast, removeFirst on a 1-item list, insert at the end…) has to keep <I>last</I> correct. More speed means more invariants to maintain.</p>
        </Reveal>
      </Sec>

      <Sec id="tostring" kicker="Part 5" title="Exercise skeletons (think, then code)">
        <p>Exercise 1 (<I>toString</I>) with the walk-a-pointer template: what does the walk start at, and what is the stop condition, now that there&apos;s a sentinel?</p>
        <Reveal q="Should p start at the sentinel or at sentinel.next when building the string?">
          <p>Start at <I>sentinel.next</I>, because the sentinel holds no real data and must not be printed. Then use <I>while (p != null)</I> to visit every real node.</p>
        </Reveal>
      </Sec>
    </>
  );
}
