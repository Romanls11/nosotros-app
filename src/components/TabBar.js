// Barra de navegación inferior flotante, con indicador animado y avisos.
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, gradients, shadow } from '../theme';
import { tap } from './ui';

export const TAB_BAR_HEIGHT = 68;

/** tabs: [{ key, icon, label, badge?: number, dot?: boolean }] */
export default function TabBar({ tabs, active, onChange }) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, tabs.findIndex((t) => t.key === active));
  const x = useRef(new Animated.Value(index)).current;
  const w = width / tabs.length;

  useEffect(() => {
    Animated.spring(x, { toValue: index, useNativeDriver: true, speed: 16, bounciness: 9 }).start();
  }, [index]);

  return (
    <View
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: Math.max(insets.bottom, 10) + 4,
      }}
    >
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width - 12)}
        style={[
          {
            height: TAB_BAR_HEIGHT,
            borderRadius: 26,
            backgroundColor: colors.card,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 6,
            borderWidth: 1,
            borderColor: colors.border,
          },
          shadow,
          { elevation: 12 },
        ]}
      >
        {/* Indicador que se desliza */}
        {width > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              left: 6,
              top: 8,
              bottom: 8,
              width: w,
              paddingHorizontal: 6,
              transform: [{ translateX: x.interpolate({ inputRange: tabs.map((_, i) => i), outputRange: tabs.map((_, i) => i * w) }) }],
            }}
          >
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 18 }} />
          </Animated.View>
        )}

        {tabs.map((t, i) => {
          const isActive = t.key === active;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                if (!isActive) tap('light');
                onChange(t.key);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t.label}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}
            >
              <View>
                <Text style={{ fontSize: isActive ? 22 : 20, textAlign: 'center' }} maxFontSizeMultiplier={1.2}>{t.icon}</Text>
                {!!t.badge && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -12,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      paddingHorizontal: 4,
                      backgroundColor: isActive ? '#fff' : colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: isActive ? colors.primary : colors.card,
                    }}
                  >
                    <Text style={{ color: isActive ? colors.primary : '#fff', fontSize: 10, fontWeight: '900' }}>
                      {t.badge > 9 ? '9+' : t.badge}
                    </Text>
                  </View>
                )}
                {!t.badge && t.dot && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -6,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.sun,
                      borderWidth: 2,
                      borderColor: isActive ? colors.primary : colors.card,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  fontFamily: isActive ? fonts.bold : undefined,
                  fontWeight: isActive ? undefined : '600',
                  color: isActive ? '#fff' : colors.muted,
                }}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
