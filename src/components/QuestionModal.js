import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, ui } from '../theme';
import { deleteQuestion, friendlyError, saveAnswer } from '../services';
import { formatDate } from './QuestionCard';

function AnswerBox({ title, children, tone = 'card' }) {
  return (
    <View
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: tone === 'soft' ? colors.primarySoft : colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 }}>{title}</Text>
      {children}
    </View>
  );
}

export default function QuestionModal({ question, onClose, coupleId, uid, partnerId, names }) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const myAnswer = question?.answers?.[uid];
  const partnerAnswer = partnerId ? question?.answers?.[partnerId] : null;
  const partnerName = (partnerId && names[partnerId]) || 'Tu pareja';

  // Reinicia el estado cada vez que se abre una pregunta distinta
  useEffect(() => {
    setDraft(myAnswer?.text || '');
    setEditing(!myAnswer);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  if (!question) return null;

  async function save() {
    if (!draft.trim()) return setError('Escribe tu respuesta.');
    setSaving(true);
    setError('');
    try {
      await saveAnswer(coupleId, question.id, uid, draft);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 48 }} keyboardShouldPersistTaps="handled">
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>‹ Volver</Text>
          </Pressable>

          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 20, fontWeight: '600' }}>
            {question.authorId === uid ? 'Tú preguntaste' : `${names[question.authorId] || 'Tu pareja'} preguntó`} ·{' '}
            {formatDate(question.createdAt)}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 8, lineHeight: 32 }}>
            {question.text}
          </Text>

          {/* Mi respuesta */}
          <AnswerBox title="Tu respuesta">
            {editing ? (
              <>
                <TextInput
                  style={[ui.input, { minHeight: 120, textAlignVertical: 'top', marginTop: 4 }]}
                  placeholder="Escribe con calma, sin prisa…"
                  placeholderTextColor={colors.muted}
                  multiline
                  value={draft}
                  onChangeText={setDraft}
                />
                {!!error && <Text style={ui.error}>{error}</Text>}
                <Pressable style={ui.button} onPress={save} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={ui.buttonText}>Guardar respuesta</Text>}
                </Pressable>
                {myAnswer && (
                  <Pressable onPress={() => { setDraft(myAnswer.text); setEditing(false); }}>
                    <Text style={[ui.link, { color: colors.muted }]}>Cancelar</Text>
                  </Pressable>
                )}
              </>
            ) : (
              <>
                <Text style={{ fontSize: 16, color: colors.text, lineHeight: 24 }}>{myAnswer?.text}</Text>
                <Pressable onPress={() => setEditing(true)}>
                  <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 10 }}>Editar</Text>
                </Pressable>
              </>
            )}
          </AnswerBox>

          {/* Respuesta de la pareja */}
          {partnerId && (
            <AnswerBox title={`Respuesta de ${partnerName}`} tone="soft">
              {!partnerAnswer && (
                <Text style={{ color: colors.muted, fontSize: 15 }}>Todavía no responde ⏳</Text>
              )}
              {partnerAnswer && !myAnswer && (
                <Text style={{ color: colors.primaryDark, fontSize: 15, fontWeight: '600' }}>
                  🔒 Ya respondió. Responde tú primero para ver su respuesta.
                </Text>
              )}
              {partnerAnswer && myAnswer && (
                <Text style={{ fontSize: 16, color: colors.text, lineHeight: 24 }}>{partnerAnswer.text}</Text>
              )}
            </AnswerBox>
          )}

          {question.authorId === uid && (
            <Pressable onPress={confirmDelete}>
              <Text style={[ui.link, { color: '#C62828', marginTop: 32 }]}>Borrar pregunta</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
