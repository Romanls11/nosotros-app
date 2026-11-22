import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadow, ui } from '../theme';
import { friendlyError, login, register, resetPassword } from '../services';
import { FadeIn, FloatingHearts, GradientButton, PasswordInput, Pulse, tap } from '../components/ui';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  const isRegister = mode === 'register';

  function showError(msg) {
    setError(msg);
    tap('warning');
    Animated.sequence(
      [10, -10, 7, -7, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 60, useNativeDriver: true }))
    ).start();
  }

  async function forgot() {
    setError('');
    setInfo('');
    if (!email.trim()) return showError('Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?".');
    try {
      await resetPassword(email);
      tap('success');
      setInfo(`Te enviamos un correo a ${email.trim()} para cambiar tu contraseña. Revisa también la carpeta de spam.`);
    } catch (e) {
      showError(friendlyError(e));
    }
  }

  async function submit() {
    setError('');
    if (isRegister && !name.trim()) return showError('Escribe tu nombre.');
    if (!email.trim() || !password) return showError('Escribe tu correo y contraseña.');
    setLoading(true);
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
      tap('success');
    } catch (e) {
      showError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={gradients.soft} style={{ flex: 1 }}>
      <FloatingHearts />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
          <ScrollView
            contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <FadeIn>
              <Pulse style={{ alignSelf: 'center' }}>
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[{ width: 104, height: 104, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }, shadow]}
                >
                  <Image source={require('../../assets/splash-icon.png')} style={{ width: 92, height: 92 }} />
                </LinearGradient>
              </Pulse>
              <Text style={[ui.title, { textAlign: 'center', marginTop: 4, fontSize: 40 }]}>nosotros</Text>
              <Text style={[ui.subtitle, { textAlign: 'center' }]}>
                Pregúntense cosas, respondan cuando quieran y conózcanse mejor.
              </Text>
            </FadeIn>

            <FadeIn delay={150}>
              <Animated.View
                style={[
                  {
                    marginTop: 28,
                    backgroundColor: colors.card,
                    borderRadius: 24,
                    padding: 20,
                    transform: [{ translateX: shake }],
                  },
                  shadow,
                ]}
              >
                {/* Selector Entrar / Crear cuenta */}
                <View style={{ flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: 14, padding: 4 }}>
                  {[
                    { k: 'login', t: 'Entrar' },
                    { k: 'register', t: 'Crear cuenta' },
                  ].map((o) => (
                    <Pressable
                      key={o.k}
                      onPress={() => {
                        tap('light');
                        setError('');
                        setInfo('');
                        setMode(o.k);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 11,
                        alignItems: 'center',
                        backgroundColor: mode === o.k ? colors.card : 'transparent',
                      }}
                    >
                      <Text style={{ fontFamily: fonts.bold, color: mode === o.k ? colors.primary : colors.muted }}>{o.t}</Text>
                    </Pressable>
                  ))}
                </View>

                {isRegister && (
                  <FadeIn from={8} duration={260}>
                    <TextInput
                      style={ui.input}
                      placeholder="Tu nombre"
                      placeholderTextColor={colors.muted}
                      value={name}
                      onChangeText={setName}
                    />
                  </FadeIn>
                )}
                <TextInput
                  style={ui.input}
                  placeholder="Correo"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Contraseña (mín. 6 caracteres)"
                  onSubmitEditing={submit}
                />

                {!isRegister && (
                  <Pressable onPress={forgot} hitSlop={8} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>¿Olvidaste tu contraseña?</Text>
                  </Pressable>
                )}

                {!!error && <Text style={ui.error}>{error}</Text>}
                {!!info && <Text style={{ color: colors.ok, marginTop: 12, textAlign: 'center' }}>{info}</Text>}

                <GradientButton title={isRegister ? 'Crear cuenta' : 'Entrar'} onPress={submit} loading={loading} />
              </Animated.View>
            </FadeIn>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
