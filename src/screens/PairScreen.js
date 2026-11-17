import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui } from '../theme';
import { createCouple, friendlyError, joinCouple, logout } from '../services';

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
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(null);
    }
  }

  async function onJoin() {
    setError('');
    if (code.trim().length < 6) return setError('El código tiene 6 caracteres.');
    setLoading('join');
    try {
      await joinCouple(user, name, code);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 24, flex: 1, justifyContent: 'center' }}>
        <Text style={ui.title}>Hola, {name} 👋</Text>
        <Text style={ui.subtitle}>
          Para empezar, conecta tu cuenta con la de tu pareja. Solo uno de los dos crea la pareja; el
          otro se une con el código.
        </Text>

        <View style={{ marginTop: 28, backgroundColor: colors.card, borderRadius: 18, padding: 18 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>1. Soy el primero</Text>
          <Text style={[ui.subtitle, { marginTop: 4 }]}>Crea la pareja y comparte el código.</Text>
          <Pressable style={ui.button} onPress={onCreate} disabled={!!loading}>
            {loading === 'create' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={ui.buttonText}>Crear pareja</Text>
            )}
          </Pressable>
        </View>

        <View style={{ marginTop: 16, backgroundColor: colors.card, borderRadius: 18, padding: 18 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>2. Ya tengo un código</Text>
          <TextInput
            style={[ui.input, { letterSpacing: 4, fontWeight: '700', textAlign: 'center' }]}
            placeholder="ABC123"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <Pressable style={ui.ghostButton} onPress={onJoin} disabled={!!loading}>
            {loading === 'join' ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={ui.ghostButtonText}>Unirme</Text>
            )}
          </Pressable>
        </View>

        {!!error && <Text style={ui.error}>{error}</Text>}

        <Pressable onPress={logout}>
          <Text style={[ui.link, { color: colors.muted }]}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
