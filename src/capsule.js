// ⏳ Cápsula del tiempo: preguntas cuyas respuestas se abren en una fecha.
// Los dos pueden responder cuando quieran, pero las respuestas de la pareja
// no se ven hasta `unlockAt`. Ese día llega un aviso local al teléfono.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export function unlockDate(q) {
  return q?.unlockAt?.toDate ? q.unlockAt.toDate() : null;
}

export function isCapsule(q) {
  return !!q?.unlockAt;
}

export function isLocked(q, now = Date.now()) {
  const d = unlockDate(q);
  return !!d && d.getTime() > now;
}

export function daysLeft(q) {
  const d = unlockDate(q);
  if (!d) return 0;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
}

export function formatLong(date) {
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Texto corto: "se abre en 3 días", "se abre mañana", "se abre hoy" */
export function countdownText(q) {
  const n = daysLeft(q);
  if (n <= 0) return 'se abre hoy';
  if (n === 1) return 'se abre mañana';
  if (n < 60) return `se abre en ${n} días`;
  const months = Math.round(n / 30);
  return `se abre en ${months} ${months === 1 ? 'mes' : 'meses'}`;
}

/** Opciones rápidas de fecha */
export function presetDates() {
  const add = (fn) => {
    const d = new Date();
    fn(d);
    d.setHours(9, 0, 0, 0); // se abre a las 9 de la mañana
    return d;
  };
  return [
    { k: '1s', t: 'En 1 semana', d: add((d) => d.setDate(d.getDate() + 7)) },
    { k: '1m', t: 'En 1 mes', d: add((d) => d.setMonth(d.getMonth() + 1)) },
    { k: '3m', t: 'En 3 meses', d: add((d) => d.setMonth(d.getMonth() + 3)) },
    { k: '6m', t: 'En 6 meses', d: add((d) => d.setMonth(d.getMonth() + 6)) },
    { k: '1a', t: 'En 1 año', d: add((d) => d.setFullYear(d.getFullYear() + 1)) },
  ];
}

/** "14/02/2027" → Date (9:00 a.m.), o null si no es válida o ya pasó */
export function parseDate(text) {
  const m = (text || '').trim().match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd, 9, 0, 0, 0);
  if (d.getDate() !== dd || d.getMonth() !== mm - 1) return null; // fecha inexistente (31/02)
  if (d.getTime() <= Date.now()) return null;
  return d;
}

const SCHEDULED_KEY = 'nosotros.capsulasAvisadas';

/** Programa (una sola vez por cápsula) un aviso local para el día en que se abre */
export async function scheduleCapsuleReminders(questions) {
  try {
    const capsules = (questions || []).filter((q) => isLocked(q));
    if (!capsules.length) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    const done = JSON.parse((await AsyncStorage.getItem(SCHEDULED_KEY)) || '{}');
    let changed = false;
    for (const q of capsules) {
      if (done[q.id]) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏳ ¡Se abrió su cápsula del tiempo!',
          body: q.text,
          sound: 'default',
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: unlockDate(q), channelId: 'default' },
      });
      done[q.id] = true;
      changed = true;
    }
    if (changed) await AsyncStorage.setItem(SCHEDULED_KEY, JSON.stringify(done));
  } catch (e) {
    console.warn('No se pudo programar el aviso de la cápsula:', e?.message);
  }
}

const SEEN_KEY = 'nosotros.capsulasVistas';

/** ¿Ya viste esta cápsula abierta? (para la animación de revelar la primera vez) */
export async function markCapsuleSeen(id) {
  try {
    const seen = JSON.parse((await AsyncStorage.getItem(SEEN_KEY)) || '{}');
    if (seen[id]) return false;
    seen[id] = true;
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    return true; // primera vez
  } catch {
    return false;
  }
}
