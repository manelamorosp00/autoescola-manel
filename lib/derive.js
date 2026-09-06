/* =========================================================
   Càlculs derivats a partir de l'estat real desat.
   Res aquí és inventat: tot surt de examResults / failedIds.
   ========================================================= */
import { CATS } from "./questions";

export const PINK = "#ff2d87";
export const CYAN = "#29e7ff";
export const LIME = "#c6ff3d";
export const GOLD = "#ffd166";
export const BG = "#05040a";
export const CARD = "#100d1c";
export const SURFACE = "#15121f";
export const MUTED = "#6f678f";
export const TEXT_SOFT = "#9d95bd";

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

/* Diferència entre l'últim examen i l'anterior. null si no n'hi ha prou. */
export function computeTrend(examResults) {
  const done = doneExamsSorted(examResults);
  if (done.length < 2) return null;
  return done[done.length - 1].score - done[done.length - 2].score;
}

/* Ratxa real: examens aprovats seguits comptant des de l'últim cap enrere */
export function computeStreak(examResults) {
  const done = doneExamsSorted(examResults);
  let streak = 0;
  for (let i = done.length - 1; i >= 0; i--) {
    if (done[i].pass) streak++;
    else break;
  }
  return streak;
}

export function countPassed(examResults) {
  return doneExamsSorted(examResults).filter((r) => r.pass).length;
}

/* Agrega perQuestion de tots els exàmens fets: % d'encert per tema */
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
      return { name: t.name, pct, color: colorForPct(pct) };
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
      return { name: t.name, pct, color: colorForPct(pct) };
    })
    .sort((a, b) => a.pct - b.pct);
}

export function colorForPct(pct) {
  return pct >= 85 ? LIME : pct >= 65 ? GOLD : PINK;
}

export function barHeight(value, max, hpx = 54) {
  return Math.max(6, Math.round((value / max) * hpx));
}

/* Nota d'evolució generada a partir de dades reals (mai text fix inventat) */
export function evolutionNote(examResults, { pass, total } = {}) {
  const done = doneExamsSorted(examResults);
  if (done.length === 0) return null;
  const avg = computeAvg(examResults);
  const streak = computeStreak(examResults);
  const weak = aggregateTopicStats(examResults, { minAnswered: 3, limit: 1 })[0];

  const parts = [];
  if (streak >= 2) parts.push(`Portes ${streak} examens aprovats seguits.`);
  parts.push(`La teva mitjana és de ${avg}${total ? " sobre " + total : ""}.`);
  if (weak) parts.push(`On més falles: ${weak.name} (${weak.pct}% d'encerts).`);
  else if (!pass) parts.push("Fes-ne algun més i et diré on flaqueges.");
  return parts.join(" ");
}
