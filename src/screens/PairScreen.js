import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadow, ui } from '../theme';
import { createCouple, friendlyError, joinCouple, logout } from '../services';
import { FadeIn, FloatingHearts, GradientButton, ScalePressable, tap } from '../components/ui';

// Pantalla para vincularse: uno crea la pareja (y obtiene un código),
// el otro escribe ese código para unirse.
export default function PairScreen({ user, name }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(null); // 'create' | 'join' | null
  const [error, setError] = useState('');

  async function onCreate() {
    setError('');
    setLoading('create');
    try {
      await createCouple(user, name);
      tap('success');
    } catch (e) {
      setError(friendlyError(e));
      tap('warning');
    } finally {
      setLoading(null);
    }
  }

  async function onJoin() {
    setError('');
    if (code.trim().length < 6) {
      tap('warning');
      return setError('El código tiene 6 caracteres.');
    }
    setLoading('join');
    try {
      await joinCouple(user, name, code);
      tap('success');
    } catch (e) {
      setError(friendlyError(e));
      tap('warning');
    } finally {
      setLoading(null);
    }
  }

  const card = [{ backgroundColor: '#fff', borderRadius: 22, padding: 20 }, shadow];

  return (
    <LinearGradient colors={gradients.soft} style={{ flex: 1 }}>
      <FloatingHearts count={5} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 24, flex: 1, justifyContent: 'center' }}>
          <FadeIn>
            <Text style={ui.title}>Hola, {name} 👋</Text>
            <Text style={ui.subtitle}>
              Conecta tu cuenta con la de tu pareja. Uno crea la pareja y el otro se une con el código.
            </Text>
          </FadeIn>

          <FadeIn delay={120} style={{ marginTop: 26 }}>
            <View style={card}>
              <Text style={{ fontSize: 28 }}>✨</Text>
              <Text style={{ fontWeight: '800', fontSize: 17, color: colors.text, marginTop: 6 }}>Soy el primero</Text>
              <Text style={[ui.subtitle, { marginTop: 4 }]}>Crea la pareja y comparte el código.</Text>
              <GradientButton title="Crear pareja" onPress={onCreate} loading={loading === 'create'} disabled={!!loading} />
            </View>
          </FadeIn>

          <FadeIn delay={240} style={{ marginTop: 16 }}>
            <View style={card}>
              <Text style={{ fontSize: 28 }}>🔑</Text>
              <Text style={{ fontWeight: '800', fontSize: 17, color: colors.text, marginTop: 6 }}>Ya tengo un código</Text>
              <TextInput
                style={[ui.input, { letterSpacing: 6, fontWeight: '800', fontSize: 22, textAlign: 'center' }]}
                placeholder="ABC123"
                placeholderTextColor={colors.border}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
              />
              <ScalePressable style={ui.ghostButton} onPress={onJoin} disabled={!!loading}>
                <Text style={ui.ghostButtonText}>{loading === 'join' ? 'Uniendo…' : 'Unirme'}</Text>
              </ScalePressable>
            </View>
          </FadeIn>

          {!!error && <Text style={ui.error}>{error}</Text>}

          <Pressable onPress={logout}>
            <Text style={[ui.link, { color: colors.muted }]}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
