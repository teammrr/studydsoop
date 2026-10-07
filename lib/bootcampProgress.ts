"use client";
import { useSyncExternalStore } from "react";

const KEY = "dsoop-bootcamp-v1";
const EVT = "dsoop-bootcamp";

export type MockScore = { ts: number; paper: string; score: number; total: number; secs: number; byProb: [number, number][] };
export type BC = { stations: Record<string, boolean>; mocks: MockScore[] };
const empty: BC = { stations: {}, mocks: [] };

let cacheRaw: string | null | undefined;
let cacheVal: BC = empty;
function snapshot(): BC {
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
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}
function save(v: BC) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function useBootcamp() {
  const bc = useSyncExternalStore(subscribe, snapshot, () => empty);
  const update = (fn: (b: BC) => BC) => save(fn(snapshot()));
  return {
    bc,
    setStation: (id: string, v: boolean) => update((x) => ({ ...x, stations: { ...x.stations, [id]: v } })),
    addMock: (m: MockScore) => update((x) => ({ ...x, mocks: [...x.mocks, m].slice(-20) })),
    reset: () => save(empty),
  };
}
