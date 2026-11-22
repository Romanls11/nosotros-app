import { useRef, useState } from 'react';
import {
  Animated,
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
import { addQuestion, friendlyError } from '../services';
import { randomSuggestion } from '../suggestions';
import { GradientButton, ScalePressable, tap } from './ui';
import { CATEGORIES, randomIdea, soft } from '../categories';

export default function NewQuestionModal({ visible, onClose, coupleId, uid, onCreated }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(null);
  const spin = useRef(new Animated.Value(0)).current;

  function close() {
    setText('');
    setError('');
    setCategory(null);
    onClose();
  }

  function inspire() {
    spin.setValue(0);
    Animated.timing(spin, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    setText((category && randomIdea(category, text)) || randomSuggestion(text));
  }

  async function save() {
    if (!text.trim()) {
      tap('warning');
      return setError('Escribe una pregunta.');
    }
    setSaving(true);
    try {
      await addQuestion(coupleId, uid, text, category);
      tap('success');
      onCreated?.(text);
      close();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={close}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}
        behavior="padding"
      >
        <Pressable style={{ flex: 1 }} onPress={close} />
        <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 }}>
          <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 16 }} />
          <Text style={[ui.title, { fontSize: 22 }]}>💌 Nueva pregunta</Text>
          <Text style={ui.subtitle}>Tu pareja la verá y podrá responderla cuando quiera.</Text>

          {/* Categoría (opcional) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <ScalePressable
                  key={c.key}
                  onPress={() => setCategory(active ? null : c.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? c.color : soft(c.color),
                  }}
                >
                  <Text>{c.emoji}</Text>
                  <Text style={{ marginLeft: 6, fontWeight: '800', color: active ? '#fff' : c.color }}>{c.label}</Text>
                </ScalePressable>
              );
            })}
          </ScrollView>

          <TextInput
            style={[ui.input, { minHeight: 110, textAlignVertical: 'top' }]}
            placeholder="¿Qué quieres saber?"
            placeholderTextColor={colors.muted}
            multiline
            value={text}
            onChangeText={setText}
            autoFocus
          />

          <ScalePressable
            onPress={inspire}
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: colors.primarySoft,
            }}
          >
            <Animated.Text style={{ transform: [{ rotate }], marginRight: 6 }}>✨</Animated.Text>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>Inspírame</Text>
          </ScalePressable>

          {!!error && <Text style={ui.error}>{error}</Text>}

          <GradientButton title="Enviar pregunta" onPress={save} loading={saving} />
          <Pressable onPress={close}>
            <Text style={[ui.link, { color: colors.muted }]}>Cancelar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
