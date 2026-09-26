"use client";
import { useState } from "react";
import { Callout, Check, Code, I, Panel, Row, Sec } from "../ui";
import { Frame, Trace } from "../viz";

/* ---------------- generic type picker ---------------- */
const BOX = [
  ["int", "Integer"],
  ["double", "Double"],
  ["char", "Character"],
  ["boolean", "Boolean"],
  ["long", "Long"],
  ["byte", "Byte"],
  ["short", "Short"],
  ["float", "Float"],
];
const TYPES = ["Integer", "Double", "String", "Character", "Long"];
const ARGS: { label: string; kind: string }[] = [
  { label: "5", kind: "int" },
  { label: "3.14", kind: "double" },
  { label: '"hi"', kind: "String" },
  { label: "'c'", kind: "char" },
  { label: "5L", kind: "long" },
];
const OK: Record<string, string> = { Integer: "int", Double: "double", String: "String", Character: "char", Long: "long" };

function TypePicker() {
  const [t, setT] = useState("Integer");
  const [a, setA] = useState(0);
  const arg = ARGS[a];
  const ok = OK[t] === arg.kind;
  return (
    <div className="card card-pad my-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="mono">SLList&lt;</span>
        <select value={t} onChange={(e) => setT(e.target.value)} className="mono rounded border px-2 py-1" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
          {TYPES.map((x) => <option key={x}>{x}</option>)}
        </select>
        <span className="mono">&gt; list = new SLList&lt;&gt;();</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="mono">list.addFirst(</span>
        {ARGS.map((x, i) => (
          <button key={i} className="btn mono !text-xs" onClick={() => setA(i)} style={i === a ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>{x.label}</button>
        ))}
        <span className="mono">);</span>
      </div>
      <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: ok ? "var(--good-soft)" : "var(--bad-soft)" }}>
        {ok ? (
          <>✓ Compiles. <span className="mono">T = {t}</span>, so the parameter is <span className="mono">{t} x</span>{t !== "String" ? <> and the primitive <span className="mono">{arg.label}</span> is <strong>autoboxed</strong> into a {t} automatically.</> : "."}</>
        ) : (
          <>✗ Compile error: <span className="mono">{arg.label}</span> is a{arg.kind === "int" ? "n" : ""} <span className="mono">{arg.kind}</span>, but this list holds <span className="mono">{t}</span>.
            {arg.kind === "int" && (t === "Double" || t === "Long") ? " Autoboxing only wraps a primitive into its own wrapper type: int → Integer, never int → Double or Long." : ""}</>
        )}
      </div>
    </div>
  );
}

