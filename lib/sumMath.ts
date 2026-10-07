/* Helpers for the summation station. Terms look like c1*i + c0, for i = 1..n. */

export const term = (c1: number, c0: number, i: number) => c1 * i + c0;
export const terms = (c1: number, c0: number, n: number) => Array.from({ length: n }, (_, k) => term(c1, c0, k + 1));
export const total = (c1: number, c0: number, n: number) => terms(c1, c0, n).reduce((a, b) => a + b, 0);
/** what every column adds up to when you write the sum forwards and backwards */
export const pairSum = (c1: number, c0: number, n: number) => c1 * (n + 1) + 2 * c0;
/** n columns, each pairSum, counted twice -> divide by 2 */
export const closedForm = (c1: number, c0: number, n: number) => (n * pairSum(c1, c0, n)) / 2;
/** the i-th term of the sum written backwards: it is just the (n-i+1)-th forward term */
export const reversedTerm = (c1: number, c0: number, n: number, i: number) => term(c1, c0, n - i + 1);

export const isOdd = (m: number) => Math.abs(m) % 2 === 1;

/* ---------- tiny safe expression evaluator for closed-form answers (no eval) ----------
   supports: numbers, n, + - * / ^, parentheses, implicit multiplication (3n, n(5n-3), 2(n+1)) */
type Tok = { t: "num"; v: number } | { t: "n" } | { t: "op"; v: string };

function tokenize(src: string): Tok[] | null {
  const s = src
    .replace(/[−–]/g, "-")
    .replace(/[×·⋅]/g, "*")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\s+/g, "")
    .replace(/^t\(n\)=/i, "")
    .replace(/^2t\(n\)=/i, "");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const v = Number(s.slice(i, j));
      if (Number.isNaN(v)) return null;
      out.push({ t: "num", v });
      i = j;
    } else if (c === "n" || c === "N") {
      out.push({ t: "n" });
      i++;
    } else if ("+-*/^()".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
    } else return null;
  }
  return out;
}

export function evalExpr(src: string, n: number): number | null {
  const parsed = tokenize(src);
  if (!parsed || parsed.length === 0) return null;
  const toks: Tok[] = parsed;
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => {
    const t = peek();
    return !!t && t.t === "op" && t.v === v;
  };
  const startsAtom = () => {
    const t = peek();
    return !!t && (t.t === "num" || t.t === "n" || (t.t === "op" && t.v === "("));
  };
  function expr(): number {
    let v = term_();
    while (isOp("+") || isOp("-")) {
      const op = (toks[p++] as { v: string }).v;
      const r = term_();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term_(): number {
    let v = power();
    for (;;) {
      if (isOp("*") || isOp("/")) {
        const op = (toks[p++] as { v: string }).v;
        const r = power();
        v = op === "*" ? v * r : v / r;
      } else if (startsAtom()) {
        v = v * power(); // implicit multiplication
      } else break;
    }
    return v;
  }
  function power(): number {
    const b = unary();
    if (isOp("^")) {
      p++;
      const e = power();
      return Math.pow(b, e);
    }
    return b;
  }
  function unary(): number {
    if (isOp("-")) {
      p++;
      return -unary();
    }
    if (isOp("+")) {
      p++;
      return unary();
    }
    return atom();
  }
  function atom(): number {
    const t = toks[p++];
    if (!t) throw new Error("eof");
    if (t.t === "num") return t.v;
    if (t.t === "n") return n;
    if (t.t === "op" && t.v === "(") {
      const v = expr();
      if (!isOp(")")) throw new Error("paren");
      p++;
      return v;
    }
    throw new Error("bad");
  }
  try {
    const v = expr();
    if (p !== toks.length) return null;
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** does the typed expression equal fn(n) for n = 1..10 ? */
export function sameFormula(src: string, fn: (n: number) => number): { ok: boolean; badN?: number; got?: number | null; want?: number; parsed: boolean } {
  if (evalExpr(src, 1) === null) return { ok: false, parsed: false };
  for (let n = 1; n <= 10; n++) {
    const got = evalExpr(src, n);
    const want = fn(n);
    if (got === null || Math.abs(got - want) > 1e-9) return { ok: false, parsed: true, badN: n, got, want };
  }
  return { ok: true, parsed: true };
}
