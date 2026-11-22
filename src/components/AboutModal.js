// 👨‍💻 Acerca de: datos de la app y del desarrollador (se editan en src/about.js).
import { useRef, useState } from 'react';
import { Animated, Image, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ABOUT } from '../about';
import { colors, fonts, gradients, shadow } from '../theme';
import { FadeIn, FloatingHearts, Pulse, ScalePressable, tap } from './ui';

function LinkRow({ icon, label, value, url }) {
  if (!value) return null;
  return (
    <ScalePressable
      onPress={() => url && Linking.openURL(url).catch(() => {})}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
    >
      <Text style={{ fontSize: 20, width: 34 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: url ? colors.primary : colors.text, fontWeight: '700' }} numberOfLines={1}>
          {value}
        </Text>
      </View>
      {url && <Text style={{ color: colors.muted, fontSize: 16 }}>↗</Text>}
    </ScalePressable>
  );
}

const clean = (u) => (u || '').replace(/^https?:\/\/(www\.)?/, '');

export default function AboutModal({ visible, onClose }) {
  const d = ABOUT.developer;
  const [taps, setTaps] = useState(0);
  const [party, setParty] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;

  // 🥚 Sorpresa: toca el logo 5 veces
  function logoTap() {
    const n = taps + 1;
    setTaps(n);
    tap('light');
    if (n >= 5) {
      setTaps(0);
      setParty(true);
      tap('success');
      spin.setValue(0);
      Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true }).start();
      setTimeout(() => setParty(false), 7000);
    }
  }
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (!visible) return null;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 30, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}
        >
          {party && <FloatingHearts count={14} />}
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>‹ Volver</Text>
          </Pressable>
          <FadeIn style={{ alignItems: 'center', marginTop: 10 }}>
            <Pressable onPress={logoTap}>
              <Pulse>
                <Animated.View style={{ transform: [{ rotate }] }}>
                  <Image source={require('../../assets/splash-icon.png')} style={{ width: 110, height: 110 }} />
                </Animated.View>
              </Pulse>
            </Pressable>
            <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 40, letterSpacing: -0.5 }}>{ABOUT.app}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>versión {ABOUT.version}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 10, lineHeight: 20 }}>{ABOUT.tagline}</Text>
            {party && <Text style={{ color: '#fff', fontWeight: '800', marginTop: 10 }}>💞 ¡Encontraste el secreto! 💞</Text>}
          </FadeIn>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Desarrollador */}
          <FadeIn delay={120} style={{ marginTop: 18 }}>
            <View style={[{ backgroundColor: colors.card, borderRadius: 22, padding: 18 }, shadow]}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>DESARROLLADO POR</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 22 }}>
                    {d.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>{d.name}</Text>
                  {!!d.role && <Text style={{ color: colors.muted, marginTop: 2, lineHeight: 19 }}>{d.role}</Text>}
                </View>
              </View>

              <View style={{ marginTop: 10 }}>
                <LinkRow icon="📍" label="Ubicación" value={d.location} />
                <LinkRow icon="✉️" label="Correo" value={d.email} url={d.email && `mailto:${d.email}`} />
                <LinkRow icon="🐙" label="GitHub" value={clean(d.github)} url={d.github} />
                <LinkRow icon="💼" label="LinkedIn" value={clean(d.linkedin)} url={d.linkedin} />
                <LinkRow icon="🌐" label="Sitio web" value={clean(d.website)} url={d.website} />
              </View>
            </View>
          </FadeIn>

          {/* Proyecto */}
          <FadeIn delay={200} style={{ marginTop: 14 }}>
            <View style={[{ backgroundColor: colors.card, borderRadius: 22, padding: 18 }, shadow]}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>EL PROYECTO</Text>
              <LinkRow icon="📦" label="Código fuente" value={clean(ABOUT.repo)} url={ABOUT.repo} />
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 6, marginBottom: 8 }}>Hecho con</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {ABOUT.stack.map((t) => (
                  <View key={t} style={{ backgroundColor: colors.violetSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 }}>
                    <Text style={{ color: colors.violet, fontWeight: '700' }}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 10, lineHeight: 18 }}>
                {ABOUT.credits.join('\n')}
                {`\nLicencia ${ABOUT.license}`}
              </Text>
            </View>
          </FadeIn>

          <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 24 }}>{ABOUT.madeWith}</Text>
          <Text style={{ textAlign: 'center', color: colors.border, marginTop: 6, fontSize: 11 }}>Psst… toca el logo 5 veces 🤫</Text>
        </View>
      </ScrollView>
    </Modal>
  );
}
