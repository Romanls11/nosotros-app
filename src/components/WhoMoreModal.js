// 🎲 Pantalla del juego "¿Quién es más probable que…?"
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadow } from '../theme';
import { createRound, deleteRound, friendlyError, voteRound } from '../services';
import { pickPrompt, roundState, score } from '../whoMore';
import { FadeIn, FloatingHearts, ScalePressable, tap } from './ui';
import { useToast } from '../toast';

const initials = (n = '') =>
  n
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

/** Botón grande con avatar para votar por alguien */
function Candidate({ name, color, selected, dimmed, onPress, disabled, badge }) {
  const pop = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!selected) return;
    pop.setValue(0.85);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }).start();
  }, [selected]);
  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      haptic="medium"
      scaleTo={0.94}
      style={[
        {
          flex: 1,
          alignItems: 'center',
          paddingVertical: 20,
          borderRadius: 24,
          backgroundColor: selected ? color : colors.card,
          borderWidth: 2,
          borderColor: selected ? color : colors.border,
          opacity: dimmed ? 0.45 : 1,
        },
        shadow,
      ]}
    >
      <Animated.View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? 'rgba(255,255,255,0.25)' : color,
          transform: [{ scale: pop }],
        }}
      >
        <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 26 }}>{initials(name)}</Text>
      </Animated.View>
      <Text style={{ marginTop: 10, fontFamily: fonts.bold, fontSize: 17, color: selected ? '#fff' : colors.text }} numberOfLines={1}>
        {name}
      </Text>
      {!!badge && (
        <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '700', color: selected ? 'rgba(255,255,255,0.9)' : colors.muted }}>{badge}</Text>
      )}
    </ScalePressable>
  );
}

/** Resultado animado */
function Result({ match }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 5, tension: 70 }).start();
    tap(match ? 'success' : 'light');
  }, [match]);
  return (
    <Animated.View
      style={{
        alignItems: 'center',
        marginTop: 18,
        opacity: v,
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
      }}
    >
      <Text style={{ fontSize: 46 }}>{match ? '💞' : '😅'}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 26, color: match ? colors.primary : colors.violet, marginTop: 4 }}>
        {match ? '¡Coincidieron!' : '¡No coincidieron!'}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}>
        {match ? 'Se conocen muy bien 😏' : 'Tienen tema de conversación 👀'}
      </Text>
    </Animated.View>
  );
}

