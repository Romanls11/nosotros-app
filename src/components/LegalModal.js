// Visor de textos legales (Aviso de Privacidad / Términos), con el contenido de src/legal.js.
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, shadow } from '../theme';
import { LEGAL, PRIVACY, TERMS } from '../legal';

export default function LegalModal({ doc, onClose }) {
  if (!doc) return null;
  const d = doc === 'terms' ? TERMS : PRIVACY;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>‹ Volver</Text>
          </Pressable>
          <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 28, marginTop: 16, lineHeight: 32 }}>{d.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: '600' }}>
            Última actualización: {LEGAL.updated}
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <Text style={{ color: colors.text, lineHeight: 22 }}>{d.intro}</Text>
          {d.sections.map((s) => (
            <View key={s.title} style={[{ backgroundColor: colors.card, borderRadius: 18, padding: 16, marginTop: 14 }, shadow]}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 8 }}>{s.title}</Text>
              <Text style={{ color: colors.text, lineHeight: 22 }} selectable>
                {s.body}
              </Text>
            </View>
          ))}
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 20, fontSize: 12 }}>
            {LEGAL.owner} · {LEGAL.email}
          </Text>
        </View>
      </ScrollView>
    </Modal>
  );
}
