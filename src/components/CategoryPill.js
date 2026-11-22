import { Text, View } from 'react-native';
import { CATEGORY_BY_KEY, soft } from '../categories';

/** Etiqueta de categoría (emoji + nombre) con su color */
export default function CategoryPill({ category, small, onDark }) {
  const c = CATEGORY_BY_KEY[category];
  if (!c) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: onDark ? 'rgba(255,255,255,0.22)' : soft(c.color),
        borderRadius: 999,
        paddingHorizontal: small ? 8 : 10,
        paddingVertical: small ? 2 : 4,
      }}
    >
      <Text style={{ fontSize: small ? 11 : 13 }}>{c.emoji}</Text>
      <Text style={{ marginLeft: 4, fontSize: small ? 11 : 12, fontWeight: '800', color: onDark ? '#fff' : c.color }}>
        {c.label}
      </Text>
    </View>
  );
}
