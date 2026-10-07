"use client";
import { useState } from "react";
import { Callout, Code, Sec } from "../ui";
import { ORIGINAL } from "@/lib/bootcampPapers";
import { codeNorm } from "@/lib/bootcampUtil";

const P3 = ORIGINAL.probs[2];
const BLANKS = P3.parts.filter((p) => p.kind === "blank");

type Drill = { id: string; title: string; spec: string; code: string; accept: string[]; model: string; why: string };
const DRILLS: Drill[] = [
  {
    id: "d1",
    title: "Count the digit characters",
    spec: "counts[k] = how many characters of word k are digits '0'..'9'.",
    code: `for (int j = 0; j < st.length(); j++) {\n    char ch = st.charAt(j);\n    if (____) counts[k]++;\n}`,
    accept: ["ch >= '0' && ch <= '9'", "Character.isDigit(ch)", "ch >= 48 && ch <= 57", "'0' <= ch && ch <= '9'"],
    model: "ch >= '0' && ch <= '9'",
    why: "Digit characters are consecutive in the character table, so a range test works. Character.isDigit(ch) is the library version.",
  },
  {
    id: "d2",
    title: "Count the UPPERCASE letters",
    spec: "counts[k] = how many characters of word k are capital letters.",
    code: `for (int j = 0; j < st.length(); j++) {\n    char ch = st.charAt(j);\n    if (____) counts[k]++;\n}`,
    accept: ["ch >= 'A' && ch <= 'Z'", "Character.isUpperCase(ch)", "'A' <= ch && ch <= 'Z'"],
    model: "ch >= 'A' && ch <= 'Z'",
    why: "Same idea with the range 'A'..'Z'. Character.isUpperCase(ch) also works.",
  },
  {
    id: "d3",
    title: "No inner loop needed",
    spec: "counts[k] = the LENGTH of word k.",
    code: `for (int k = 0; k < n; k++) {\n    counts[k] = ____;\n}`,
    accept: ["words[k].length()", "charArray[k].length()", "arr[k].length()", "a[k].length()"],
    model: "words[k].length()",
    why: "Not every problem needs the inner character loop. Strings have length() with parentheses (arrays have length without).",
  },
  {
    id: "d4",
    title: "Does the word contain a 'z'?",
    spec: "has[k] = true if word k contains the letter z (has is a boolean[] of size n, all false at first).",
    code: `for (int j = 0; j < st.length(); j++) {\n    if (st.charAt(j) == 'z') ____;\n}`,
    accept: ["has[k] = true"],
    model: "has[k] = true",
    why: "Set the flag for word k (not j). Setting it more than once is harmless.",
  },
];

