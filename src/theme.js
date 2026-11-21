import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#FFF7F5',
  card: '#FFFFFF',
  primary: '#E2557A',
  primaryDark: '#B83A5C',
  primarySoft: '#FCE4EA',
  accent: '#FF9A8B',
  text: '#2B2230',
  muted: '#8A7F8C',
  border: '#F1E4E7',
  ok: '#2E9E6B',
  okSoft: '#E1F4EA',
  wait: '#C98A1B',
  waitSoft: '#FBF0DA',
  danger: '#C62828',
  dangerSoft: '#FDECEC',
};

// Degradados usados en encabezados, botones y fondos
export const gradients = {
  primary: ['#FF8A9B', '#E2557A', '#C2416B'],
  soft: ['#FFF1EE', '#FFF7F5', '#FDEFF3'],
  reveal: ['#FFE3EA', '#FFF4E8'],
};

export const shadow = {
  shadowColor: '#B83A5C',
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export const ui = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 6, lineHeight: 21 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginTop: 12,
  },
  ghostButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  ghostButtonText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  link: { color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 18 },
  error: { color: colors.danger, marginTop: 12, textAlign: 'center' },
});
