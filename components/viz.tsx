"use client";
import { ReactNode, useEffect, useState } from "react";
import { Code } from "./ui";

/* =============================== types =============================== */
export type Cell = number | string | null;
export type ArraySpec = {
  name: string;
  values: Cell[];
  ptrs?: Record<string, number>;
  hi?: number[];
  dim?: number[];
};
export type ListNode = { v: string | number; sentinel?: boolean; hi?: boolean; fresh?: boolean };
export type ListSpec = {
  title?: string;
  nodes: ListNode[];
  /** pointer name -> node index. index === nodes.length means null */
  ptrs?: Record<string, number>;
  meta?: Record<string, string | number>;
};
export type MVar = { name: string; type: string; value?: string | number; ref?: string | null; unset?: boolean };
export type MObj = {
  id: string;
  cls: string;
  x: number;
  y: number;
  fields: { name: string; value?: string | number; ref?: string | null }[];
  hi?: boolean;
};
export type Mem = { vars: MVar[]; objs: MObj[] };
export type Frame = {
  line: number;
  note: ReactNode;
  vars?: Record<string, string | number | boolean | null>;
  arrays?: ArraySpec[];
  lists?: ListSpec[];
  mem?: Mem;
  stack?: string[];
  stackLabel?: string;
  out?: string;
};

/* =============================== arrays =============================== */
const PCOL = ["var(--accent)", "var(--teal)", "#7c3aed", "#2563eb"];

