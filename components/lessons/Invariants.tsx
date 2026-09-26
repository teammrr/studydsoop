"use client";
import { useState } from "react";
import { Callout, Check, Code, I, Reveal, Row, Panel, Sec } from "../ui";
import { Frame, Trace } from "../viz";

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));

/* ---------- factorial trace with the invariant checked every time ---------- */
const FACT_CODE = `int factorial(int n) {            // precondition: n >= 0
    int r = 1, m = n;
    while (m > 0) {               // invariant: r * m! = n!  and  m >= 0
        r *= m;
        m -= 1;
    }
    return r;                     // postcondition: r = n!
}`;
function factFrames(n: number): Frame[] {
  const F: Frame[] = [];
  let r = 1, m = n;
  const v = (extra?: Record<string, string | number>) => ({ n, r, m, "r·m!": r * fact(m), "n!": fact(n), ...extra });
  F.push({ line: 2, vars: v(), note: <>Init: r = 1, m = n = {n}. Invariant check: r · m! = 1 · {n}! = n!. ✓ It&apos;s true <strong>before</strong> the loop condition is tested for the first time.</> });
  while (m > 0) {
    F.push({ line: 3, vars: v(), note: <>Top of the loop. Invariant: r · m! = {r} · {fact(m)} = {r * fact(m)} = {fact(n)} = n! ✓ and m ≥ 0 ✓. m &gt; 0, so we enter.</> });
    r *= m;
    F.push({ line: 4, vars: v(), note: <>r *= m. <strong>In the middle of the body the invariant may be temporarily false</strong> (r · m! is now {r * fact(m)}). That&apos;s fine, it only has to be true at the top.</> });
    m -= 1;
    F.push({ line: 5, vars: v(), note: <>m -= 1. Invariant restored: r · m! = {r} · {fact(m)} = {r * fact(m)} = n! ✓. The gap m shrank by 1.</> });
  }
  F.push({ line: 3, vars: v(), note: <>Check fails: m = 0, so we leave. The invariant still holds, and now <strong>m = 0</strong>. So r · 0! = n!, so <strong>r = n!</strong>.</> });
  F.push({ line: 7, vars: v(), out: String(r), note: <>Postcondition established: return r = {r} = {n}!.</> });
  return F;
}

/* ---------- running max, invariant as a sentence ---------- */
const MAX_CODE = `int max(int[] a) {                // precondition: a.length > 0
    int best = a[0];
    for (int i = 1; i < a.length; i++) {
        // invariant: best = largest of a[0..i-1]
        if (a[i] > best) best = a[i];
    }
    return best;                  // i = a.length, so best = max of all of a
}`;
function maxFrames(a: number[]): Frame[] {
  const F: Frame[] = [];
  let best = a[0];
  const A = (i: number, hi: number[]) => [{ name: "a", values: a, ptrs: { i }, hi }];
  F.push({ line: 2, vars: { best }, arrays: A(1, [0]), note: <>Before the loop (i = 1): a[0..0] is just {"{"}{a[0]}{"}"}, and best = {best}. ✓ Invariant true.</> });
  for (let i = 1; i < a.length; i++) {
    F.push({ line: 4, vars: { i, best }, arrays: A(i, range(0, i - 1)), note: <>Top of iteration i = {i}: best = {best} is the largest of a[0..{i - 1}] ✓.</> });
    if (a[i] > best) best = a[i];
    F.push({ line: 5, vars: { i, best }, arrays: A(i, range(0, i)), note: <>After handling a[{i}] = {a[i]}, best = {best} is the largest of a[0..{i}], which is exactly the invariant for the <em>next</em> value of i ({i + 1}). ✓</> });
  }
  F.push({ line: 7, vars: { best }, arrays: A(a.length, range(0, a.length - 1)), out: String(best), note: <>Loop exits with i = a.length, so the invariant says best is the largest of a[0..length-1]: the whole array. ✓</> });
  return F;
}
const range = (a: number, b: number) => (b < a ? [] : Array.from({ length: b - a + 1 }, (_, k) => a + k));

