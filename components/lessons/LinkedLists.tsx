"use client";
import { Callout, Check, Code, I, Panel, Reveal, Row, Sec } from "../ui";
import { Frame, ListNode, ListViz, Trace } from "../viz";

const N = (vals: (number | string)[], hi: number[] = [], fresh: number[] = []): ListNode[] =>
  vals.map((v, i) => ({ v, hi: hi.includes(i), fresh: fresh.includes(i) }));

/* ---------- build by prepending ---------- */
const BUILD_CODE = `IntNode L = new IntNode(5, null);
L = new IntNode(2, L);
L = new IntNode(1, L);`;
const BUILD_FRAMES: Frame[] = [
  { line: 1, lists: [{ nodes: N([5], [], [0]), ptrs: { L: 0 } }], note: "One node: head = 5, next = null. L points at it." },
  { line: 2, lists: [{ nodes: N([2, 5], [], [0]), ptrs: { L: 0 } }], note: <>The right side runs first: a new node whose <I>next</I> is the <em>old</em> L. Then L is re-pointed to the new node. Adding at the front never shifts anything.</> },
  { line: 3, lists: [{ nodes: N([1, 2, 5], [], [0]), ptrs: { L: 0 } }], note: "Same again. The list is 1 → 2 → 5 → null." },
];

/* ---------- iterativeSize ---------- */
const SIZE_CODE = `public int iterativeSize() {
    IntNode current = this;
    int totalSize = 0;
    while (current != null) {
        totalSize++;
        current = current.next;
    }
    return totalSize;
}`;
function sizeFrames(vals: number[]): Frame[] {
  const F: Frame[] = [];
  const L = (p: number) => [{ nodes: N(vals, p < vals.length ? [p] : []), ptrs: { current: p } }];
  F.push({ line: 2, vars: { totalSize: "?" }, lists: L(0), note: <><I>this</I> is the first node, so current starts at the front.</> });
  F.push({ line: 3, vars: { totalSize: 0 }, lists: L(0), note: "Counter starts at 0." });
  for (let i = 0; i < vals.length; i++) {
    F.push({ line: 4, vars: { totalSize: i }, lists: L(i), note: <>current is not null, so there is a node here to count.</> });
    F.push({ line: 5, vars: { totalSize: i + 1 }, lists: L(i), note: <>Count it: totalSize = {i + 1}.</> });
    F.push({ line: 6, vars: { totalSize: i + 1 }, lists: L(i + 1), note: i + 1 < vals.length ? <>Hop to the next node.</> : <>current.next was null, so current becomes null: we fell off the end.</> });
  }
  F.push({ line: 4, vars: { totalSize: vals.length }, lists: L(vals.length), note: "current == null, so the loop condition is false. Loop ends." });
  F.push({ line: 8, vars: { totalSize: vals.length }, lists: L(vals.length), note: `Return ${vals.length}.` });
  return F;
}

/* ---------- get(i) ---------- */
const GET_CODE = `public int get(int i) {
    IntNode current = this;
    while (i > 0) {
        current = current.next;
        i--;
    }
    return current.head;
}`;
function getFrames(vals: number[], idx: number): Frame[] {
  const F: Frame[] = [];
  let p = 0;
  let i = idx;
  const L = () => [{ nodes: N(vals, [p]), ptrs: { current: p } }];
  F.push({ line: 2, vars: { i }, lists: L(), note: <>We want index {idx}. Start at index 0 (this) and hop {idx} times.</> });
  while (i > 0) {
    F.push({ line: 3, vars: { i }, lists: L(), note: <>i = {i} &gt; 0: still hops to make.</> });
    p++;
    F.push({ line: 4, vars: { i }, lists: L(), note: <>Hop: current moves one node right.</> });
    i--;
    F.push({ line: 5, vars: { i }, lists: L(), note: <>i-- : {i} hop{i === 1 ? "" : "s"} left.</> });
  }
  F.push({ line: 3, vars: { i }, lists: L(), note: "i is 0, so we're at the right node." });
  F.push({ line: 7, vars: { i }, lists: L(), note: <>Return current.head = {vals[p]}. Cost: {idx} hops, i.e. time grows with the index. That is the price of a linked list.</> });
  return F;
}

