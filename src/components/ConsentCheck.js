// Casilla de consentimiento expreso (aviso de privacidad, términos y datos sensibles).
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../theme';
import { tap } from './ui';
import LegalModal from './LegalModal';

export default function ConsentCheck({ checked, onChange }) {
  const [doc, setDoc] = useState(null);
  const link = (k, t) => (
    <Text style={{ color: colors.primary, fontWeight: '800', textDecorationLine: 'underline' }} onPress={() => setDoc(k)}>
      {t}
    </Text>
  );
  return (
    <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'flex-start' }}>
      <Pressable
        onPress={() => {
          tap('light');
          onChange(!checked);
        }}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          borderWidth: 2,
          borderColor: checked ? colors.primary : colors.muted,
          backgroundColor: checked ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
          marginTop: 1,
        }}
      >
        {checked && <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>✓</Text>}
      </Pressable>
      <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 }}>
        Soy mayor de 18 años, acepto los {link('terms', 'Términos y Condiciones')} y el {link('privacy', 'Aviso de Privacidad')}, y doy mi
        consentimiento expreso para el tratamiento de los datos (incluidos datos sensibles) que yo decida escribir en la app.
      </Text>
      <LegalModal doc={doc} onClose={() => setDoc(null)} />
    </View>
  );
}
