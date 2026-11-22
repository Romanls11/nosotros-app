// Cálculos para "Nuestro mapa". Todo sale de las preguntas que ya están cargadas (no hace lecturas extra).
import { todayKey } from './daily';

const STOP = new Set(
  ('a al algo algun alguna algunas alguno algunos ante antes aqui asi aun bien cada casi como con contra cosa cosas cual cuando de del desde donde dos el ella ellas ellos en entre era eran es esa esas ese eso esos esta estaba estado estan estar este esto estos estoy fue fueron ha habia han hasta hay he hoy la las le les lo los mas me mi mis mismo mucho muy nada ni no nos nosotros o otra otras otro otros para pero poco por porque que quien se sea ser si sido siempre sin sobre solo son su sus tambien tan tanto te tener tengo ti tiene tienen todo todos tu tus un una uno unos y ya yo vez veces hace hacer creo pues bueno asi eh ah jaja jajaja jeje'
  ).split(' ')
);

function words(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos para contar igual "más" y "mas"
    .replace(/[^a-zñ0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function topWords(texts, n = 6) {
  const count = {};
  texts.forEach((t) => words(t).forEach((w) => (count[w] = (count[w] || 0) + 1)));
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w, c]) => ({ w, c }));
}

function ms(ts) {
  return ts?.toMillis ? ts.toMillis() : null;
}

export function humanDuration(msVal) {
  if (msVal == null) return '—';
  const min = msVal / 60000;
  if (min < 60) return `${Math.max(1, Math.round(min))} min`;
  const h = min / 60;
  if (h < 24) return `${Math.round(h)} h`;
  const d = h / 24;
  return `${Math.round(d)} ${Math.round(d) === 1 ? 'día' : 'días'}`;
}

/** Racha más larga de preguntas del día respondidas por los dos */
function bestStreak(questions, a, b) {
  const days = questions
    .filter((q) => q.daily && q.answers?.[a] && q.answers?.[b])
    .map((q) => q.daily)
    .sort();
  let best = 0;
  let cur = 0;
  let prev = null;
  for (const d of days) {
    const t = Date.parse(d + 'T12:00:00');
    cur = prev != null && Math.round((t - prev) / 86400000) === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = t;
  }
  return best;
}

export function computeStats({ questions = [], couple, uid, partnerId }) {
  const total = questions.length;
  const both = questions.filter((q) => q.answers?.[uid] && partnerId && q.answers?.[partnerId]);
  const complicity = total ? Math.round((both.length / total) * 100) : 0;

  // Quién pregunta más (sin contar las del día)
  const own = questions.filter((q) => !q.daily);
  const askedMe = own.filter((q) => q.authorId === uid).length;
  const askedThem = own.filter((q) => q.authorId === partnerId).length;

  // Tiempo promedio en responder (desde que se creó la pregunta)
  function avgResponse(id) {
    const times = questions
      .map((q) => {
        const c = ms(q.createdAt);
        const a = ms(q.answers?.[id]?.answeredAt);
        return c && a && a >= c ? a - c : null;
      })
      .filter((x) => x != null);
    return times.length ? times.reduce((s, x) => s + x, 0) / times.length : null;
  }

  // Actividad: respuestas por día en los últimos 7 días
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    week.push({ key: todayKey(d), label: d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', ''), me: 0, them: 0 });
  }
  const byKey = Object.fromEntries(week.map((w) => [w.key, w]));
  questions.forEach((q) => {
    [uid, partnerId].forEach((id) => {
      const t = q.answers?.[id]?.answeredAt;
      if (!t?.toDate) return;
      const w = byKey[todayKey(t.toDate())];
      if (w) w[id === uid ? 'me' : 'them']++;
    });
  });

  // Palabras
  const myTexts = questions.map((q) => q.answers?.[uid]?.text).filter(Boolean);
  const theirTexts = questions.map((q) => q.answers?.[partnerId]?.text).filter(Boolean);
  const myTop = topWords(myTexts, 8);
  const theirTop = topWords(theirTexts, 8);
  const theirSet = new Set(topWords(theirTexts, 40).map((x) => x.w));
  const shared = topWords(myTexts, 40)
    .filter((x) => theirSet.has(x.w))
    .slice(0, 6);

  // Reacciones y chat
  const reactionCount = {};
  questions.forEach((q) => Object.values(q.reactions || {}).forEach((e) => (reactionCount[e] = (reactionCount[e] || 0) + 1)));
  const favReaction = Object.entries(reactionCount).sort((a, b) => b[1] - a[1])[0] || null;
  const messages = questions.reduce((s, q) => s + (q.commentCount || 0), 0);

  // Días juntos en la app
  const since = couple?.createdAt?.toDate ? couple.createdAt.toDate() : null;
  const daysTogether = since ? Math.max(1, Math.floor((Date.now() - since.getTime()) / 86400000) + 1) : null;

  const longest = (arr) => arr.reduce((best, t) => (t.length > best.length ? t : best), '');

  return {
    total,
    bothCount: both.length,
    complicity,
    askedMe,
    askedThem,
    avgMe: avgResponse(uid),
    avgThem: avgResponse(partnerId),
    week,
    myTop,
    theirTop,
    shared,
    favReaction,
    messages,
    daysTogether,
    since,
    best: bestStreak(questions, uid, partnerId),
    longestMine: longest(myTexts).length,
    longestTheirs: longest(theirTexts).length,
  };
}