/* ---------- recursive size ---------- */
const RSIZE_CODE = `public int size() {
    if (this.next == null)
        return 1;
    else
        return 1 + this.next.size();
}`;
function rsizeFrames(vals: number[]): Frame[] {
  const F: Frame[] = [];
  const n = vals.length;
  const stackTo = (d: number) => Array.from({ length: d + 1 }, (_, k) => `size() with this = node ${vals[k]}`);
  for (let d = 0; d < n; d++) {
    const lists = [{ nodes: N(vals, [d]), ptrs: { this: d } }];
    F.push({ line: 2, lists, stack: stackTo(d), note: d < n - 1 ? <>this.next is not null, so this isn&apos;t the last node.</> : <>this.next == null: we&apos;re at the last node. <strong>Base case.</strong></> });
    if (d < n - 1) F.push({ line: 5, lists, stack: stackTo(d), note: <>&quot;1 + (size of the rest)&quot;. We <strong>trust</strong> this.next.size() to count the rest, and call it.</> });
    else F.push({ line: 3, lists, stack: stackTo(d), note: "Base case returns 1: a single node has size 1." });
  }
  for (let d = n - 2; d >= 0; d--) {
    F.push({
      line: 5,
      lists: [{ nodes: N(vals, [d]), ptrs: { this: d } }],
      stack: stackTo(d),
      note: <>The call below returned {n - d - 1}. So this call returns 1 + {n - d - 1} = <strong>{n - d}</strong>.</>,
    });
  }
  F.push({ line: 5, lists: [{ nodes: N(vals), ptrs: { this: 0 } }], stack: [], note: <>The first call finally returns {n}.</> });
  return F;
}

/* ---------- addLast walk ---------- */
const LAST_CODE = `public void addLast(int x) {
    IntNode current = this;
    while (current.next != null) {
        current = current.next;
    }
    current.next = new IntNode(x, null);
}`;
function lastFrames(vals: number[], x: number): Frame[] {
  const F: Frame[] = [];
  let p = 0;
  const L = (extra?: ListNode[]) => [{ nodes: extra ?? N(vals, [p]), ptrs: { current: p } }];
  F.push({ line: 2, lists: L(), note: "Start at the front." });
  while (p < vals.length - 1) {
    F.push({ line: 3, lists: L(), note: <>current.next is not null, so there is more list ahead: keep walking.</> });
    p++;
    F.push({ line: 4, lists: L(), note: "Hop." });
  }
  F.push({ line: 3, lists: L(), note: <><strong>current.next == null</strong>: current is the <em>last node</em>. We stop <em>on</em> it, not after it. That is what lets us attach something.</> });
  F.push({ line: 6, lists: L(N([...vals, x], [vals.length], [vals.length])), note: <>Set current.next to a new node. The list grew at the end.</> });
  return F;
}