/* ---------------- stack / queue playground ---------------- */
function Playground() {
  const [mode, setMode] = useState<"stack" | "queue">("stack");
  const [items, setItems] = useState<number[]>([]);
  const [next, setNext] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const add = () => {
    setItems([...items, next]);
    setLog([`${mode === "stack" ? "push" : "enqueue"}(${next})`, ...log].slice(0, 8));
    setNext(next + 1);
  };
  const rem = () => {
    if (!items.length) {
      setLog([`${mode === "stack" ? "pop" : "dequeue"}() → error: empty`, ...log].slice(0, 8));
      return;
    }
    const v = mode === "stack" ? items[items.length - 1] : items[0];
    setItems(mode === "stack" ? items.slice(0, -1) : items.slice(1));
    setLog([`${mode === "stack" ? "pop" : "dequeue"}() → ${v}`, ...log].slice(0, 8));
  };
  const switchMode = (m: "stack" | "queue") => { setMode(m); setItems([]); setLog([]); setNext(1); };
  return (
    <div className="card card-pad my-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["stack", "queue"] as const).map((m) => (
          <button key={m} className="btn" onClick={() => switchMode(m)} style={mode === m ? { background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" } : undefined}>{m === "stack" ? "Stack (LIFO)" : "Queue (FIFO)"}</button>
        ))}
        <span className="mx-1" />
        <button className="btn btn-primary" onClick={add}>{mode === "stack" ? `push(${next})` : `enqueue(${next})`}</button>
        <button className="btn" onClick={rem}>{mode === "stack" ? "pop()" : "dequeue()"}</button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_14rem]">
        <div className="min-h-[9rem]">
          {mode === "stack" ? (
            <div className="flex flex-col-reverse items-start gap-1">
              {items.map((v, i) => (
                <div key={v} className="cell pop !w-28 !justify-between px-3" style={{ background: i === items.length - 1 ? "var(--hi)" : undefined }}>
                  <span>{v}</span>
                  {i === items.length - 1 && <span className="mono text-[0.7rem] font-normal">← top</span>}
                </div>
              ))}
              <div className="mono text-xs muted">bottom</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1">
                <span className="mono mr-1 text-xs muted">front →</span>
                {items.map((v, i) => (
                  <div key={v} className="cell pop" style={{ background: i === 0 ? "var(--hi)" : undefined }}>{v}</div>
                ))}
                <span className="mono ml-1 text-xs muted">← rear</span>
              </div>
              <div className="mono mt-2 text-xs muted">enqueue joins at the rear; dequeue leaves from the front</div>
            </div>
          )}
          {items.length === 0 && <div className="mono text-sm muted">(empty)</div>}
        </div>
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Log</div>
          {log.map((l, i) => <div key={i} className="mono text-xs" style={{ opacity: 1 - i * 0.1 }}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ---------------- predict puzzle ---------------- */
type Puzzle = { mode: "stack" | "queue"; ops: string[]; answer: number[] };

function makePuzzle(seed?: number): Puzzle {
  const rnd = seed === undefined ? Math.random : (() => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); })();
  const mode = rnd() < 0.5 ? "stack" : "queue";
  const ops: string[] = [];
  const buf: number[] = [];
  const ans: number[] = [];
  let v = 1;
  while (ops.length < 9) {
    const canRem = buf.length > 0;
    if (!canRem || (rnd() < 0.55 && buf.length < 4)) {
      ops.push(mode === "stack" ? `push(${v})` : `enqueue(${v})`);
      buf.push(v++);
    } else {
      const r = mode === "stack" ? buf.pop()! : buf.shift()!;
      ops.push(mode === "stack" ? "pop()" : "dequeue()");
      ans.push(r);
    }
  }
  return { mode, ops, answer: ans };
}

