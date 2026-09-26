"use client";
import { useState } from "react";
import { Callout, Check, Code, I, Panel, Reveal, Row, Sec } from "../ui";
import { ArrayBoxes, Frame, Trace } from "../viz";

type Policy = "plus1" | "double";
const grow = (c: number, p: Policy) => (p === "double" ? c * 2 : c + 1);

/* ---------- interactive growing array ---------- */
function Grower() {
  const [policy, setPolicy] = useState<Policy>("double");
  const [cap, setCap] = useState(1);
  const [size, setSize] = useState(0);
  const [total, setTotal] = useState(0);
  const [last, setLast] = useState(0);
  const reset = (p = policy) => { setPolicy(p); setCap(1); setSize(0); setTotal(0); setLast(0); };
  const add = (k: number) => {
    let c = cap, s = size, t = total, l = 0;
    for (let i = 0; i < k; i++) {
      if (s === c) { l = s; t += s; c = grow(c, policy); }
      s++;
    }
    setCap(c); setSize(s); setTotal(t); setLast(k === 1 ? l : 0);
  };
  const values = Array.from({ length: cap }, (_, i) => (i < size ? i + 1 : null));
  return (
    <div className="card card-pad my-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm muted">When full, grow by:</span>
        {(["plus1", "double"] as const).map((p) => (
          <button key={p} className="btn" onClick={() => reset(p)} style={policy === p ? { background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" } : undefined}>
            {p === "plus1" ? "+1 slot" : "×2 (doubling)"}
          </button>
        ))}
        <span className="mx-1" />
        <button className="btn btn-primary" onClick={() => add(1)}>addLast</button>
        <button className="btn" onClick={() => add(8)}>add 8</button>
        <button className="btn" onClick={() => reset()}>reset</button>
      </div>
      <div className="mt-3">
        <ArrayBoxes spec={{ name: `items (capacity ${cap})`, values, hi: last ? Array.from({ length: last }, (_, i) => i) : [] }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        <span className="chip mono">size = {size}</span>
        <span className="chip mono">capacity = {cap}</span>
        <span className="chip mono">copies in last add = {last}</span>
        <span className="chip mono" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>total copies = {total}</span>
        <span className="chip mono">copies / n = {size ? (total / size).toFixed(2) : "0"}</span>
      </div>
      {last > 0 && <p className="mt-2 text-sm">The array was full, so a bigger one was allocated and all <strong>{last}</strong> existing items were copied over (highlighted).</p>}
    </div>
  );
}

/* ---------- chart ---------- */
function totals(n: number, p: Policy) {
  const out: number[] = [];
  let c = 1, s = 0, t = 0;
  for (let i = 0; i < n; i++) {
    if (s === c) { t += s; c = grow(c, p); }
    s++;
    out.push(t);
  }
  return out;
}
function Chart() {
  const [n, setN] = useState(64);
  const a = totals(n, "plus1");
  const b = totals(n, "double");
  const W = 460, H = 240, L = 44, B = 26, T = 10, R = 10;
  const max = Math.max(...a, 2 * n);
  const x = (i: number) => L + ((W - L - R) * i) / Math.max(1, n - 1);
  const y = (v: number) => H - B - ((H - B - T) * v) / max;
  const pts = (arr: number[]) => arr.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const ref = Array.from({ length: n }, (_, i) => 2 * (i + 1));
  return (
    <div className="card card-pad my-4">
      <label className="flex items-center gap-3 text-sm">Number of addLast calls n = <strong className="mono">{n}</strong>
        <input type="range" min={8} max={200} value={n} onChange={(e) => setN(+e.target.value)} className="flex-1 accent-[var(--accent)]" />
      </label>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--muted)" />
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="var(--muted)" />
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(max * f)} y2={y(max * f)} stroke="var(--line)" />
            <text x={L - 4} y={y(max * f) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{Math.round(max * f)}</text>
          </g>
        ))}
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--muted)">n (items added)</text>
        <polyline points={pts(a)} fill="none" stroke="var(--bad)" strokeWidth="2.5" />
        <polyline points={pts(ref)} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 4" />
        <polyline points={pts(b)} fill="none" stroke="var(--teal)" strokeWidth="2.5" />
      </svg>
      <div className="flex flex-wrap gap-4 text-sm">
        <span><span style={{ color: "var(--bad)" }}>━</span> grow by +1: {a[n - 1]} copies (~n²/2)</span>
        <span><span style={{ color: "var(--teal)" }}>━</span> doubling: {b[n - 1]} copies</span>
        <span><span className="muted">┅</span> the line 2n = {2 * n}</span>
      </div>
    </div>
  );
}

