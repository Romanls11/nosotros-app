import { Text, View } from 'react-native';
import { colors, fonts, shadow } from '../theme';
import { FadeIn, ScalePressable } from './ui';

function Line({ name, text, color }) {
  return (
    <Text style={{ color: colors.text, marginTop: 6, lineHeight: 20 }} numberOfLines={2}>
      <Text style={{ color, fontWeight: '800' }}>{name}: </Text>
      {text}
    </Text>
  );
}

/** Tarjeta "Un día como hoy" */
export default function MemoryCard({ memory, uid, partnerId, names, onPress }) {
  if (!memory) return null;
  const { question: q, label } = memory;
  return (
    <FadeIn delay={120}>
      <ScalePressable
        onPress={onPress}
        scaleTo={0.97}
        style={[
          {
            backgroundColor: colors.card,
            borderRadius: 22,
            padding: 18,
            marginBottom: 18,
            borderWidth: 1.5,
            borderColor: colors.sun,
          },
          shadow,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.sunSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.wait, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.4 }}>
              📅 UN DÍA COMO HOY · {label.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.text, marginTop: 12, lineHeight: 23 }}>{q.text}</Text>
        <Line name={names[uid] || 'Tú'} text={q.answers?.[uid]?.text} color={colors.primary} />
        <Line name={names[partnerId] || 'Tu pareja'} text={q.answers?.[partnerId]?.text} color={colors.violet} />
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 10 }}>¿Siguen pensando lo mismo? Toca para recordarlo 💛</Text>
      </ScalePressable>
    </FadeIn>
  );
}
