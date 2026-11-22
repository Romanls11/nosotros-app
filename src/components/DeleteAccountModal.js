// 🗑️ Eliminar mi cuenta y mis datos (derecho de cancelación / revocación del consentimiento).
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { colors, fonts, shadow, ui } from '../theme';
import { deleteMyAccount, friendlyError } from '../services';
import { PasswordInput, ScalePressable, tap } from './ui';

export default function DeleteAccountModal({ visible, onClose, user, coupleId, questions, games }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  if (!visible) return null;

  const ready = password.length >= 6 && confirm.trim().toUpperCase() === 'ELIMINAR';

  async function run() {
    if (!ready) return;
    setBusy(true);
    setError('');
    try {
      await deleteMyAccount({ user, password, coupleId, questions, games, onStep: setStep });
      tap('success');
      // Al borrarse la cuenta, la app regresa sola a la pantalla de inicio de sesión.
    } catch (e) {
      tap('warning');
      setError(friendlyError(e));
      setBusy(false);
      setStep('');
    }
  }

  return (
    <Modal visible animationType="slide" transparent statusBarTranslucent onRequestClose={() => !busy && onClose()}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
        <ScrollView
          style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', flexGrow: 0 }}
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 40 }}>🗑️</Text>
          <Text style={[ui.title, { fontSize: 24, marginTop: 6 }]}>Eliminar mi cuenta</Text>
          <View style={[{ backgroundColor: colors.dangerSoft, borderRadius: 16, padding: 14, marginTop: 14 }]}>
            <Text style={{ color: colors.text, lineHeight: 21 }}>
              Esto es <Text style={{ fontWeight: '800' }}>permanente</Text>. Se borrarán:
              {'\n'}• Tu cuenta y tu perfil
              {'\n'}• Todas tus respuestas, reacciones y mensajes
              {'\n'}• Tu vínculo con tu pareja
              {'\n\n'}Las preguntas que escribiste se quedan, sin tu nombre, para no borrar las respuestas de tu pareja.
            </Text>
          </View>

          <Text style={{ color: colors.text, fontWeight: '700', marginTop: 18 }}>Confirma tu contraseña</Text>
          <PasswordInput value={password} onChangeText={setPassword} placeholder="Tu contraseña" editable={!busy} />

          <Text style={{ color: colors.text, fontWeight: '700', marginTop: 16 }}>
            Escribe <Text style={{ color: colors.danger, fontFamily: fonts.bold }}>ELIMINAR</Text> para confirmar
          </Text>
          <TextInput
            style={ui.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="ELIMINAR"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!busy}
          />

          {!!error && <Text style={ui.error}>{error}</Text>}

          <ScalePressable
            onPress={run}
            disabled={!ready || busy}
            haptic="warning"
            style={[{ marginTop: 20, borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: colors.danger }, shadow]}
          >
            {busy ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 10 }}>{step || 'Eliminando…'}</Text>
              </View>
            ) : (
              <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 16 }}>Eliminar definitivamente</Text>
            )}
          </ScalePressable>
          {!busy && (
            <Pressable onPress={onClose}>
              <Text style={[ui.link, { color: colors.muted }]}>Cancelar</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
