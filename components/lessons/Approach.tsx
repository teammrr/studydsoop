"use client";
import { useState } from "react";
import { Callout, Check, Code, I, Reveal, Sec } from "../ui";
import { Frame, Trace } from "../viz";

/* ------------------------------------------------------------------ */
const STEPS = [
  {
    t: "Restate",
    what: "Say the problem in your own words: what goes in, what comes out, and does it change something (mutate) or return something new?",
    ask: ["What are the input types? What is the return type (or void)?", "What is the smallest legal input? (empty array, one element, n = 0)", "Do I modify the input, or build a new thing?"],
    trap: "Starting to type before you can say the output for a made-up input.",
  },
  {
    t: "Trace by hand",
    what: "Pick a small example and solve it on paper, slowly, like a robot. Do at least two: a normal one and an edge case.",
    ask: ["What did my eyes/hands do at each step?", "What did I keep track of in my head? (that becomes a variable)", "When did I stop? (that becomes the loop condition)"],
    trap: "Skipping this. If you can't do it by hand you can't code it.",
  },
  {
    t: "Name the pattern",
    what: "Match what you did to a known pattern from the toolkit below: accumulate, running best, walk a pointer, build a new copy, recurse on the rest…",
    ask: ["Is this 'for every position, do X'?", "Is it 'walk until I fall off the end'?", "Is the problem the same shape but smaller? (recursion)"],
    trap: "Inventing a fancy trick when a plain loop is enough.",
  },
  {
    t: "Plan in words",
    what: "Write 3–6 lines of plain-English pseudocode. State what is true at the top of each loop iteration ('so far I have…').",
    ask: ["What are my variables and what does each mean?", "What is the loop's start, stop, and step?", "What is the base case (recursion) or special case?"],
    trap: "Writing Java syntax and design at the same time, so both go wrong.",
  },
  {
    t: "Code the skeleton",
    what: "Translate the plan line by line. Get the loop bounds right first, fill the body second. Use helper names that say what they mean.",
    ask: ["Is the loop bound < or <=? Is it length or length-1?", "Am I reading an index that could be out of range?", "Did I return in the right place?"],
    trap: "Copy-pasting code you don't understand.",
  },
  {
    t: "Test & trace",
    what: "Run your edge cases first (empty, one, boundaries), then trace your actual code on the small example with a table of variables.",
    ask: ["What happens on the first iteration? On the last?", "What if the input is length 0? length 1?", "Does my code do what the plan said, or what I hoped?"],
    trap: "Only testing the example from the assignment.",
  },
];

function SixSteps() {
  const [k, setK] = useState(0);
  const s = STEPS[k];
  return (
    <div className="card my-4 overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2" style={{ background: "var(--panel2)" }}>
        {STEPS.map((x, i) => (
          <button key={i} onClick={() => setK(i)} className="btn !rounded-full" style={i === k ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>
            {i + 1}. {x.t}
          </button>
        ))}
      </div>
      <div className="card-pad">
        <div className="text-lg font-semibold">
          {k + 1}. {s.t}
        </div>
        <p className="mt-1">{s.what}</p>
        <div className="mt-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--teal)" }}>Ask yourself</div>
        <ul className="prose-l">{s.ask.map((a) => <li key={a}>{a}</li>)}</ul>
        <div className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--bad-soft)" }}>
          <strong>Classic trap:</strong> {s.trap}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
const A0 = [1, 2, -3, 4, 5, 4];

function winResult(a: number[], n: number) {
  return a.map((x, i) => (x > 0 ? a.slice(i, Math.min(i + n, a.length - 1) + 1).reduce((p, c) => p + c, 0) : x));
}