/* ---------- table explorer for the sum example ---------- */
function SumTable() {
  const [x, setX] = useState(6);
  const rows: { i: number; p: number }[] = [];
  let p = 0;
  for (let i = 0; i <= x; i++) {
    rows.push({ i, p });
    p += 2 ** i;
  }
  return (
    <div className="card card-pad my-4">
      <label className="flex items-center gap-3 text-sm">x = <strong className="mono">{x}</strong>
        <input type="range" min={0} max={10} value={x} onChange={(e) => setX(+e.target.value)} className="flex-1 accent-[var(--accent)]" />
      </label>
      <div className="mt-3 overflow-x-auto">
        <table className="mono w-full text-left text-sm">
          <thead><tr className="muted"><th className="px-2">at the top of iteration…</th><th className="px-2">i</th><th className="px-2">p</th><th className="px-2">2ⁱ − 1</th><th className="px-2">p = 2ⁱ − 1 ?</th></tr></thead>
          <tbody>
            {rows.map((r, k) => (
              <tr key={k} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-2 muted">{k === 0 ? "init (before 1st test)" : k === x ? "final test (exit)" : `#${k}`}</td>
                <td className="px-2">{r.i}</td><td className="px-2">{r.p}</td><td className="px-2">{2 ** r.i - 1}</td>
                <td className="px-2" style={{ color: "var(--good)" }}>✓</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm muted">Recipe used to discover the invariant: <strong>write the variables per iteration in a table, then look for a relationship that never breaks.</strong></p>
    </div>
  );
}

export default function Invariants() {
  return (
    <>
      <p className="text-lg muted">An invariant is a promise about your variables. Loop invariants let you <em>prove</em> a loop is right, and, more usefully for you, <strong>they tell you what a loop should be doing</strong> while you write it.</p>

      <Sec id="idea" kicker="Part 1" title="The idea in one picture">
        <Row cols={3}>
          <Panel title="1 · Init">The invariant is true <strong>before</strong> the loop condition is tested the first time.</Panel>
          <Panel title="2 · Preservation">If it is true at the top and the condition holds, then after one run of the body it is true <strong>again</strong>.</Panel>
          <Panel title="3 · Termination">Something (a &quot;gap&quot;) shrinks every iteration and can&apos;t go below its limit, so the loop stops.</Panel>
        </Row>
        <Callout kind="key" title="How the proof finishes">
          When the loop exits, you know two things: <strong>the invariant</strong> and <strong>the negation of the loop condition</strong>. Together they imply the postcondition. This is like induction: init = base case, preservation = inductive step.
        </Callout>
      </Sec>

      <Sec id="fact" kicker="Part 2" title="Factorial: watch the invariant hold">
        <p>Precondition: <I>n ≥ 0</I>. Postcondition: returns <I>n!</I>. Invariant: <I>r · m! = n!</I> and <I>m ≥ 0</I>. The moral: <em>r is the part of n! we&apos;ve already multiplied, m! is the part still to do</em>.</p>
        <Trace title="factorial(4)" code={FACT_CODE} frames={factFrames(4)} />
        <p><strong>Termination:</strong> track <I>m</I>. It starts at n, drops by 1 each iteration, and the loop stops once m is no longer &gt; 0. So after n iterations we exit.</p>
      </Sec>

      <Sec id="find" kicker="Part 3" title="How do I find an invariant?">
        <ol>
          <li>Run the loop on a small example and <strong>tabulate the variables</strong> at the top of each iteration.</li>
          <li>Look for a relationship that never changes (a sum, a product, an equation).</li>
          <li>Check it against the goal: <em>invariant AND loop condition false ⇒ postcondition?</em></li>
        </ol>
        <Code code={`int sum(int x) {                  // precondition: x >= 0\n    int p = 0, i = 0;\n    while (i < x) {               // @loop_invariant: 0 <= i <= x and p = 2**i - 1\n        p += pow(2, i);\n        i += 1;\n    }\n    return p;                     // postcondition: p = 2**x - 1\n}`} />
        <SumTable />
        <Check
          q="At the top of successive iterations, (i, p) = (0,0), (1,1), (2,3), (3,7), (4,15). Which invariant fits?"
          options={["p = i²", "p = 2ⁱ − 1", "p = 2i − 1", "p = i + 1"]}
          answer={1}
          why="2⁰−1 = 0, 2¹−1 = 1, 2²−1 = 3, 2³−1 = 7, 2⁴−1 = 15. ✓. (i² would give 0,1,4,9,16.)"
        />
        <Check
          q="For `sum`, the loop exits when !(i < x), i.e. i ≥ x. With the invariant 0 ≤ i ≤ x, what do we conclude?"
          options={["i < x", "i = x, so p = 2ˣ − 1 (the postcondition)", "p = 0", "x = 0"]}
          answer={1}
          why="i ≥ x and i ≤ x means i = x. Substitute into p = 2ⁱ − 1 to get p = 2ˣ − 1."
        />
        <Check
          q="What quantity should we track to prove that sum's loop terminates?"
          options={["p", "x − i, the gap: it starts at x, drops by 1 each iteration and the loop ends at 0", "2ⁱ", "x + i"]}
          answer={1}
          why="A termination measure decreases every iteration and is bounded below. Here x − i decreases by exactly 1 (i increases, x is fixed) and the loop stops when it reaches 0."
        />
      </Sec>

      <Sec id="arrays" kicker="Part 4" title="Everyday loops have invariants too">
        <p>The running-max loop from Lesson 2 is correct <em>because</em> of a one-sentence invariant.</p>
        <Trace title="max on {4, 9, 2, 7}" code={MAX_CODE} frames={maxFrames([4, 9, 2, 7])} />
        <Callout kind="tip" title="Use this while writing loops">
          Before you write the body, finish the sentence <em>&quot;at the top of each iteration I have already ____&quot;</em>. If the sentence is clear, the body writes itself, and the loop bounds usually fall out too.
        </Callout>
        <Check
          q="For `int s = 0; for (int i = 0; i < a.length; i++) s += a[i];` which invariant (at the top of the loop) is correct?"
          options={["s = a[i]", "s = sum of a[0..i-1] (and 0 ≤ i ≤ a.length)", "s = sum of a[0..i]", "s = 0"]}
          answer={1}
          why="At the top, a[i] hasn't been added yet, so s holds the first i elements: a[0..i-1]. When i = 0 that is the empty sum 0 ✓; when i = a.length it is the whole array ✓."
        />
        <Check
          q="When is a loop invariant required to be true?"
          options={["At every single line inside the body", "Just before the loop condition is tested, on entry and after every iteration", "Only after the loop", "Only before the loop"]}
          answer={1}
          why="Inside the body it may be temporarily broken (like after `r *= m` but before `m -= 1`). It must be restored by the time control returns to the condition test."
        />
      </Sec>

      <Sec id="cond" kicker="Part 5" title="Reasoning through an if (Hoare-style)">
        <p>Inside an <I>if (P)</I> branch, <strong>P is true</strong>. In the <I>else</I> branch, <strong>!P is true</strong>. Annotate what each line guarantees:</p>
        <Code code={`int abs(int x) {                  // precondition: x is an int\n    int a = 0;\n    if (x < 0)\n        // { x < 0 }\n        a = -x;\n        // { a = -x = |x| }   because x is negative\n    else\n        // { x >= 0 }\n        a = x;\n        // { a = x = |x| }    because x is non-negative\n    // { a = |x| }            true in both branches\n    return a;\n}                                 // postcondition: returns |x|`} />
        <Reveal q={<>In your own words: why does the assertion after the whole if/else work, even though the two branches did different things?</>}>
          <p>Because <em>both</em> branches end with the same assertion, <I>a = |x|</I>. Whichever path ran, that fact holds afterwards, so we can state it once after the if/else.</p>
        </Reveal>
      </Sec>
    </>
  );
}
