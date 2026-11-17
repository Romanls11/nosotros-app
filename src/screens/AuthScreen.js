import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui } from '../theme';
import { friendlyError, login, register } from '../services';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  async function submit() {
    setError('');
    if (isRegister && !name.trim()) return setError('Escribe tu nombre.');
    if (!email.trim() || !password) return setError('Escribe tu correo y contraseña.');
    setLoading(true);
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 56, textAlign: 'center' }}>💞</Text>
          <Text style={[ui.title, { textAlign: 'center', marginTop: 8 }]}>Nosotros</Text>
          <Text style={[ui.subtitle, { textAlign: 'center' }]}>
            Pregúntense cosas, respondan cuando quieran y conózcanse mejor.
          </Text>

          <View style={{ marginTop: 28 }}>
            {isRegister && (
              <TextInput
                style={ui.input}
                placeholder="Tu nombre"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
              />
            )}
            <TextInput
              style={ui.input}
              placeholder="Correo"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={ui.input}
              placeholder="Contraseña (mín. 6 caracteres)"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {!!error && <Text style={ui.error}>{error}</Text>}

            <Pressable style={ui.button} onPress={submit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={ui.buttonText}>{isRegister ? 'Crear cuenta' : 'Entrar'}</Text>
              )}
            </Pressable>

            <Pressable onPress={() => { setError(''); setMode(isRegister ? 'login' : 'register'); }}>
              <Text style={ui.link}>
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo(a)? Crea tu cuenta'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
