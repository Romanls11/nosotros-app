import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadow, ui } from '../theme';
import { deleteQuestion, friendlyError, saveAnswer } from '../services';
import { formatDate } from './QuestionCard';
import { FadeIn, GradientButton, tap } from './ui';
import { Chat, ReactionBadge, ReactionBar } from './Conversation';
import CategoryPill from './CategoryPill';

function AnswerBox({ title, children, soft }) {
  const box = [
    { marginTop: 16, padding: 18, borderRadius: 20, backgroundColor: colors.card },
    shadow,
  ];
  if (soft) {
    return (
      <LinearGradient colors={gradients.reveal} style={[...box, { backgroundColor: undefined }]}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 }}>{title}</Text>
        {children}
      </LinearGradient>
    );
  }
  return (
    <View style={box}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.muted, marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

/** Animación de "revelar": la respuesta crece y salen corazones */
function Reveal({ children, play }) {
  const v = useRef(new Animated.Value(play ? 0 : 1)).current;
  const burst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!play) return;
    tap('success');
    Animated.parallel([
      Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 6, tension: 60 }),
      Animated.timing(burst, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [play]);

  const hearts = ['💗', '💞', '💕', '💖', '✨', '💗'];
  return (
    <View>
      <Animated.View
        style={{
          opacity: v,
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
        }}
      >
        {children}
      </Animated.View>
      {play &&
        hearts.map((h, i) => {
          const angle = (i / hearts.length) * Math.PI * 2;
          return (
            <Animated.Text
              key={i}
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: '45%',
                left: '48%',
                fontSize: 22,
                opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * 120] }) },
                  { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * 70 - 30] }) },
                  { scale: burst.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.3, 0.9] }) },
                ],
              }}
            >
              {h}
            </Animated.Text>
          );
        })}
    </View>
  );
}

export default function QuestionModal({ question, onClose, coupleId, uid, partnerId, names, onAnswered, onReacted, onCommented }) {
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [justRevealed, setJustRevealed] = useState(false);

  const myAnswer = question?.answers?.[uid];
  const partnerAnswer = partnerId ? question?.answers?.[partnerId] : null;
  const partnerName = (partnerId && names[partnerId]) || 'Tu pareja';

  // Reinicia el estado cada vez que se abre una pregunta distinta
  useEffect(() => {
    setDraft(myAnswer?.text || '');
    setEditing(!myAnswer);
    setError('');
    setJustRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  if (!question) return null;

  async function save() {
    if (!draft.trim()) {
      tap('warning');
      return setError('Escribe tu respuesta.');
    }
    setSaving(true);
    setError('');
    try {
      const isFirstAnswer = !myAnswer;
      await saveAnswer(coupleId, question.id, uid, draft);
      tap('success');
      // Solo se avisa la primera vez que respondes (no en ediciones)
      if (isFirstAnswer) onAnswered?.(question, !!partnerAnswer);
      // Si tu pareja ya había respondido, ¡momento de revelar!
      if (isFirstAnswer && partnerAnswer) setJustRevealed(true);
      setEditing(false);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Borrar pregunta', 'Se borrará para los dos, junto con las respuestas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await deleteQuestion(coupleId, question.id);
          onClose();
        },
      },
    ]);
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bg }}
        behavior="padding"
      >
        <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
          >
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>‹ Volver</Text>
            </Pressable>
            <FadeIn>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 20, fontWeight: '600' }}>
                {question.daily ? '☀️ Pregunta del día' : question.authorId === uid ? 'Tú preguntaste' : `${names[question.authorId] || 'Tu pareja'} preguntó`} ·{' '}
                {formatDate(question.createdAt)}
              </Text>
              {!!question.category && (
                <View style={{ marginTop: 10 }}>
                  <CategoryPill category={question.category} onDark />
                </View>
              )}
              <Text style={{ fontSize: 26, fontFamily: fonts.display, color: '#fff', marginTop: 8, lineHeight: 32 }}>
                {question.text}
              </Text>
            </FadeIn>
          </LinearGradient>

          <View style={{ paddingHorizontal: 20 }}>
            {/* Mi respuesta */}
            <FadeIn delay={100}>
              <AnswerBox title="✍️ Tu respuesta">
                {editing ? (
                  <>
                    <TextInput
                      style={[ui.input, { minHeight: 120, textAlignVertical: 'top', marginTop: 0 }]}
                      placeholder="Escribe con calma, sin prisa…"
                      placeholderTextColor={colors.muted}
                      multiline
                      value={draft}
                      onChangeText={setDraft}
                    />
                    {!!error && <Text style={ui.error}>{error}</Text>}
                    <GradientButton title={myAnswer ? 'Guardar cambios' : 'Guardar respuesta'} onPress={save} loading={saving} />
                    {myAnswer && (
                      <Pressable onPress={() => { setDraft(myAnswer.text); setEditing(false); }}>
                        <Text style={[ui.link, { color: colors.muted }]}>Cancelar</Text>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <>
                    <ReactionBadge emoji={partnerId ? question.reactions?.[partnerId] : null} name={partnerName} />
                    <Text style={{ fontSize: 16, color: colors.text, lineHeight: 24 }}>{myAnswer?.text}</Text>
                    <Pressable onPress={() => setEditing(true)} hitSlop={8}>
                      <Text style={{ color: colors.primary, fontWeight: '800', marginTop: 12 }}>Editar</Text>
                    </Pressable>
                  </>
                )}
              </AnswerBox>
            </FadeIn>

            {/* Respuesta de la pareja */}
            {partnerId && (
              <FadeIn delay={200}>
                {!partnerAnswer && (
                  <AnswerBox title={`💭 Respuesta de ${partnerName}`}>
                    <Text style={{ color: colors.muted, fontSize: 15 }}>Todavía no responde ⏳</Text>
                  </AnswerBox>
                )}
                {partnerAnswer && !myAnswer && (
                  <AnswerBox title={`🔒 Respuesta de ${partnerName}`} soft>
                    <Text style={{ color: colors.primaryDark, fontSize: 15, fontWeight: '700' }}>
                      ¡Ya respondió! Responde tú primero para ver lo que dijo.
                    </Text>
                  </AnswerBox>
                )}
                {partnerAnswer && myAnswer && (
                  <Reveal play={justRevealed}>
                    <AnswerBox title={`💞 Respuesta de ${partnerName}`} soft>
                      <Text style={{ fontSize: 16, color: colors.text, lineHeight: 24 }}>{partnerAnswer.text}</Text>
                      <ReactionBar coupleId={coupleId} question={question} uid={uid} onReacted={onReacted} />
                    </AnswerBox>
                  </Reveal>
                )}
              </FadeIn>
            )}

            {/* Mini chat: cuando los dos ya respondieron */}
            {partnerAnswer && myAnswer && (
              <Chat
                coupleId={coupleId}
                question={question}
                uid={uid}
                names={names}
                onSent={onCommented}
                onNewMessage={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150)}
              />
            )}

            {question.authorId === uid && !question.daily && (
              <Pressable onPress={confirmDelete}>
                <Text style={[ui.link, { color: colors.danger, marginTop: 32 }]}>Borrar pregunta</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