/* ---------- addFirst trace ---------- */
const AF_CODE = `public void addFirst(int x) {
    if (size == items.length) resize(size * 2);
    for (int i = size; i > 0; i--) {
        items[i] = items[i - 1];
    }
    items[0] = x;
    size++;
}`;
const AF_FRAMES: Frame[] = (() => {
  const a: (number | null)[] = [3, 7, 9, null];
  const F: Frame[] = [];
  const A = (ptrs: Record<string, number>, hi: number[]) => [{ name: "items (size = 3, capacity 4)", values: [...a], ptrs, hi }];
  F.push({ line: 2, arrays: A({}, []), note: "size 3 < capacity 4, so no resize. We want to put 5 at index 0. But index 0 is occupied." });
  for (let i = 3; i > 0; i--) {
    a[i] = a[i - 1];
    F.push({ line: 4, vars: { i }, arrays: A({ i }, [i]), note: <>items[{i}] = items[{i - 1}]. We copy <strong>from the far end</strong>, so each cell we overwrite has already been copied.</> });
  }
  a[0] = 5;
  F.push({ line: 6, arrays: A({}, [0]), note: "Now index 0 is free (a stale copy of 3 sits there). Overwrite it with 5." });
  F.push({ line: 7, vars: { size: 4 }, arrays: A({}, []), note: <>size++. We moved 3 items. In general, <strong>addFirst moves all n items</strong>, so its cost grows with n. That&apos;s the price of contiguous storage.</> });
  return F;
})();

/* ---------- GC demo ---------- */
function Loiter() {
  const [nullIt, setNullIt] = useState(false);
  const [removed, setRemoved] = useState(false);
  const vals = ["A", "B", "C", "D"];
  const size = removed ? 3 : 4;
  const shown = vals.map((v, i) => (i < size ? v : nullIt ? null : v));
  return (
    <div className="card card-pad my-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={nullIt} onChange={(e) => { setNullIt(e.target.checked); setRemoved(false); }} className="accent-[var(--accent)]" />
        removeLast sets the vacated slot to <span className="mono">null</span>
      </label>
      <div className="mt-2 flex items-center gap-3">
        <button className="btn btn-primary" disabled={removed} onClick={() => setRemoved(true)}>removeLast()</button>
        <button className="btn" onClick={() => setRemoved(false)}>undo</button>
      </div>
      <ArrayBoxes spec={{ name: `items   (size = ${size})`, values: shown, dim: removed ? [3] : [], hi: removed && !nullIt ? [3] : [] }} />
      {removed && (
        <p className="text-sm" style={{ color: nullIt ? "var(--good)" : "var(--bad)" }}>
          {nullIt ? "✓ Nothing points at object D any more, so Java can garbage-collect it." : "✗ items[3] still holds a reference to D. Even though size says it's gone, D stays reachable, so it is never freed (\"loitering\")."}
        </p>
      )}
    </div>
  );
}

