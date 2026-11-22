import { StyleSheet } from 'react-native';

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
export const colors = {
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
};

export const gradients = {
  primary: ['#FF7A59', '#FF3D6E', '#6D4BFF'], // coral → rosa → violeta (firma de la marca)
  soft: ['#FFF1EA', '#FFF8F2', '#F2EDFF'],
  reveal: ['#FFF3D6', '#FFE4EB', '#EEE9FF'],
  night: ['#2B1846', '#1E1330'],
};

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

export const ui = StyleSheet.create({
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
    backgroundColor: '#fff',
  },
  ghostButtonText: { color: colors.violet, fontSize: 16, fontFamily: fonts.bold },
  link: { color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 18 },
  error: { color: colors.danger, marginTop: 12, textAlign: 'center' },
});
