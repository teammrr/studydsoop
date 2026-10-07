"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { PAPERS, paperMax } from "@/lib/bootcampPapers";
import { useBootcamp } from "@/lib/bootcampProgress";
import { Callout } from "../ui";
import RefStation from "./RefStation";
import SumStation from "./SumStation";
import StringStation from "./StringStation";
import ListStation from "./ListStation";
import MockStation from "./MockStation";

const STATIONS = [
  { id: "refs", label: "1 · References & static", pts: 5, prob: "Problem 1", mins: 60, skill: "Trace code with boxes and arrows; static, ==, and parameter passing" },
  { id: "sums", label: "2 · Summations & proof", pts: 10, prob: "Problem 2", mins: 90, skill: "Loop → Σ, forwards + backwards, closed form, true/false with a counterexample" },
  { id: "strings", label: "3 · String loops", pts: 5, prob: "Problem 3", mins: 45, skill: "Fill-in-the-blanks: array of tallies, nested loops, charAt, char tests" },
  { id: "lists", label: "4 · Sentinel list", pts: 10, prob: "Problem 4", mins: 120, skill: "Write isEmpty, removeFirst and a counting walk with a sentinel node" },
  { id: "mock", label: "5 · Timed mock", pts: 30, prob: "Everything", mins: 60, skill: "Closed-book, 45 minutes, graded against a mark scheme" },
] as const;

type Tab = "plan" | (typeof STATIONS)[number]["id"];

function Plan({ go }: { go: (t: Tab) => void }) {
  const { bc } = useBootcamp();
  const fresh = bc.mocks.filter((m) => m.paper === "fresh");
  const best = fresh.length ? Math.max(...fresh.map((m) => m.score)) : null;
  const done = STATIONS.filter((s) => bc.stations[s.id]).length;
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Quiz 1 · Data Structures &amp; More · Java</div>
      <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight">The one-night bootcamp</h1>
      <p className="mt-3 max-w-2xl text-lg muted">
        Built from the actual quiz: <strong>30 points in 45 minutes</strong>. Four problems, four skills. You learn each skill with a worked example, then you solve fresh problems, then you sit a timed mock and get a score.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card card-pad"><div className="text-xs font-bold uppercase tracking-wider muted">Stations done</div><div className="mt-1 text-3xl font-bold">{done}/{STATIONS.length}</div></div>
        <div className="card card-pad"><div className="text-xs font-bold uppercase tracking-wider muted">Best fresh mock</div><div className="mt-1 text-3xl font-bold">{best === null ? "–" : `${best}/${paperMax(PAPERS[0])}`}</div></div>
        <div className="card card-pad"><div className="text-xs font-bold uppercase tracking-wider muted">Time budget</div><div className="mt-1 text-3xl font-bold">≈ 6 h</div></div>
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">Tonight, in order</h2>
      <div className="mt-3 grid gap-3">
        {STATIONS.map((s) => (
          <button key={s.id} onClick={() => go(s.id)} className="card card-pad text-left transition-transform hover:-translate-y-0.5" style={bc.stations[s.id] ? { borderColor: "var(--good)" } : undefined}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">{bc.stations[s.id] ? "✓ " : ""}{s.label}</div>
              <div className="flex gap-2 text-xs"><span className="chip">{s.prob} · {s.pts} pts</span><span className="chip">≈ {s.mins} min</span></div>
            </div>
            <div className="text-sm muted">{s.skill}</div>
          </button>
        ))}
        <div className="card card-pad"><div className="font-semibold">6 · Sleep</div><div className="text-sm muted">Rested recall beats a 3 a.m. cram. In the morning, skim only what you got wrong in the mock.</div></div>
      </div>

      <Callout kind="tip" title="How to use each station">
        Do the <strong>predict / attempt first</strong> parts before opening any reveal or walkthrough. The struggle is what makes it stick; the answer after a real attempt teaches ten times more than the answer before one.
      </Callout>
      <Callout kind="exam" title="Only 2 hours?">
        Station 1 steps 1–2 (25 min), Station 2 steps 2–4 (40 min), Station 4 steps 2–3 (40 min), Station 3 step 1 (15 min). Then one fresh mock problem at a time.
      </Callout>
      <p className="mt-6 text-sm muted">
        Related: the regular <Link href="/learn/references" className="underline">References</Link>, <Link href="/learn/sllist" className="underline">SLList</Link> lessons and the <Link href="/code-lab" className="underline">Code Lab</Link> (problems 15–17 are new) explain the same ideas in more depth. Progress here is saved in this browser only.
      </p>
    </div>
  );
}

export default function Bootcamp() {
  const [tab, setTab] = useState<Tab>("plan");
  const { bc, setStation } = useBootcamp();
  const go = (t: Tab) => {
    setTab(t);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  const body: Record<Tab, ReactNode> = {
    plan: <Plan go={go} />,
    refs: <RefStation />,
    sums: <SumStation />,
    strings: <StringStation />,
    lists: <ListStation />,
    mock: <MockStation onGo={(id) => go(id as Tab)} />,
  };
  const cur = STATIONS.find((s) => s.id === tab);
  const idx = STATIONS.findIndex((s) => s.id === tab);
  const next = idx >= 0 ? STATIONS[idx + 1] : undefined;
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <button className="btn !text-xs" onClick={() => go("plan")} style={tab === "plan" ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>Plan</button>
        {STATIONS.map((s) => (
          <button key={s.id} className="btn !text-xs" onClick={() => go(s.id)} style={tab === s.id ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>
            {bc.stations[s.id] ? "✓ " : ""}{s.label}
          </button>
        ))}
      </div>
      {cur && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className="chip">{cur.prob} · {cur.pts} pts</span><span className="chip">≈ {cur.mins} min</span></div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{cur.label.replace(/^\d · /, "")}</h1>
        </div>
      )}
      <div className={cur ? "mt-3" : "mt-6"}>{body[tab]}</div>
      {cur && tab !== "mock" && (
        <div className="card card-pad mt-16 flex flex-wrap items-center justify-between gap-3">
          <button className={"btn " + (bc.stations[cur.id] ? "" : "btn-primary")} onClick={() => setStation(cur.id, !bc.stations[cur.id])}>
            {bc.stations[cur.id] ? "✓ Station complete (click to undo)" : "Mark station complete"}
          </button>
          {next && <button className="btn" onClick={() => go(next.id)}>Next: {next.label} →</button>}
        </div>
      )}
    </div>
  );
}
