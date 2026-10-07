"use client";
import { useState } from "react";
import { Callout, Check, Code, Panel, Row, Sec } from "../ui";
import { Trace } from "../viz";
import { PUPPY_CODE, PUPPY_FRAMES, PUPPY_ROWS } from "@/lib/puppySim";

export default function RefStation() {
  const [ans, setAns] = useState<string[]>(() => Array(10).fill(""));
  const [checked, setChecked] = useState(false);
  const ok = PUPPY_ROWS.map((r, i) => ans[i].trim().toLowerCase() === r.answer.toLowerCase());
  const score = ok.filter(Boolean).length;
  const traps = Array.from(new Set(PUPPY_ROWS.filter((_, i) => !ok[i]).map((r) => r.trap)));

  return (
    <div>
      <p className="text-lg muted">
        Problem 1 is <strong>5 points for ten one-line answers</strong>, and every wrong answer comes from the same four mistakes. Learn to see the boxes and arrows and these become free points.
      </p>

      <Callout kind="key" title="The four rules (everything in Problem 1 is one of these)">
        <ol>
          <li>A variable holds <strong>either a value or an arrow</strong>. An array of objects is a row of arrows.</li>
          <li><strong>Calling a method copies each argument.</strong> A copied arrow still reaches the same object (writing through it sticks), but re-pointing the copy does nothing to the caller.</li>
          <li><code className="inline">static</code> means <strong>one box for the whole class</strong>, not one per object. <code className="inline">kone.breed</code> is just a fancy way to write <code className="inline">Puppy.breed</code>.</li>
          <li><code className="inline">==</code> on references asks &quot;same object?&quot;; on numbers it compares values. <code className="inline">.equals</code> compares contents.</li>
        </ol>
      </Callout>

      <Sec kicker="Step 1 · Predict first" title="What does each println print?">
        <p>Read the code, commit to ten answers <em>before</em> you touch the walkthrough. Case does not matter.</p>
        <Code code={PUPPY_CODE} title="the program from the quiz (println means System.out.println)" />
        <div className="card card-pad my-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {PUPPY_ROWS.map((r, i) => (
              <label key={r.n} className="flex items-center gap-2 rounded-lg px-2 py-1" style={checked ? { background: ok[i] ? "var(--good-soft)" : "var(--bad-soft)" } : undefined}>
                <span className="chip">#{r.n}</span>
                <span className="mono min-w-0 flex-1 truncate text-[0.78rem] muted" title={r.expr}>{r.expr}</span>
                <input
                  className="mono w-24 rounded-md border bg-transparent px-2 py-1 text-sm"
                  style={{ borderColor: "var(--line)" }}
                  value={ans[i]}
                  onChange={(e) => {
                    const v = [...ans];
                    v[i] = e.target.value;
                    setAns(v);
                    setChecked(false);
                  }}
                  aria-label={`answer ${r.n}`}
                />
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="btn btn-primary" onClick={() => setChecked(true)} disabled={ans.every((a) => !a.trim())}>Check my answers</button>
            <button className="btn" onClick={() => { setAns(Array(10).fill("")); setChecked(false); }}>Clear</button>
            {checked && (
              <span className="text-sm">
                <strong>{score}/10</strong> correct = <strong>{score * 0.5}/5</strong> points
              </span>
            )}
          </div>
          {checked && (
            <div className="mt-3 grid gap-2 text-sm">
              {PUPPY_ROWS.map((r, i) =>
                ok[i] ? null : (
                  <div key={r.n} className="rounded-lg px-3 py-2" style={{ background: "var(--panel2)" }}>
                    <strong>#{r.n}</strong> expected <code className="inline">{r.answer}</code>
                    <span className="chip ml-2">{r.trap}</span>
                    <div className="mt-0.5 muted">{r.why}</div>
                  </div>
                ),
              )}
              {traps.length > 0 ? (
                <div className="mt-1">
                  Your misses come from: {traps.map((t) => <span key={t} className="chip mr-1">{t}</span>)}. Watch those steps in the walkthrough below.
                </div>
              ) : (
                <div style={{ color: "var(--good)" }}>Perfect. Run the walkthrough anyway to confirm you can explain each line, then do the drills.</div>
              )}
            </div>
          )}
        </div>
      </Sec>

      <Sec kicker="Step 2 · Watch it run" title="The same program, one line at a time">
        <p>Look at the <strong>top of the heap</strong> (the static box) and at which arrows move. Notice that the helper methods only ever change objects, never the caller&apos;s variables.</p>
        <Trace code={PUPPY_CODE} frames={PUPPY_FRAMES} title="Puppy program: memory diagram" />
      </Sec>

      <Sec kicker="Step 3 · Drills" title="Same traps, new code">
        <Check
          q="What does this print?"
          code={`class Box { static int count; int id;\n    Box() { count++; id = count; } }\n// main\nBox a = new Box(); Box b = new Box(); Box c = new Box();\nSystem.out.println(a.id + " " + b.id + " " + c.id + " " + Box.count);`}
          options={["1 2 3 3", "3 3 3 3", "1 1 1 3", "1 2 3 1"]}
          answer={0}
          why="id is per-object and was copied from count at construction time (1, 2, 3). count is the single shared box, which ends at 3."
        />
        <Check
          q="What does this print?"
          code={`static void f(int[] a) { a = new int[]{9, 9}; }\nstatic void g(int[] a) { a[0] = 9; }\n// main\nint[] x = {1, 2};\nf(x);\ng(x);\nSystem.out.println(x[0] + "," + x[1]);`}
          options={["9,2", "9,9", "1,2", "1,9"]}
          answer={0}
          why="f re-points its own copy of the arrow: no effect on x. g writes through its copy of the arrow into the shared array: x[0] becomes 9."
        />
        <Check
          q="What does this print?"
          code={`int[] p = {1, 2};\nint[] q = {1, 2};\nSystem.out.println((p == q) + " " + p.equals(q));`}
          options={["true true", "false true", "false false", "true false"]}
          answer={2}
          why="Arrays do not override equals, so equals behaves like ==: two different arrays are never equal, even with the same contents."
        />
        <Check
          q="What does this print?"
          code={`String s = "hi";\nString t = s;\ns = s + "!";\nSystem.out.println(t);`}
          options={["hi!", "hi", "!", "null"]}
          answer={1}
          why={"s + \"!\" builds a NEW String and re-points s to it. t still points to the original \"hi\". Strings can never be changed in place."}
        />
        <Row>
          <Panel title="Your 20-second routine on the quiz">
            Draw a stack of variables. Draw each <code className="inline">new</code> as a box. For every call, write the copied arrows next to the callee. Cross out the callee&apos;s locals when it returns.
          </Panel>
          <Panel title="Fast tells">
            See <code className="inline">static</code>? Draw ONE box and point everything at it. See <code className="inline">x = new …</code> inside a method? Only the local x moved.
          </Panel>
        </Row>
      </Sec>
    </div>
  );
}
