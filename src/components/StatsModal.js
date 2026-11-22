// 📊 "Nuestro mapa": estadísticas visuales de la pareja (sin librerías de gráficas).
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadow } from '../theme';
import { computeStats, humanDuration } from '../stats';
import { dailyStreak } from '../daily';
import { FadeIn } from './ui';
import { CATEGORY_BY_KEY } from '../categories';

/** Barra que crece animada (0..1) */
function Bar({ value, color, height = 12, delay = 0, vertical = false }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: Math.max(0, Math.min(1, value || 0)),
      duration: 900,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value]);
  const size = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return vertical ? (
    <Animated.View style={{ width: '100%', height: size, backgroundColor: color, borderRadius: 6 }} />
  ) : (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.border, overflow: 'hidden' }}>
      <Animated.View style={{ height, width: size, backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

function Card({ children, delay = 0, style }) {
  return (
    <FadeIn delay={delay} style={{ marginTop: 14 }}>
      <View style={[{ backgroundColor: colors.card, borderRadius: 22, padding: 18 }, shadow, style]}>{children}</View>
    </FadeIn>
  );
}

const H = ({ children }) => (
  <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 12 }}>{children}</Text>
);

function Chips({ items, color, bg }) {
  if (!items.length) return <Text style={{ color: colors.muted, fontStyle: 'italic' }}>Aún no hay suficientes respuestas.</Text>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {items.map(({ w, c }) => (
        <View key={w} style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 }}>
          <Text style={{ color, fontWeight: '700' }}>
            {w}
            {c > 1 ? <Text style={{ opacity: 0.6 }}> ×{c}</Text> : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function StatsModal({ visible, onClose, questions, couple, uid, partnerId }) {
  const names = couple?.names || {};
  const me = names[uid] || 'Tú';
  const them = (partnerId && names[partnerId]) || 'Tu pareja';
  const s = useMemo(
    () => (visible ? computeStats({ questions, couple, uid, partnerId }) : null),
    [visible, questions, couple, uid, partnerId]
  );
  const streak = useMemo(() => dailyStreak(questions, uid, partnerId), [questions, uid, partnerId]);
  if (!visible || !s) return null;

  const asked = s.askedMe + s.askedThem;
  const faster =
    s.avgMe != null && s.avgThem != null ? (s.avgMe <= s.avgThem ? me : them) : null;
  const weekMax = Math.max(1, ...s.week.map((d) => d.me + d.them));

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>‹ Volver</Text>
          </Pressable>
          <FadeIn>
            <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 34, marginTop: 16, letterSpacing: -0.5 }}>nuestro mapa</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' }}>
              {me} & {them}
              {s.since
                ? ` · juntos aquí desde el ${s.since.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} (${s.daysTogether} ${s.daysTogether === 1 ? 'día' : 'días'})`
                : ''}
            </Text>
          </FadeIn>

          {/* Números grandes */}
          <FadeIn delay={120} style={{ flexDirection: 'row', marginTop: 18 }}>
            {[
              { n: s.total, t: 'preguntas' },
              { n: s.bothCount, t: 'respondidas\njuntos' },
              { n: `${s.complicity}%`, t: 'complicidad' },
            ].map((x, i) => (
              <View key={i} style={{ flex: 1, marginRight: i < 2 ? 8 : 0, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18, padding: 12 }}>
                <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 28 }}>{x.n}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>{x.t}</Text>
              </View>
            ))}
          </FadeIn>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Rachas */}
          <Card delay={150} style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>🔥</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 30, color: colors.text }}>{streak}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>racha actual</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>🏆</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 30, color: colors.text }}>{s.best}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>mejor racha</Text>
            </View>
          </Card>

          {/* Quién pregunta más */}
          <Card delay={200}>
            <H>🙋 ¿Quién pregunta más?</H>
            {asked === 0 ? (
              <Text style={{ color: colors.muted, fontStyle: 'italic' }}>Todavía no hay preguntas propias.</Text>
            ) : (
              <>
                <View style={{ flexDirection: 'row', height: 18, borderRadius: 9, overflow: 'hidden' }}>
                  <View style={{ flex: s.askedMe || 0.0001, backgroundColor: colors.primary }} />
                  <View style={{ flex: s.askedThem || 0.0001, backgroundColor: colors.violet }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>{me} · {s.askedMe}</Text>
                  <Text style={{ color: colors.violet, fontWeight: '800' }}>{s.askedThem} · {them}</Text>
                </View>
              </>
            )}
          </Card>

          {/* Quién responde más rápido */}
          <Card delay={250}>
            <H>⚡ ¿Quién responde más rápido?</H>
            {[
              { n: me, v: s.avgMe, c: colors.primary },
              { n: them, v: s.avgThem, c: colors.violet },
            ].map((r, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {r.n} {faster === r.n ? '⚡' : ''}
                  </Text>
                  <Text style={{ color: colors.muted, fontWeight: '700' }}>{humanDuration(r.v)} en promedio</Text>
                </View>
                <Bar
                  value={r.v == null ? 0 : 1 - r.v / Math.max(s.avgMe || 0, s.avgThem || 0, 1) + 0.08}
                  color={r.c}
                  delay={300 + i * 100}
                />
              </View>
            ))}
          </Card>

          {/* Semana */}
          <Card delay={300}>
            <H>📅 Su semana</H>
            <View style={{ flexDirection: 'row', height: 110, alignItems: 'flex-end' }}>
              {s.week.map((d, i) => (
                <View key={d.key} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', height: 90, alignItems: 'flex-end' }}>
                    <View style={{ width: 9, height: '100%', justifyContent: 'flex-end', marginRight: 3 }}>
                      <Bar vertical value={d.me / weekMax} color={colors.primary} delay={350 + i * 60} />
                    </View>
                    <View style={{ width: 9, height: '100%', justifyContent: 'flex-end' }}>
                      <Bar vertical value={d.them / weekMax} color={colors.violet} delay={380 + i * 60} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 6, fontWeight: '600' }}>{d.label}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Text style={{ color: colors.primary, fontWeight: '700', marginRight: 14 }}>● {me}</Text>
              <Text style={{ color: colors.violet, fontWeight: '700' }}>● {them}</Text>
            </View>
          </Card>

          {/* Palabras */}
          <Card delay={350}>
            <H>💛 Lo que comparten</H>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: -6, marginBottom: 10 }}>
              Palabras que los dos usan en sus respuestas
            </Text>
            <Chips items={s.shared} color={colors.wait} bg={colors.sunSoft} />
          </Card>

          <Card delay={400}>
            <H>🗣️ Las palabras de cada quien</H>
            <Text style={{ color: colors.primary, fontWeight: '800', marginBottom: 8 }}>{me}</Text>
            <Chips items={s.myTop} color={colors.primary} bg={colors.primarySoft} />
            <Text style={{ color: colors.violet, fontWeight: '800', marginTop: 12, marginBottom: 8 }}>{them}</Text>
            <Chips items={s.theirTop} color={colors.violet} bg={colors.violetSoft} />
          </Card>

          {/* Datos curiosos */}
          <Card delay={450}>
            <H>✨ Datos curiosos</H>
            <Text style={{ color: colors.text, lineHeight: 24 }}>
              {s.favReaction ? `Su reacción favorita es ${s.favReaction[0]} (${s.favReaction[1]} ${s.favReaction[1] === 1 ? 'vez' : 'veces'}).\n` : ''}
              {s.favCategory && CATEGORY_BY_KEY[s.favCategory[0]]
                ? `Su categoría favorita es ${CATEGORY_BY_KEY[s.favCategory[0]].emoji} ${CATEGORY_BY_KEY[s.favCategory[0]].label} (${s.favCategory[1]}).\n`
                : ''}
              {`Se han escrito ${s.messages} ${s.messages === 1 ? 'mensaje' : 'mensajes'} en los chats.\n`}
              {s.longestMine || s.longestTheirs
                ? `La respuesta más larga es de ${s.longestMine >= s.longestTheirs ? me : them} (${Math.max(s.longestMine, s.longestTheirs)} caracteres).`
                : ''}
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Modal>
  );
}
