"use client";
import { useSyncExternalStore } from "react";

const KEY = "dsoop-study-v1";

export type QuizResult = {
  ts: number;
  score: number;
  total: number;
  byTopic: Record<string, [number, number]>;
};
export type Progress = {
  done: Record<string, boolean>;
  quiz: QuizResult[];
  lab: Record<string, boolean>;
};

const empty: Progress = { done: {}, quiz: [], lab: {} };

let cacheRaw: string | null | undefined;
let cacheVal: Progress = empty;
function snapshot(): Progress {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheVal = raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch {
      cacheVal = empty;
    }
  }
  return cacheVal;
}
function subscribe(cb: () => void) {
  window.addEventListener("dsoop-progress", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("dsoop-progress", cb);
    window.removeEventListener("storage", cb);
  };
}
function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
  window.dispatchEvent(new Event("dsoop-progress"));
}

export function useProgress() {
  const p = useSyncExternalStore(subscribe, snapshot, () => empty);
  const update = (fn: (p: Progress) => Progress) => save(fn(snapshot()));
  return {
    p,
    setDone: (slug: string, v: boolean) => update((x) => ({ ...x, done: { ...x.done, [slug]: v } })),
    setLab: (id: string, v: boolean) => update((x) => ({ ...x, lab: { ...x.lab, [id]: v } })),
    addQuiz: (r: QuizResult) => update((x) => ({ ...x, quiz: [...x.quiz, r].slice(-20) })),
    reset: () => save(empty),
  };
}
