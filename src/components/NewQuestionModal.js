import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, ui } from '../theme';
import { addQuestion, friendlyError } from '../services';
import { randomSuggestion } from '../suggestions';

export default function NewQuestionModal({ visible, onClose, coupleId, uid }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function close() {
    setText('');
    setError('');
    onClose();
  }

  async function save() {
    if (!text.trim()) return setError('Escribe una pregunta.');
    setSaving(true);
    try {
      await addQuestion(coupleId, uid, text);
      close();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <Text style={[ui.title, { fontSize: 22 }]}>Nueva pregunta</Text>
          <Text style={ui.subtitle}>Tu pareja la verá y podrá responderla cuando quiera.</Text>

          <TextInput
            style={[ui.input, { minHeight: 110, textAlignVertical: 'top' }]}
            placeholder="¿Qué quieres saber?"
            placeholderTextColor={colors.muted}
            multiline
            value={text}
            onChangeText={setText}
            autoFocus
          />

          <Pressable onPress={() => setText(randomSuggestion(text))}>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 12 }}>✨ Inspírame</Text>
          </Pressable>

          {!!error && <Text style={ui.error}>{error}</Text>}

          <Pressable style={ui.button} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={ui.buttonText}>Enviar pregunta</Text>}
          </Pressable>
          <Pressable onPress={close}>
            <Text style={[ui.link, { color: colors.muted }]}>Cancelar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