function WindowDemo() {
  const [n, setN] = useState(3);
  const [i, setI] = useState(0);
  const end = Math.min(i + n, A0.length - 1);
  const pos = A0[i] > 0;
  const range = pos ? Array.from({ length: end - i + 1 }, (_, k) => i + k) : [i];
  const sum = pos ? range.reduce((p, k) => p + A0[k], 0) : A0[i];
  return (
    <div className="card card-pad my-4">
      <div className="mb-2 text-sm font-semibold">Try it: what does <span className="mono">windowPosSum(a, n)</span> do at position i?</div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          n = <strong>{n}</strong>
          <input type="range" min={0} max={5} value={n} onChange={(e) => setN(+e.target.value)} className="accent-[var(--accent)]" />
        </label>
        <span className="muted">Click a cell to choose i</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-y-2">
        {A0.map((v, k) => (
          <button key={k} onClick={() => setI(k)} className="flex flex-col items-center" style={{ marginLeft: k ? -2 : 0 }}>
            <div className="cell" style={{ background: range.includes(k) ? "var(--hi)" : undefined, outline: k === i ? "3px solid var(--accent)" : undefined }}>{v}</div>
            <div className="mono text-[0.68rem] muted">{k}{k === i ? " ← i" : k === end && pos ? " ← end" : ""}</div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[0.95rem]">
        {pos ? (
          <>
            <I>a[{i}] = {A0[i]}</I> is positive, so add <I>a[{i}]..a[min({i}+{n}, {A0.length - 1}) = {end}]</I> = <strong>{sum}</strong>.
          </>
        ) : (
          <>
            <I>a[{i}] = {A0[i]}</I> is not positive, so leave it alone.
          </>
        )}
      </p>
      <div className="mt-2 text-sm">
        Full result for n={n}: <span className="mono font-semibold">{JSON.stringify(winResult(A0, n))}</span>
      </div>
    </div>
  );
}

function windowFrames(a0: number[], n: number): Frame[] {
  const a = [...a0];
  const F: Frame[] = [];
  const arr = (extra: { ptrs?: Record<string, number>; hi?: number[] }) => [{ name: "a", values: [...a], ...extra }];
  for (let i = 0; i < a.length; i++) {
    F.push({ line: 3, vars: { i }, arrays: arr({ ptrs: { i }, hi: [i] }), note: <>i = {i}: a[{i}] = {a[i]} {a[i] > 0 ? "is positive, so we replace it with a window sum." : "is not positive, so skip it."}</> });
    if (a[i] > 0) {
      const end = Math.min(i + n, a.length - 1);
      F.push({ line: 4, vars: { i, end }, arrays: arr({ ptrs: { i, end }, hi: range(i, end) }), note: <>The window is a[{i}]..a[{end}]. The <I>min</I> stops us running off the end of the array.</> });
      let sum = 0;
      for (let j = i; j <= end; j++) {
        sum += a[j];
        F.push({ line: 7, vars: { i, end, j, sum }, arrays: arr({ ptrs: { i, j }, hi: range(i, end) }), note: <>Add a[{j}] = {a[j]}. sum is now {sum}.</> });
      }
      a[i] = sum;
      F.push({ line: 9, vars: { i, sum }, arrays: arr({ ptrs: { i }, hi: [i] }), note: <>Store the sum into a[{i}]. Later windows start at i+1 or after, so they never read this overwritten cell. <strong>That&apos;s why we go left to right.</strong></> });
    }
  }
  F.push({ line: 12, arrays: arr({}), note: <>Done. The array was modified in place, and the method returns <I>void</I>.</> });
  return F;
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);

const WINDOW_CODE = `public static void windowPosSum(int[] a, int n) {
    for (int i = 0; i < a.length; i++) {
        if (a[i] > 0) {
            int end = Math.min(i + n, a.length - 1);
            int sum = 0;
            for (int j = i; j <= end; j++) {
                sum += a[j];
            }
            a[i] = sum;
        }
    }
}`;

/* ------------------------------------------------------------------ */
const TOOLKIT = [
  {
    name: "Accumulator",
    when: "sum, product, count, length, 'how many…'",
    ask: "What is the starting value if there is nothing yet? (0 for sum, 1 for product)",
    code: `int total = 0;
for (int x : a) total += x;`,
  },
  {
    name: "Running best",
    when: "max, min, first that matches, longest",
    ask: "Start from a[0] (not from 0!). Only compare against what you've kept.",
    code: `int best = a[0];
for (int i = 1; i < a.length; i++)
    if (a[i] > best) best = a[i];`,
  },
  {
    name: "Scan with an index",
    when: "positions matter: windows, neighbours, every k-th",
    ask: "Which values can i take? Does a[i+1] exist on the last iteration?",
    code: `for (int i = 0; i + 1 < a.length; i++)
    use(a[i], a[i + 1]);`,
  },
  {
    name: "Walk a pointer",
    when: "linked list traversal, 'until I fall off the end'",
    ask: "Stop when current == null, or when current.next == null? Which one do you need?",
    code: `IntNode cur = this;
while (cur != null) {
    // use cur.head
    cur = cur.next;
}`,
  },
  {
    name: "Build a new copy",
    when: "'return a new…', don't change the original",
    ask: "Allocate the result first. Write where the next item goes (result[k++] or a new node).",
    code: `int[] out = new int[a.length];
for (int i = 0; i < a.length; i++)
    out[i] = a[i] + delta;`,
  },
  {
    name: "Recurse on the rest",
    when: "list or problem is 'one item + a smaller same problem'",
    ask: "What is the base case? Assume the recursive call works on the smaller part; what do I add?",
    code: `int size() {
    if (next == null) return 1;
    return 1 + next.size();
}`,
  },
  {
    name: "Shift items",
    when: "insert at front / remove from middle of an array",
    ask: "Which direction do I copy, so I don't overwrite something I still need? (Go from the far end.)",
    code: `for (int i = size; i > 0; i--)
    items[i] = items[i - 1];
items[0] = x;`,
  },
  {
    name: "Keep a stack",
    when: "'most recent unmatched thing', undo, brackets",
    ask: "What do I push? When do I pop? What if the stack is empty when I need to pop?",
    code: `for (char c : s.toCharArray()) {
    if (isOpen(c)) push(c);
    else if (!matches(pop(), c)) return false;
}`,
  },
];

function Toolkit() {
  const [k, setK] = useState(0);
  const t = TOOLKIT[k];
  return (
    <div className="card my-4 grid overflow-hidden md:grid-cols-[13rem_1fr]">
      <div className="flex flex-row flex-wrap gap-1 p-2 md:flex-col" style={{ background: "var(--panel2)" }}>
        {TOOLKIT.map((x, i) => (
          <button key={i} onClick={() => setK(i)} className="btn !justify-start" style={i === k ? { background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" } : undefined}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="card-pad">
        <div className="text-lg font-semibold">{t.name}</div>
        <p className="mt-1"><strong>Looks like:</strong> {t.when}</p>
        <p><strong>Ask:</strong> {t.ask}</p>
        <Code code={t.code} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function Approach() {
  return (
    <>
      <p className="text-lg muted">
        Being &quot;bad at algorithm questions&quot; almost never means you can&apos;t code. It means you&apos;re jumping from the problem straight to Java. Good programmers
        insert a few thinking steps in between. They are learnable, mechanical, and they work on quiz problems too.
      </p>

      <Sec id="loop" kicker="Step 1" title="The 6-step loop">
        <p>Click through each step. Every problem in this course (and on your quiz) can be attacked this way.</p>
        <SixSteps />
        <Callout kind="key" title="The one habit that changes everything">
          Before writing code, be able to <strong>solve a small example by hand and describe what you did</strong>. Code is just that description made precise.
        </Callout>
      </Sec>

      <Sec id="worked" kicker="Step 2" title="Worked example: windowPosSum">
        <p>
          This is Practice Exercise II from the Further Java Basics lesson. Watch each step of the loop applied to it, and <strong>try to answer the questions before revealing</strong>.
        </p>
        <Callout kind="exam" title="The spec">
          <I>windowPosSum(int[] a, int n)</I> replaces each <I>a[i]</I> with the sum of <I>a[i]</I> through <I>a[i+n]</I>, but only if <I>a[i]</I> is positive. If the window runs past the end, sum as many as exist.
        </Callout>

        <h3 className="mt-6 text-lg font-semibold">1 · Restate</h3>
        <Reveal q={<>List three questions about this spec that you would want answered before coding.</>}>
          <ul>
            <li>What if <I>a[i]</I> is 0 or negative? (Leave it alone.)</li>
            <li>What if <I>i + n</I> is past the end? (Stop at <I>a.length - 1</I>.)</li>
            <li>Does the window use the <em>original</em> values or already-updated ones? (Original, and that affects the direction of our loop.)</li>
            <li>Return type is <I>void</I>: we mutate the array in place.</li>
          </ul>
        </Reveal>

        <h3 className="mt-6 text-lg font-semibold">2 · Trace by hand</h3>
        <p>Play with it. Notice what <em>you</em> do at each position: look at the value, decide, then add a range.</p>
        <WindowDemo />

        <h3 className="mt-6 text-lg font-semibold">3 · Name the pattern</h3>
        <Reveal q={<>Looking at what you did in the demo: which two toolkit patterns are combined here?</>}>
          <p><strong>Scan with an index</strong> (for every position i) + <strong>Accumulator</strong> (sum a small range). That means a loop <em>inside</em> a loop. The tricky part is the end of the range: <I>Math.min(i + n, a.length - 1)</I>.</p>
        </Reveal>

        <h3 className="mt-6 text-lg font-semibold">4 · Plan in words</h3>
        <Code code={`for each position i, from left to right:
    if a[i] is not positive: skip
    end = the smaller of (i + n) and the last index
    sum = 0
    add up a[i], a[i+1], ..., a[end]
    a[i] = sum`} />
        <p>Notice that the plan has no Java in it. The only thinking left is translation.</p>

        <h3 className="mt-6 text-lg font-semibold">5 · Code, then 6 · Trace your own code</h3>
        <p>Try writing it yourself first, then step through this version and compare.</p>
        <Trace title="windowPosSum on {1, 2, -3, 4, 5, 4} with n = 3" code={WINDOW_CODE} frames={windowFrames(A0, 3)} />

        <h3 className="mt-6 text-lg font-semibold">Test list (step 6)</h3>
        <ul>
          <li><I>{"{}"}</I> (empty): the outer loop never runs. Fine.</li>
          <li><I>n = 0</I>: window is just <I>a[i]</I> itself. Nothing changes.</li>
          <li><I>n</I> bigger than the array: <I>min</I> saves us.</li>
          <li>All negative: nothing changes.</li>
        </ul>
        <Check
          q="What goes wrong if we loop right to left (i from a.length-1 down to 0)?"
          options={["Nothing, the answer is the same", "Later windows would read cells we already overwrote, giving wrong sums", "It throws ArrayIndexOutOfBoundsException", "It never terminates"]}
          answer={1}
          why="Going right to left, when we handle position i the cells to its right are already replaced by sums. But the window at i must use the original values. Left to right is safe because we only overwrite cells to the left of every later window."
        />
      </Sec>

      <Sec id="toolkit" kicker="Step 3" title="The pattern toolkit">
        <p>Almost every problem in this course is one of these, or two glued together. Click through and learn the &quot;Looks like&quot; column: that is how you recognise them.</p>
        <Toolkit />
      </Sec>

      <Sec id="stuck" kicker="Step 4" title="When you're stuck: the ladder">
        <ol>
          <li><strong>Shrink it.</strong> Solve it for an array of length 1, then 2. What changes?</li>
          <li><strong>Draw it.</strong> Boxes and arrows for lists and objects; cells and indices for arrays.</li>
          <li><strong>Do it by hand</strong> and narrate. Every noun in the narration is a variable.</li>
          <li><strong>Write the loop&apos;s promise:</strong> &quot;after k iterations I have ____&quot;. That sentence is an invariant (Lesson 9).</li>
          <li><strong>Check the ends:</strong> first iteration, last iteration, empty input.</li>
        </ol>
        <Callout kind="tip" title="Off-by-one checklist">
          <ul>
            <li>Array of length n has indices <I>0..n-1</I>. The last index is <I>length - 1</I>.</li>
            <li><I>i &lt; a.length</I> vs <I>i &lt;= a.length</I>: the second reads one past the end.</li>
            <li>Loop from 1 when comparing with <I>a[0]</I> (running best).</li>
            <li>If you read <I>a[i+1]</I>, the loop must stop at <I>a.length - 2</I> (or <I>i + 1 &lt; a.length</I>).</li>
          </ul>
        </Callout>
      </Sec>

      <Sec id="practice" kicker="Step 5" title="Spot the pattern">
        <Check
          q={<>&quot;Return how many elements of the array are even.&quot; Which toolkit pattern?</>}
          options={["Running best", "Accumulator (a counter)", "Shift items", "Recurse on the rest"]}
          answer={1}
          why="A counter is an accumulator that adds 1 when a condition holds. Start at 0; add 1 for each even element."
        />
        <Check
          q={<>&quot;Return the position of the first occurrence of x in the array, or -1.&quot; What should the loop&apos;s return statement look like?</>}
          options={["Return i inside the loop when a[i] == x; return -1 after the loop", "Return -1 inside the loop when a[i] != x", "Return i after the loop", "Return a[0]"]}
          answer={0}
          why="Scan with an index. The early return inside the loop handles 'found'. Reaching the end of the loop means 'never found', so -1 goes after the loop. Returning -1 inside the loop would give up after the first mismatch."
        />
        <Check
          q="You need a running maximum of an array of negative numbers. What is wrong with `int best = 0;` as the start?"
          options={["Nothing", "0 is bigger than every element, so the answer would wrongly be 0", "It won't compile", "It only works for length 1"]}
          answer={1}
          why="Start from a[0] (an element that really exists) and loop from index 1. Starting from 0 injects a value that isn't in the array."
        />
      </Sec>
    </>
  );
}
