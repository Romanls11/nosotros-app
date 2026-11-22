// Tarjeta compacta del test de compatibilidad en la pantalla principal
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, shadow } from '../theme';
import { compareAnswers, PACKS, packState } from '../compat';
import { FadeIn, ScalePressable } from './ui';

export default function CompatCard({ tests, uid, partnerId, partnerName, onPress }) {
  const states = PACKS.map((p) => ({ p, st: packState(tests[p.key], uid, partnerId) }));
  const done = states.filter((x) => x.st === 'done');
  const avg = done.length
    ? Math.round(done.reduce((s, x) => s + compareAnswers(x.p, tests[x.p.key].answers[uid], tests[x.p.key].answers[partnerId]).pct, 0) / done.length)
    : null;
  const yourTurn = states.find((x) => x.st === 'yourTurn');
  const status = yourTurn
    ? `🤫 ${partnerName || 'Tu pareja'} ya respondió "${yourTurn.p.title}". ¡Te toca!`
    : done.length
    ? `${done.length} de ${PACKS.length} tests completados`
    : '¿Qué tanto coinciden? 3 tests de 10 preguntas';

  return (
    <FadeIn delay={180}>
      <ScalePressable onPress={onPress} scaleTo={0.97} haptic="medium" style={[{ borderRadius: 22, marginBottom: 18 }, shadow]}>
        <LinearGradient
          colors={['#00A3A3', '#6D4BFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Text style={{ fontSize: 28 }}>💯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 16 }}>Test de compatibilidad</Text>
            <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, marginTop: 3, lineHeight: 18 }} numberOfLines={2}>
              {status}
            </Text>
          </View>
          {avg != null && (
            <View style={{ alignItems: 'center', marginLeft: 8 }}>
              <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 20 }}>{avg}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700' }}>compatibles</Text>
            </View>
          )}
        </LinearGradient>
      </ScalePressable>
    </FadeIn>
  );
}
