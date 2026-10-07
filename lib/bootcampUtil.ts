/** loose compare for printed values: case/space-insensitive */
export const loose = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
/** compare code fragments: ignore all whitespace and a trailing semicolon (case still matters in Java) */
export const codeNorm = (s: string) => s.replace(/\s+/g, "").replace(/;+$/, "");
export const mmss = (secs: number) => {
  const s = Math.max(0, secs);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** wall-clock timestamp for saved attempts (kept out of component bodies on purpose) */
export const stamp = () => Date.now();
