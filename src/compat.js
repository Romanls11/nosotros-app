// 💯 Test de compatibilidad: cada quien responde sobre sí mismo y se compara cuántas respuestas coinciden.

export const PACKS = [
  {
    key: 'amor',
    title: 'Amor y pareja',
    emoji: '💞',
    colors: ['#FF7A59', '#FF3D6E'],
    questions: [
      { q: '¿Cuál es tu forma favorita de demostrar cariño?', o: ['💬 Palabras bonitas', '⏰ Tiempo juntos', '🎁 Detalles', '🤗 Abrazos y besos'] },
      { q: 'Después de una discusión, ¿qué prefieres?', o: ['🗣️ Hablarlo ya', '🧘 Un rato a solas', '🤗 Un abrazo primero', '✍️ Escribirlo'] },
      { q: 'La cita ideal es…', o: ['🍝 Cena tranquila', '🎢 Algo de aventura', '🛋️ Peli en casa', '🌄 Paseo al aire libre'] },
      { q: '¿Qué tan importante son los aniversarios?', o: ['🎉 Muchísimo', '🙂 Bastante', '🤷 Más o menos', '😅 Se me olvidan'] },
      { q: '¿Cómo te gusta celebrar tu cumpleaños?', o: ['🎊 Fiesta grande', '👫 Solo con mi pareja', '👨‍👩‍👧 En familia', '🙈 Que no se note'] },
      { q: 'Los celos en pareja son…', o: ['🚫 Nunca sanos', '🤏 Normales un poquito', '😬 Señal de que importa', '🤔 Depende'] },
      { q: '¿Con qué frecuencia te gusta hablar durante el día?', o: ['📱 Todo el tiempo', '☀️ Un par de veces', '🌙 Solo en la noche', '🤷 Cuando se pueda'] },
      { q: '¿Qué valoras más en una relación?', o: ['🤝 Confianza', '😂 Diversión', '💪 Apoyo', '🔥 Pasión'] },
      { q: '¿Dónde te imaginas viviendo juntos?', o: ['🏙️ Ciudad', '🏡 Pueblo tranquilo', '🏖️ Cerca del mar', '✈️ Otro país'] },
      { q: 'Un regalo perfecto es…', o: ['💌 Hecho a mano', '🎟️ Una experiencia', '📦 Algo que necesitaba', '🎶 Una canción/playlist'] },
    ],
  },
  {
    key: 'vida',
    title: 'Estilo de vida',
    emoji: '🏡',
    colors: ['#00A3A3', '#6D4BFF'],
    questions: [
      { q: '¿Madrugador o nocturno?', o: ['🌅 Madrugador', '🌙 Nocturno', '😴 Dormilón total', '⚖️ Depende del día'] },
      { q: 'Un domingo perfecto es…', o: ['🛋️ No hacer nada', '🥾 Salir a pasear', '👨‍👩‍👧 Visitar familia', '🧹 Ponerme al día'] },
      { q: '¿Cómo manejas el dinero?', o: ['💰 Ahorro todo', '📊 Con presupuesto', '🛍️ Disfruto el momento', '🎲 Como salga'] },
      { q: 'En casa, ¿orden o caos creativo?', o: ['✨ Todo en su lugar', '🙂 Ordenado casi siempre', '🌀 Caos con lógica', '😅 Caos total'] },
      { q: '¿Mascotas?', o: ['🐶 Perros', '🐱 Gatos', '🐠 Algo pequeño', '🚫 Mejor no'] },
      { q: 'De vacaciones prefieres…', o: ['🏖️ Playa', '🏔️ Montaña', '🏛️ Ciudad y cultura', '🏕️ Aventura'] },
      { q: '¿Cocinar en casa o salir a comer?', o: ['👩‍🍳 Cocinar', '🍔 Salir', '📦 Pedir a domicilio', '⚖️ Mitad y mitad'] },
      { q: '¿Cuánto tiempo a solas necesitas?', o: ['🧍 Mucho', '🙂 Un poco cada día', '👫 Casi nada', '🤷 Varía'] },
      { q: '¿Planificar o improvisar?', o: ['📅 Todo planeado', '📝 Un plan flexible', '🎲 Improvisar', '😴 Que otro planee'] },
      { q: 'Tu bebida favorita para platicar:', o: ['☕ Café', '🍵 Té', '🍺 Una chela', '🥤 Refresco/agua'] },
    ],
  },
  {
    key: 'diversion',
    title: 'Diversión',
    emoji: '🎉',
    colors: ['#E8590C', '#C2255C'], // naranja → frambuesa (buen contraste con texto blanco)
    questions: [
      { q: 'Género de película favorito:', o: ['😂 Comedia', '😱 Terror', '💘 Romance', '💥 Acción'] },
      { q: 'Plan de viernes:', o: ['🎤 Karaoke', '🎮 Videojuegos', '🍿 Series', '💃 Salir a bailar'] },
      { q: '¿Qué superpoder elegirías?', o: ['🕊️ Volar', '🫥 Ser invisible', '⏳ Viajar en el tiempo', '🧠 Leer mentes'] },
      { q: 'Comida para toda la vida:', o: ['🌮 Tacos', '🍕 Pizza', '🍣 Sushi', '🍝 Pasta'] },
      { q: 'En un juego de mesa eres…', o: ['🏆 Competitivo(a)', '😎 Relajado(a)', '🕵️ Tramposo(a)', '🙈 El que pierde'] },
      { q: 'Música para el carro:', o: ['🎸 Rock', '🎶 Pop', '🤠 Regional mexicano', '🎧 Reguetón'] },
      { q: '¿Qué harías con un día libre sorpresa?', o: ['😴 Dormir', '🚗 Escaparnos', '🎨 Un hobby', '📺 Maratón'] },
      { q: '¿Playa o alberca?', o: ['🌊 Playa', '🏊 Alberca', '🚿 Ninguna', '🤷 Las dos'] },
      { q: 'Postre favorito:', o: ['🍫 Chocolate', '🍦 Helado', '🍰 Pastel', '🍮 Flan'] },
      { q: 'Si fuéramos un dúo famoso, seríamos…', o: ['🦸 Superhéroes', '🎤 Cantantes', '🍳 Chefs', '🕵️ Detectives'] },
    ],
  },
];

