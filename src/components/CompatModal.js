// 💯 Test de compatibilidad: lista de tests → responder (una pregunta por pantalla) → resultado.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadow } from '../theme';
import { friendlyError, saveTestAnswers } from '../services';
import { compareAnswers, PACKS, packState, tier } from '../compat';
import { FadeIn, FloatingHearts, ScalePressable, tap } from './ui';

const G = ['#6D4BFF', '#B23CFF', '#FF3D6E'];

/** Número que cuenta hacia arriba */
function CountUp({ to, style }) {
  const v = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);
  useEffect(() => {
    v.setValue(0);
    const id = v.addListener(({ value }) => setN(Math.round(value)));
    Animated.timing(v, { toValue: to, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [to]);
  return <Text style={style}>{n}%</Text>;
}

/** Barra de progreso animada */
function Progress({ value }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: value, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value]);
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
      <Animated.View style={{ height: 8, borderRadius: 4, backgroundColor: '#fff', width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

/** Responder un test */
function Quiz({ pack, initial, onSubmit, onCancel, busy }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState(initial || []);
  const slide = useRef(new Animated.Value(0)).current;
  const q = pack.questions[i];
  const last = i === pack.questions.length - 1;

  function go(to) {
    slide.setValue(to > i ? 40 : -40);
    setI(to);
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8, tension: 80 }).start();
  }
  function pick(k) {
    tap('light');
    const next = [...ans];
    next[i] = k;
    setAns(next);
    if (!last) setTimeout(() => go(i + 1), 220);
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={pack.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={onCancel} hitSlop={12}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>✕</Text>
          </Pressable>
          <Text style={{ color: '#fff', fontFamily: fonts.bold, marginLeft: 14, flex: 1 }}>
            {pack.emoji} {pack.title}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '800' }}>
            {i + 1}/{pack.questions.length}
          </Text>
        </View>
        <View style={{ marginTop: 14 }}>
          <Progress value={(i + (ans[i] != null ? 1 : 0)) / pack.questions.length} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Animated.View style={{ transform: [{ translateX: slide }] }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.text, lineHeight: 32, marginTop: 6 }}>{q.q}</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>Responde por ti. Tu pareja no verá nada hasta que los dos terminen.</Text>
          <View style={{ marginTop: 18 }}>
            {q.o.map((opt, k) => {
              const active = ans[i] === k;
              return (
                <ScalePressable
                  key={k}
                  onPress={() => pick(k)}
                  haptic={null}
                  scaleTo={0.97}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderRadius: 18,
                      marginBottom: 10,
                      backgroundColor: active ? pack.colors[1] : colors.card,
                      borderWidth: 2,
                      borderColor: active ? pack.colors[1] : colors.border,
                    },
                    active ? shadow : null,
                  ]}
                >
                  <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: active ? '#fff' : colors.text }}>{opt}</Text>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: active ? '#fff' : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                  </View>
                </ScalePressable>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
          {i > 0 && (
            <Pressable onPress={() => go(i - 1)} hitSlop={10}>
              <Text style={{ color: colors.muted, fontWeight: '800' }}>‹ Anterior</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          {!last && ans[i] != null && (
            <Pressable onPress={() => go(i + 1)} hitSlop={10}>
              <Text style={{ color: pack.colors[1], fontWeight: '800' }}>Siguiente ›</Text>
            </Pressable>
          )}
        </View>

        {last && ans.filter((x) => x != null).length === pack.questions.length && (
          <ScalePressable onPress={() => onSubmit(ans)} disabled={busy} haptic="medium" style={[{ marginTop: 20, borderRadius: 18 }, shadow]}>
            <LinearGradient colors={pack.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, paddingVertical: 16, alignItems: 'center' }}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 17 }}>Enviar respuestas ✨</Text>}
            </LinearGradient>
          </ScalePressable>
        )}
      </ScrollView>
    </View>
  );
}

