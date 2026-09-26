"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TOPICS, TOPIC_LESSON, Topic } from "@/lib/lessons";
import { norm, Q, QUESTIONS } from "@/lib/questions";
import { useProgress } from "@/lib/progress";
import { Code } from "./ui";

type Phase = "setup" | "run" | "done";
type Mode = "exam" | "learn";

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

const isRight = (q: Q, a: number | string | null) => (q.kind === "mcq" ? a === q.answer : typeof a === "string" && norm(a) === norm(q.answer));

export default function QuizLab() {
  const { p, addQuiz } = useProgress();
  const [phase, setPhase] = useState<Phase>("setup");
  const [topics, setTopics] = useState<Set<Topic>>(new Set(TOPICS));
  const [count, setCount] = useState(12);
  const [mode, setMode] = useState<Mode>("exam");
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<(number | string | null)[]>([]);
  const [draft, setDraft] = useState("");
  const [shown, setShown] = useState(false);

  const pool = useMemo(() => QUESTIONS.filter((q) => topics.has(q.topic)), [topics]);

  const start = () => {
    const chosen = shuffle(pool)
      .slice(0, Math.min(count, pool.length))
      .map((q): Q => {
        if (q.kind !== "mcq") return q;
        const order = shuffle(q.options.map((_, k) => k));
        return { ...q, options: order.map((k) => q.options[k]), answer: order.indexOf(q.answer) };
      });
    setQs(chosen);
    setAns(chosen.map(() => null));
    setI(0);
    setDraft("");
    setShown(false);
    setPhase("run");
  };

  const finish = (a: (number | string | null)[]) => {
    const byTopic: Record<string, [number, number]> = {};
    qs.forEach((q, k) => {
      const t = (byTopic[q.topic] ??= [0, 0]);
      t[1]++;
      if (isRight(q, a[k])) t[0]++;
    });
    addQuiz({ ts: Date.now(), score: qs.filter((q, k) => isRight(q, a[k])).length, total: qs.length, byTopic });
    setPhase("done");
  };

  const record = (v: number | string) => {
    const a = [...ans];
    a[i] = v;
    setAns(a);
    if (mode === "learn") setShown(true);
    return a;
  };
  const next = (a = ans) => {
    if (i + 1 >= qs.length) return finish(a);
    setI(i + 1);
    setDraft("");
    setShown(false);
  };

  /* ---------------- SETUP ---------------- */
  if (phase === "setup") {
    const last = p.quiz.slice(-5).reverse();
    return (
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Quiz Lab</h1>
        <p className="mt-2 muted">Mixed practice in quiz style: tracing code, spotting bugs, predicting output. {QUESTIONS.length} questions in the bank.</p>

        <div className="card card-pad mt-6">
          <div className="mb-2 text-sm font-semibold">Topics</div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const on = topics.has(t);
              return (
                <button key={t} className="btn" onClick={() => { const s = new Set(topics); if (on) s.delete(t); else s.add(t); setTopics(s); }} style={on ? { background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" } : undefined}>
                  {t} <span className="opacity-70">({QUESTIONS.filter((q) => q.topic === t).length})</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <button className="underline muted" onClick={() => setTopics(new Set(TOPICS))}>select all</button>
            <button className="underline muted" onClick={() => setTopics(new Set())}>clear</button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold">Mode</div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => setMode("exam")} style={mode === "exam" ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>Exam (answers at the end)</button>
                <button className="btn" onClick={() => setMode("learn")} style={mode === "learn" ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>Learn (instant feedback)</button>
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Length</div>
              <div className="flex gap-2">
                {[8, 12, 20, 999].map((n) => (
                  <button key={n} className="btn" onClick={() => setCount(n)} style={count === n ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>{n === 999 ? "All" : n}</button>
                ))}
              </div>
            </div>
          </div>
          <button className="btn btn-primary mt-6" disabled={pool.length === 0} onClick={start}>
            Start ({Math.min(count, pool.length)} questions)
          </button>
        </div>

        {last.length > 0 && (
          <div className="card card-pad mt-6">
            <div className="mb-2 text-sm font-semibold">Recent attempts</div>
            <div className="flex flex-col gap-1 text-sm">
              {last.map((r) => (
                <div key={r.ts} className="flex items-center gap-3">
                  <span className="muted w-40">{new Date(r.ts).toLocaleString()}</span>
                  <span className="mono font-semibold">{r.score}/{r.total}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--panel2)" }}>
                    <div className="h-full" style={{ width: `${(100 * r.score) / r.total}%`, background: "var(--teal)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------- RUN ---------------- */
  if (phase === "run") {
    const q = qs[i];
    const a = ans[i];
    const answered = a !== null;
    return (
      <div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="chip">{q.topic}</span>
          <span className="muted">Question {i + 1} / {qs.length} · {"●".repeat(q.level)}{"○".repeat(3 - q.level)}</span>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--panel2)" }}>
          <div className="h-full transition-all" style={{ width: `${(100 * i) / qs.length}%`, background: "var(--accent)" }} />
        </div>
        <div className="card card-pad">
          <div className="text-lg font-medium">{q.q}</div>
          {q.code && <Code code={q.code} />}
          {q.kind === "mcq" ? (
            <div className="mt-3 grid gap-2">
              {q.options.map((o, k) => {
                const sel = a === k;
                let style: React.CSSProperties | undefined = sel && mode === "exam" ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : undefined;
                if (mode === "learn" && shown) {
                  if (k === q.answer) style = { background: "var(--good-soft)", borderColor: "var(--good)" };
                  else if (sel) style = { background: "var(--bad-soft)", borderColor: "var(--bad)" };
                }
                return (
                  <button key={k} disabled={mode === "learn" && shown} onClick={() => record(k)} className="btn !justify-start !rounded-lg text-left mono !text-[0.82rem] disabled:!opacity-100" style={style}>
                    <span className="muted">{String.fromCharCode(65 + k)}.</span> {o}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={mode === "learn" && shown} onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) record(draft); }} placeholder={q.placeholder ?? "your answer"} className="mono rounded-lg border px-3 py-1.5" style={{ background: "var(--panel)", borderColor: "var(--line)" }} />
              <button className="btn" disabled={!draft.trim() || (mode === "learn" && shown)} onClick={() => record(draft)}>{mode === "exam" && answered ? "Update answer" : "Submit answer"}</button>
              {mode === "exam" && answered && <span className="text-sm muted">saved: <span className="mono">{String(a)}</span></span>}
            </div>
          )}
          {mode === "learn" && shown && (
            <div className="mt-4 rounded-lg px-3 py-2 text-[0.95rem]" style={{ background: isRight(q, a) ? "var(--good-soft)" : "var(--bad-soft)" }}>
              <strong>{isRight(q, a) ? "Correct. " : "Not quite. "}</strong>
              {q.kind === "type" && !isRight(q, a) && <>The answer is <span className="mono">{q.answer}</span>. </>}
              {q.why}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="btn" disabled={i === 0} onClick={() => { setI(i - 1); setDraft(typeof ans[i - 1] === "string" ? (ans[i - 1] as string) : ""); setShown(mode === "learn"); }}>← Back</button>
          <button className="btn btn-primary" disabled={mode === "learn" ? !shown : false} onClick={() => next()}>{i + 1 === qs.length ? "Finish" : mode === "exam" && !answered ? "Skip →" : "Next →"}</button>
        </div>
      </div>
    );
  }

  /* ---------------- DONE ---------------- */
  const score = qs.filter((q, k) => isRight(q, ans[k])).length;
  const by: Record<string, [number, number]> = {};
  qs.forEach((q, k) => {
    const t = (by[q.topic] ??= [0, 0]);
    t[1]++;
    if (isRight(q, ans[k])) t[0]++;
  });
  const weak = Object.entries(by).filter(([, [r, t]]) => r / t < 0.7);
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Results</h1>
      <div className="card card-pad mt-4 flex flex-wrap items-center gap-6">
        <div className="text-5xl font-bold">{score}<span className="text-2xl muted">/{qs.length}</span></div>
        <div className="text-sm">
          <div className="font-semibold">{Math.round((100 * score) / qs.length)}%</div>
          <div className="muted">{score / qs.length >= 0.85 ? "Strong. Keep the tricky ones fresh." : score / qs.length >= 0.6 ? "Solid base. Review the misses below." : "Good start. Work through the lessons for the weak topics, then retry."}</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn btn-primary" onClick={start}>Retry (new mix)</button>
          <button className="btn" onClick={() => setPhase("setup")}>Setup</button>
        </div>
      </div>

      <div className="card card-pad mt-4">
        <div className="mb-2 text-sm font-semibold">By topic</div>
        <div className="grid gap-2">
          {Object.entries(by).map(([t, [r, n]]) => (
            <div key={t} className="flex items-center gap-3 text-sm">
              <span className="w-44">{t}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--panel2)" }}>
                <div className="h-full" style={{ width: `${(100 * r) / n}%`, background: r / n < 0.7 ? "var(--bad)" : "var(--good)" }} />
              </div>
              <span className="mono w-10 text-right">{r}/{n}</span>
            </div>
          ))}
        </div>
        {weak.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="muted">Review:</span>
            {weak.map(([t]) => (
              <Link key={t} className="underline" style={{ color: "var(--accent)" }} href={`/learn/${TOPIC_LESSON[t as Topic]}`}>{t}</Link>
            ))}
          </div>
        )}
      </div>

      <h2 className="mt-8 text-xl font-semibold">Review every question</h2>
      <div className="mt-3 grid gap-3">
        {qs.map((q, k) => {
          const ok = isRight(q, ans[k]);
          return (
            <div key={q.id} className="card card-pad" style={{ borderLeft: `5px solid ${ok ? "var(--good)" : "var(--bad)"}` }}>
              <div className="mb-1 flex items-center gap-2 text-xs"><span className="chip">{q.topic}</span><strong style={{ color: ok ? "var(--good)" : "var(--bad)" }}>{ok ? "Correct" : ans[k] === null ? "Skipped" : "Wrong"}</strong></div>
              <div className="font-medium">{q.q}</div>
              {q.code && <Code code={q.code} />}
              <div className="mt-1 text-sm">
                <span className="muted">Your answer: </span><span className="mono">{ans[k] === null ? "(none)" : q.kind === "mcq" ? `${String.fromCharCode(65 + (ans[k] as number))}. ${q.options[ans[k] as number]}` : String(ans[k])}</span>
              </div>
              {!ok && (
                <div className="text-sm"><span className="muted">Correct: </span><span className="mono">{q.kind === "mcq" ? `${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}` : q.answer}</span></div>
              )}
              <div className="prose-l mt-1 text-sm">{q.why}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