function Blank({ label, value, onChange, state, placeholder }: { label: string; value: string; onChange: (v: string) => void; state?: "ok" | "bad"; placeholder?: string }) {
  return (
    <label className="flex items-center gap-2 rounded-lg px-2 py-1" style={state ? { background: state === "ok" ? "var(--good-soft)" : "var(--bad-soft)" } : undefined}>
      <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
      <input
        className="mono min-w-0 flex-1 rounded-md border bg-transparent px-2 py-1 text-sm"
        style={{ borderColor: "var(--line)" }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </label>
  );
}

export default function StringStation() {
  const [ans, setAns] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [words, setWords] = useState("b1n, iRS, mini, viii, I1iI1");
  const [target, setTarget] = useState("i");
  const [dAns, setDAns] = useState<Record<string, string>>({});
  const [dChecked, setDChecked] = useState<Record<string, boolean>>({});

  const okBlank = (id: string) => {
    const b = BLANKS.find((x) => x.id === id);
    return !!b && b.kind === "blank" && !!(ans[id] ?? "").trim() && b.accept.some((a) => codeNorm(a) === codeNorm(ans[id] ?? ""));
  };
  const score = BLANKS.filter((b) => okBlank(b.id)).length;

  const list = words.split(",").map((w) => w.trim()).filter((w) => w.length > 0);
  const t = target.length ? target[0] : "";
  const counts = list.map((w) => (t ? [...w].filter((c) => c === t).length : 0));

  return (
    <div>
      <p className="text-lg muted">
        Problem 3 is <strong>5 points</strong> and it is always the same shape: <em>build an array, loop over strings, loop over characters, test, update</em>. Learn the shape once and the blanks fill themselves.
      </p>

      <Sec kicker="Step 1 · Try the quiz problem" title="Fill the five blanks">
        <p>{P3.intro}</p>
        <Code code={P3.code ?? ""} />
        <div className="card card-pad my-3 grid gap-1">
          {BLANKS.map((b) => (
            <Blank key={b.id} label={b.kind === "blank" ? b.label : ""} placeholder={b.kind === "blank" ? b.placeholder : undefined} value={ans[b.id] ?? ""} onChange={(v) => { setAns({ ...ans, [b.id]: v }); setChecked(false); }} state={checked ? (okBlank(b.id) ? "ok" : "bad") : undefined} />
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button className="btn btn-primary" onClick={() => setChecked(true)}>Check</button>
            {checked && <span className="text-sm"><strong>{score}/5</strong> blanks correct</span>}
          </div>
          {checked && (
            <div className="mt-2 grid gap-1 text-sm">
              {BLANKS.map((b) => b.kind === "blank" && !okBlank(b.id) && (
                <div key={b.id} className="rounded-lg px-3 py-2" style={{ background: "var(--panel2)" }}>
                  <strong>{b.label}</strong>: <code className="inline">{b.model}</code>
                  <div className="muted">{b.why}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Sec>

      <Sec kicker="Step 2 · See it work" title="Run the method by eye">
        <p>Change the words or the character to count. Highlighted letters are the ones the <code className="inline">if</code> accepts, and the array on the right is what <code className="inline">counts</code> ends up as.</p>
        <div className="card card-pad my-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex flex-1 items-center gap-2">
              <span className="font-semibold">words</span>
              <input className="mono min-w-0 flex-1 rounded-md border bg-transparent px-2 py-1" style={{ borderColor: "var(--line)" }} value={words} onChange={(e) => setWords(e.target.value)} />
            </label>
            <label className="flex items-center gap-2">
              <span className="font-semibold">count</span>
              <input className="mono w-12 rounded-md border bg-transparent px-2 py-1 text-center" style={{ borderColor: "var(--line)" }} value={target} maxLength={1} onChange={(e) => setTarget(e.target.value)} />
            </label>
          </div>
          <div className="mt-3 grid gap-2">
            {list.map((w, k) => (
              <div key={k} className="flex items-center gap-3">
                <span className="mono w-14 text-xs muted">k = {k}</span>
                <span className="flex flex-wrap gap-1">
                  {[...w].map((c, j) => (
                    <span key={j} className="cell !h-8 !min-w-[2rem] !border" style={c === t ? { background: "var(--hi)" } : undefined}>{c}</span>
                  ))}
                </span>
                <span className="mono ml-auto text-sm">counts[{k}] = <strong>{counts[k]}</strong></span>
              </div>
            ))}
          </div>
          <div className="mono mt-3 text-sm">returns {"{"}{counts.join(", ")}{"}"}</div>
        </div>
        <Callout kind="warn" title="Four classic slips">
          <ul>
            <li><code className="inline">s.length()</code> for a String but <code className="inline">a.length</code> for an array (no parentheses).</li>
            <li>A <code className="inline">char</code> is written with single quotes: <code className="inline">ch == &apos;i&apos;</code>, never <code className="inline">&quot;i&quot;</code>.</li>
            <li>The tally belongs to the <em>word</em>: <code className="inline">counts[k]</code>, not <code className="inline">counts[j]</code>.</li>
            <li>Check the example for exact rules: <code className="inline">I1iI1</code> has capital I&apos;s, but the answer is 1, so only lowercase i counts.</li>
          </ul>
        </Callout>
      </Sec>

      <Sec kicker="Step 3 · Variations" title="Change the question, keep the shape">
        <p>On the quiz the question will differ. Fill the one blank that changes.</p>
        <div className="grid gap-4">
          {DRILLS.map((d) => {
            const v = dAns[d.id] ?? "";
            const good = d.accept.some((a) => codeNorm(a) === codeNorm(v)) && v.trim() !== "";
            return (
              <div key={d.id} className="card card-pad">
                <div className="font-semibold">{d.title}</div>
                <div className="text-sm muted">{d.spec}</div>
                <Code code={d.code} />
                <Blank label="____ =" value={v} onChange={(x) => { setDAns({ ...dAns, [d.id]: x }); setDChecked({ ...dChecked, [d.id]: false }); }} state={dChecked[d.id] ? (good ? "ok" : "bad") : undefined} />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button className="btn" onClick={() => setDChecked({ ...dChecked, [d.id]: true })}>Check</button>
                  {dChecked[d.id] && (
                    <span className="text-sm">
                      {good ? <strong style={{ color: "var(--good)" }}>Correct. </strong> : <strong style={{ color: "var(--bad)" }}>Not yet: expected <code className="inline">{d.model}</code>. </strong>}
                      <span className="muted">{d.why}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Sec>
    </div>
  );
}
