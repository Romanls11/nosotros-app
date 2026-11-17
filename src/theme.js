import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#FFF7F3',
  card: '#FFFFFF',
  primary: '#E2557A',
  primaryDark: '#B83A5C',
  primarySoft: '#FCE4EA',
  text: '#2B2230',
  muted: '#8A7F8C',
  border: '#EFE3E6',
  ok: '#2E9E6B',
  okSoft: '#E1F4EA',
  wait: '#C98A1B',
  waitSoft: '#FBF0DA',
};

export const ui = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 6, lineHeight: 21 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginTop: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ghostButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghostButtonText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  link: { color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 18 },
  error: { color: '#C62828', marginTop: 12, textAlign: 'center' },
});
