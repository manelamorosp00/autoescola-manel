/* =========================================================
   Càlculs derivats a partir de l'estat real desat.
   Res aquí és inventat: tot surt de examResults / failedIds.
   ========================================================= */
import { CATS } from "./questions";

export const BLUE = "#155dfc";
export const GREEN = "#12b76a";
export const RED = "#f04438";
export const AMBER = "#f79009";

export function fmtTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}

/* Llista ordenada per data de finalització dels exàmens fets */
export function doneExamsSorted(examResults) {
  return Object.entries(examResults || {})
    .filter(([, r]) => r && r.done)
    .map(([num, r]) => ({ num: Number(num), ...r }))
    .sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0));
}

export function computeAvg(examResults) {
  const done = doneExamsSorted(examResults);
  if (done.length === 0) return null;
  const avg = done.reduce((a, r) => a + r.score, 0) / done.length;
  return Math.round(avg * 10) / 10;
}

export function computeTrend(examResults) {
  const done = doneExamsSorted(examResults);
  if (done.length < 2) return null;
  const last = done[done.length - 1];
  const prev = done[done.length - 2];
  const diff = last.score - prev.score;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff} respecte fa 2`;
}

/* Agrega perQuestion de tots els exàmens fets per calcular el % d'encert per tema */
export function aggregateTopicStats(examResults, { minAnswered = 3, limit = null } = {}) {
  const map = {};
  doneExamsSorted(examResults).forEach((r) => {
    (r.perQuestion || []).forEach((pq) => {
      const k = pq.cat;
      map[k] = map[k] || { name: CATS[k] || k, ok: 0, n: 0 };
      map[k].n++;
      if (pq.ok) map[k].ok++;
    });
  });
  let list = Object.values(map)
    .filter((t) => t.n >= minAnswered)
    .map((t) => {
      const pct = Math.round((t.ok / t.n) * 100);
      const color = pct >= 85 ? GREEN : pct >= 65 ? AMBER : RED;
      return { name: t.name, pct, color };
    })
    .sort((a, b) => a.pct - b.pct);
  if (limit) list = list.slice(0, limit);
  return list;
}

/* Estadístiques per tema d'un únic examen (per a l'informe) */
export function singleExamTopicStats(perQuestion) {
  const map = {};
  (perQuestion || []).forEach((pq) => {
    const k = pq.cat;
    map[k] = map[k] || { name: CATS[k] || k, ok: 0, n: 0 };
    map[k].n++;
    if (pq.ok) map[k].ok++;
  });
  return Object.values(map)
    .map((t) => {
      const pct = Math.round((t.ok / t.n) * 100);
      const color = pct >= 85 ? GREEN : pct >= 65 ? AMBER : RED;
      return { name: t.name, pct, color };
    })
    .sort((a, b) => a.pct - b.pct);
}

export function barHeight(value, max, hpx = 52) {
  return Math.max(6, Math.round((value / max) * hpx));
}