export default function LinkedLists() {
  return (
    <>
      <p className="text-lg muted">
        Linked lists are the first place where drawing boxes and arrows <em>is</em> the solution. Every method in this lesson is either <strong>walk a pointer</strong> or <strong>recurse on the rest</strong>.
      </p>

      <Sec id="what" kicker="Part 1" title="What is an IntNode chain?">
        <Code code={`class IntNode {\n    int head;        // the data\n    IntNode next;    // arrow to the rest of the list (or null)\n\n    public IntNode(int head, IntNode next) {\n        this.head = head;\n        this.next = next;\n    }\n}`} />
        <p>There is no &quot;list&quot; object here. A list is just <strong>a reference to its first node</strong>; each node points to the next; the last node&apos;s <I>next</I> is <I>null</I>.</p>
        <Trace title="Building 1 → 2 → 5 by prepending" code={BUILD_CODE} frames={BUILD_FRAMES} />
        <Row>
          <Panel title="Array"><ul><li>get(i): jump straight there</li><li>grow: allocate + copy everything</li></ul></Panel>
          <Panel title="Linked chain"><ul><li>get(i): must hop i times</li><li>add at front: just one new node</li></ul></Panel>
        </Row>
      </Sec>

      <Sec id="walk" kicker="Part 2" title="Pattern: walk a pointer">
        <p>Use a <strong>separate</strong> variable (<I>current</I>) to walk. Never move <I>this</I>. The template is always:</p>
        <Code code={`IntNode current = this;\nwhile (current != null) {   // visits EVERY node\n    // do something with current.head\n    current = current.next;\n}`} />
        <Trace title="iterativeSize on 4 → 8 → 15" code={SIZE_CODE} frames={sizeFrames([4, 8, 15])} />
        <h3 className="mt-6 text-lg font-semibold">get(i): walk a fixed number of hops</h3>
        <Reveal q={<>To find the item at index 2, how many hops from the first node? What variable tells you when to stop?</>}>
          <p>Two hops: index 0 is where you start, and each hop increments the index. Count down <I>i</I> to zero, hopping each time.</p>
        </Reveal>
        <Trace title="get(2) on 10 → 20 → 30 → 40" code={GET_CODE} frames={getFrames([10, 20, 30, 40], 2)} />
        <Callout kind="key" title="Which stop condition?">
          <ul>
            <li><I>while (current != null)</I>: visit <strong>every</strong> node, and you end up <em>past</em> the last one (current is null).</li>
            <li><I>while (current.next != null)</I>: stop <strong>on the last node</strong>. Use this when you need to change the last node (addLast).</li>
          </ul>
        </Callout>
        <Trace title="addLast: stop ON the last node" code={LAST_CODE} frames={lastFrames([4, 8, 15], 99)} />
        <Check
          q="What happens here on a non-empty list?"
          code={`IntNode current = this;\nwhile (current != null) {\n    current = current.next;\n}\ncurrent.next = new IntNode(x, null);`}
          options={["Appends x at the end", "NullPointerException: current is null after the loop", "Infinite loop", "Compile error"]}
          answer={1}
          why="The loop only ends when current is null, and then current.next follows a null arrow. To append you needed the loop to stop on the last node: `while (current.next != null)`."
        />
      </Sec>

      <Sec id="recurse" kicker="Part 3" title="Pattern: recurse on the rest">
        <p>A list is <em>one node + a smaller list</em>. So write:</p>
        <ol>
          <li><strong>Base case:</strong> the smallest list (here: <I>next == null</I>, a single node).</li>
          <li><strong>Recursive case:</strong> assume <I>this.next.method()</I> works on the rest; use its answer to build yours.</li>
        </ol>
        <Trace title="size() on 7 → 3 → 9" code={RSIZE_CODE} frames={rsizeFrames([7, 3, 9])} />
        <Check
          q="What happens if we delete the base case (`if (this.next == null) return 1;`) and always run `return 1 + this.next.size();`?"
          options={["It works", "StackOverflowError", "NullPointerException at the last node", "Returns 0"]}
          answer={2}
          why="At the last node, this.next is null, and we then call .size() on null: NullPointerException. (A StackOverflow only happens when the recursion never reaches a stopping point.)"
        />
        <h3 className="mt-6 text-lg font-semibold">Building a new list recursively: incrList and copy</h3>
        <p>&quot;Return a new list&quot; means each recursive call returns <em>a node</em>, and you link your new node in front of the rest:</p>
        <Reveal q={<>Fill in the blank from the lesson: what should <I>incrList(delta)</I> return in the recursive case? Hint: the new node needs a value and a <em>next</em>.</>}>
          <Code code={`public IntNode incrList(int delta) {\n    if (this.next == null)\n        return new IntNode(this.head + delta, null);\n    else\n        return new IntNode(this.head + delta, this.next.incrList(delta));\n}`} />
          <p>New head = old head + delta. New tail = <em>whatever the recursive call builds from the rest</em>. Nothing in the original list changes.</p>
        </Reveal>
        <Code title="copy() from the lesson (same shape)" code={`public IntNode copy() {\n    if (this.next == null)\n        return new IntNode(this.head, null);\n    else {\n        IntNode copyOfRest = this.next.copy();\n        return new IntNode(this.head, copyOfRest);\n    }\n}`} />
        <div className="card card-pad my-4">
          <div className="mb-1 text-sm font-semibold">Alias vs copy</div>
          <ListViz spec={{ title: "IntNode a = ...;  IntNode b = a;", nodes: N([1, 2, 3]), ptrs: { a: 0, b: 0 } }} />
          <ListViz spec={{ title: "IntNode c = a.copy();  (a brand-new chain)", nodes: N([1, 2, 3], [], [0, 1, 2]), ptrs: { c: 0 } }} />
        </div>
        <Check
          q="After the code below, what is a.head?"
          code={`IntNode a = new IntNode(1, null);\nIntNode b = a;\nIntNode c = a.copy();\nb.head = 50;\nc.head = 70;`}
          options={["1", "50", "70", "Compile error"]}
          answer={1}
          why="b is an alias of a, so `b.head = 50` changes a's only node: a.head becomes 50. c is a separate copy, so 70 lands only in c."
        />
      </Sec>

      <Sec id="compare" kicker="Part 4" title="Iterative or recursive? Choosing">
        <Row>
          <Panel title="Iterative (walk a pointer)">Uses constant extra memory. Good for size, get, set, addLast. Watch: which stop condition?</Panel>
          <Panel title="Recursive">Great for &quot;return a new list&quot; (copy, incrList) and toString. Each call is a frame on the call stack, so very long lists could overflow the stack.</Panel>
        </Row>
        <Callout kind="tip" title="Linked-list debugging checklist">
          <ul>
            <li>Draw the list before and after the change. Which arrows move?</li>
            <li>Empty list? One node? Do you dereference <I>null</I> anywhere?</li>
            <li>Order of assignments: don&apos;t overwrite an arrow before you save where it points.</li>
          </ul>
        </Callout>
      </Sec>
    </>
  );
}
