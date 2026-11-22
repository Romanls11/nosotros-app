// Categorías de preguntas, cada una con su color e ícono.
// El color "soft" se calcula con transparencia para que funcione en modo claro y oscuro.

export const CATEGORIES = [
  {
    key: 'profundas',
    label: 'Profundas',
    emoji: '💭',
    color: '#6D4BFF',
    ideas: [
      '¿Qué es lo que más miedo te da perder?',
      '¿Qué te hace sentir realmente valorado(a)?',
      '¿Qué herida del pasado todavía te pesa?',
      '¿Qué significa para ti el amor verdadero?',
      '¿Qué parte de ti casi nadie conoce?',
      '¿Qué te gustaría que te perdonara?',
      '¿En qué momento de tu vida creciste más?',
      '¿Qué necesitas de mí cuando estás triste?',
    ],
  },
  {
    key: 'divertidas',
    label: 'Divertidas',
    emoji: '😂',
    color: '#E0A100',
    ideas: [
      'Si fueras un animal, ¿cuál serías y por qué?',
      '¿Cuál es la cosa más ridícula que has hecho por amor?',
      'Si tuviéramos un programa de TV, ¿cómo se llamaría?',
      '¿Qué comida nunca volverías a probar?',
      '¿Cuál es tu talento inútil favorito?',
      'Si fueras un emoji, ¿cuál serías?',
      '¿Qué canción cantas cuando nadie te oye?',
      '¿Cuál ha sido tu peor corte de cabello?',
    ],
  },
  {
    key: 'futuro',
    label: 'Futuro',
    emoji: '🔮',
    color: '#00A3A3',
    ideas: [
      '¿Dónde te imaginas viviendo en 10 años?',
      '¿Qué viaje tenemos que hacer sí o sí?',
      '¿Cómo te imaginas nuestra casa ideal?',
      '¿Qué meta quieres cumplir antes de los 40?',
      '¿Qué tradición quieres que tengamos algún día?',
      '¿Qué te gustaría aprender el próximo año?',
      '¿Cómo te imaginas un domingo perfecto en el futuro?',
      '¿Qué proyecto te gustaría que hiciéramos juntos?',
    ],
  },
  {
    key: 'infancia',
    label: 'Infancia',
    emoji: '🧸',
    color: '#FF7A59',
    ideas: [
      '¿Cuál era tu caricatura favorita?',
      '¿Qué querías ser de grande?',
      '¿Cuál es tu recuerdo más bonito de niño(a)?',
      '¿Qué travesura nunca confesaste?',
      '¿Quién era tu mejor amigo(a) de la infancia?',
      '¿Cuál era tu juguete favorito?',
      '¿Qué comida de tu infancia extrañas?',
      '¿Qué te daba miedo de niño(a)?',
    ],
  },
  {
    key: 'nosotros',
    label: 'Nosotros',
    emoji: '💞',
    color: '#FF3D6E',
    ideas: [
      '¿Qué fue lo primero que te gustó de mí?',
      '¿Cuál ha sido nuestro mejor momento juntos?',
      '¿Qué hago que te hace sentir amado(a)?',
      '¿Qué te gustaría que hiciéramos más seguido?',
      '¿Qué canción es "nuestra" para ti?',
      '¿En qué momento supiste que te gustaba?',
      '¿Qué es lo que más admiras de nosotros como pareja?',
      '¿Qué recuerdo nuestro te hace reír siempre?',
    ],
  },
  {
    key: 'picantes',
    label: 'Picantes',
    emoji: '🌶️',
    color: '#E5484D',
    ideas: [
      '¿Qué es lo más atrevido que te gustaría que hiciéramos?',
      '¿Cuál ha sido la cita más romántica que imaginas?',
      '¿Qué detalle mío te parece irresistible?',
      '¿Qué outfit mío es tu favorito?',
      '¿Cuál es tu idea de una noche perfecta juntos?',
      '¿Qué te gustaría que te susurrara al oído?',
    ],
  },
];

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

/** Color de fondo suave a partir del color de la categoría (funciona en claro y oscuro) */
export function soft(color, alpha = '22') {
  return `${color}${alpha}`;
}

export function randomIdea(categoryKey, exclude) {
  const pool = (CATEGORY_BY_KEY[categoryKey]?.ideas || []).filter((s) => s !== exclude);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