export function ArrayBoxes({ spec }: { spec: ArraySpec }) {
  const names = Object.keys(spec.ptrs ?? {});
  return (
    <div className="my-2">
      <div className="mono mb-1 text-xs muted">{spec.name}</div>
      <div className="flex flex-wrap gap-y-2">
        {spec.values.map((v, i) => {
          const here = names.filter((n) => spec.ptrs![n] === i);
          const hi = spec.hi?.includes(i);
          const dim = spec.dim?.includes(i);
          return (
            <div key={i} className="flex flex-col items-center" style={{ marginLeft: i ? -2 : 0 }}>
              <div
                className="cell"
                style={{
                  background: hi ? "var(--hi)" : undefined,
                  opacity: dim ? 0.35 : 1,
                  color: v === null ? "var(--muted)" : undefined,
                  borderStyle: v === null ? "dashed" : "solid",
                }}
              >
                {v === null ? "·" : v}
              </div>
              <div className="mono text-[0.68rem] muted">{i}</div>
              <div className="flex min-h-[1.2rem] flex-col items-center">
                {here.map((n) => (
                  <span key={n} className="mono text-[0.72rem] font-bold" style={{ color: PCOL[names.indexOf(n) % PCOL.length] }}>
                    ↑{n}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================ lists ================================ */
export function ListViz({ spec }: { spec: ListSpec }) {
  const names = Object.keys(spec.ptrs ?? {});
  const N = spec.nodes.length;
  const label = (idx: number) => names.filter((n) => spec.ptrs![n] === idx);
  return (
    <div className="my-2">
      {(spec.title || spec.meta) && (
        <div className="mb-1 flex flex-wrap items-center gap-3 text-xs">
          {spec.title && <span className="mono muted">{spec.title}</span>}
          {spec.meta &&
            Object.entries(spec.meta).map(([k, v]) => (
              <span key={k} className="chip mono">
                {k} = {String(v)}
              </span>
            ))}
        </div>
      )}
      <div className="flex flex-wrap items-end gap-y-3">
        {spec.nodes.map((n, i) => (
          <div key={i} className={"flex items-end " + (n.fresh ? "pop" : "")}>
            <div className="flex flex-col items-center">
              <div className="flex min-h-[1.4rem] flex-col items-center">
                {label(i).map((nm) => (
                  <span key={nm} className="mono text-[0.72rem] font-bold" style={{ color: PCOL[names.indexOf(nm) % PCOL.length] }}>
                    {nm}↓
                  </span>
                ))}
              </div>
              <div
                className="flex overflow-hidden rounded-md"
                style={{
                  border: n.sentinel ? "2px dashed var(--muted)" : "2px solid var(--ink)",
                  background: n.hi ? "var(--hi)" : "var(--panel)",
                }}
              >
                <div className="mono flex h-10 min-w-[2.2rem] items-center justify-center px-1.5 font-semibold">
                  {n.sentinel ? <span className="muted text-xs">sent.</span> : n.v}
                </div>
                <div className="flex h-10 w-6 items-center justify-center" style={{ borderLeft: "2px solid var(--ink)" }}>
                  <span style={{ color: "var(--accent)" }}>●</span>
                </div>
              </div>
            </div>
            <div className="mb-2 px-0.5 text-lg muted">→</div>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <div className="flex min-h-[1.4rem] flex-col items-center">
            {label(N).map((nm) => (
              <span key={nm} className="mono text-[0.72rem] font-bold" style={{ color: PCOL[names.indexOf(nm) % PCOL.length] }}>
                {nm}↓
              </span>
            ))}
          </div>
          <div className="mono flex h-10 items-center px-1 muted">null</div>
        </div>
      </div>
    </div>
  );
}

/* ============================ memory diagram ============================ */
const ROW = 30;
const HEAD = 26;
const OW = 156;
const FR = 26;
const STACK_W = 176;

export function MemoryViz({ mem }: { mem: Mem }) {
  const { vars, objs } = mem;
  const byId = Object.fromEntries(objs.map((o) => [o.id, o]));
  const h = Math.max(vars.length * ROW + HEAD + 24, ...objs.map((o) => o.y + HEAD + o.fields.length * FR + 16), 120);
  const w = Math.max(...objs.map((o) => o.x + OW + 16), STACK_W + 20);
  const arrows: { d: string; key: string }[] = [];
  vars.forEach((v, i) => {
    if (v.ref && byId[v.ref]) {
      const o = byId[v.ref];
      const sx = STACK_W,
        sy = HEAD + i * ROW + ROW / 2;
      const tx = o.x,
        ty = o.y + HEAD / 2;
      arrows.push({ key: "v" + i, d: `M${sx - 14},${sy} C${sx + 50},${sy} ${tx - 50},${ty} ${tx},${ty}` });
    }
  });
  objs.forEach((o) =>
    o.fields.forEach((f, i) => {
      if (f.ref && byId[f.ref]) {
        const t = byId[f.ref];
        const sx = o.x + OW - 12,
          sy = o.y + HEAD + i * FR + FR / 2;
        const tx = t.x,
          ty = t.y + HEAD / 2;
        arrows.push({ key: o.id + i, d: `M${sx},${sy} C${sx + 50},${sy} ${tx - 50},${ty} ${tx},${ty}` });
      }
    }),
  );
  return (
    <div className="overflow-x-auto">
      <div className="relative" style={{ width: w, height: h }}>
        <div className="absolute left-0 top-0 rounded-lg" style={{ width: STACK_W, border: "2px solid var(--ink)", background: "var(--panel)" }}>
          <div className="mono px-2 text-xs muted" style={{ height: HEAD, lineHeight: HEAD + "px", borderBottom: "1px solid var(--line)" }}>
            Stack · variables
          </div>
          {vars.map((v, i) => (
            <div key={i} className="mono flex items-center justify-between px-2 text-[0.8rem]" style={{ height: ROW, borderBottom: i < vars.length - 1 ? "1px solid var(--line)" : undefined }}>
              <span>
                <span className="muted">{v.type} </span>
                <strong>{v.name}</strong>
              </span>
              <span>
                {v.unset ? (
                  <span className="muted">?</span>
                ) : v.ref !== undefined ? (
                  v.ref === null ? (
                    <span className="muted">null</span>
                  ) : (
                    <span style={{ color: "var(--accent)" }}>●</span>
                  )
                ) : (
                  <strong>{v.value}</strong>
                )}
              </span>
            </div>
          ))}
        </div>
        {objs.map((o) => (
          <div
            key={o.id}
            className="pop absolute rounded-lg"
            style={{
              left: o.x,
              top: o.y,
              width: OW,
              border: "2px solid " + (o.hi ? "var(--accent)" : "var(--ink)"),
              background: o.hi ? "var(--accent-soft)" : "var(--panel)",
            }}
          >
            <div className="mono px-2 text-xs font-bold" style={{ height: HEAD, lineHeight: HEAD + "px", borderBottom: "1px solid var(--line)" }}>
              {o.cls}
            </div>
            {o.fields.map((f, i) => (
              <div key={i} className="mono flex items-center justify-between px-2 text-[0.8rem]" style={{ height: FR }}>
                <span className="muted">{f.name}</span>
                {f.ref !== undefined ? (
                  f.ref === null ? (
                    <span className="muted">null</span>
                  ) : (
                    <span style={{ color: "var(--accent)" }}>●</span>
                  )
                ) : (
                  <strong>{f.value}</strong>
                )}
              </div>
            ))}
          </div>
        ))}
        <svg className="pointer-events-none absolute left-0 top-0" width={w} height={h}>
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
            </marker>
          </defs>
          {arrows.map((a) => (
            <path key={a.key} d={a.d} fill="none" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#ah)" />
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ============================== call stack ============================== */
export function CallStack({ items, label = "call stack (top is the running call)" }: { items: string[]; label?: string }) {
  return (
    <div className="my-2">
      <div className="mono mb-1 text-xs muted">{label}</div>
      <div className="flex flex-col-reverse gap-1">
        {items.map((s, i) => (
          <div
            key={i}
            className="mono rounded-md px-2 py-1 text-[0.8rem]"
            style={{
              border: "1px solid var(--line)",
              background: i === items.length - 1 ? "var(--hi)" : "var(--panel2)",
            }}
          >
            {s}
          </div>
        ))}
        {items.length === 0 && <div className="mono text-xs muted">(empty)</div>}
      </div>
    </div>
  );
}

/* ================================ Trace ================================ */
export function Trace({ code, frames, title }: { code: string; frames: Frame[]; title?: string }) {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  const last = frames.length - 1;
  const f = frames[Math.min(i, last)];

  const playing = play && i < last;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setI((x) => Math.min(x + 1, last)), 1100);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  return (
    <div className="card my-5 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="text-sm font-semibold">{title ?? "Step through it"}</div>
        <span className="chip mono">
          step {i + 1} / {frames.length}
        </span>
      </div>
      <div className={"grid gap-4 px-4 pb-3 " + (f.mem ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" : f.lists ? "lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]" : "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]")}>
        <Code code={code} hi={[f.line]} />
        <div className="min-w-0 py-2">
          {f.vars && Object.keys(f.vars).length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {Object.entries(f.vars).map(([k, v]) => (
                <span key={k} className="mono rounded-md px-2 py-0.5 text-[0.82rem]" style={{ background: "var(--panel2)" }}>
                  <span className="muted">{k} =</span> <strong>{String(v)}</strong>
                </span>
              ))}
            </div>
          )}
          {f.mem && <MemoryViz mem={f.mem} />}
          {f.lists?.map((l, k) => <ListViz key={k} spec={l} />)}
          {f.arrays?.map((a, k) => <ArrayBoxes key={k} spec={a} />)}
          {f.stack && <CallStack items={f.stack} label={f.stackLabel} />}
          {f.out !== undefined && (
            <pre className="mono mt-2 rounded-md p-2 text-xs" style={{ background: "var(--code-bg)", color: "var(--code-ink)" }}>
              {"> " + (f.out || "(no output yet)")}
            </pre>
          )}
        </div>
      </div>
      <div className="mx-4 mb-3 rounded-lg px-3 py-2 text-[0.93rem]" style={{ background: "var(--accent-soft)" }}>
        {f.note}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2" style={{ borderColor: "var(--line)" }}>
        <button className="btn" onClick={() => { setI(0); setPlay(false); }} disabled={i === 0}>⏮</button>
        <button className="btn" onClick={() => { setPlay(false); setI((x) => Math.max(0, x - 1)); }} disabled={i === 0}>◀ Back</button>
        <button className="btn btn-primary" onClick={() => { setPlay(false); setI((x) => Math.min(last, x + 1)); }} disabled={i === last}>Next ▶</button>
        <button className="btn" onClick={() => { if (i >= last) { setI(0); setPlay(true); } else setPlay(!playing); }}>{playing ? "⏸ Pause" : "▶ Auto-play"}</button>
        <input type="range" min={0} max={last} value={i} onChange={(e) => { setPlay(false); setI(+e.target.value); }} className="ml-auto min-w-[8rem] flex-1 accent-[var(--accent)] sm:max-w-[16rem]" aria-label="step" />
      </div>
    </div>
  );
}
