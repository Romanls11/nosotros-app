// Tarjeta del juego en la pantalla principal
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, shadow } from '../theme';
import { roundState, score } from '../whoMore';
import { FadeIn, ScalePressable } from './ui';

export default function WhoMoreCard({ games, uid, partnerId, partnerName, onPress }) {
  const current = games?.[0] || null;
  const state = roundState(current, uid, partnerId);
  const sc = score(games, uid, partnerId);
  const them = partnerName || 'tu pareja';
  const status = !current
    ? '¿Quién se pierde más fácil? ¿Quién llora con las películas? ¡Voten y descúbranlo!'
    : state === 'vote'
    ? current.votes?.[partnerId]
      ? `🤫 ${them} ya votó. ¡Te toca!`
      : '🗳️ Nueva ronda: ¡vota!'
    : state === 'waiting'
    ? `⏳ Esperando el voto de ${them}`
    : '✨ ¡Resultado listo! Toca para ver';

  return (
    <FadeIn delay={160}>
      <ScalePressable onPress={onPress} scaleTo={0.97} haptic="medium" style={[{ borderRadius: 22, marginBottom: 18 }, shadow]}>
        <LinearGradient
          colors={['#6D4BFF', '#B23CFF', '#FF3D6E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center' }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Text style={{ fontSize: 28 }}>🎲</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 16 }}>¿Quién es más probable que…?</Text>
            <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, marginTop: 3, lineHeight: 18 }} numberOfLines={2}>
              {current && state !== 'revealed' ? `…${current.prompt}?\n` : ''}
              {status}
            </Text>
          </View>
          {sc.played > 0 && (
            <View style={{ alignItems: 'center', marginLeft: 8 }}>
              <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 20 }}>{sc.pct}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700' }}>sintonía</Text>
            </View>
          )}
        </LinearGradient>
      </ScalePressable>
    </FadeIn>
  );
}
