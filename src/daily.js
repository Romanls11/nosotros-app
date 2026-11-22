// Pregunta del día: la misma para los dos, cambia cada día a medianoche.
// El documento se guarda con id fijo "daily-AAAA-MM-DD" para que ambos respondan el mismo.

export const DAILY_QUESTIONS = [
  '¿Qué fue lo mejor que te pasó hoy?',
  '¿Qué canción describe cómo te sientes esta semana?',
  'Si hoy pudiéramos escaparnos a cualquier lugar, ¿a dónde iríamos?',
  '¿Qué es algo que hice últimamente que te hizo sentir querido(a)?',
  '¿Qué recuerdo de nosotros te saca una sonrisa siempre?',
  '¿Qué te gustaría que hiciéramos juntos este fin de semana?',
  '¿Qué cosa pequeña te hace feliz y casi nadie sabe?',
  'Si tu vida fuera una película, ¿cómo se llamaría?',
  '¿Qué miedo te gustaría superar este año?',
  '¿Cuál es tu comida de consuelo favorita?',
  '¿Qué te gustaría que aprendiéramos juntos?',
  '¿Qué es algo que admiras de mí y no me has dicho?',
  '¿Cómo sería tu día perfecto de principio a fin?',
  '¿Qué tradición te gustaría que tuviéramos?',
  '¿Qué es lo más loco que harías conmigo?',
  '¿Qué te preocupa últimamente?',
  '¿Qué sueño de niño(a) todavía te gustaría cumplir?',
  '¿Cuál ha sido nuestra mejor cita hasta ahora?',
  '¿Qué tres palabras me describen?',
  '¿Qué te hace sentir en casa?',
  '¿En qué momento del día piensas más en mí?',
  '¿Qué película o serie te gustaría que viéramos juntos?',
  '¿Qué es algo que te gustaría cambiar de tu rutina?',
  '¿Qué olor te transporta a tu infancia?',
  '¿Qué te gustaría que hiciera más seguido?',
  'Si pudieras regresar a un día de tu vida, ¿cuál sería?',
  '¿Qué valoras más en una amistad?',
  '¿Qué aprendiste de la última vez que nos enojamos?',
  '¿Qué lugar de tu ciudad te gustaría enseñarme?',
  '¿Cuál es tu forma favorita de recibir cariño?',
  '¿Qué meta tienes para este mes?',
  '¿Qué te dio risa hoy?',
  '¿Qué es algo que nunca te has atrevido a preguntarme?',
  '¿Cómo te imaginas que seremos de viejitos?',
  '¿Qué es lo que más extrañas de tu infancia?',
  '¿Qué superpoder elegirías para un día?',
  '¿Cuál es el mejor consejo que te han dado?',
  '¿Qué te gustaría que celebráramos más?',
  '¿Qué hábito mío te parece tierno?',
  '¿Qué te gustaría decirle a tu yo de hace 5 años?',
  '¿Qué plan barato y divertido podríamos hacer?',
  '¿Qué es algo que te hace sentir orgulloso(a) de nosotros?',
  '¿Qué tema podrías platicar por horas?',
  '¿Qué cosa nueva quieres probar este año?',
  '¿Cuál es tu recuerdo favorito de una fiesta o celebración?',
  '¿Qué te ayuda a calmarte cuando estás estresado(a)?',
  '¿Qué te gustaría que supiera de ti hoy?',
  'Si escribiéramos un libro juntos, ¿de qué trataría?',
  '¿Qué detalle romántico te encantaría recibir?',
  '¿Qué agradeces hoy?',
];

/** "AAAA-MM-DD" en la hora local del teléfono */
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Pregunta del día: recorre la lista en orden (sin repetir) empezando en un punto distinto por pareja */
export function dailyQuestionFor(coupleId, key = todayKey()) {
  const [y, m, d] = key.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const i = (dayNumber + hash(coupleId)) % DAILY_QUESTIONS.length;
  return DAILY_QUESTIONS[i];
}

/** Días seguidos en que los dos respondieron la pregunta del día */
export function dailyStreak(questions, uid, partnerId) {
  if (!partnerId) return 0;
  const done = new Set(
    (questions || [])
      .filter((q) => q.daily && q.answers?.[uid] && q.answers?.[partnerId])
      .map((q) => q.daily)
  );
  const day = new Date();
  // Si hoy todavía no terminan, la racha sigue viva desde ayer
  if (!done.has(todayKey(day))) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (done.has(todayKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}