export const PACK_BY_KEY = Object.fromEntries(PACKS.map((p) => [p.key, p]));

/** Resultado de un test entre los dos */
export function compareAnswers(pack, a = [], b = []) {
  const n = pack.questions.length;
  let same = 0;
  const detail = pack.questions.map((q, i) => {
    const match = a[i] != null && a[i] === b[i];
    if (match) same++;
    return { q: q.q, mine: q.o[a[i]] ?? '—', theirs: q.o[b[i]] ?? '—', match };
  });
  return { pct: Math.round((same / n) * 100), same, total: n, detail };
}

export function tier(pct) {
  if (pct >= 90) return { emoji: '💞', title: 'Almas gemelas', text: 'Piensan casi igual. ¡Qué miedo! 😄' };
  if (pct >= 70) return { emoji: '✨', title: 'Muy compatibles', text: 'Comparten muchísimo y se entienden fácil.' };
  if (pct >= 50) return { emoji: '🧩', title: 'Se complementan', text: 'Coinciden en lo importante y se enriquecen en lo demás.' };
  return { emoji: '🧲', title: 'Polos opuestos', text: 'Diferentes… pero se atraen. ¡Tienen mucho que platicar!' };
}

/** Estado de un test para mostrar en la lista */
export function packState(doc, uid, partnerId) {
  const mine = doc?.answers?.[uid];
  const theirs = partnerId ? doc?.answers?.[partnerId] : null;
  if (mine && theirs) return 'done';
  if (mine) return 'waiting';
  if (theirs) return 'yourTurn';
  return 'new';
}
