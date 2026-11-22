// Reacciones a la respuesta de tu pareja + mini chat por pregunta.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, TextInput, View } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { addComment, friendlyError, setReaction } from '../services';
import { colors, fonts, shadow } from '../theme';
import { FadeIn, ScalePressable, tap } from './ui';

export const REACTIONS = ['❤️', '😂', '🥹', '😮', '🔥', '🙏'];

/** Barra para reaccionar a la respuesta de tu pareja */
export function ReactionBar({ coupleId, question, uid, onReacted }) {
  const mine = question.reactions?.[uid] || null;
  const pop = useRef(new Animated.Value(1)).current;

  async function react(emoji) {
    const next = mine === emoji ? null : emoji; // tocar la misma la quita
    tap(next ? 'success' : 'light');
    pop.setValue(0.6);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
    try {
      await setReaction(coupleId, question.id, uid, next);
      if (next) onReacted?.(question, next);
    } catch {}
  }

  return (
    <View style={{ flexDirection: 'row', marginTop: 14, flexWrap: 'wrap' }}>
      {REACTIONS.map((e) => {
        const active = mine === e;
        return (
          <Pressable
            key={e}
            onPress={() => react(e)}
            hitSlop={4}
            style={{
              marginRight: 8,
              marginTop: 4,
              width: 42,
              height: 42,
              borderRadius: 21,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.card : 'rgba(255,255,255,0.35)',
              borderWidth: active ? 2 : 0,
              borderColor: colors.primary,
            }}
          >
            <Animated.Text style={{ fontSize: 20, transform: [{ scale: active ? pop : 1 }] }}>{e}</Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Insignia con la reacción que tu pareja le puso a TU respuesta */
export function ReactionBadge({ emoji, name }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!emoji) return;
    v.setValue(0);
    Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  }, [emoji]);
  if (!emoji) return null;
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: 14,
          top: -14,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          transform: [{ scale: v }],
        },
        shadow,
      ]}
    >
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={{ fontSize: 11, color: colors.muted, marginLeft: 4, fontWeight: '700' }}>{name}</Text>
    </Animated.View>
  );
}

function hora(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
}

/** Mini chat debajo de las respuestas */
export function Chat({ coupleId, question, uid, names, onSent, onNewMessage }) {
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'couples', coupleId, 'questions', question.id, 'comments'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(
      q,
      (snap) => {
        setMsgs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        onNewMessage?.();
      },
      () => setMsgs([])
    );
  }, [coupleId, question.id]);

  async function send() {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    setError('');
    try {
      await addComment(coupleId, question.id, uid, t);
      tap('light');
      setText('');
      onSent?.(question, t);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <FadeIn delay={250} style={{ marginTop: 26 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.text }}>💬 Platiquen sobre esto</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>Solo ustedes dos lo ven.</Text>

      <View style={{ marginTop: 12 }}>
        {msgs === null && <ActivityIndicator color={colors.primary} />}
        {msgs?.length === 0 && (
          <Text style={{ color: colors.muted, fontStyle: 'italic', marginVertical: 8 }}>
            Todavía no hay mensajes. ¿Qué te pareció su respuesta?
          </Text>
        )}
        {msgs?.map((m) => {
          const me = m.authorId === uid;
          return (
            <FadeIn key={m.id} from={8} duration={250}>
              <View
                style={{
                  alignSelf: me ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  marginVertical: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 18,
                  borderBottomRightRadius: me ? 6 : 18,
                  borderBottomLeftRadius: me ? 18 : 6,
                  backgroundColor: me ? colors.primary : colors.card,
                }}
              >
                {!me && (
                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.violet, marginBottom: 2 }}>
                    {names[m.authorId] || 'Tu pareja'}
                  </Text>
                )}
                <Text style={{ color: me ? '#fff' : colors.text, fontSize: 15, lineHeight: 21 }}>{m.text}</Text>
                <Text style={{ color: me ? 'rgba(255,255,255,0.75)' : colors.muted, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' }}>
                  {hora(m.createdAt)}
                </Text>
              </View>
            </FadeIn>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: colors.border,
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 15,
            color: colors.text,
            maxHeight: 110,
          }}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={colors.muted}
          multiline
          maxLength={500}
          value={text}
          onChangeText={setText}
        />
        <ScalePressable
          onPress={send}
          disabled={sending || !text.trim()}
          haptic={null}
          style={{
            marginLeft: 8,
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: text.trim() ? colors.primary : colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 20, marginLeft: 2 }}>➤</Text>}
        </ScalePressable>
      </View>
      {!!error && <Text style={{ color: colors.danger, marginTop: 6 }}>{error}</Text>}
    </FadeIn>
  );
}
