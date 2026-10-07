"use client";
import { useEffect, useRef, useState } from "react";
import { Code } from "../ui";
import { PAPERS, Part, Prob, paperMax, probMax, sameFormula } from "@/lib/bootcampPapers";
import { codeNorm, loose, mmss, stamp } from "@/lib/bootcampUtil";
import { useBootcamp } from "@/lib/bootcampProgress";

type Phase = "ready" | "taking" | "review";
const FIX: Record<string, { id: string; label: string }> = {
  p1: { id: "refs", label: "Station 1 · References & static" },
  p2: { id: "sums", label: "Station 2 · Summations & proof" },
  p3: { id: "strings", label: "Station 3 · String loops" },
  p4: { id: "lists", label: "Station 4 · Sentinel list" },
};

const looksLikeCode = (s: string) => s.includes("{") || (s.includes("(") && s.includes(";"));

export default function MockStation({ onGo }: { onGo: (id: string) => void }) {
  const { bc, addMock, setStation } = useBootcamp();
  const [paperId, setPaperId] = useState(PAPERS[0].id);
  const [phase, setPhase] = useState<Phase>("ready");
  const [timed, setTimed] = useState(true);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const startRef = useRef(0);
  const baseRef = useRef(0);

  const paper = PAPERS.find((p) => p.id === paperId) ?? PAPERS[0];
  const limit = paper.mins * 60;

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const id = setInterval(() => setSecs(baseRef.current + Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(id);
  }, [running]);

  const begin = (t: boolean) => {
    baseRef.current = 0;
    setSecs(0);
    setAns({});
    setChecks({});
    setSaved(false);
    setTimed(t);
    setPhase("taking");
    setRunning(t);
  };
  const pause = () => {
    baseRef.current += Math.floor((Date.now() - startRef.current) / 1000);
    setSecs(baseRef.current);
    setRunning(false);
  };
  const finish = () => {
    if (running) baseRef.current += Math.floor((Date.now() - startRef.current) / 1000);
    setSecs(baseRef.current);
    setRunning(false);
    setPhase("review");
  };
  const reset = () => {
    setRunning(false);
    setPhase("ready");
    setSecs(0);
  };

  const formulaOk = (p: Part) => p.kind === "free" && !!p.formula && sameFormula(ans[p.id] ?? "", p.formula).ok;
  const checkOf = (p: Part, i: number) => checks[`${p.id}#${i}`] ?? formulaOk(p);
  const awarded = (p: Part): number => {
    if (p.kind === "blank") {
      const v = ans[p.id] ?? "";
      const norm = p.mode === "code" ? codeNorm : loose;
      return v.trim() && p.accept.some((a) => norm(a) === norm(v)) ? p.pts : 0;
    }
    return p.rubric.reduce((s, r, i) => s + (checkOf(p, i) ? r.pts : 0), 0);
  };
  const probScore = (pr: Prob) => pr.parts.reduce((s, p) => s + awarded(p), 0);
  const total = paper.probs.reduce((s, pr) => s + probScore(pr), 0);
  const max = paperMax(paper);

  const weakest = [...paper.probs].sort((a, b) => probScore(a) / probMax(a) - probScore(b) / probMax(b))[0];

  const remaining = limit - secs;
  const clock = timed ? (remaining >= 0 ? mmss(remaining) : "+" + mmss(-remaining)) : mmss(secs);

  const save = () => {
    addMock({ ts: stamp(), paper: paper.id, score: total, total: max, secs, byProb: paper.probs.map((pr) => [probScore(pr), probMax(pr)]) });
    if (paper.id === "fresh" && total >= max * 0.8) setStation("mock", true);
    setSaved(true);
  };

  /* ------------------------------ READY ------------------------------ */
  if (phase === "ready") {
    const hist = [...bc.mocks].reverse().slice(0, 6);
    return (
      <div>
        <p className="text-lg muted">
          The real thing: <strong>30 points, 45 minutes, closed book</strong>. Do it on this page, but keep a sheet of paper for your diagrams (you would draw on the quiz too). Marks for blanks are automatic; for the written parts you grade yourself against a mark scheme.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PAPERS.map((p) => (
            <button key={p.id} onClick={() => setPaperId(p.id)} className="card card-pad text-left" style={paperId === p.id ? { borderColor: "var(--accent)", background: "var(--accent-soft)" } : undefined}>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm muted">{p.blurb}</div>
              <div className="mt-1 text-xs muted">{paperMax(p)} points · {p.mins} min</div>
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn btn-primary !px-5 !py-2.5 !text-base" onClick={() => begin(true)}>Start timed ({paper.mins}:00)</button>
          <button className="btn !px-5 !py-2.5 !text-base" onClick={() => begin(false)}>Start untimed</button>
        </div>
        {hist.length > 0 && (
          <div className="card card-pad mt-8">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Your saved attempts</div>
            <div className="grid gap-1 text-sm">
              {hist.map((h) => (
                <div key={h.ts} className="flex flex-wrap items-center gap-3">
                  <span className="mono muted">{new Date(h.ts).toLocaleString()}</span>
                  <span>{PAPERS.find((p) => p.id === h.paper)?.title ?? h.paper}</span>
                  <strong>{h.score}/{h.total}</strong>
                  <span className="muted">{mmss(h.secs)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----------------------- TAKING + REVIEW (shared) ----------------------- */
  const review = phase === "review";
  return (
    <div>
      <div className="sticky top-12 z-20 -mx-2 mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2 md:top-2" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
        <div className="mono text-2xl font-bold" style={{ color: timed && remaining < 0 ? "var(--bad)" : timed && remaining < 300 ? "var(--accent)" : undefined }}>{clock}</div>
        <div className="text-sm muted">{paper.title}</div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {review ? (
            <>
              <span className="text-lg font-bold">{total}/{max}</span>
              <button className="btn btn-primary" onClick={save} disabled={saved}>{saved ? "✓ saved" : "Save score"}</button>
              <button className="btn" onClick={reset}>New attempt</button>
            </>
          ) : (
            <>
              {timed && <button className="btn" onClick={() => (running ? pause() : (setRunning(true)))}>{running ? "⏸ Pause" : "▶ Resume"}</button>}
              <button className="btn btn-primary" onClick={finish}>Finish &amp; grade</button>
              <button className="btn" onClick={reset}>Abandon</button>
            </>
          )}
        </div>
      </div>

      {review && (
        <div className="card card-pad mb-4">
          <div className="text-xs font-bold uppercase tracking-wider muted">Result</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {paper.probs.map((pr, i) => (
              <span key={pr.id} className="chip" style={{ fontSize: "0.8rem" }}>P{i + 1}: {probScore(pr)}/{probMax(pr)}</span>
            ))}
          </div>
          <p className="mt-2 text-sm">
            Weakest: <strong>Problem {paper.probs.findIndex((p) => p.id === weakest.id) + 1}</strong>
            {probScore(weakest) < probMax(weakest) && (
              <> → <button className="underline" style={{ color: "var(--accent)" }} onClick={() => onGo(FIX[weakest.id].id)}>{FIX[weakest.id].label}</button></>
            )}
            . Tick the rubric boxes honestly for the written parts: if you can&apos;t point to the line that earns the mark, it is not earned.
          </p>
        </div>
      )}

      <div className="grid gap-5">
        {paper.probs.map((pr) => (
          <section key={pr.id} className="card card-pad">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{pr.title}</h2>
              {review && <span className="chip">{probScore(pr)}/{probMax(pr)}</span>}
            </div>
            <p className="mt-1 text-[0.95rem]">{pr.intro}</p>
            {pr.code && <Code code={pr.code} />}
            <div className="mt-3 grid gap-3">
              {pr.parts.map((p) => {
                const v = ans[p.id] ?? "";
                const got = awarded(p);
                if (p.kind === "blank") {
                  return (
                    <div key={p.id}>
                      <label className="flex items-center gap-2 rounded-lg px-2 py-1" style={review ? { background: got ? "var(--good-soft)" : "var(--bad-soft)" } : undefined}>
                        <span className="text-sm font-semibold whitespace-nowrap">{p.label}</span>
                        <input
                          className="mono min-w-0 flex-1 rounded-md border bg-transparent px-2 py-1 text-sm"
                          style={{ borderColor: "var(--line)" }}
                          value={v}
                          disabled={review}
                          placeholder={p.placeholder}
                          onChange={(e) => setAns({ ...ans, [p.id]: e.target.value })}
                          spellCheck={false}
                          autoCapitalize="off"
                          autoCorrect="off"
                        />
                        {review && <span className="mono text-xs">{got}/{p.pts}</span>}
                      </label>
                      {review && !got && (
                        <div className="ml-2 mt-1 text-sm">
                          Expected <code className="inline">{p.model}</code> <span className="muted">· {p.why}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={p.id}>
                    <div className="mb-1 text-sm font-semibold">{p.label}</div>
                    <textarea
                      className="mono w-full rounded-md border bg-transparent px-3 py-2 text-[0.85rem]"
                      style={{ borderColor: "var(--line)" }}
                      rows={p.rows ?? 4}
                      value={v}
                      disabled={review}
                      placeholder={p.placeholder ?? "Write your answer…"}
                      onChange={(e) => setAns({ ...ans, [p.id]: e.target.value })}
                      spellCheck={false}
                    />
                    {review && (
                      <div className="mt-2 grid gap-2 lg:grid-cols-2">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider muted">Model answer</div>
                          {looksLikeCode(p.model) && p.model.includes("\n") ? <Code code={p.model} /> : <pre className="mono mt-1 whitespace-pre-wrap rounded-lg p-3 text-[0.85rem]" style={{ background: "var(--panel2)" }}>{p.model}</pre>}
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider muted">Mark scheme · {got}/{p.pts}{p.formula && formulaOk(p) ? " · formula auto-checked ✓" : ""}</div>
                          <div className="mt-1 grid gap-1">
                            {p.rubric.map((r, i) => (
                              <label key={i} className="flex items-start gap-2 rounded-md px-2 py-1 text-sm" style={{ background: checkOf(p, i) ? "var(--good-soft)" : "var(--panel2)" }}>
                                <input type="checkbox" className="mt-1 accent-[var(--accent)]" checked={checkOf(p, i)} onChange={(e) => setChecks({ ...checks, [`${p.id}#${i}`]: e.target.checked })} />
                                <span>{r.t} <span className="muted">({r.pts})</span></span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {!review && (
        <div className="mt-5 flex justify-end">
          <button className="btn btn-primary !px-5 !py-2.5 !text-base" onClick={finish}>Finish &amp; grade</button>
        </div>
      )}
    </div>
  );
}
