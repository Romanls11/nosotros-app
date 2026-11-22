// 👋 Bienvenida: 3 pantallas que explican la app la primera vez que se abre.
import { useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, gradients } from '../theme';
import { FadeIn, FloatingHearts, Pulse, ScalePressable, tap } from '../components/ui';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    logo: true,
    title: 'Bienvenidos a nosotros',
    text: 'Un espacio solo para ustedes dos, para conocerse más, una pregunta a la vez.',
  },
  {
    emoji: '💌',
    title: 'Pregúntense lo que sea',
    text: 'Cada quien responde cuando quiera. La respuesta del otro se revela hasta que respondes tú. Sin spoilers.',
  },
  {
    emoji: '🔥',
    title: 'Hagan de esto un ritual',
    text: 'Pregunta del día con racha, reacciones, mini chat, cápsulas del tiempo y su propio mapa de pareja.',
  },
];

export default function WelcomeScreen({ onDone }) {
  const x = useRef(new Animated.Value(0)).current;
  const scroller = useRef(null);
  const [page, setPage] = useState(0);
  const last = page === SLIDES.length - 1;

  function next() {
    tap(last ? 'success' : 'light');
    if (last) return onDone();
    scroller.current?.scrollTo({ x: (page + 1) * W, animated: true });
  }

  return (
    <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <FloatingHearts count={9} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8 }}>
          {!last && (
            <Pressable onPress={onDone} hitSlop={12}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700' }}>Saltar</Text>
            </Pressable>
          )}
        </View>

        <Animated.ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: true })}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / W))}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {SLIDES.map((s, i) => {
            // Paralaje: el ícono se mueve más lento que el texto
            const shift = x.interpolate({ inputRange: [(i - 1) * W, i * W, (i + 1) * W], outputRange: [W * 0.3, 0, -W * 0.3] });
            const scale = x.interpolate({ inputRange: [(i - 1) * W, i * W, (i + 1) * W], outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });
            return (
              <View key={i} style={{ width: W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                <Animated.View style={{ transform: [{ translateX: shift }, { scale }], marginBottom: 28 }}>
                  {s.logo ? (
                    <Pulse>
                      <Image source={require('../../assets/splash-icon.png')} style={{ width: 170, height: 170 }} />
                    </Pulse>
                  ) : (
                    <Pulse>
                      <Text style={{ fontSize: 110 }}>{s.emoji}</Text>
                    </Pulse>
                  )}
                </Animated.View>
                <FadeIn delay={150}>
                  <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 34, textAlign: 'center', letterSpacing: -0.5, lineHeight: 38 }}>
                    {s.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 17, textAlign: 'center', marginTop: 14, lineHeight: 25 }}>
                    {s.text}
                  </Text>
                </FadeIn>
              </View>
            );
          })}
        </Animated.ScrollView>

        {/* Puntos que se estiran según la página */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 22 }}>
          {SLIDES.map((_, i) => {
            const w = x.interpolate({ inputRange: [(i - 1) * W, i * W, (i + 1) * W], outputRange: [8, 26, 8], extrapolate: 'clamp' });
            const o = x.interpolate({ inputRange: [(i - 1) * W, i * W, (i + 1) * W], outputRange: [0.45, 1, 0.45], extrapolate: 'clamp' });
            return <Animated.View key={i} style={{ height: 8, width: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: '#fff', opacity: o, transform: [{ scaleX: w.interpolate({ inputRange: [8, 26], outputRange: [1, 3.25] }) }] }} />;
          })}
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          <ScalePressable
            onPress={next}
            haptic={null}
            style={{ backgroundColor: '#fff', borderRadius: 18, paddingVertical: 17, alignItems: 'center' }}
          >
            <Text style={{ color: '#FF3D6E', fontFamily: fonts.bold, fontSize: 17 }}>{last ? 'Empezar 💞' : 'Siguiente'}</Text>
          </ScalePressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
