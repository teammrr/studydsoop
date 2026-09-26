"use client";
import Link from "next/link";
import { LESSONS } from "@/lib/lessons";
import { PROBLEMS } from "@/lib/parsons";
import { useProgress } from "@/lib/progress";

const PLAN: { day: string; title: string; slugs: string[]; lab?: string; note?: string }[] = [
  { day: "Sat Sep 26", title: "Method + Java + References", slugs: ["approach", "java-basics", "references"], lab: "Code Lab 1–5" },
  { day: "Sun Sep 27", title: "Static/overloading + Linked lists", slugs: ["overloading-static", "linked-lists"], lab: "Code Lab 6–9" },
  { day: "Mon Sep 28", title: "SLList & sentinel", slugs: ["sllist"], lab: "Code Lab 10–12" },
  { day: "Tue Sep 29", title: "Generics, stacks & queues + ArrayList", slugs: ["generics-stacks-queues", "arraylist"], lab: "Code Lab 13–14", note: "Live class today is ArrayList: resizing." },
  { day: "Wed Sep 30", title: "Invariants + full mock quiz", slugs: ["invariants"], lab: "Quiz Lab, 20 questions, Exam mode", note: "Review every miss, then reread the cheat sheet." },
  { day: "Thu Oct 1", title: "Quiz day", slugs: [], note: "Skim the cheat sheet. Trust the 6-step loop: restate, trace, pattern, plan, code, test." },
];

export default function Home() {
  const { p } = useProgress();
  const now = new Date();
  const days = Math.round((new Date(2026, 9, 1).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);
  const done = LESSONS.filter((l) => p.done[l.slug]).length;
  const lab = PROBLEMS.filter((x) => p.lab[x.id]).length;
  const best = p.quiz.length ? Math.max(...p.quiz.map((r) => Math.round((100 * r.score) / r.total))) : null;
  const stat = (n: string, v: React.ReactNode, sub: string) => (
    <div className="card card-pad">
      <div className="text-xs font-bold uppercase tracking-wider muted">{n}</div>
      <div className="mt-1 text-3xl font-bold">{v}</div>
      <div className="text-sm muted">{sub}</div>
    </div>
  );
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Data Structures &amp; {"{Abstractions, OOP}"} · Java 21</div>
      <h1 className="mt-2 text-5xl font-bold leading-tight tracking-tight">
        Learn to <span style={{ color: "var(--accent)" }}>approach</span> the problem,<br />not just write the code.
      </h1>
      <p className="mt-4 max-w-2xl text-lg muted">
        Everything for the <strong>in-class quiz on Oct 1</strong>: nine interactive lessons with step-through visualizers, a Code Lab that trains planning, and a mock quiz with instant review. Built from your course pages (S2–L5) and both homeworks.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/learn/approach" className="btn btn-primary !px-5 !py-2.5 !text-base">Start with the approach →</Link>
        <Link href="/quiz" className="btn !px-5 !py-2.5 !text-base">Take a mock quiz</Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat("Quiz in", <span suppressHydrationWarning>{days <= 0 ? "today" : `${days} day${days === 1 ? "" : "s"}`}</span>, "Oct 1 · in-class")}
        {stat("Lessons", `${done}/${LESSONS.length}`, "marked complete")}
        {stat("Code Lab", `${lab}/${PROBLEMS.length}`, "problems solved")}
        {stat("Best mock", best === null ? "–" : `${best}%`, `${p.quiz.length} attempt${p.quiz.length === 1 ? "" : "s"}`)}
      </div>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">Your 5-day plan</h2>
      <p className="mt-1 text-sm muted">About 1–1.5 hours per day. Adjust freely; the order is the important part (each topic builds on the last).</p>
      <div className="mt-4 grid gap-3">
        {PLAN.map((d) => {
          const complete = d.slugs.length > 0 && d.slugs.every((s) => p.done[s]);
          return (
            <div key={d.day} className="card card-pad flex flex-wrap items-start gap-4" style={complete ? { borderColor: "var(--good)" } : undefined}>
              <div className="w-28 flex-none">
                <div className="text-sm font-semibold">{d.day}</div>
                {complete && <div className="text-xs" style={{ color: "var(--good)" }}>✓ done</div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{d.title}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-sm">
                  {d.slugs.map((s) => {
                    const l = LESSONS.find((x) => x.slug === s)!;
                    return <Link key={s} href={`/learn/${s}`} className="underline" style={{ color: "var(--accent)" }}>{p.done[s] ? "✓ " : ""}{l.title}</Link>;
                  })}
                  {d.lab && <Link href={d.lab.startsWith("Quiz") ? "/quiz" : "/code-lab"} className="underline muted">+ {d.lab}</Link>}
                </div>
                {d.note && <div className="mt-1 text-sm muted">{d.note}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">All lessons</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {LESSONS.map((l, i) => (
          <Link key={l.slug} href={`/learn/${l.slug}`} className="card card-pad block transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between text-xs muted">
              <span>Lesson {i + 1} · {l.source}</span>
              <span>{p.done[l.slug] ? <span style={{ color: "var(--good)" }}>✓ complete</span> : `~${l.mins} min`}</span>
            </div>
            <div className="mt-1 font-semibold">{l.title}</div>
            <div className="text-sm muted">{l.blurb}</div>
          </Link>
        ))}
      </div>

      <div className="card card-pad mt-10 text-sm muted">
        <strong style={{ color: "var(--ink)" }}>Scope note.</strong> The course schedule lists the in-class quiz on Oct 1, after the ArrayList class on Sep 29. I assumed it covers everything through Lesson 5 (Java basics → ArrayList) plus loop invariants. Confirm the exact scope and format with your instructor. Also, this site teaches the techniques with practice problems from the lesson pages; your graded homework should still be written by you, as your assignments require.
      </div>
    </div>
  );
}
