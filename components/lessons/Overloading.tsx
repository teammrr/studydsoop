"use client";
import { useState } from "react";
import { Callout, Check, Code, I, Row, Panel, Sec } from "../ui";

type Sig = { name: string; params: string[] };
type Call = { label: string; args: string[] };

const widen = (from: string, to: string) => from === "int" && to === "double";

function resolve(sigs: Sig[], on: boolean[], call: Call) {
  const cands = sigs.map((s, i) => ({ s, i })).filter((x) => on[x.i] && x.s.params.length === call.args.length);
  const exact = cands.find((c) => c.s.params.every((p, k) => p === call.args[k]));
  if (exact) return { sig: exact.s, how: "exact match" };
  const wid = cands.find((c) => c.s.params.every((p, k) => p === call.args[k] || widen(call.args[k], p)));
  if (wid) return { sig: wid.s, how: "after widening int → double" };
  return null;
}
const show = (s: Sig) => `${s.name}(${s.params.join(", ")})`;

function Picker({ title, sigs, calls }: { title: string; sigs: Sig[]; calls: Call[] }) {
  const [on, setOn] = useState(sigs.map(() => true));
  const [k, setK] = useState(0);
  const call = calls[k];
  const r = resolve(sigs, on, call);
  return (
    <div className="card card-pad my-4">
      <div className="mb-2 font-semibold">{title}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Overloads defined (toggle to remove)</div>
          {sigs.map((s, i) => (
            <label key={i} className="mono flex cursor-pointer items-center gap-2 py-0.5 text-sm">
              <input type="checkbox" checked={on[i]} onChange={() => setOn(on.map((v, j) => (j === i ? !v : v)))} className="accent-[var(--accent)]" />
              <span style={{ opacity: on[i] ? 1 : 0.4 }}>{show(s)}</span>
            </label>
          ))}
        </div>
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Pick a call</div>
          <div className="flex flex-wrap gap-1">
            {calls.map((c, i) => (
              <button key={i} className="btn mono !text-xs" onClick={() => setK(i)} style={i === k ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: r ? "var(--good-soft)" : "var(--bad-soft)" }}>
        <span className="mono">{call.label}</span> →{" "}
        {r ? (
          <>
            runs <strong className="mono">{show(r.sig)}</strong> <span className="muted">({r.how})</span>
          </>
        ) : (
          <strong>compile error: no method matches ({call.args.join(", ")})</strong>
        )}
      </div>
    </div>
  );
}

const N = ({ v, set }: { v: number; set: (n: number) => void }) => (
  <input type="number" value={v} onChange={(e) => set(+e.target.value || 0)} className="mono w-16 rounded border px-1" style={{ background: "var(--panel)", borderColor: "var(--line)" }} />
);

/* ---------- static vs instance ---------- */
function StaticDemo() {
  const [x1, setX1] = useState(0);
  const [x2, setX2] = useState(0);
  const [y, setY] = useState(0);
  return (
    <div className="card card-pad my-4">
      <div className="mb-3 text-sm muted">Edit the values. Notice which ones are per-object and which are shared.</div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg p-3" style={{ border: "2px solid var(--ink)" }}>
          <div className="mono text-xs font-bold">ob1 : StaticDemo</div>
          <div className="mono mt-1 text-sm">x = <N v={x1} set={setX1} /></div>
          <div className="mono mt-2 text-sm">sum() = x + y = <strong>{x1 + y}</strong></div>
        </div>
        <div className="rounded-lg p-3" style={{ border: "2px solid var(--ink)" }}>
          <div className="mono text-xs font-bold">ob2 : StaticDemo</div>
          <div className="mono mt-1 text-sm">x = <N v={x2} set={setX2} /></div>
          <div className="mono mt-2 text-sm">sum() = x + y = <strong>{x2 + y}</strong></div>
        </div>
        <div className="rounded-lg p-3" style={{ border: "2px dashed var(--accent)", background: "var(--accent-soft)" }}>
          <div className="mono text-xs font-bold">class StaticDemo (shared)</div>
          <div className="mono mt-1 text-sm">static y = <N v={y} set={setY} /></div>
          <div className="mt-2 text-xs muted">One copy, owned by the class. Write it as <span className="mono">StaticDemo.y</span>.</div>
        </div>
      </div>
    </div>
  );
}

function CounterDemo() {
  const [ids, setIds] = useState<number[]>([]);
  const count = ids.length;
  return (
    <div className="card card-pad my-4">
      <Code code={`class Timer {\n    static int count = 0;   // shared by all Timers\n    int id;                 // one per Timer\n    Timer() {\n        count++;\n        id = count;\n    }\n}`} />
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={() => setIds([...ids, ids.length + 1])}>new Timer()</button>
        <button className="btn" onClick={() => setIds([])}>reset</button>
        <span className="mono text-sm">Timer.count = <strong>{count}</strong></span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ids.map((id) => (
          <div key={id} className="pop mono rounded-lg px-3 py-1 text-sm" style={{ border: "2px solid var(--ink)" }}>Timer · id = {id}</div>
        ))}
        {ids.length === 0 && <span className="text-sm muted">No objects yet, but Timer.count already exists (it belongs to the class).</span>}
      </div>
    </div>
  );
}

export default function Overloading() {
  return (
    <>
      <p className="text-lg muted">Two mechanics questions that quizzes love: <em>which method does Java pick?</em> and <em>is this thing shared or per-object?</em></p>

      <Sec id="signature" kicker="Part 1" title="Method signature">
        <p>A method&apos;s <strong>signature</strong> is its <strong>name + parameter types (in order)</strong>. Return type and parameter <em>names</em> are <strong>not</strong> part of it.</p>
        <Code code={`public double calculateAnswer(double wingSpan, int numberOfEngines,\n                              double length, double grossTons)  // signature: calculateAnswer(double, int, double, double)\npublic int fooBar(int foo, double bar)                          // signature: fooBar(int, double)`} />
        <Callout kind="key">Overloading = several methods with the <strong>same name but different signatures</strong>. Java picks one at compile time from the argument types.</Callout>
      </Sec>

      <Sec id="overloading" kicker="Part 2" title="Which overload runs?">
        <p>Java looks for an <strong>exact</strong> match first. If none, it tries <strong>widening</strong> conversions (an <I>int</I> can become a <I>double</I>). If still none: compile error. Try removing overloads to see the fallbacks.</p>
        <Picker
          title="draw(...) overloads"
          sigs={[
            { name: "draw", params: ["String"] },
            { name: "draw", params: ["int"] },
            { name: "draw", params: ["double"] },
            { name: "draw", params: ["int", "double"] },
          ]}
          calls={[
            { label: 'draw("Hello")', args: ["String"] },
            { label: "draw(24)", args: ["int"] },
            { label: "draw(3.14)", args: ["double"] },
            { label: "draw(25, 2.5)", args: ["int", "double"] },
            { label: "draw(24, 5)", args: ["int", "int"] },
            { label: 'draw(25, "H")', args: ["int", "String"] },
          ]}
        />
        <Picker
          title="Overloaded constructors: MyClass(), MyClass(int), MyClass(double), MyClass(int, int)"
          sigs={[
            { name: "MyClass", params: [] },
            { name: "MyClass", params: ["int"] },
            { name: "MyClass", params: ["double"] },
            { name: "MyClass", params: ["int", "int"] },
          ]}
          calls={[
            { label: "new MyClass()", args: [] },
            { label: "new MyClass(88)", args: ["int"] },
            { label: "new MyClass(17.23)", args: ["double"] },
            { label: "new MyClass(2, 4)", args: ["int", "int"] },
            { label: 'new MyClass("a")', args: ["String"] },
          ]}
        />
        <Check
          q="Do these two methods overload each other, or does this fail to compile?"
          code={`int    compute(int a)  { … }\ndouble compute(int b)  { … }`}
          options={["Legal overloads: return types differ", "Compile error: same signature compute(int)", "Legal: parameter names differ", "Only an error at runtime"]}
          answer={1}
          why="Only the name and parameter types form the signature. Return type and parameter names don't count. Both are compute(int), so it's a duplicate definition."
        />
      </Sec>

      <Sec id="static" kicker="Part 3" title="static vs instance">
        <Row>
          <Panel title="Instance (no keyword)">Belongs to <strong>one object</strong>. Each object has its own copy. Use as <I>obj.x</I>. Methods can use <I>this</I>.</Panel>
          <Panel title="static">Belongs to the <strong>class</strong>. One shared copy. Use as <I>ClassName.y</I>. Works before any object exists (like <I>Math.sqrt</I>, <I>main</I>).</Panel>
        </Row>
        <StaticDemo />
        <p>Another classic: a static counter that every constructor bumps.</p>
        <CounterDemo />
        <Callout kind="warn" title="The static rule">A <strong>static method has no <I>this</I></strong> (there is &quot;no me&quot;), so it cannot use instance variables or call instance methods directly. An instance method <em>can</em> use static things.</Callout>
        <Check
          q="What does this do?"
          code={`class Foo {\n    int x = 5;\n    static int twice() {\n        return x * 2;\n    }\n}`}
          options={["Returns 10", "Compile error: static method can't access instance variable x", "Returns 0", "Runtime exception"]}
          answer={1}
          why="twice() belongs to the class and doesn't know which object's x you mean. Either make x static or make twice() an instance method."
        />
        <Check
          q="After `new Timer(); new Timer(); new Timer();` what is Timer.count, and what are the ids?"
          options={["count = 3, ids 1, 2, 3", "count = 1, ids 1, 1, 1", "count = 3, ids 3, 3, 3", "count = 0"]}
          answer={0}
          why="count is one shared variable that goes 1→2→3. Each constructor copies the current count into that object's own id at the moment it runs."
        />
      </Sec>
    </>
  );
}
