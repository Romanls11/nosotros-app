// Reacciones a la respuesta de tu pareja + mini chat por pregunta.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, TextInput, View } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { addComment, friendlyError } from '../services';
import { colors, fonts, shadow } from '../theme';
import { FadeIn, ScalePressable, tap } from './ui';

// Las reacciones viven en ./Reactions (se re-exportan para no romper imports)
export { REACTIONS, ReactionBar, ReactionBadge } from './Reactions';

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
