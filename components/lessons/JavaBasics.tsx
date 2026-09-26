"use client";
import { useState } from "react";
import { Callout, Check, Code, I, Reveal, Sec } from "../ui";
import { Frame, Mem, MObj, Trace } from "../viz";

/* ---------------- Python vs Java ---------------- */
const PYJ: [string, string, string][] = [
  ["Variable", "x = 5", "int x = 5;   // type is required and fixed"],
  ["Print", "print(x)", "System.out.println(x);"],
  ["If / else", "if x > 0:\n    …\nelif …:\nelse:", "if (x > 0) {\n    …\n} else if (…) {\n} else {\n}"],
  ["Counting loop", "for i in range(n):", "for (int i = 0; i < n; i++)"],
  ["For each", "for x in a:", "for (int x : a)"],
  ["List / array", "a = [1, 2, 3]\nlen(a)", "int[] a = {1, 2, 3};\na.length   // no ( )"],
  ["String length / char", "len(s)   s[i]", "s.length()   s.charAt(i)"],
  ["Logic", "and  or  not", "&&   ||   !"],
  ["Integer division", "7 // 2  →  3", "7 / 2  →  3   (int / int is int!)\n7 / 2.0 → 3.5"],
  ["String equality", "s == t", "s.equals(t)   // == compares references"],
];