export default function ArrayListLesson() {
  return (
    <>
      <p className="text-lg muted">Linked chains can&apos;t jump to index <I>i</I>. Arrays can, but they can&apos;t grow. The ArrayList idea: <strong>wrap an array, and swap in a bigger one when it fills up</strong>.</p>

      <Sec id="design" kicker="Part 1" title="The design and its invariants">
        <Code code={`public class AList<T> {\n    private T[] items;   // the array; capacity = items.length\n    private int size;    // number of real items; also the next free index\n\n    public AList() {\n        items = (T[]) new Object[8];   // can't write new T[8]\n        size = 0;\n    }\n    public T get(int i)        { return items[i]; }        // instant\n    public int size()          { return size; }\n    public T getLast()         { return items[size - 1]; }\n}`} />
        <Callout kind="key" title="Invariants (things that must stay true)">
          <ul>
            <li>Items live in <I>items[0 .. size-1]</I>, packed at the left.</li>
            <li><I>size</I> is also the index where the next addLast goes.</li>
            <li>The last item is <I>items[size - 1]</I> (not <I>items[size]</I>!).</li>
          </ul>
        </Callout>
        <Reveal q={<>Why can&apos;t we write <I>new T[8]</I>? What does the code use instead?</>}>
          <p>Java doesn&apos;t allow creating arrays of a generic type. The workaround is <I>(T[]) new Object[8]</I>: make an <I>Object</I> array and <strong>typecast</strong> it to <I>T[]</I>. You get a compiler warning that you can ignore.</p>
        </Reveal>
      </Sec>

      <Sec id="resize" kicker="Part 2" title="Resizing">
        <Code code={`private void resize(int newCapacity) {\n    T[] bigger = (T[]) new Object[newCapacity];\n    for (int i = 0; i < size; i++) {\n        bigger[i] = items[i];         // copy every real item\n    }\n    items = bigger;                   // old array becomes garbage\n}\n\npublic void addLast(T x) {\n    if (size == items.length) {\n        resize(size * 2);             // grow first\n    }\n    items[size] = x;                  // then store\n    size++;\n}`} />
        <Callout kind="warn">If the capacity could ever be 0, then <I>0 × 2 = 0</I> and the array never grows. Start with capacity ≥ 1 or use <I>Math.max</I>.</Callout>
        <p>Play with it. Try both policies, then press <strong>add 8</strong> several times and compare the <em>total copies</em>.</p>
        <Grower />
      </Sec>

      <Sec id="amortized" kicker="Part 3" title="Why doubling is cheap on average">
        <Chart />
        <Row>
          <Panel title="Grow by +1">Every add after the array fills copies everything: 1 + 2 + … + (n−1) ≈ n²/2. Terrible.</Panel>
          <Panel title="Doubling">Copies happen when the array holds 1, 2, 4, 8, …, 2ʲ items, where 2ʲ &lt; n. That sums to 2ʲ⁺¹ − 1, and since 2ʲ &lt; n this is less than 2n. So <strong>n adds cost at most about 2n copies: constant work per add, on average</strong> (&quot;amortized constant&quot;).</Panel>
        </Row>
        <Callout kind="key">Expensive resizes are rare, and each one buys lots of cheap adds afterwards. That is the argument to remember: the doubling is what makes the copies rare.</Callout>
        <Check
          q="Start with capacity 1 and size 0, growth by doubling. After 8 addLast calls, how many total copy steps have happened?"
          options={["8", "7", "15", "28"]}
          answer={1}
          why="Copies happen when adding the 2nd (copy 1, cap→2), 3rd (copy 2, cap→4) and 5th item (copy 4, cap→8): 1 + 2 + 4 = 7. The 9th add would copy 8 more."
        />
        <Check
          q="Same start, but growth is +1. Total copy steps after 8 addLast calls?"
          options={["7", "8", "28", "36"]}
          answer={2}
          why="Every add from the 2nd on finds the array full and copies all current items: 1+2+…+7 = 28."
        />
      </Sec>

      <Sec id="front" kicker="Part 4" title="Why addFirst hurts">
        <Trace title="addFirst(5) on [3, 7, 9]" code={AF_CODE} frames={AF_FRAMES} />
        <Check
          q="Why does the shifting loop run from the end (i = size down to 1) instead of from the front?"
          options={["Speed", "So we don't overwrite items we haven't copied yet", "Because arrays are indexed from the end", "It doesn't matter"]}
          answer={1}
          why="Going forward, items[1] = items[0] would destroy the 7 before it's copied to index 2. Copying from the far end always writes into a cell whose old value has already been moved."
        />
      </Sec>

      <Sec id="gc" kicker="Part 5" title="removeLast and garbage collection">
        <Code code={`public T removeLast() {\n    T itemToRemove = items[size - 1];\n    items[size - 1] = null;     // ← important for generic arrays\n    size--;\n    return itemToRemove;\n}`} />
        <Loiter />
        <p>Java frees an object only when <strong>no reference</strong> to it remains. Decrementing <I>size</I> changes what <em>we</em> consider part of the list, but the array cell still points to the object.</p>
      </Sec>

      <Sec id="compare" kicker="Part 6" title="Array list vs linked list">
        <div className="card my-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr style={{ background: "var(--panel2)" }}><th className="px-3 py-2">Operation</th><th className="px-3 py-2">AList (array)</th><th className="px-3 py-2">SLList (sentinel, no last ptr)</th></tr></thead>
            <tbody>
              {[
                ["get(i)", "constant", "grows with i"],
                ["addLast", "constant on average (amortized)", "grows with n"],
                ["removeLast", "constant", "grows with n (need the node before last)"],
                ["addFirst", "grows with n (shift everything)", "constant"],
                ["removeFirst", "grows with n (shift)", "constant"],
                ["memory", "spare capacity wasted", "one extra pointer per node"],
              ].map(([a, b, c]) => <tr key={a} className="border-t" style={{ borderColor: "var(--line)" }}><td className="mono px-3 py-1.5">{a}</td><td className="px-3 py-1.5">{b}</td><td className="px-3 py-1.5">{c}</td></tr>)}
            </tbody>
          </table>
        </div>
        <Check
          q="You need lots of get(i) calls in the middle of the list and appends at the end. Which do you pick?"
          options={["SLList", "AList", "They're identical", "Neither can do get(i)"]}
          answer={1}
          why="AList's get(i) is one array read. SLList would hop i times. addLast is amortized constant for AList."
        />
      </Sec>
    </>
  );
}
