// Apariencia de la app: 'system' (sigue al teléfono), 'light' o 'dark'.
// La preferencia se guarda en el teléfono.
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyScheme } from './theme';

const KEY = 'nosotros.apariencia';
export const ThemeContext = createContext({ pref: 'system', scheme: 'light', setPref: () => {} });

/** Se usa una sola vez, en App.js */
export function useAppTheme() {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [pref, setPrefState] = useState('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setPrefState(v)).catch(() => {});
  }, []);

  function setPref(v) {
    setPrefState(v);
    AsyncStorage.setItem(KEY, v).catch(() => {});
  }

  const scheme = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  // Se aplica durante el render, antes de dibujar las pantallas
  applyScheme(scheme);
  return { pref, scheme, setPref };
}

export function useTheme() {
  return useContext(ThemeContext);
}