function Predict() {
  const [p, setP] = useState<Puzzle>(() => makePuzzle(7));
  const [txt, setTxt] = useState("");
  const [shown, setShown] = useState(false);
  const guess = txt.split(/[\s,]+/).filter(Boolean).map(Number);
  const right = guess.length === p.answer.length && guess.every((g, i) => g === p.answer[i]);
  return (
    <div className="card card-pad my-4">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Practice</div>
      <p className="text-sm">
        Start with an empty <strong>{p.mode}</strong>. Run these operations in order. List the values returned by {p.mode === "stack" ? "pop()" : "dequeue()"}, in the order they come out.
      </p>
      <div className="mono my-2 flex flex-wrap gap-1 text-sm">
        {p.ops.map((o, i) => <span key={i} className="rounded px-2 py-0.5" style={{ background: "var(--panel2)" }}>{i + 1}. {o}</span>)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={txt} onChange={(e) => { setTxt(e.target.value); setShown(false); }} placeholder="e.g. 3 2 1" className="mono rounded border px-2 py-1 text-sm" style={{ background: "var(--panel)", borderColor: "var(--line)" }} />
        <button className="btn btn-primary" onClick={() => setShown(true)}>Check</button>
        <button className="btn" onClick={() => { setP(makePuzzle()); setTxt(""); setShown(false); }}>New puzzle</button>
      </div>
      {shown && (
        <div className="mt-2 text-sm">
          {right ? <strong style={{ color: "var(--good)" }}>Correct!</strong> : <strong style={{ color: "var(--bad)" }}>Not yet. </strong>}
          {!right && <span className="muted">Expected: <span className="mono">{p.answer.join(" ")}</span> (a {p.mode} returns {p.mode === "stack" ? "the most recent item" : "the oldest item"}).</span>}
        </div>
      )}
    </div>
  );
}

/* ---------------- brackets trace ---------------- */
const BR_CODE = `for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') {
        stack.push(c);
    } else {
        if (stack.isEmpty()) return false;
        char open = stack.pop();
        if (!matches(open, c)) return false;
    }
}
return stack.isEmpty();`;
function brFrames(s: string): Frame[] {
  const F: Frame[] = [];
  const st: string[] = [];
  const pair: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const S = () => ({ stack: [...st], stackLabel: "stack (top is the last-pushed bracket)" });
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const vars = { c: `'${c}'`, i };
    if ("([{".includes(c)) {
      F.push({ line: 2, vars, ...S(), note: <>&apos;{c}&apos; is an opening bracket: remember it.</> });
      st.push(c);
      F.push({ line: 3, vars, ...S(), note: <>Push &apos;{c}&apos;. The most recent unmatched opener is now on top.</> });
    } else {
      F.push({ line: 5, vars, ...S(), note: <>&apos;{c}&apos; is a closer. It must match the <em>most recent</em> unmatched opener: exactly what a stack gives us.</> });
      if (!st.length) {
        F.push({ line: 5, vars, ...S(), out: "false", note: <>Stack is empty but we have a closer with nothing to match: <strong>not balanced</strong>.</> });
        return F;
      }
      const o = st.pop()!;
      F.push({ line: 6, vars: { ...vars, open: `'${o}'` }, ...S(), note: <>Pop the top: &apos;{o}&apos;.</> });
      if (pair[c] !== o) {
        F.push({ line: 7, vars: { ...vars, open: `'${o}'` }, ...S(), out: "false", note: <>&apos;{o}&apos; and &apos;{c}&apos; don&apos;t match: <strong>not balanced</strong>.</> });
        return F;
      }
      F.push({ line: 7, vars: { ...vars, open: `'${o}'` }, ...S(), note: <>&apos;{o}&apos; matches &apos;{c}&apos;. Good.</> });
    }
  }
  F.push({ line: 10, ...S(), out: String(st.length === 0), note: st.length === 0 ? <>Stack is empty: every opener was matched. <strong>Balanced.</strong></> : <>Stack still has {st.length} unmatched opener(s): <strong>not balanced</strong>.</> });
  return F;
}

function Brackets() {
  const cases = ["([]{})", "([)]", "(()", "())"];
  const [c, setC] = useState(0);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm muted">Input string:</span>
        {cases.map((x, i) => (
          <button key={i} className="btn mono" onClick={() => setC(i)} style={i === c ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>{x}</button>
        ))}
      </div>
      <Trace key={c} title={`isBalanced("${cases[c]}")`} code={BR_CODE} frames={brFrames(cases[c])} />
    </div>
  );
}

