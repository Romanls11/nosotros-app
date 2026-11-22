// ✓ Avisos breves ("toasts") que aparecen arriba y se van solos.
// Uso: const toast = useToast(); toast('Respuesta guardada', '✓');
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, shadow } from './theme';

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState(null);
  const y = useRef(new Animated.Value(-120)).current;
  const timer = useRef(null);

  const show = useCallback((text, icon = '✓', tone = 'ok') => {
    clearTimeout(timer.current);
    setMsg({ text, icon, tone, id: Date.now() });
    y.setValue(-120);
    Animated.spring(y, { toValue: 0, useNativeDriver: true, friction: 8, tension: 90 }).start();
    timer.current = setTimeout(() => {
      Animated.timing(y, { toValue: -120, duration: 220, useNativeDriver: true }).start(() => setMsg(null));
    }, 2200);
  }, []);

  const tones = {
    ok: { bg: colors.ok, fg: '#fff' },
    info: { bg: colors.ink, fg: colors.bg },
    warn: { bg: colors.danger, fg: '#fff' },
  };
  const t = tones[msg?.tone] || tones.ok;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg && (
        <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, alignItems: 'center', zIndex: 999, elevation: 999 }}>
          <Animated.View
            accessibilityLiveRegion="polite"
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: t.bg,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                maxWidth: '90%',
                transform: [{ translateY: y }],
              },
              shadow,
              { elevation: 20 },
            ]}
          >
            <Text style={{ color: t.fg, fontSize: 15, marginRight: 8 }}>{msg.icon}</Text>
            <Text style={{ color: t.fg, fontFamily: fonts.bold, fontSize: 14 }} numberOfLines={2} maxFontSizeMultiplier={1.3}>
              {msg.text}
            </Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}
