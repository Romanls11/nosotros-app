import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadow } from '../theme';
import { FadeIn, ScalePressable } from './ui';

/** Llama encendida que "respira" */
function Flame({ active }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);
  return (
    <Animated.Text
      style={{
        fontSize: 22,
        opacity: active ? 1 : 0.35,
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
      }}
    >
      🔥
    </Animated.Text>
  );
}

export default function DailyCard({ text, mine, theirs, partnerName, streak, onPress }) {
  const both = mine && theirs;
  const status = both
    ? '💞 Los dos respondieron. ¡Toca para ver!'
    : mine
    ? `⏳ Esperando a ${partnerName || 'tu pareja'}`
    : theirs
    ? `🔒 ${partnerName || 'Tu pareja'} ya respondió. ¡Te toca!`
    : '✍️ Respóndela antes de medianoche';

  return (
    <FadeIn>
      <ScalePressable onPress={onPress} scaleTo={0.97} haptic="medium" style={[{ borderRadius: 26, marginBottom: 18 }, shadow]}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 26, padding: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.22)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.5 }}>☀️ PREGUNTA DEL DÍA</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Flame active={streak > 0} />
            <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 20, marginLeft: 2 }}>{streak}</Text>
          </View>

          <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 22, lineHeight: 28, marginTop: 14 }}>{text}</Text>

          <View style={{ marginTop: 14, backgroundColor: 'rgba(30,19,48,0.18)', borderRadius: 14, padding: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{status}</Text>
          </View>
          {streak > 0 && (
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 8 }}>
              Llevan {streak} {streak === 1 ? 'día' : 'días'} seguidos respondiendo juntos. ¡No rompan la racha!
            </Text>
          )}
        </LinearGradient>
      </ScalePressable>
    </FadeIn>
  );
}
