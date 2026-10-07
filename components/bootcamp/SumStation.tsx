"use client";
import { ReactNode, useState } from "react";
import { Callout, Check, Code, Reveal, Row, Sec } from "../ui";
import { isOdd, pairSum, sameFormula, terms, total } from "@/lib/sumMath";

function Sigma({ from = "i=1", to = "n", children }: { from?: string; to?: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className="inline-flex flex-col items-center leading-none">
        <span className="mono text-[0.68rem]">{to}</span>
        <span className="text-3xl">Σ</span>
        <span className="mono text-[0.68rem]">{from}</span>
      </span>
      <span className="mono">{children}</span>
    </span>
  );
}

const LOOP = `int specialSum(int n) { // 1, 6, 11, 16, 21, ..., 5n-4
    int total = 0;
    for (int i = 1; i <= n; i++) total += 5*i - 4;
    return total;
}`;

const STEPS: { eq: ReactNode; why: string }[] = [
  { eq: <Sigma>(5i − 4)</Sigma>, why: "T(n) written forwards: the smallest term first." },
  { eq: <span className="mono">T(n) = <Sigma>(5(n − i + 1) − 4)</Sigma> = <Sigma>(5n − 5i + 1)</Sigma></span>, why: "Same terms, largest first. The i-th term of the reversed list is the (n − i + 1)-th original term, so replace i by n − i + 1 and simplify." },
  { eq: <span className="mono">2T(n) = <Sigma>[(5i − 4) + (5n − 5i + 1)]</Sigma></span>, why: "Add the two equations term by term (column by column)." },
  { eq: <span className="mono">= <Sigma>(5n − 3)</Sigma></span>, why: "The i's cancel (5i − 5i = 0) and −4 + 1 = −3. Every column is the same number." },
  { eq: <span className="mono">= n(5n − 3)</span>, why: "n identical terms of (5n − 3) add up to n times (5n − 3)." },
  { eq: <span className="mono">T(n) = n(5n − 3) / 2</span>, why: "We counted T(n) twice (once forwards, once backwards), so divide by 2." },
];

