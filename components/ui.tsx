"use client";
import { ReactNode, useMemo, useState } from "react";

/* ---------- code highlighting (tiny, regex based) ---------- */
const TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(\d+(?:\.\d+)?L?)\b|\b(public|private|static|void|class|new|return|if|else|for|while|int|long|double|boolean|char|null|this|true|false|import|final|extends|implements|interface|break|continue)\b|\b([A-Z][A-Za-z0-9_]*)\b/g;

function colorize(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  let k = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "tk-cm" : m[2] ? "tk-st" : m[3] ? "tk-nu" : m[4] ? "tk-kw" : "tk-ty";
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function Code({ code, hi = [], title }: { code: string; hi?: number[]; title?: string }) {
  const lines = code.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
  return (
    <div className="my-3">
      {title && <div className="mono mb-1 text-xs muted">{title}</div>}
      <div className="codeblock">
        {lines.map((l, i) => (
          <div key={i} className={"codeline" + (hi.includes(i + 1) ? " hl" : "")}>
            <span className="ln">{i + 1}</span>
            <span>{l.length ? colorize(l) : " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const I = ({ children }: { children: ReactNode }) => <code className="inline">{children}</code>;

/* ---------- layout pieces ---------- */
export function Sec({
  id,
  title,
  kicker,
  children,
}: {
  id?: string;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-6">
      {kicker && <div className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>{kicker}</div>}
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="prose-l mt-2">{children}</div>
    </section>
  );
}

const CALL = {
  tip: { bg: "var(--teal-soft)", fg: "var(--teal)", label: "Tip" },
  key: { bg: "var(--accent-soft)", fg: "var(--accent)", label: "Key idea" },
  warn: { bg: "var(--warn-soft)", fg: "var(--ink)", label: "Watch out" },
  exam: { bg: "var(--panel2)", fg: "var(--ink)", label: "Quiz-style" },
};
export function Callout({
  kind = "key",
  title,
  children,
}: {
  kind?: keyof typeof CALL;
  title?: string;
  children: ReactNode;
}) {
  const c = CALL[kind];
  return (
    <div className="my-4 rounded-xl px-4 py-3" style={{ background: c.bg }}>
      <div className="mb-0.5 text-xs font-bold uppercase tracking-wider" style={{ color: c.fg }}>
        {title ?? c.label}
      </div>
      <div className="prose-l text-[0.95rem]">{children}</div>
    </div>
  );
}

/* ---------- think-first reveal ---------- */
export function Reveal({ q, children, label = "Show answer" }: { q: ReactNode; children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card card-pad my-4">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--teal)" }}>
        Think first
      </div>
      <div className="prose-l">{q}</div>
      {open ? (
        <div className="mt-3 rounded-lg p-3 prose-l" style={{ background: "var(--panel2)" }}>
          {children}
        </div>
      ) : (
        <button className="btn mt-2" onClick={() => setOpen(true)}>
          {label}
        </button>
      )}
    </div>
  );
}

/* ---------- inline multiple choice ---------- */
export function Check({
  q,
  code,
  options,
  answer,
  why,
}: {
  q: ReactNode;
  code?: string;
  options: string[];
  answer: number;
  why: ReactNode;
}) {
  const [pick, setPick] = useState<number | null>(null);
  const done = pick !== null;
  // deterministic shuffle (same on server and client) so the right answer isn't always in the same slot
  const order = useMemo(() => {
    let s = [...(typeof q === "string" ? q : "q") + options.join("|")].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 233280, 11);
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const idx = options.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [q, options]);
  return (
    <div className="card card-pad my-4">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
        Check yourself
      </div>
      <div className="prose-l">{q}</div>
      {code && <Code code={code} />}
      <div className="mt-2 grid gap-2">
        {order.map((orig, i) => {
          const o = options[orig];
          const isAns = orig === answer;
          const style =
            done && isAns
              ? { background: "var(--good-soft)", borderColor: "var(--good)" }
              : done && pick === orig
                ? { background: "var(--bad-soft)", borderColor: "var(--bad)" }
                : undefined;
          return (
            <button
              key={i}
              disabled={done}
              onClick={() => setPick(orig)}
              style={style}
              className="btn !justify-start !rounded-lg text-left mono !text-[0.82rem] disabled:!opacity-100"
            >
              <span className="muted">{String.fromCharCode(65 + i)}.</span> {o}
            </button>
          );
        })}
      </div>
      {done && (
        <div className="prose-l mt-3 text-[0.95rem]">
          <strong style={{ color: pick === answer ? "var(--good)" : "var(--bad)" }}>
            {pick === answer ? "Correct. " : "Not quite. "}
          </strong>
          {why}
        </div>
      )}
    </div>
  );
}

/* ---------- misc ---------- */
export function Row({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={"my-4 grid gap-4 " + (cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>{children}</div>;
}
export function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="card card-pad">
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="prose-l text-[0.93rem]">{children}</div>
    </div>
  );
}
