// 😍 Reacciones con diseño tipo "bandeja" (como en las apps de mensajería).
//  - ReactionBar: botón "Reaccionar" → bandeja flotante con 6 reacciones animadas.
//  - ReactionBadge: insignia con la reacción que tu pareja le puso a TU respuesta.
//  - ReactionStack: emojis encimados (para las tarjetas de la lista).
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { setReaction } from '../services';
import { colors, fonts, shadow } from '../theme';
import { tap } from './ui';

export const REACTIONS = [
  { e: '❤️', label: 'Me encanta' },
  { e: '😂', label: 'Me hace reír' },
  { e: '🥹', label: 'Me conmueve' },
  { e: '😮', label: '¡Wow!' },
  { e: '🔥', label: 'Fuego' },
  { e: '🙏', label: 'Gracias' },
];
export const reactionLabel = (e) => REACTIONS.find((r) => r.e === e)?.label || '';

/**
 * Animación "con personalidad" según la reacción:
 * ❤️ late · 😂 se ríe (se sacude) · 🥹 flota con ternura · 😮 se sorprende (crece)
 * 🔥 parpadea como flama · 🙏 hace reverencia
 */
const MOTION = {
  '❤️': (v) => ({ transform: [{ scale: v.interpolate({ inputRange: [0, 0.15, 0.3, 0.45, 0.6, 1], outputRange: [1, 1.28, 1, 1.18, 1, 1] }) }] }),
  '😂': (v) => ({
    transform: [
      { rotate: v.interpolate({ inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1], outputRange: ['0deg', '-14deg', '14deg', '-12deg', '12deg', '0deg', '0deg'] }) },
      { translateY: v.interpolate({ inputRange: [0, 0.15, 0.3, 0.45, 1], outputRange: [0, -3, 0, -2, 0] }) },
    ],
  }),
  '🥹': (v) => ({
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -4, 0] }) },
      { scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] }) },
    ],
  }),
  '😮': (v) => ({ transform: [{ scale: v.interpolate({ inputRange: [0, 0.2, 0.35, 0.5, 1], outputRange: [1, 1.4, 0.95, 1, 1] }) }] }),
  '🔥': (v) => ({
    opacity: v.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [1, 0.75, 1, 0.8, 1, 1] }),
    transform: [
      { scaleY: v.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [1, 1.18, 0.95, 1.12, 1, 1] }) },
      { translateY: v.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 1], outputRange: [0, -2, 0, -1, 0] }) },
    ],
  }),
  '🙏': (v) => ({
    transform: [
      { rotate: v.interpolate({ inputRange: [0, 0.25, 0.5, 1], outputRange: ['0deg', '-18deg', '0deg', '0deg'] }) },
      { translateY: v.interpolate({ inputRange: [0, 0.25, 0.5, 1], outputRange: [0, 3, 0, 0] }) },
    ],
  }),
};
const DURATION = { '❤️': 1400, '😂': 1300, '🥹': 2200, '😮': 1600, '🔥': 900, '🙏': 1800 };

/** Envuelve un emoji y lo anima según su tipo (en bucle, con pausas) */
export function ReactionAnim({ emoji, children, delay = 0, style, loop = true }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!emoji) return;
    v.setValue(0);
    const once = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: 1, duration: DURATION[emoji] || 1400, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.delay(1600),
    ]);
    // En la lista se anima una sola vez (ahorra batería); en el detalle, en bucle
    const anim = loop ? Animated.loop(once) : once;
    anim.start();
    return () => anim.stop();
  }, [emoji, loop]);
  const motion = MOTION[emoji] ? MOTION[emoji](v) : {};
  return <Animated.View style={[style, motion]}>{children}</Animated.View>;
}

/** Ráfaga: varias copias del emoji salen flotando hacia arriba (al reaccionar) */
export function ReactionBurst({ emoji, burstKey }) {
  const parts = useRef(
    Array.from({ length: 9 }, (_, i) => ({ v: new Animated.Value(0), x: (i - 4) * 18 + (i % 2 ? 6 : -6), d: i * 45, s: 0.8 + (i % 3) * 0.25 }))
  ).current;
  useEffect(() => {
    if (!emoji || !burstKey) return;
    parts.forEach((p) => p.v.setValue(0));
    Animated.stagger(
      40,
      parts.map((p) => Animated.timing(p.v, { toValue: 1, duration: 1100 + p.d, easing: Easing.out(Easing.quad), useNativeDriver: true }))
    ).start();
  }, [burstKey]);
  if (!emoji || !burstKey) return null;
  const wobble = emoji === '😂' || emoji === '🙏';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 20, height: 1, alignItems: 'center' }}>
      {parts.map((p, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: 22,
            opacity: p.v.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 0.9, 0] }),
            transform: [
              { translateX: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.x * (emoji === '😮' ? 1.8 : 1)] }) },
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, emoji === '🔥' ? -150 : -120 - (i % 3) * 20] }) },
              { scale: p.v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, p.s * (emoji === '❤️' ? 1.25 : 1.1), p.s] }) },
              { rotate: wobble ? p.v.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', i % 2 ? '25deg' : '-25deg', '0deg'] }) : '0deg' },
            ],
          }}
        >
          {emoji}
        </Animated.Text>
      ))}
    </View>
  );
}

