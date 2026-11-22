// Fila deslizable hecha con PanResponder + Animated (sin librerías nativas).
//  → deslizar a la derecha: acción principal (responder / ver)
//  ← deslizar a la izquierda: acción secundaria (dejar para después)
import { useRef } from 'react';
import { Animated, Dimensions, PanResponder, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { tap } from './ui';

const THRESHOLD = 100;
const WIDTH = Dimensions.get('window').width;

export default function SwipeRow({ children, onSwipeRight, onSwipeLeft, rightLabel, leftLabel, style, radius = 20 }) {
  const x = useRef(new Animated.Value(0)).current;
  const crossed = useRef(false);
  // Guardamos los callbacks en refs para que el PanResponder (creado una vez) use siempre los últimos
  const cbs = useRef({});
  cbs.current = { onSwipeRight, onSwipeLeft };

  const pan = useRef(
    PanResponder.create({
      // Solo toma el gesto si es claramente horizontal (así la lista sigue haciendo scroll vertical)
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
      // "Capture": se lo quita al botón de la tarjeta en cuanto el gesto es horizontal
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        let dx = g.dx;
        if (dx < 0 && !cbs.current.onSwipeLeft) dx = dx / 6; // resistencia si no hay acción
        if (dx > 0 && !cbs.current.onSwipeRight) dx = dx / 6;
        x.setValue(dx);
        const over = Math.abs(dx) > THRESHOLD;
        if (over !== crossed.current) {
          crossed.current = over;
          if (over) tap('light');
        }
      },
      onPanResponderRelease: (_, g) => {
        crossed.current = false;
        const { onSwipeRight: r, onSwipeLeft: l } = cbs.current;
        if (g.dx > THRESHOLD && r) {
          tap('medium');
          Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
          r();
        } else if (g.dx < -THRESHOLD && l) {
          tap('medium');
          // Sale por la izquierda y regresa (la lista la reacomoda)
          Animated.timing(x, { toValue: -WIDTH, duration: 220, useNativeDriver: true }).start(() => {
            l();
            x.setValue(0);
          });
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
        }
      },
      onPanResponderTerminate: () => {
        crossed.current = false;
        Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const rightOpacity = x.interpolate({ inputRange: [0, 40, THRESHOLD], outputRange: [0, 0.6, 1], extrapolate: 'clamp' });
  const leftOpacity = x.interpolate({ inputRange: [-THRESHOLD, -40, 0], outputRange: [1, 0.6, 0], extrapolate: 'clamp' });
  const rightScale = x.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0.6, 1.1], extrapolate: 'clamp' });
  const leftScale = x.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1.1, 0.6], extrapolate: 'clamp' });

  return (
    <View style={style}>
      {/* Fondo que se descubre al deslizar */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: radius,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          overflow: 'hidden',
        }}
      >
        <Animated.View style={{ opacity: rightOpacity, transform: [{ scale: rightScale }], flexDirection: 'row', alignItems: 'center' }}>
          {!!onSwipeRight && (
            <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 15 }}>{rightLabel}</Text>
          )}
        </Animated.View>
        <Animated.View style={{ opacity: leftOpacity, transform: [{ scale: leftScale }], flexDirection: 'row', alignItems: 'center' }}>
          {!!onSwipeLeft && <Text style={{ color: colors.violet, fontFamily: fonts.bold, fontSize: 15 }}>{leftLabel}</Text>}
        </Animated.View>
      </View>

      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }] }}>
        {children}
      </Animated.View>
    </View>
  );
}
