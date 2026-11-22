// 📅 "Un día como hoy": recupera una pregunta que respondieron juntos hace una semana, un mes, etc.
import { todayKey } from './daily';
import { isLocked } from './capsule';

const OFFSETS = [
  { label: 'hace 1 año', fn: (d) => d.setFullYear(d.getFullYear() - 1) },
  { label: 'hace 6 meses', fn: (d) => d.setMonth(d.getMonth() - 6) },
  { label: 'hace 3 meses', fn: (d) => d.setMonth(d.getMonth() - 3) },
  { label: 'hace 1 mes', fn: (d) => d.setMonth(d.getMonth() - 1) },
  { label: 'hace 1 semana', fn: (d) => d.setDate(d.getDate() - 7) },
];

/** Devuelve { question, label } o null. Prefiere el recuerdo más antiguo. */
export function findMemory(questions, uid, partnerId, now = new Date()) {
  if (!partnerId || !questions?.length) return null;
  const byDay = {};
  for (const q of questions) {
    const c = q.createdAt?.toDate?.();
    if (!c || !q.answers?.[uid] || !q.answers?.[partnerId] || isLocked(q)) continue;
    (byDay[todayKey(c)] ||= []).push(q);
  }
  for (const o of OFFSETS) {
    const d = new Date(now);
    o.fn(d);
    const list = byDay[todayKey(d)];
    if (list?.length) {
      // Si hay varias ese día, una al azar pero fija durante el día
      const i = now.getDate() % list.length;
      return { question: list[i], label: o.label };
    }
  }
  return null;
}