export default function SumStation() {
  const [n, setN] = useState(5);
  const [step, setStep] = useState(0);
  const [c1, setC1] = useState(5);
  const [c0, setC0] = useState(-4);
  const [mine, setMine] = useState("");
  const [pick, setPick] = useState<number | null>(null);

  const fw = terms(5, -4, n);
  const bw = [...fw].reverse();
  const T = (m: number) => (m * (5 * m - 3)) / 2;
  const gf = terms(c1, c0, n);
  const verdict = mine.trim() ? sameFormula(mine, (m) => total(5, -4, m)) : null;
  const rows = Array.from({ length: 12 }, (_, k) => k + 1);

  return (
    <div>
      <p className="text-lg muted">
        Problem 2 is <strong>10 points</strong>, and parts 1–4 are one trick: write the sum forwards, write it backwards, add. Part 5 (4 points) is a true/false question you answer with small examples or the definition of odd.
      </p>

      <Sec kicker="Step 1 · 1 point" title="Turn a loop into Σ notation">
        <p>Three questions: where does <code className="inline">i</code> start (bottom of Σ), where does it stop (top), and what is added each time (the body).</p>
        <Code code={LOOP} />
        <div className="card card-pad my-3 text-lg">
          <span className="mono">T(n) = </span>
          <Sigma>(5i − 4)</Sigma>
        </div>
        <div className="card card-pad my-3">
          <label className="text-sm font-semibold">
            Try n = <strong>{n}</strong>
            <input type="range" min={1} max={8} value={n} onChange={(e) => setN(+e.target.value)} className="ml-3 align-middle accent-[var(--accent)]" />
          </label>
          <div className="mono mt-2 text-sm">
            T({n}) = {fw.join(" + ")} = <strong>{total(5, -4, n)}</strong>
          </div>
        </div>
        <Check
          q="Which Σ matches this loop?"
          code={`for (int i = 0; i < n; i++) total += 2*i + 3;`}
          options={["Σ_{i=1}^{n} (2i + 3)", "Σ_{i=0}^{n−1} (2i + 3)", "Σ_{i=0}^{n} (2i + 3)", "Σ_{i=1}^{n−1} (2i + 3)"]}
          answer={1}
          why="i starts at 0 and the loop runs while i < n, so the last value is n − 1. The bounds must copy the loop exactly."
        />
      </Sec>

      <Sec kicker="Step 2 · 5 points" title="Forwards + backwards = n equal columns">
        <p>Drag n and watch: the top row is T(n) forwards, the middle row is the same terms backwards, and every column of the bottom row is the same number.</p>
        <div className="card card-pad my-3 overflow-x-auto">
          <label className="text-sm font-semibold">
            n = <strong>{n}</strong>
            <input type="range" min={1} max={8} value={n} onChange={(e) => setN(+e.target.value)} className="ml-3 align-middle accent-[var(--accent)]" />
          </label>
          <div className="mt-3 inline-grid gap-1" style={{ gridTemplateColumns: `5.5rem repeat(${n}, 3rem)` }}>
            <span className="mono text-xs muted self-center">forwards</span>
            {fw.map((v, i) => <span key={"a" + i} className="cell !h-9 !min-w-0 !border">{v}</span>)}
            <span className="mono text-xs muted self-center">backwards</span>
            {bw.map((v, i) => <span key={"b" + i} className="cell !h-9 !min-w-0 !border">{v}</span>)}
            <span className="mono text-xs self-center font-bold">sum</span>
            {fw.map((v, i) => <span key={"c" + i} className="cell !h-9 !min-w-0 !border" style={{ background: "var(--hi)" }}>{v + bw[i]}</span>)}
          </div>
          <div className="mono mt-3 text-sm">
            every column = 5n − 3 = {5 * n - 3} · {n} columns · 2T({n}) = {n} × {pairSum(5, -4, n)} = {n * pairSum(5, -4, n)} · T({n}) = <strong>{T(n)}</strong>
          </div>
        </div>
        <p>Now the same thing as algebra. This is what to write on the quiz. Click to reveal one line at a time and say the reason aloud before you read it.</p>
        <div className="card card-pad my-3">
          <ol className="grid gap-2">
            {STEPS.slice(0, step).map((s, i) => (
              <li key={i} className="list-none rounded-lg px-3 py-2" style={{ background: i === step - 1 ? "var(--accent-soft)" : "var(--panel2)" }}>
                <div className="text-lg">{i === 0 ? <span className="mono">T(n) = </span> : null}{s.eq}</div>
                <div className="text-sm muted">{s.why}</div>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-primary" disabled={step >= STEPS.length} onClick={() => setStep(step + 1)}>{step === 0 ? "Start the derivation" : "Next line"}</button>
            <button className="btn" disabled={step === 0} onClick={() => setStep(0)}>Reset</button>
          </div>
        </div>
        <Callout kind="exam" title="What the 6 marks look like">
          Part 2 (2 pts): replace <em>i</em> by <em>n − i + 1</em> and simplify. Part 3 (2 pts): add and show that the <em>i</em>&apos;s cancel. Part 4 (1 pt): divide by 2. Always write the in-between line; the marks are for the work.
        </Callout>
      </Sec>

      <Sec kicker="Make it yours" title="The same trick on any sum of the form c₁·i + c₀">
        <p>Change the loop body. The columns always add up to <strong>c₁(n+1) + 2c₀</strong>, so T(n) = n(c₁(n+1) + 2c₀) / 2.</p>
        <div className="card card-pad my-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="mono">total += </span>
            <input type="number" className="mono w-16 rounded-md border bg-transparent px-2 py-1" style={{ borderColor: "var(--line)" }} value={c1} onChange={(e) => setC1(Number(e.target.value) || 0)} aria-label="c1" />
            <span className="mono">*i +</span>
            <input type="number" className="mono w-16 rounded-md border bg-transparent px-2 py-1" style={{ borderColor: "var(--line)" }} value={c0} onChange={(e) => setC0(Number(e.target.value) || 0)} aria-label="c0" />
            <span className="muted">with n = {n}</span>
          </div>
          <div className="mono mt-3 text-sm">terms: {gf.join(", ")}</div>
          <div className="mono text-sm">column sum = {c1}({n}+1) + 2({c0}) = {pairSum(c1, c0, n)} · T = {n} × {pairSum(c1, c0, n)} / 2 = <strong>{(n * pairSum(c1, c0, n)) / 2}</strong> · loop says <strong>{total(c1, c0, n)}</strong></div>
        </div>
      </Sec>

      <Sec kicker="Step 3 · 1 point" title="Check your closed form">
        <p>Type your answer for T(n). I evaluate it for n = 1…10 against the real loop (you can write <code className="inline">n(5n-3)/2</code> or <code className="inline">(5n^2-3n)/2</code>).</p>
        <div className="card card-pad my-3">
          <input className="mono w-full rounded-md border bg-transparent px-3 py-2" style={{ borderColor: "var(--line)" }} placeholder="T(n) = ..." value={mine} onChange={(e) => setMine(e.target.value)} />
          {verdict && (
            <div className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: verdict.ok ? "var(--good-soft)" : "var(--bad-soft)" }}>
              {verdict.ok
                ? "Matches the loop for every n from 1 to 10."
                : !verdict.parsed
                  ? "I cannot read that. Use n, numbers, + − * / ^ and parentheses."
                  : `Not equal: at n = ${verdict.badN} the loop gives ${verdict.want} but your formula gives ${verdict.got}.`}
            </div>
          )}
        </div>
      </Sec>

      <Sec kicker="Step 4 · 4 points" title="True or False: if n is odd, then T(n) is odd?">
        <p>
          <strong>Do not start by proving.</strong> Test small cases first. Tap a row where <em>n is odd</em> and decide what it tells you.
        </p>
        <div className="card card-pad my-3 overflow-x-auto">
          <div className="inline-grid gap-1 text-sm" style={{ gridTemplateColumns: "repeat(4, minmax(4.5rem, auto))" }}>
            <span className="mono text-xs muted">n</span>
            <span className="mono text-xs muted">n is…</span>
            <span className="mono text-xs muted">T(n)</span>
            <span className="mono text-xs muted">T(n) is…</span>
            {rows.map((m) => (
              <button key={m} className="contents" onClick={() => setPick(m)} aria-label={`row ${m}`}>
                {[m, isOdd(m) ? "odd" : "even", T(m), isOdd(T(m)) ? "odd" : "even"].map((c, k) => (
                  <span key={k} className="mono rounded px-2 py-1 text-left" style={{ background: pick === m ? "var(--hi)" : "var(--panel2)" }}>{c}</span>
                ))}
              </button>
            ))}
          </div>
          {pick !== null && (
            <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: !isOdd(pick) ? "var(--warn-soft)" : isOdd(T(pick)) ? "var(--panel2)" : "var(--good-soft)" }}>
              {!isOdd(pick)
                ? `n = ${pick} is even, so it says nothing about the claim (the claim is only about odd n).`
                : isOdd(T(pick))
                  ? `n = ${pick} is odd and T(${pick}) = ${T(pick)} is odd: the claim survives this case. One example can never prove a claim, so keep looking.`
                  : `Found it: n = ${pick} is odd but T(${pick}) = ${T(pick)} is even. One counterexample is enough: the statement is FALSE.`}
            </div>
          )}
        </div>
        <Reveal q={<>Write the 4-point answer exactly as you would on paper.</>} label="Show the model answer">
          <p><strong>False.</strong> Counterexample: n = 3 is odd (3 = 2·1 + 1).</p>
          <p>T(3) = 1 + 6 + 11 = 18 = 2·9, which is even: it has the form 2k, not 2k + 1.</p>
          <p className="muted">Marks: says false (1) · valid odd n (1) · T computed correctly (1) · concludes it is not odd (1). The formula agrees: 3·(15 − 3)/2 = 18.</p>
        </Reveal>
        <Callout kind="tip" title="The decision rule">
          <ol>
            <li>Test n = 1, 2, 3, 4. If any case breaks the claim, it is false: write that case up as a counterexample.</li>
            <li>If none breaks it, try a proof from the definition: write <em>n = 2k + 1</em>, substitute, and rearrange into <em>2(something) + 1</em>.</li>
          </ol>
        </Callout>
        <Row>
          <Reveal q={<>Prove: if <em>a</em> and <em>b</em> are odd, then <em>a + b</em> is even.</>}>
            <p>Let a = 2j + 1 and b = 2k + 1 for non-negative integers j, k.</p>
            <p>a + b = 2j + 2k + 2 = 2(j + k + 1), which is 2 times an integer, so a + b is even. ∎</p>
          </Reveal>
          <Reveal q={<>Prove: if <em>n</em> is odd, then <em>n²</em> is odd.</>}>
            <p>Let n = 2k + 1.</p>
            <p>n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which has the form 2m + 1 with m = 2k² + 2k, so n² is odd. ∎</p>
          </Reveal>
        </Row>
      </Sec>
    </div>
  );
}
