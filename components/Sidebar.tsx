"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LESSONS } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";

export default function Sidebar() {
  const path = usePathname();
  const { p } = useProgress();
  const [open, setOpen] = useState(false);
  const done = LESSONS.filter((l) => p.done[l.slug]).length;
  const link = (href: string, label: string, extra?: React.ReactNode) => {
    const active = path === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[0.9rem] transition-colors"
        style={active ? { background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 600 } : undefined}
      >
        <span>{label}</span>
        {extra}
      </Link>
    );
  };
  const nav = (
    <nav className="flex flex-col gap-0.5">
      {link("/", "Overview")}
      <div className="mt-4 mb-1 px-3 text-[0.7rem] font-bold uppercase tracking-widest muted">Lessons · {done}/{LESSONS.length}</div>
      {LESSONS.map((l, i) =>
        link(`/learn/${l.slug}`, `${i + 1}. ${l.title.replace("How to Attack an Algorithm Problem", "The Approach")}`, p.done[l.slug] ? <span style={{ color: "var(--good)" }}>✓</span> : null),
      )}
      <div className="mt-4 mb-1 px-3 text-[0.7rem] font-bold uppercase tracking-widest muted">Practice</div>
      {link("/bootcamp", "Quiz 1 Bootcamp ⚡")}
      {link("/code-lab", "Code Lab (build it)")}
      {link("/quiz", "Quiz Lab (mock quiz)")}
      {link("/eli3", "Explain like I'm 3 🧸")}
      {link("/cheatsheet", "Cheat sheet")}
    </nav>
  );
  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-2 md:hidden" style={{ background: "var(--bg)", borderColor: "var(--line)" }}>
        <Link href="/" className="font-semibold">DSOOP Quiz Prep</Link>
        <button className="btn" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </div>
      {open && <div className="border-b p-3 md:hidden" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>{nav}</div>}
      <aside className="sticky top-0 hidden h-screen w-72 flex-none overflow-y-auto border-r p-4 md:block" style={{ borderColor: "var(--line)" }}>
        <Link href="/" className="mb-5 block px-3">
          <div className="text-lg font-bold tracking-tight">DSOOP <span style={{ color: "var(--accent)" }}>Quiz Prep</span></div>
          <div className="text-xs muted">Data Structures &amp; OOP · Java · Quiz Oct 1</div>
        </Link>
        {nav}
        <div className="mt-6 px-3 text-[0.72rem] muted">Progress is saved in this browser only.</div>
      </aside>
    </>
  );
}