export default function StacksQueues() {
  return (
    <>
      <p className="text-lg muted">Two ideas in one lesson: <strong>generics</strong> (a list that works for any type) and <strong>two disciplines</strong> for using a list (stack and queue).</p>

      <Sec id="generics" kicker="Part 1" title="Generics: a type parameter">
        <Code code={`class SLList<T> {                    // T is a type parameter (a "type variable")\n    private class Node {\n        T head;                      // T instead of int\n        Node rest;\n        Node(T h, Node r) { head = h; rest = r; }\n    }\n    private Node first;\n    public void addFirst(T x) { first = new Node(x, first); }\n    public T getFirst()        { return first.head; }\n}\n\nSLList<Double> list1 = new SLList<>();   // T becomes Double for this list`} />
        <Callout kind="key">Write the type in the declaration (<I>SLList&lt;Double&gt;</I>), and use the empty diamond <I>&lt;&gt;</I> after <I>new</I>. The type argument must be a <strong>reference type</strong>, never a primitive.</Callout>
        <div className="card my-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr style={{ background: "var(--panel2)" }}><th className="px-3 py-2">Primitive</th><th className="px-3 py-2">Reference (wrapper) type</th></tr></thead>
            <tbody>{BOX.map(([a, b]) => <tr key={a} className="border-t" style={{ borderColor: "var(--line)" }}><td className="mono px-3 py-1.5">{a}</td><td className="mono px-3 py-1.5">{b}</td></tr>)}</tbody>
          </table>
        </div>
        <p>Try it: which additions compile?</p>
        <TypePicker />
        <Check
          q="Which declaration is legal?"
          options={["SLList<int> a = new SLList<>();", "SLList<Integer> a = new SLList<>();", "SLList<integer> a = new SLList<>();", "SLList a<Integer> = new SLList();"]}
          answer={1}
          why="A type argument must be a reference type: Integer, not int. Java is case-sensitive, so `integer` isn't a type."
        />
      </Sec>

      <Sec id="adts" kicker="Part 2" title="Stack and queue: two rules for the same data">
        <Row>
          <Panel title="Stack: LIFO"><strong>Last in, first out.</strong> Insert (<I>push</I>) and delete (<I>pop</I>) at the <em>same end</em>, the top. Plates, undo history, function calls.</Panel>
          <Panel title="Queue: FIFO"><strong>First in, first out.</strong> Insert (<I>enqueue</I>) at the rear; delete (<I>dequeue</I>) from the front. Waiting lines, print jobs.</Panel>
        </Row>
        <p>These are <strong>abstract data types</strong>: they say <em>what</em> operations exist and how they behave, not <em>how</em> they are stored. Try both:</p>
        <Playground />
        <Predict />
      </Sec>

      <Sec id="using" kicker="Part 3" title="Using a stack to solve problems">
        <Callout kind="key" title="Recognise a stack problem">
          If the rule is &quot;match / undo / reverse the <em>most recent</em> thing&quot;, use a stack. Balanced brackets is the classic: a closer must match the most recent unmatched opener.
        </Callout>
        <Brackets />
        <Check
          q="Which ADT would you choose for each: (1) undo in a text editor; (2) customers waiting for a cashier?"
          options={["(1) queue, (2) stack", "(1) stack, (2) queue", "both stacks", "both queues"]}
          answer={1}
          why="Undo reverses the most recent action first (LIFO: stack). Customers are served in arrival order (FIFO: queue)."
        />
      </Sec>

      <Sec id="impl" kicker="Part 4" title="Implementing them with lists">
        <div className="card my-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr style={{ background: "var(--panel2)" }}><th className="px-3 py-2">ADT operation</th><th className="px-3 py-2">Using SLList methods</th><th className="px-3 py-2">Cost</th></tr></thead>
            <tbody>
              {[
                ["push(x)", "addFirst(x)", "constant"],
                ["pop()", "removeFirst()", "constant"],
                ["enqueue(x)", "addLast(x)", "grows with n (unless we keep a last pointer)"],
                ["dequeue()", "removeFirst()", "constant"],
              ].map(([a, b, c]) => <tr key={a} className="border-t" style={{ borderColor: "var(--line)" }}><td className="mono px-3 py-1.5">{a}</td><td className="mono px-3 py-1.5">{b}</td><td className="px-3 py-1.5 muted">{c}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p>A stack works nicely at the <em>front</em> of a singly linked list, because both add and remove there are cheap. A queue needs to add at one end and remove at the other, so we want fast access to both ends.</p>
        <Check
          q="Push 1, push 2, push 3, pop, pop. What are the two values popped, in order?"
          options={["1, 2", "3, 2", "2, 3", "3, 1"]}
          answer={1}
          why="Stack = LIFO: the last pushed (3) is popped first, then 2."
        />
        <Check
          q="Enqueue 1, enqueue 2, enqueue 3, dequeue, dequeue. What are the two values dequeued, in order?"
          options={["1, 2", "3, 2", "2, 3", "3, 1"]}
          answer={0}
          why="Queue = FIFO: the first enqueued (1) leaves first, then 2."
        />
      </Sec>
    </>
  );
}
