import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { colors, shadow, ui } from '../theme';
import { friendlyError, leaveCouple, logout, resetPassword } from '../services';
import { FadeIn, ScalePressable, tap } from './ui';

function Row({ icon, title, subtitle, onPress, danger, right }) {
  return (
    <ScalePressable
      onPress={onPress}
      scaleTo={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}
    >
      <Text style={{ fontSize: 22, width: 36 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: danger ? colors.danger : colors.text }}>{title}</Text>
        {!!subtitle && <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {right ?? <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>}
    </ScalePressable>
  );
}

function Section({ title, children, delay }) {
  return (
    <FadeIn delay={delay} style={{ marginTop: 22 }}>
      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 1, marginLeft: 6, marginBottom: 8 }}>
        {title.toUpperCase()}
      </Text>
      <View style={[{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' }, shadow]}>{children}</View>
    </FadeIn>
  );
}

const Divider = () => <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />;

export default function SettingsModal({
  visible,
  onClose,
  user,
  coupleId,
  couple,
  partnerId,
  push,
  onCheckPush,
  onExport,
}) {
  const [leaving, setLeaving] = useState(false);
  const names = couple?.names || {};
  const myName = names[user.uid] || user.displayName || 'Tú';
  const partnerName = partnerId ? names[partnerId] : null;

  function confirmLeave() {
    tap('warning');
    Alert.alert(
      'Desvincular pareja',
      partnerName
        ? `Dejarás de compartir preguntas con ${partnerName}. Las preguntas se quedan guardadas para ${partnerName}.\n\nSi después quieres volver, pídele el código ${couple?.inviteCode}.`
        : 'Se cancelará esta pareja y podrás crear una nueva o unirte con otro código.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            setLeaving(true);
            try {
              await leaveCouple(user.uid, coupleId);
              onClose();
            } catch (e) {
              Alert.alert('No se pudo desvincular', friendlyError(e));
            } finally {
              setLeaving(false);
            }
          },
        },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 52, paddingBottom: 40 }}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 16 }}>‹ Volver</Text>
          </Pressable>
          <Text style={[ui.title, { marginTop: 16 }]}>⚙️ Ajustes</Text>

          <Section title="Ustedes" delay={60}>
            <Row icon="🙂" title={myName} subtitle={user.email} right={<View />} />
            <Divider />
            {partnerName ? (
              <Row icon="💞" title={partnerName} subtitle="Tu pareja" right={<View />} />
            ) : (
              <Row
                icon="🔑"
                title={`Código: ${couple?.inviteCode || '—'}`}
                subtitle="Compártelo para que tu pareja se una"
                onPress={() => Share.share({ message: `Únete a nuestra app de preguntas 💞 Mi código es: ${couple?.inviteCode}` })}
              />
            )}
          </Section>

          <Section title="Notificaciones" delay={120}>
            <Row
              icon={push?.ok ? '🔔' : '🔕'}
              title={push?.ok ? 'Activas en este teléfono' : 'No están activas'}
              subtitle={push?.ok ? 'Toca para revisar el estado de los dos' : 'Toca para intentar activarlas y ver el motivo'}
              onPress={onCheckPush}
            />
          </Section>

          <Section title="Datos" delay={180}>
            <Row icon="📤" title="Exportar a SQL" subtitle="Comparte un respaldo de sus preguntas" onPress={onExport} />
          </Section>

          <Section title="Cuenta" delay={240}>
            <Row
              icon="💔"
              title="Desvincular pareja"
              subtitle="Para unirte a otra pareja o volver a empezar"
              danger
              onPress={confirmLeave}
              right={leaving ? <ActivityIndicator color={colors.danger} /> : undefined}
            />
            <Divider />
            <Row
              icon="🔑"
              title="Cambiar contraseña"
              subtitle="Te enviamos un correo para elegir una nueva"
              onPress={async () => {
                try {
                  await resetPassword(user.email);
                  tap('success');
                  Alert.alert('Correo enviado 📩', `Revisa ${user.email} (y la carpeta de spam) para elegir tu nueva contraseña.`);
                } catch (e) {
                  Alert.alert('No se pudo enviar', friendlyError(e));
                }
              }}
            />
            <Divider />
            <Row
              icon="🚪"
              title="Cerrar sesión"
              subtitle="Para entrar con otra cuenta"
              onPress={() => {
                onClose();
                logout();
              }}
            />
          </Section>

          <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 28, fontSize: 12 }}>nosotros · v0.3.0</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