function PyJava() {
  return (
    <div className="card my-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ background: "var(--panel2)" }}>
            <th className="px-3 py-2">Idea</th>
            <th className="px-3 py-2">Python</th>
            <th className="px-3 py-2">Java</th>
          </tr>
        </thead>
        <tbody>
          {PYJ.map(([a, b, c]) => (
            <tr key={a} className="border-t align-top" style={{ borderColor: "var(--line)" }}>
              <td className="px-3 py-2 font-medium">{a}</td>
              <td className="mono whitespace-pre px-3 py-2 text-[0.8rem]">{b}</td>
              <td className="mono whitespace-pre px-3 py-2 text-[0.8rem]">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- max loop trace ---------------- */
const MAX_CODE = `public static int maxFor(int[] numbers) {
    int best = numbers[0];
    for (int i = 1; i < numbers.length; i++) {
        if (numbers[i] > best) {
            best = numbers[i];
        }
    }
    return best;
}`;
function maxFrames(a: number[]): Frame[] {
  const F: Frame[] = [];
  let best = a[0];
  F.push({ line: 2, vars: { best }, arrays: [{ name: "numbers", values: a, ptrs: {}, hi: [0] }], note: <>Start with the first element. We can&apos;t start from 0, since every number might be negative.</> });
  for (let i = 1; i < a.length; i++) {
    const bigger = a[i] > best;
    F.push({ line: 4, vars: { i, best }, arrays: [{ name: "numbers", values: a, ptrs: { i }, hi: [i] }], note: <>Compare numbers[{i}] = {a[i]} with best = {best}: {bigger ? "bigger, so update." : "not bigger, keep best."}</> });
    if (bigger) {
      best = a[i];
      F.push({ line: 5, vars: { i, best }, arrays: [{ name: "numbers", values: a, ptrs: { i }, hi: [i] }], note: <>best = {best}.</> });
    }
  }
  F.push({ line: 8, vars: { best }, arrays: [{ name: "numbers", values: a }], note: <>Loop over: return {best}. Note the loop compared n-1 pairs. It started at index 1.</> });
  return F;
}

/* ---------------- array statements ---------------- */
const ARR_CODE = `int[] a = {7, 1, 1, 9, 8, 2};
int b = a[0] + 5;
a[4] = 25;
a[2]++;
a[3] += 11;`;
const ARR_FRAMES: Frame[] = (() => {
  const a = [7, 1, 1, 9, 8, 2];
  const F: Frame[] = [];
  F.push({ line: 1, arrays: [{ name: "a", values: [...a] }], note: "Array literal creates a length-6 array. The size is fixed from now on." });
  F.push({ line: 2, vars: { b: 12 }, arrays: [{ name: "a", values: [...a], hi: [0] }], note: "b = a[0] + 5 = 7 + 5 = 12. b is a plain int; it holds no link back to the array." });
  a[4] = 25;
  F.push({ line: 3, vars: { b: 12 }, arrays: [{ name: "a", values: [...a], hi: [4] }], note: "a[4] = 25 overwrites the 8." });
  a[2]++;
  F.push({ line: 4, vars: { b: 12 }, arrays: [{ name: "a", values: [...a], hi: [2] }], note: "a[2]++ adds 1 to that cell: 1 → 2." });
  a[3] += 11;
  F.push({ line: 5, vars: { b: 12 }, arrays: [{ name: "a", values: [...a], hi: [3] }], note: "a[3] += 11 means a[3] = a[3] + 11: 9 → 20." });
  return F;
})();

/* ---------------- alias vs copy (memory) ---------------- */
const arrObj = (id: string, x: number, y: number, vals: number[], hi = false): MObj => ({
  id,
  cls: "int[]",
  x,
  y,
  hi,
  fields: vals.map((v, i) => ({ name: `[${i}]`, value: v })),
});
const ALIAS_CODE = `int[] a = {1, 2, 3};
int[] b = a;
int[] c = Arrays.copyOf(a, a.length);
b[0] = 99;
System.out.println(a[0]);
System.out.println(c[0]);`;
const ALIAS_FRAMES: Frame[] = (() => {
  const A1 = (v: number[], hi = false) => arrObj("A1", 220, 10, v, hi);
  const m = (vars: Mem["vars"], objs: MObj[]): Mem => ({ vars, objs });
  return [
    { line: 1, mem: m([{ name: "a", type: "int[]", ref: "A1" }], [A1([1, 2, 3])]), note: "a holds an arrow (reference) to an array object on the heap." },
    { line: 2, mem: m([{ name: "a", type: "int[]", ref: "A1" }, { name: "b", type: "int[]", ref: "A1" }], [A1([1, 2, 3])]), note: <><strong>b = a copies the arrow, not the array.</strong> Now a and b are aliases of one array.</> },
    { line: 3, mem: m([{ name: "a", type: "int[]", ref: "A1" }, { name: "b", type: "int[]", ref: "A1" }, { name: "c", type: "int[]", ref: "A2" }], [A1([1, 2, 3]), arrObj("A2", 220, 150, [1, 2, 3])]), note: "Arrays.copyOf builds a brand new array with the same contents. Only c points to it." },
    { line: 4, mem: m([{ name: "a", type: "int[]", ref: "A1" }, { name: "b", type: "int[]", ref: "A1" }, { name: "c", type: "int[]", ref: "A2" }], [A1([99, 2, 3], true), arrObj("A2", 220, 150, [1, 2, 3])]), note: "b[0] = 99 follows b's arrow and changes the shared array." },
    { line: 5, out: "99", mem: m([{ name: "a", type: "int[]", ref: "A1" }, { name: "b", type: "int[]", ref: "A1" }, { name: "c", type: "int[]", ref: "A2" }], [A1([99, 2, 3], true), arrObj("A2", 220, 150, [1, 2, 3])]), note: "a sees the change: 99." },
    { line: 6, out: "99\n1", mem: m([{ name: "a", type: "int[]", ref: "A1" }, { name: "b", type: "int[]", ref: "A1" }, { name: "c", type: "int[]", ref: "A2" }], [A1([99, 2, 3]), arrObj("A2", 220, 150, [1, 2, 3], true)]), note: "c is independent: still 1." },
  ];
})();

/* ---------------- loop equivalents ---------------- */
function Loops() {
  const [k, setK] = useState(0);
  const forms = [
    { n: "for-each", c: `for (int x : numbers) {\n    System.out.println(x);\n}`, s: "Easiest when you only need the values, not the positions. You can't change the array cells through x." },
    { n: "while", c: `int index = 0;\nwhile (index < numbers.length) {\n    System.out.println(numbers[index]);\n    index++;\n}`, s: "init, condition and update are spread out. Easy to forget the index++ (infinite loop!)." },
    { n: "C-style for", c: `for (int index = 0; index < numbers.length; index++) {\n    System.out.println(numbers[index]);\n}`, s: "The same three parts, in one line. The variable declared in the header only exists inside the loop." },
  ];
  const f = forms[k];
  return (
    <div className="card my-4 overflow-hidden">
      <div className="flex gap-1 p-2" style={{ background: "var(--panel2)" }}>
        {forms.map((x, i) => (
          <button key={i} onClick={() => setK(i)} className="btn" style={i === k ? { background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" } : undefined}>{x.n}</button>
        ))}
      </div>
      <div className="card-pad">
        <Code code={f.c} />
        <p className="text-sm">{f.s}</p>
      </div>
    </div>
  );
}

/* ---------------- 2D grid demo ---------------- */
function Grid() {
  const [n, setN] = useState(4);
  const [mode, setMode] = useState<"full" | "tri">("full");
  const rows = Array.from({ length: n }, (_, i) => (mode === "full" ? Array.from({ length: n }, (_, j) => i + j) : Array.from({ length: i + 1 }, (_, j) => j)));
  const code =
    mode === "full"
      ? `int[][] grid = new int[n][n];      // n rows, each of length n\nfor (int i = 0; i < n; ++i)\n    for (int j = 0; j < n; ++j)\n        grid[i][j] = i + j;`
      : `int[][] tri = new int[n][];        // n rows, rows not made yet\nfor (int i = 0; i < n; ++i) {\n    tri[i] = new int[i + 1];         // row i has length i+1\n    for (int j = 0; j <= i; ++j)\n        tri[i][j] = j;\n}`;
  return (
    <div className="card card-pad my-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex gap-1">
          <button className="btn" onClick={() => setMode("full")} style={mode === "full" ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>full n×n</button>
          <button className="btn" onClick={() => setMode("tri")} style={mode === "tri" ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>triangular</button>
        </div>
        <label className="flex items-center gap-2">n = <strong>{n}</strong>
          <input type="range" min={1} max={7} value={n} onChange={(e) => setN(+e.target.value)} className="accent-[var(--accent)]" />
        </label>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="mono w-14 text-xs muted">row {i}</span>
            {r.map((v, j) => (
              <div key={j} className="cell !min-w-[38px] !h-[38px] !text-sm pop" title={`[${i}][${j}]`}>{v}</div>
            ))}
          </div>
        ))}
      </div>
      <Code code={code} />
      <p className="text-sm muted">A 2D array is an array whose cells are themselves arrays. That&apos;s why rows can have different lengths.</p>
    </div>
  );
}

/* ---------------- overflow demo ---------------- */
const OvRow = ({ t, v, bad }: { t: string; v: bigint; bad: boolean }) => (
  <div className="mono flex flex-wrap items-center gap-2 py-1 text-sm">
    <span className="w-24 muted">{t}</span>
    <span className="break-all rounded px-2" style={{ background: bad ? "var(--bad-soft)" : "var(--good-soft)" }}>{v.toString()}</span>
    <span className="text-xs">{bad ? "✗ overflowed" : "✓ correct"}</span>
  </div>
);

function Overflow() {
  const [n, setN] = useState(15);
  let i32 = 1n, i64 = 1n, exact = 1n;
  for (let k = 2; k <= n; k++) {
    i32 = BigInt.asIntN(32, i32 * BigInt(k));
    i64 = BigInt.asIntN(64, i64 * BigInt(k));
    exact *= BigInt(k);
  }
  const badInt = i32 !== exact;
  const badLong = i64 !== exact;
  return (
    <div className="card card-pad my-4">
      <label className="flex items-center gap-3 text-sm">
        Compute n! for n = <strong className="mono">{n}</strong>
        <input type="range" min={1} max={30} value={n} onChange={(e) => setN(+e.target.value)} className="flex-1 accent-[var(--accent)]" />
      </label>
      <div className="mt-2">
        <OvRow t="int (32-bit)" v={i32} bad={badInt} />
        <OvRow t="long (64-bit)" v={i64} bad={badLong} />
        <OvRow t="BigInteger" v={exact} bad={false} />
      </div>
      <p className="mt-2 text-sm muted">Java ints and longs silently wrap around when they overflow. No exception is thrown. It just gives a wrong answer. Use <I>BigInteger</I> when numbers can get huge.</p>
    </div>
  );
}

/* ---------------- trailing zeros helper ---------------- */
function Zeros() {
  const [n, setN] = useState(100);
  let f = 1n;
  for (let k = 2; k <= n; k++) f *= BigInt(k);
  const s = f.toString();
  const actual = s.length - s.replace(/0+$/, "").length;
  const parts: { p: number; c: number }[] = [];
  for (let p = 5; p <= n; p *= 5) parts.push({ p, c: Math.floor(n / p) });
  const total = parts.reduce((x, y) => x + y.c, 0);
  return (
    <div className="card card-pad my-4">
      <label className="flex items-center gap-3 text-sm">
        n = <strong className="mono">{n}</strong>
        <input type="range" min={1} max={300} value={n} onChange={(e) => setN(+e.target.value)} className="flex-1 accent-[var(--accent)]" />
      </label>
      <div className="mono mt-2 text-sm">Actual trailing zeros of n!: <strong>{actual}</strong></div>
      <div className="mono text-sm">
        Count of 5-factors: {parts.map((x, i) => <span key={i}>{i ? " + " : ""}⌊{n}/{x.p}⌋={x.c}</span>)} = <strong>{total}</strong>
        {total === actual ? " ✓" : ""}
      </div>
    </div>
  );
}

/* ---------------- lesson ---------------- */
export default function JavaBasics() {
  return (
    <>
      <p className="text-lg muted">You already know programming; this lesson is mostly about what changes when Python becomes Java, and where quiz questions like to hide the tricks.</p>

      <Sec id="pyjava" kicker="Part 1" title="Python → Java cheat table">
        <PyJava />
        <Callout kind="warn">Java is <strong>statically typed</strong>: every variable has a type written next to it, and it never changes. Statements end with <I>;</I>. Blocks use <I>{"{ }"}</I>, and indentation is only for humans.</Callout>
      </Sec>

      <Sec id="loops" kicker="Part 2" title="Three ways to loop">
        <Loops />
        <p>Now apply the approach from Lesson 1 to a running-best problem. Watch how <I>best</I> changes.</p>
        <Trace title="maxFor on {3, 1, 4, 2, 8}" code={MAX_CODE} frames={maxFrames([3, 1, 4, 2, 8])} />
        <Check
          q="What is printed, or what happens?"
          code={`for (int i = 0; i < 5; i++) {\n}\nSystem.out.println(i);`}
          options={["5", "4", "Compile error: i doesn't exist outside the loop", "0"]}
          answer={2}
          why="A variable declared in the for-header lives only inside the loop. To use i afterwards, declare it before the loop (and then write `for (i = 0; ...)`)."
        />
      </Sec>

      <Sec id="arrays" kicker="Part 3" title="Fixed-size arrays">
        <ul>
          <li>Length is fixed when created: <I>new int[10]</I>. It cannot grow. (Growing means making a new one and copying.)</li>
          <li>All elements have the same type. New int arrays start filled with <strong>0</strong>.</li>
          <li><I>a.length</I> is a field (no parentheses). <I>a[i]</I> is valid for <I>0 ≤ i &lt; a.length</I>, else <I>ArrayIndexOutOfBoundsException</I>.</li>
          <li><I>System.out.println(a)</I> prints gibberish like <I>[I@42e26948</I>. Use <I>Arrays.toString(a)</I>.</li>
        </ul>
        <Reveal q={<>Before stepping through: after these five lines, what are <I>a</I> and <I>b</I>?</>}>
          <p>a = {"{7, 1, 2, 20, 25, 2}"}, b = 12. Step through to see exactly how.</p>
        </Reveal>
        <Trace title="Array statements" code={ARR_CODE} frames={ARR_FRAMES} />
        <h3 className="mt-6 text-lg font-semibold">Copying is not <I>=</I></h3>
        <Trace title="Alias vs copy" code={ALIAS_CODE} frames={ALIAS_FRAMES} />
        <Callout kind="tip">The lesson page writes <I>Arrays.copyOf(a)</I>. The real method takes a new length too: <I>Arrays.copyOf(a, a.length)</I>. Remember to <I>import java.util.Arrays;</I> as well.</Callout>
        <Check
          q="What does this print?"
          code={`int[] a = {4, 5, 6};\nint[] b = a;\nb[1] = 0;\nSystem.out.println(a[1]);`}
          options={["5", "0", "4", "It doesn't compile"]}
          answer={1}
          why="b = a copies the reference. Both variables point to the same array, so writing through b changes what a sees."
        />
        <Check
          q="After `int[] z = new int[4];` what is z[2]?"
          options={["null", "0", "Undefined, it may be garbage", "Compile error"]}
          answer={1}
          why="Java initializes int array cells to 0 (boolean to false, references to null). No garbage values, unlike C."
        />
      </Sec>

      <Sec id="grids" kicker="Part 4" title="Arrays of arrays">
        <Grid />
      </Sec>

      <Sec id="numbers" kicker="Part 5" title="When int isn't big enough">
        <Overflow />
        <p>Using BigInteger looks like this (from the lesson):</p>
        <Code code={`import java.math.BigInteger;\n\nBigInteger nFac = BigInteger.valueOf(1);\nfor (int i = 2; i <= n; i++) {\n    nFac = nFac.multiply(BigInteger.valueOf(i));\n}`} />
        <p>Notice that BigInteger is an object, so you can&apos;t write <I>*</I>. You call <I>.multiply</I>, and assign the result back (BigIntegers are immutable).</p>
        <h3 className="mt-6 text-lg font-semibold">Thinking before coding: trailing zeros of n!</h3>
        <p>Practice Exercise I asks for the number of trailing zeros of n!. You can&apos;t compute n! in an int for large n, so <strong>step 2 (trace by hand)</strong> matters. What makes a trailing zero? Try it:</p>
        <Zeros />
        <Reveal q="Given the numbers above, what is being counted, and why does it work?">
          <p>Every trailing zero is a factor 10 = 2 × 5. There are always more 2s than 5s among 1…n, so count the 5s: multiples of 5 give one each, multiples of 25 give an <em>extra</em> one, multiples of 125 another, and so on. So you loop: <I>n /= 5; count += n;</I> No big numbers needed.</p>
        </Reveal>
        <Check
          q="What does `System.out.println(7 / 2);` print?"
          options={["3.5", "3", "4", "3.0"]}
          answer={1}
          why="int / int is integer division: the fractional part is dropped. 7 / 2.0 would give 3.5."
        />
      </Sec>
    </>
  );
}
