"use client";
import { useMemo, useState } from "react";
import { PROBLEMS, Problem } from "@/lib/parsons";
import { useProgress } from "@/lib/progress";
import { Code } from "./ui";

type Item = { id: number; t: string; why?: string };

function seededShuffle<T>(a: T[], seed: number) {
  const b = [...a];
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function Builder({ prob, onSolved, solved }: { prob: Problem; onSolved: () => void; solved: boolean }) {
  const items: Item[] = useMemo(
    () => [...prob.solution.map((t, i) => ({ id: i, t })), ...prob.distractors.map((d, i) => ({ id: 100 + i, t: d.t, why: d.why }))],
    [prob],
  );
  const [order] = useState<Item[]>(() => seededShuffle(items, [...prob.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) % 9973));
  const [placed, setPlaced] = useState<Item[]>([]);
  const [hints, setHints] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  const left = order.filter((o) => !placed.some((p) => p.id === o.id));

  const check = () => {
    if (placed.length === 0) return setMsg({ ok: false, text: "Add some lines first." });
    const bad = placed.find((p) => p.why);
    if (bad) return setMsg({ ok: false, text: `“${bad.t.trim()}” doesn't belong. ${bad.why}` });
    for (let k = 0; k < placed.length; k++) {
      if (placed[k].t !== prob.solution[k]) {
        return setMsg({ ok: false, text: `Line ${k + 1} is not right yet: “${placed[k].t.trim()}” is either in the wrong place or (if it's a closing brace) at the wrong indentation. Re-read the plan.` });
      }
    }
    if (placed.length < prob.solution.length) return setMsg({ ok: false, text: `So far so good, but ${prob.solution.length - placed.length} line(s) are still missing.` });
    setMsg({ ok: true, text: "Correct! Now trace it on a tiny example, then explain to yourself why each line is needed." });
    setShowPlan(true);
    onSolved();
  };

  return (
    <div>
      <div className="card card-pad">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="chip">{prob.topic}</span>
          <span className="chip" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>Pattern: {hints >= 1 ? prob.pattern : "?  (reveal with hint 1)"}</span>
          {solved && <span className="chip" style={{ background: "var(--good-soft)", color: "var(--good)" }}>✓ solved</span>}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">{prob.title}</h2>
        <p className="mt-1">{prob.spec}</p>
        <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--panel2)" }}>
          <strong>Before you click anything:</strong> say in one sentence what the inputs/outputs are, and what you would do by hand on a 3-element example. Use the hints only after trying.
        </div>
        <div className="mt-3 flex flex-wrap items-start gap-2">
          <button className="btn" disabled={hints >= prob.hints.length} onClick={() => setHints(hints + 1)}>💡 {hints === 0 ? "Hint" : "Next hint"} ({hints}/{prob.hints.length})</button>
        </div>
        {hints > 0 && (
          <ol className="prose-l mt-2 text-sm">
            {prob.hints.slice(0, hints).map((h, i) => <li key={i}>{h}</li>)}
          </ol>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Line bank (click to add; some lines are decoys)</div>
          <div className="flex flex-col gap-1.5">
            {left.map((it) => (
              <button key={it.id} className="mono btn !justify-start !rounded-md text-left !text-[0.78rem] whitespace-pre" onClick={() => { setPlaced([...placed, it]); setMsg(null); }}>{it.t}</button>
            ))}
            {left.length === 0 && <div className="text-sm muted">(all lines used)</div>}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Your solution (click a line to remove it)</div>
          <div className="codeblock min-h-[8rem]">
            {placed.map((it, k) => (
              <button key={k} onClick={() => { setPlaced(placed.filter((_, j) => j !== k)); setMsg(null); }} className="codeline w-full text-left hover:bg-white/10">
                <span className="ln">{k + 1}</span>
                <span>{it.t}</span>
              </button>
            ))}
            {placed.length === 0 && <div className="px-4 py-2 text-xs" style={{ color: "var(--code-dim)" }}>empty</div>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={check}>Check</button>
            <button className="btn" onClick={() => { setPlaced([]); setMsg(null); }}>Reset</button>
            <button className="btn" onClick={() => { setPlaced(prob.solution.map((t, i) => ({ id: i, t }))); setMsg(null); setShowPlan(true); }}>Show solution</button>
          </div>
          {msg && (
            <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: msg.ok ? "var(--good-soft)" : "var(--bad-soft)" }}>{msg.text}</div>
          )}
        </div>
      </div>

      {showPlan && (
        <div className="card card-pad mt-4">
          <div className="text-sm font-semibold">The plan behind this code</div>
          <Code code={prob.plan} />
          <p className="text-sm muted">Notice how the code is a direct translation of the plan. This is the habit to copy on the quiz: write the plan first.</p>
        </div>
      )}
    </div>
  );
}

export default function CodeLab() {
  const { p, setLab } = useProgress();
  const [k, setK] = useState(0);
  const prob = PROBLEMS[k];
  const solved = PROBLEMS.filter((x) => p.lab[x.id]).length;
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Code Lab</h1>
      <p className="mt-2 muted">
        Assemble the solution from shuffled lines (with decoys). It trains the part you said is hard: <strong>deciding what the code must do</strong>, without getting lost in syntax. {solved}/{PROBLEMS.length} solved.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {PROBLEMS.map((x, i) => (
          <button key={x.id} className="btn !text-xs" onClick={() => setK(i)} style={i === k ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>
            {p.lab[x.id] ? "✓ " : ""}{i + 1}. {x.title}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <Builder key={prob.id} prob={prob} solved={!!p.lab[prob.id]} onSolved={() => setLab(prob.id, true)} />
      </div>
      <div className="mt-4 flex justify-between">
        <button className="btn" disabled={k === 0} onClick={() => setK(k - 1)}>← Previous</button>
        <button className="btn" disabled={k === PROBLEMS.length - 1} onClick={() => setK(k + 1)}>Next →</button>
      </div>
    </div>
  );
}
