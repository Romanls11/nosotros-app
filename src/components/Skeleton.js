// Esqueletos de carga: bloques que "respiran" mientras llegan los datos.
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors, gradients } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

export function Bone({ w = '100%', h = 14, r = 8, style }) {
  const v = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: colors.border, opacity: v }, style]} />;
}

/** Esqueleto de la pantalla principal */
export function HomeSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 150, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, justifyContent: 'flex-end', padding: 20 }}>
        <View style={{ width: '60%', height: 26, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <View style={{ width: '40%', height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 10 }} />
      </LinearGradient>
      <View style={{ padding: 20 }}>
        <Bone w="35%" h={16} style={{ marginBottom: 14 }} />
        {[0, 1].map((i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, padding: 14, marginBottom: 10 }}>
            <Bone w={44} h={44} r={14} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Bone w="70%" h={14} />
              <Bone w="45%" h={12} style={{ marginTop: 8 }} />
            </View>
          </View>
        ))}
        <Bone w="45%" h={16} style={{ marginTop: 10, marginBottom: 14 }} />
        <Bone h={150} r={26} />
      </View>
    </View>
  );
}
