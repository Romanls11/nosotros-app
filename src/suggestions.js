// Preguntas de ejemplo para cuando no se les ocurra qué preguntar
export const suggestions = [
  '¿Cuál es tu recuerdo favorito de cuando eras niño(a)?',
  '¿Qué fue lo primero que pensaste de mí cuando me conociste?',
  '¿Cuál es tu comida favorita y por qué?',
  'Si pudiéramos viajar a cualquier lugar mañana, ¿a dónde irías?',
  '¿Qué es algo que te da miedo y casi nunca dices?',
  '¿Qué canción te recuerda a nosotros?',
  '¿Cómo te imaginas nuestra vida en 5 años?',
  '¿Qué pequeño detalle mío te hace sentir querido(a)?',
  '¿Cuál ha sido el mejor día que hemos pasado juntos?',
  '¿Qué sueño tienes que todavía no has cumplido?',
  '¿Qué te gustaría que hiciéramos más seguido?',
  '¿Cuál es tu forma favorita de pasar un domingo?',
  '¿Qué aprendiste de tus papás que quieres repetir… y qué no?',
  '¿Qué te hace reír sin falta?',
  '¿En qué momento supiste que te gustaba?',
  '¿Qué cosa te estresa y cómo puedo ayudarte cuando pasa?',
  'Si tuvieras un día libre solo para ti, ¿qué harías?',
  '¿Qué película o serie podrías ver mil veces?',
  '¿Qué tradición te gustaría que tuviéramos como pareja?',
  '¿De qué estás más orgulloso(a) de ti?',
  '¿Cuál es tu lenguaje del amor: palabras, tiempo, detalles, ayuda o contacto?',
  '¿Qué es algo nuevo que te gustaría que aprendiéramos juntos?',
];

export function randomSuggestion(exclude) {
  const pool = suggestions.filter((s) => s !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}
