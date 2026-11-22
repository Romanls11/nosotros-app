// Componentes visuales reutilizables con animaciones (Animated de React Native).
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, gradients, shadow, ui } from '../theme';

/** Vibración sutil (no falla si el teléfono no la soporta) */
export function tap(kind = 'light') {
  const map = {
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  };
  map[kind]?.().catch(() => {});
}

/** Pressable que se encoge al tocarlo */
export function ScalePressable({ children, style, onPress, disabled, scaleTo = 0.96, haptic = 'light', ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      onPress={(e) => {
        if (haptic) tap(haptic);
        onPress?.(e);
      }}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.6 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/** Aparece con desvanecido + deslizamiento hacia arriba */
export function FadeIn({ children, delay = 0, from = 18, style, duration = 420 }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Late suavemente sin parar (para el logo) */
export function Pulse({ children, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

/** Corazones que flotan de fondo */
export function FloatingHearts({ count = 7 }) {
  const items = useRef(
    Array.from({ length: count }, (_, i) => ({
      v: new Animated.Value(0),
      left: `${8 + ((i * 13) % 84)}%`,
      size: 14 + ((i * 7) % 16),
      delay: i * 700,
      emoji: ['💗', '✨', '💛', '💜'][i % 4],
    }))
  ).current;

  useEffect(() => {
    const loops = items.map((it) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(it.delay),
          Animated.timing(it.v, { toValue: 1, duration: 6500, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(it.v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {items.map((it, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            bottom: -30,
            left: it.left,
            fontSize: it.size,
            opacity: it.v.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 0.55, 0.35, 0] }),
            transform: [
              { translateY: it.v.interpolate({ inputRange: [0, 1], outputRange: [0, -700] }) },
              { translateX: it.v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 14, -8] }) },
            ],
          }}
        >
          {it.emoji}
        </Animated.Text>
      ))}
    </View>
  );
}

/** Botón principal con degradado */
export function GradientButton({ title, onPress, loading, disabled, style, haptic = 'medium' }) {
  return (
    <ScalePressable onPress={onPress} disabled={disabled || loading} haptic={haptic} style={[{ marginTop: 18, borderRadius: 16 }, shadow, style]}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 17, fontFamily: fonts.bold, letterSpacing: 0.2 }}>{title}</Text>
        )}
      </LinearGradient>
    </ScalePressable>
  );
}

/** Campo de contraseña con botón 👁️ para mostrar/ocultar */
export function PasswordInput({ value, onChangeText, placeholder = 'Contraseña', ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ justifyContent: 'center' }}>
      <TextInput
        style={[ui.input, { paddingRight: 54 }]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      <Pressable
        onPress={() => {
          tap('light');
          setVisible((v) => !v);
        }}
        hitSlop={12}
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{ position: 'absolute', right: 16, top: 12, bottom: 0, justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 20, opacity: visible ? 1 : 0.55 }}>{visible ? '🙈' : '👁️'}</Text>
      </Pressable>
    </View>
  );
}

/** Encabezado con degradado y esquinas redondeadas */
export function GradientHeader({ children, style }) {
  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 22 }, style]}
    >
      {children}
    </LinearGradient>
  );
}
