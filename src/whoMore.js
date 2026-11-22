// 🎲 "¿Quién es más probable que…?": los dos votan en secreto y se revela si coincidieron.

export const WHO_MORE_PROMPTS = [
  'se pierda en un lugar nuevo',
  'llore viendo una película',
  'se quede dormido(a) en una fiesta',
  'olvide una fecha importante',
  'gaste todo en comida',
  'haga amigos en una fila',
  'cante a todo pulmón en el carro',
  'adopte un perrito sin avisar',
  'se ría en un momento serio',
  'se coma el último pedazo sin preguntar',
  'planee el viaje con hoja de cálculo',
  'pida perdón primero después de una discusión',
  'se despierte de malas',
  'tenga 50 pestañas abiertas en el navegador',
  'se lleve bien con la suegra',
  'diga "ya casi llego" sin haber salido',
  'organice una sorpresa',
  'se asuste en una película de terror',
  'baile en público sin pena',
  'compre algo que no necesita',
  'se tarde más en arreglarse',
  'deje los platos para "al rato"',
  'recuerde el aniversario sin recordatorio',
  'hable con las plantas o las mascotas',
  'se pierda de las indicaciones del GPS',
  'pruebe la comida más rara del menú',
  'se emocione más en Navidad',
  'se quede viendo series hasta las 3 a.m.',
  'gane en un juego de mesa',
  'haga trampa en un juego de mesa',
  'se ponga celoso(a) de una mascota',
  'escriba una carta de amor',
  'mande audios de 5 minutos',
  'se desvele platicando',
  'se olvide del cargador',
  'diga "te lo dije"',
  'se vuelva famoso(a) en TikTok',
  'se enferme primero en temporada de frío',
  'cocine algo increíble improvisando',
  'quiera mudarse a otro país',
  'llegue tarde a su propia boda',
  'se haga amigo(a) del mesero',
  'tome mil fotos del atardecer',
  'quiera tener más hijos',
  'diga "te amo" primero en el día',
];

export function pickPrompt(used = new Set()) {
  const pool = WHO_MORE_PROMPTS.filter((p) => !used.has(p));
  const list = pool.length ? pool : WHO_MORE_PROMPTS;
  return list[Math.floor(Math.random() * list.length)];
}

/** Estado de una ronda desde el punto de vista de `uid` */
export function roundState(game, uid, partnerId) {
  if (!game) return 'none';
  const mine = game.votes?.[uid];
  const theirs = partnerId ? game.votes?.[partnerId] : null;
  if (mine && theirs) return 'revealed';
  if (mine) return 'waiting';
  return 'vote';
}

export function score(games, uid, partnerId) {
  const done = (games || []).filter((g) => g.votes?.[uid] && partnerId && g.votes?.[partnerId]);
  const matches = done.filter((g) => g.votes[uid] === g.votes[partnerId]).length;
  return { played: done.length, matches, pct: done.length ? Math.round((matches / done.length) * 100) : 0 };
}
