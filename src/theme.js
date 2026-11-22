/**
 * Identidad visual "Nosotros"
 * Concepto: dos mitades de un corazón que se encuentran; el espacio que
 * comparten (dorado) es el "nosotros".
 *  - Coral  → calidez, cercanía
 *  - Rosa   → cariño
 *  - Violeta eléctrico → lo moderno, lo inesperado
 *  - Sol    → el espacio compartido
 *  - Tinta ciruela en lugar de negro, para textos con carácter
 */
const LIGHT = {
  bg: '#FFF8F2', // crema cálido
  card: '#FFFFFF',
  ink: '#1E1330', // ciruela profundo (texto principal)
  text: '#1E1330',
  muted: '#7D7290',
  border: '#EFE6EE',

  coral: '#FF7A59',
  primary: '#FF3D6E', // rosa vibrante (acción principal)
  primaryDark: '#C81E54',
  primarySoft: '#FFE4EB',
  violet: '#6D4BFF',
  violetSoft: '#EEE9FF',
  sun: '#FFC24B', // el "nosotros"
  sunSoft: '#FFF3D6',

  ok: '#14A37F',
  okSoft: '#DDF6EE',
  wait: '#D48A00',
  waitSoft: '#FFF1D2',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  overlay: 'rgba(30,19,48,0.45)',
};

// Modo oscuro: noche ciruela, con los mismos acentos de la marca
const DARK = {
  bg: '#140C22',
  card: '#221638',
  ink: '#F6F0FF',
  text: '#F6F0FF',
  muted: '#A99DC0',
  border: '#33254D',

  coral: '#FF8A6B',
  primary: '#FF5A82',
  primaryDark: '#FF8FAB',
  primarySoft: '#3A1A33',
  violet: '#8F75FF',
  violetSoft: '#2A2150',
  sun: '#FFC24B',
  sunSoft: '#3A2E14',

  ok: '#3DD6A8',
  okSoft: '#123A30',
  wait: '#F2B23A',
  waitSoft: '#3A2C10',
  danger: '#FF6B70',
  dangerSoft: '#3A1518',
  overlay: 'rgba(0,0,0,0.6)',
};

const GRADIENTS = {
  light: {
    primary: ['#FF7A59', '#FF3D6E', '#6D4BFF'], // coral → rosa → violeta (firma de la marca)
    soft: ['#FFF1EA', '#FFF8F2', '#F2EDFF'],
    reveal: ['#FFF3D6', '#FFE4EB', '#EEE9FF'],
  },
  dark: {
    primary: ['#FF7A59', '#FF3D6E', '#6D4BFF'],
    soft: ['#1E1330', '#140C22', '#1B1240'],
    reveal: ['#3A2E14', '#3A1A33', '#2A2150'],
  },
};

// Objetos "vivos": applyScheme() los actualiza en su lugar y la app se vuelve a dibujar
export const colors = { ...LIGHT };
export const gradients = { ...GRADIENTS.light };
export let currentScheme = 'light';

// Tipografía: Bricolage Grotesque para títulos (se carga en App.js)
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  bold: 'BricolageGrotesque_700Bold',
  medium: 'BricolageGrotesque_500Medium',
};

export const shadow = {
  shadowColor: '#6D4BFF',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};

function makeUi() {
  return {
  title: { fontSize: 30, fontFamily: fonts.display, color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 6, lineHeight: 21 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    color: colors.ink,
    marginTop: 12,
  },
  ghostButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: colors.violet,
    backgroundColor: colors.card,
  },
  ghostButtonText: { color: colors.violet, fontSize: 16, fontFamily: fonts.bold },
  link: { color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 18 },
  error: { color: colors.danger, marginTop: 12, textAlign: 'center' },
  };
}

export const ui = makeUi();

/** Cambia entre 'light' y 'dark' actualizando colores, degradados, sombras y estilos */
export function applyScheme(scheme) {
  const dark = scheme === 'dark';
  currentScheme = dark ? 'dark' : 'light';
  Object.assign(colors, dark ? DARK : LIGHT);
  Object.assign(gradients, GRADIENTS[currentScheme]);
  shadow.shadowColor = dark ? '#000000' : '#6D4BFF';
  shadow.shadowOpacity = dark ? 0.35 : 0.12;
  Object.assign(ui, makeUi());
}
