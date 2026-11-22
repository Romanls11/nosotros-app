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
import { formatLong, parseDate, presetDates } from '../capsule';
import { useToast } from '../toast';

export default function NewQuestionModal({ visible, onClose, coupleId, uid, onCreated }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(null);
  const toast = useToast();
  const [capsule, setCapsule] = useState(false);
  const [preset, setPreset] = useState('1m');
  const [custom, setCustom] = useState('');
  const spin = useRef(new Animated.Value(0)).current;

  function close() {
    setText('');
    setError('');
    setCategory(null);
    setCapsule(false);
    setPreset('1m');
    setCustom('');
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
    let unlockAt = null;
    if (capsule) {
      unlockAt = preset === 'custom' ? parseDate(custom) : presetDates().find((p) => p.k === preset)?.d;
      if (!unlockAt) {
        tap('warning');
        return setError('Escribe una fecha futura válida, por ejemplo 14/02/2027.');
      }
    }
    setSaving(true);
    try {
      await addQuestion(coupleId, uid, text, category, unlockAt);
      tap('success');
      toast(unlockAt ? `Cápsula creada · se abre el ${formatLong(unlockAt)}` : 'Pregunta enviada', unlockAt ? '⏳' : '💌');
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
        <ScrollView
          style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', flexGrow: 0 }}
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* ⏳ Cápsula del tiempo */}
          <ScalePressable
            onPress={() => setCapsule((c) => !c)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 14,
              padding: 12,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: capsule ? colors.violet : colors.border,
              backgroundColor: capsule ? colors.violetSoft : 'transparent',
            }}
          >
            <Text style={{ fontSize: 20 }}>⏳</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: '800', color: capsule ? colors.violet : colors.text }}>Cápsula del tiempo</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Las respuestas se abren hasta la fecha que elijas</Text>
            </View>
            <Text style={{ fontSize: 18, color: capsule ? colors.violet : colors.muted }}>{capsule ? '✓' : '+'}</Text>
          </ScalePressable>

          {capsule && (
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[...presetDates(), { k: 'custom', t: '📅 Otra fecha' }].map((p) => {
                  const active = preset === p.k;
                  return (
                    <ScalePressable
                      key={p.k}
                      onPress={() => setPreset(p.k)}
                      style={{
                        marginRight: 6,
                        marginBottom: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 999,
                        backgroundColor: active ? colors.violet : colors.violetSoft,
                      }}
                    >
                      <Text style={{ fontWeight: '700', color: active ? '#fff' : colors.violet }}>{p.t}</Text>
                    </ScalePressable>
                  );
                })}
              </View>
              {preset === 'custom' ? (
                <TextInput
                  style={[ui.input, { marginTop: 4 }]}
                  placeholder="DD/MM/AAAA (ej. 14/02/2027)"
                  placeholderTextColor={colors.muted}
                  keyboardType="numbers-and-punctuation"
                  value={custom}
                  onChangeText={setCustom}
                />
              ) : (
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
                  Se abre el {formatLong(presetDates().find((p) => p.k === preset).d)}
                </Text>
              )}
              {preset === 'custom' && parseDate(custom) && (
                <Text style={{ color: colors.violet, fontSize: 13, marginTop: 6, fontWeight: '700' }}>
                  Se abre el {formatLong(parseDate(custom))}
                </Text>
              )}
            </View>
          )}

          {!!error && <Text style={ui.error}>{error}</Text>}

          <GradientButton title="Enviar pregunta" onPress={save} loading={saving} />
          <Pressable onPress={close}>
            <Text style={[ui.link, { color: colors.muted }]}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
