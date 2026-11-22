// Se muestra a cuentas que todavía no han aceptado la versión vigente del Aviso de Privacidad.
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadow, ui } from '../theme';
import { acceptPrivacy, friendlyError, logout } from '../services';
import { FadeIn, GradientButton, tap } from '../components/ui';
import ConsentCheck from '../components/ConsentCheck';
import { LEGAL } from '../legal';

export default function ConsentScreen({ user, isUpdate }) {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function accept() {
    if (!checked) {
      tap('warning');
      return setError('Para continuar necesitas marcar la casilla.');
    }
    setSaving(true);
    try {
      await acceptPrivacy(user.uid);
      tap('success');
    } catch (e) {
      setError(friendlyError(e));
      setSaving(false);
    }
  }

  return (
    <LinearGradient colors={gradients.soft} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
          <FadeIn>
            <Text style={{ fontSize: 48 }}>🔐</Text>
            <Text style={[ui.title, { marginTop: 8 }]}>{isUpdate ? 'Actualizamos el aviso de privacidad' : 'Tu privacidad importa'}</Text>
            <Text style={ui.subtitle}>
              Antes de seguir, revisa cómo cuidamos tu información. En resumen:
            </Text>
          </FadeIn>
          <FadeIn delay={120}>
            <View style={[{ backgroundColor: colors.card, borderRadius: 20, padding: 18, marginTop: 18 }, shadow]}>
              {[
                '💞 Lo que escribes solo lo ve tu pareja vinculada.',
                '🚫 Sin publicidad, sin venta de datos, sin rastreo.',
                '☁️ Se guarda en Google Firebase; las notificaciones pasan por Expo.',
                '🗑️ Puedes eliminar tu cuenta cuando quieras desde Ajustes.',
                `✉️ Dudas o derechos ARCO: ${LEGAL.email}`,
              ].map((t) => (
                <Text key={t} style={{ color: colors.text, lineHeight: 22, marginBottom: 6 }}>
                  {t}
                </Text>
              ))}
              <ConsentCheck checked={checked} onChange={setChecked} />
            </View>
          </FadeIn>
          {!!error && <Text style={ui.error}>{error}</Text>}
          <GradientButton title="Aceptar y continuar" onPress={accept} loading={saving} />
          <Text style={[ui.link, { color: colors.muted }]} onPress={logout}>
            No acepto · cerrar sesión
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