/** Resultado del test */
function Result({ pack, doc, uid, partnerId, names, onRetake, onBack }) {
  const r = compareAnswers(pack, doc.answers[uid], doc.answers[partnerId]);
  const t = tier(r.pct);
  const them = names[partnerId] || 'Tu pareja';
  useEffect(() => {
    tap('success');
  }, []);
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={pack.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden', alignItems: 'center' }}>
        {r.pct >= 70 && <FloatingHearts count={10} />}
        <Pressable onPress={onBack} hitSlop={12} style={{ alignSelf: 'flex-start' }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>‹ Tests</Text>
        </Pressable>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontFamily: fonts.bold, marginTop: 14 }}>
          {pack.emoji} {pack.title}
        </Text>
        <View
          style={{
            width: 170,
            height: 170,
            borderRadius: 85,
            borderWidth: 10,
            borderColor: 'rgba(255,255,255,0.35)',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 16,
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        >
          <CountUp to={r.pct} style={{ color: '#fff', fontFamily: fonts.display, fontSize: 52 }} />
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: -4 }}>compatibles</Text>
        </View>
        <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 26, marginTop: 16 }}>
          {t.emoji} {t.title}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.92)', textAlign: 'center', marginTop: 6 }}>{t.text}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, fontWeight: '700' }}>
          Coincidieron en {r.same} de {r.total}
        </Text>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        {r.detail.map((d, i) => (
          <FadeIn key={i} delay={200 + i * 60}>
            <View
              style={[
                {
                  backgroundColor: colors.card,
                  borderRadius: 18,
                  padding: 14,
                  marginTop: 10,
                  borderLeftWidth: 5,
                  borderLeftColor: d.match ? colors.ok : colors.border,
                },
                shadow,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 15 }}>{d.q}</Text>
                <Text style={{ fontSize: 18 }}>{d.match ? '✅' : '↔️'}</Text>
              </View>
              <Text style={{ color: colors.primary, marginTop: 8, fontWeight: '700' }}>
                {names[uid] || 'Tú'}: <Text style={{ color: colors.text, fontWeight: '400' }}>{d.mine}</Text>
              </Text>
              <Text style={{ color: colors.violet, marginTop: 2, fontWeight: '700' }}>
                {them}: <Text style={{ color: colors.text, fontWeight: '400' }}>{d.theirs}</Text>
              </Text>
            </View>
          </FadeIn>
        ))}
        <Pressable onPress={onRetake} style={{ alignSelf: 'center', marginTop: 20 }}>
          <Text style={{ color: colors.violet, fontWeight: '800' }}>🔁 Volver a responder mi parte</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export default function CompatModal({ visible, onClose, coupleId, uid, partnerId, names, tests, onCompleted }) {
  const [view, setView] = useState({ mode: 'list', pack: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!visible) return null;

  const them = names[partnerId] || 'tu pareja';
  const close = () => {
    setView({ mode: 'list', pack: null });
    onClose();
  };

  async function submit(pack, answers) {
    setBusy(true);
    setError('');
    try {
      await saveTestAnswers(coupleId, pack.key, uid, answers);
      const doc = tests[pack.key];
      const partnerDone = !!doc?.answers?.[partnerId];
      onCompleted?.(pack, partnerDone ? compareAnswers(pack, answers, doc.answers[partnerId]).pct : null);
      tap('success');
      setView({ mode: partnerDone ? 'result' : 'list', pack });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  let content;
  if (view.mode === 'quiz') {
    content = (
      <Quiz
        pack={view.pack}
        initial={tests[view.pack.key]?.answers?.[uid]}
        busy={busy}
        onCancel={() => setView({ mode: 'list', pack: null })}
        onSubmit={(a) => submit(view.pack, a)}
      />
    );
  } else if (view.mode === 'result' && packState(tests[view.pack.key], uid, partnerId) === 'done') {
    content = (
      <Result
        pack={view.pack}
        doc={tests[view.pack.key]}
        uid={uid}
        partnerId={partnerId}
        names={names}
        onBack={() => setView({ mode: 'list', pack: null })}
        onRetake={() => setView({ mode: 'quiz', pack: view.pack })}
      />
    );
  } else {
    content = (
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient colors={G} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <Pressable onPress={close} hitSlop={12}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>‹ Volver</Text>
          </Pressable>
          <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 30, marginTop: 16 }}>💯 Test de compatibilidad</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 6, lineHeight: 20 }}>
            Respondan por separado 10 preguntas. Al terminar los dos, descubren qué tanto coinciden.
          </Text>
        </LinearGradient>
        <View style={{ paddingHorizontal: 20 }}>
          {PACKS.map((p, i) => {
            const st = packState(tests[p.key], uid, partnerId);
            const pct = st === 'done' ? compareAnswers(p, tests[p.key].answers[uid], tests[p.key].answers[partnerId]).pct : null;
            const label = {
              new: 'Empieza el test',
              yourTurn: `🤫 ${them} ya respondió. ¡Te toca!`,
              waiting: `⏳ Esperando a ${them}`,
              done: `${tier(pct).emoji} ${pct}% · ${tier(pct).title}`,
            }[st];
            return (
              <FadeIn key={p.key} delay={100 + i * 80}>
                <ScalePressable
                  onPress={() => setView({ mode: st === 'done' ? 'result' : st === 'waiting' ? 'list' : 'quiz', pack: p })}
                  disabled={st === 'waiting'}
                  scaleTo={0.97}
                  style={[{ marginTop: 16, borderRadius: 22 }, shadow]}
                >
                  <LinearGradient colors={p.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 34, marginRight: 14 }}>{p.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 18 }}>{p.title}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.92)', marginTop: 3, fontWeight: '600' }}>{label}</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 22 }}>{st === 'waiting' ? '' : '›'}</Text>
                  </LinearGradient>
                </ScalePressable>
                {st === 'waiting' && (
                  <Pressable onPress={() => setView({ mode: 'quiz', pack: p })} style={{ alignSelf: 'flex-end', marginTop: 6 }}>
                    <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>Cambiar mis respuestas</Text>
                  </Pressable>
                )}
              </FadeIn>
            );
          })}
          {!!error && <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 12 }}>{error}</Text>}
        </View>
      </ScrollView>
    );
  }

  return (
    <Modal visible animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>{content}</View>
    </Modal>
  );
}