/** Botón + bandeja para reaccionar a la respuesta de tu pareja */
export function ReactionBar({ coupleId, question, uid, onReacted }) {
  const mine = question.reactions?.[uid] || null;
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null); // emoji presionado (muestra su nombre)
  const tray = useRef(new Animated.Value(0)).current;
  const [burst, setBurst] = useState({ emoji: null, key: 0 });
  const chipPop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!open) return;
    tray.setValue(0);
    Animated.spring(tray, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }).start();
  }, [open]);

  async function choose(emoji) {
    const next = mine === emoji ? null : emoji; // elegir la misma la quita
    tap(next ? 'success' : 'light');
    setOpen(false);
    setPreview(null);
    if (next) setBurst((b) => ({ emoji: next, key: b.key + 1 }));
    chipPop.setValue(0.4);
    Animated.spring(chipPop, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }).start();
    try {
      await setReaction(coupleId, question.id, uid, next);
      if (next) onReacted?.(question, next);
    } catch {}
  }

  return (
    <View style={{ marginTop: 14 }}>
      <ReactionBurst emoji={burst.emoji} burstKey={burst.key} />
      {/* Nombre de la reacción mientras la presionas */}
      {open && (
        <View style={{ height: 26, alignItems: 'flex-start', justifyContent: 'center', marginBottom: 4 }}>
          {preview && (
            <View style={{ backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ color: colors.bg, fontWeight: '800', fontSize: 12 }}>{reactionLabel(preview)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bandeja (aparece arriba del botón) */}
      {open && (
      <Animated.View
        style={[
          {
            alignSelf: 'flex-start',
            marginBottom: 10,
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: 32,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: tray,
            transform: [
              { translateY: tray.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              { scale: tray.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
            ],
          },
          shadow,
          { elevation: 10 },
        ]}
      >
        {REACTIONS.map((r, i) => {
          // Cada emoji entra un poquito después del anterior
          const s = tray.interpolate({
            inputRange: [0, Math.min(0.99, 0.15 + i * 0.12), 1],
            outputRange: [0.3, 0.3, 1],
            extrapolate: 'clamp',
          });
          const active = mine === r.e;
          const focused = preview === r.e;
          return (
            <Pressable
              key={r.e}
              onPress={() => choose(r.e)}
              onPressIn={() => {
                setPreview(r.e);
                tap('light');
              }}
              onPressOut={() => setPreview(null)}
              hitSlop={4}
              style={{ alignItems: 'center', width: 44 }}
            >
              <Animated.Text
                style={{
                  fontSize: focused ? 34 : 28,
                  transform: [{ scale: s }, { translateY: focused ? -8 : 0 }],
                }}
              >
                {r.e}
              </Animated.Text>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  marginTop: 2,
                  backgroundColor: active ? colors.primary : 'transparent',
                }}
              />
            </Pressable>
          );
        })}
      </Animated.View>
      )}

      {/* Botón / chip */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => {
            tap('light');
            setOpen((o) => !o);
          }}
          accessibilityLabel={mine ? `Tu reacción: ${reactionLabel(mine)}. Toca para cambiarla` : 'Reaccionar'}
        >
          <Animated.View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 999,
                paddingLeft: mine ? 6 : 14,
                paddingRight: 14,
                paddingVertical: 6,
                backgroundColor: mine ? colors.card : 'rgba(255,255,255,0.55)',
                borderWidth: 1.5,
                borderColor: mine ? colors.primary : colors.border,
                transform: [{ scale: chipPop }],
              },
              mine ? shadow : null,
            ]}
          >
            {mine ? (
              <>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: colors.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <ReactionAnim emoji={mine}>
                    <Text style={{ fontSize: 17 }}>{mine}</Text>
                  </ReactionAnim>
                </View>
                <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 14 }}>{reactionLabel(mine)}</Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 16, marginRight: 6 }}>☺︎</Text>
                <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 14 }}>Reaccionar</Text>
              </>
            )}
          </Animated.View>
        </Pressable>
        {open && (
          <Pressable onPress={() => setOpen(false)} hitSlop={10} style={{ marginLeft: 12 }}>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>Cerrar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Insignia en TU respuesta con lo que te reaccionó tu pareja */
export function ReactionBadge({ emoji, name }) {
  const v = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!emoji) return;
    v.setValue(0);
    Animated.sequence([
      Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(wiggle, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]).start(() => wiggle.setValue(0));
  }, [emoji]);
  if (!emoji) return null;
  const rotate = wiggle.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '-12deg', '10deg', '-6deg', '0deg'] });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: 14,
          top: -16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: 999,
          paddingLeft: 4,
          paddingRight: 12,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: colors.border,
          transform: [{ scale: v }],
        },
        shadow,
      ]}
    >
      <Animated.View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate }],
        }}
      >
        <ReactionAnim emoji={emoji} delay={600}>
          <Text style={{ fontSize: 15 }}>{emoji}</Text>
        </ReactionAnim>
      </Animated.View>
      <Text style={{ fontSize: 12, color: colors.text, marginLeft: 6 }}>
        <Text style={{ fontWeight: '800' }}>{name}</Text>
        <Text style={{ color: colors.muted }}> · {reactionLabel(emoji)}</Text>
      </Text>
    </Animated.View>
  );
}

/** Emojis encimados en círculos (para las tarjetas) */
export function ReactionStack({ reactions }) {
  const list = Object.values(reactions || {});
  if (!list.length) return null;
  return (
    <View style={{ flexDirection: 'row' }}>
      {list.map((e, i) => (
        <View
          key={i}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.card,
            borderWidth: 2,
            borderColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: i ? -8 : 0,
            zIndex: list.length - i,
          }}
        >
          <ReactionAnim emoji={e} delay={300 + i * 400} loop={false}>
            <Text style={{ fontSize: 13 }}>{e}</Text>
          </ReactionAnim>
        </View>
      ))}
    </View>
  );
}