export default function WhoMoreModal({ visible, onClose, coupleId, uid, partnerId, names, games, onRoundCreated, onVoted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const spin = useRef(new Animated.Value(0)).current;
  if (!visible) return null;

  const me = names[uid] || 'Tú';
  const them = names[partnerId] || 'Tu pareja';
  const current = games?.[0] || null;
  const state = roundState(current, uid, partnerId);
  const sc = score(games, uid, partnerId);
  const history = (games || []).slice(1, 30);
  const nameOf = (id) => (id === uid ? me : id === partnerId ? them : '—');

  async function newRound() {
    setBusy(true);
    setError('');
    spin.setValue(0);
    Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    try {
      const used = new Set((games || []).map((g) => g.prompt));
      const prompt = pickPrompt(used);
      await createRound(coupleId, uid, prompt);
      tap('success');
      onRoundCreated?.(prompt);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function changePrompt() {
    if (!current) return;
    setBusy(true);
    try {
      await deleteRound(coupleId, current.id);
      await createRound(coupleId, uid, pickPrompt(new Set((games || []).map((g) => g.prompt))));
      tap('light');
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function vote(choice) {
    if (!current || busy) return;
    setBusy(true);
    try {
      await voteRound(coupleId, current.id, uid, choice);
      if (!current.votes?.[partnerId]) toast('Voto guardado en secreto', '🤫');
      onVoted?.(current, !!current.votes?.[partnerId]);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  const dice = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });
  const match = state === 'revealed' && current.votes[uid] === current.votes[partnerId];
  const canChange = current && state === 'vote' && !current.votes?.[partnerId] && current.createdBy === uid;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={['#6D4BFF', '#B23CFF', '#FF3D6E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}
        >
          {match && <FloatingHearts count={10} />}
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>‹ Volver</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <Animated.Text style={{ fontSize: 34, transform: [{ rotate: dice }] }}>🎲</Animated.Text>
            <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 24, marginLeft: 10, flex: 1, lineHeight: 28 }}>
              ¿Quién es más probable que…?
            </Text>
          </View>
          {sc.played > 0 && (
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              {[
                { n: sc.played, t: 'rondas' },
                { n: sc.matches, t: 'coincidencias' },
                { n: `${sc.pct}%`, t: 'sintonía' },
              ].map((x, i) => (
                <View key={i} style={{ flex: 1, marginRight: i < 2 ? 8 : 0, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 10 }}>
                  <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 22 }}>{x.n}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>{x.t}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {!current ? (
            <FadeIn style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 60 }}>🎲</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text, marginTop: 10, textAlign: 'center' }}>
                Voten en secreto y descubran si piensan igual
              </Text>
              <Text style={{ color: colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 21 }}>
                Cada ronda es una situación. Los dos eligen quién es más probable que lo haga, y se revela cuando votan ambos.
              </Text>
            </FadeIn>
          ) : (
            <FadeIn key={current.id}>
              {/* Pregunta */}
              <View style={[{ backgroundColor: colors.card, borderRadius: 24, padding: 22, marginTop: 20 }, shadow]}>
                <Text style={{ color: colors.violet, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 0.5 }}>¿QUIÉN ES MÁS PROBABLE QUE…</Text>
                <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.text, marginTop: 8, lineHeight: 31 }}>
                  …{current.prompt}?
                </Text>
              </View>

              {/* Votar / esperar / resultado */}
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                {[
                  { id: uid, name: me, color: colors.primary },
                  { id: partnerId, name: them, color: colors.violet },
                ].map((c, i) => {
                  const myPick = current.votes?.[uid] === c.id;
                  const theirPick = state === 'revealed' && current.votes?.[partnerId] === c.id;
                  const badge =
                    state === 'revealed'
                      ? [myPick && 'Tu voto', theirPick && `Voto de ${them}`].filter(Boolean).join(' · ') || ' '
                      : myPick
                      ? 'Tu voto'
                      : ' ';
                  return (
                    <View key={c.id} style={{ flex: 1, marginRight: i === 0 ? 12 : 0 }}>
                      <Candidate
                        name={c.name}
                        color={c.color}
                        selected={myPick || theirPick}
                        dimmed={state === 'revealed' && !myPick && !theirPick}
                        disabled={busy || state === 'revealed'}
                        onPress={() => vote(c.id)}
                        badge={badge}
                      />
                    </View>
                  );
                })}
              </View>

              {state === 'vote' && (
                <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 14 }}>
                  Toca a quien creas. {current.votes?.[partnerId] ? `🤫 ${them} ya votó.` : 'Tu voto es secreto hasta que voten los dos.'}
                </Text>
              )}
              {state === 'waiting' && (
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <Text style={{ fontSize: 28 }}>⏳</Text>
                  <Text style={{ color: colors.text, fontWeight: '700', marginTop: 4 }}>Esperando el voto de {them}…</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Puedes cambiar tu voto mientras tanto.</Text>
                </View>
              )}
              {state === 'revealed' && <Result match={match} />}

              {canChange && (
                <Pressable onPress={changePrompt} disabled={busy} style={{ alignSelf: 'center', marginTop: 12 }}>
                  <Text style={{ color: colors.violet, fontWeight: '700' }}>🔀 Otra situación</Text>
                </Pressable>
              )}
            </FadeIn>
          )}

          {(!current || state === 'revealed') && (
            <ScalePressable onPress={newRound} disabled={busy} haptic="medium" style={[{ marginTop: 24, borderRadius: 18 }, shadow]}>
              <LinearGradient
                colors={['#6D4BFF', '#B23CFF', '#FF3D6E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 18, paddingVertical: 16, alignItems: 'center' }}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 17 }}>{current ? 'Siguiente ronda 🎲' : 'Empezar a jugar 🎲'}</Text>
                )}
              </LinearGradient>
            </ScalePressable>
          )}
          {!!error && <Text style={{ color: colors.danger, textAlign: 'center', marginTop: 10 }}>{error}</Text>}

          {/* Historial */}
          {history.length > 0 && (
            <FadeIn delay={150} style={{ marginTop: 28 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.text, marginBottom: 8 }}>Rondas anteriores</Text>
              {history.map((g) => {
                const done = g.votes?.[uid] && g.votes?.[partnerId];
                const same = done && g.votes[uid] === g.votes[partnerId];
                return (
                  <View
                    key={g.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: !done ? colors.border : same ? colors.primary : colors.violet,
                    }}
                  >
                    <Text style={{ fontSize: 20, marginRight: 10 }}>{!done ? '⏸️' : same ? '💞' : '😅'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={2}>
                        …{g.prompt}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                        {!done
                          ? 'Sin terminar'
                          : same
                          ? `Los dos dijeron: ${nameOf(g.votes[uid])}`
                          : `Tú: ${nameOf(g.votes[uid])} · ${them}: ${nameOf(g.votes[partnerId])}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </FadeIn>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
