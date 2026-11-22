import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './src/firebase';
import { colors } from './src/theme';
import { ThemeContext, useAppTheme } from './src/themeContext';
import AuthScreen from './src/screens/AuthScreen';
import PairScreen from './src/screens/PairScreen';
import HomeScreen from './src/screens/HomeScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ConsentScreen from './src/screens/ConsentScreen';
import { LEGAL } from './src/legal';
import { ToastProvider } from './src/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WelcomeContext } from './src/welcome';

export default function App() {
  const theme = useAppTheme(); // claro / oscuro (debe ir primero: actualiza los colores)
  const [user, setUser] = useState(undefined); // undefined = cargando
  const [profile, setProfile] = useState(undefined);
  const [welcome, setWelcome] = useState(undefined); // undefined = revisando, true = mostrar
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  // ¿Ya vio la bienvenida?
  useEffect(() => {
    AsyncStorage.getItem('nosotros.bienvenida')
      .then((v) => setWelcome(!v))
      .catch(() => setWelcome(false));
  }, []);
  function finishWelcome() {
    setWelcome(false);
    AsyncStorage.setItem('nosotros.bienvenida', '1').catch(() => {});
  }

  // ¿Hay sesión iniciada?
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Perfil del usuario (nombre y a qué pareja pertenece)
  useEffect(() => {
    if (!user) {
      setProfile(user === null ? null : undefined);
      return;
    }
    return onSnapshot(
      doc(db, 'users', user.uid),
      { includeMetadataChanges: true },
      (snap) => {
        // Esperar a que el servidor confirme (p. ej. al crear la pareja),
        // si no, las pantallas siguientes leen datos que aún no existen allá.
        if (snap.metadata.hasPendingWrites) return;
        setProfile(
          snap.exists() ? snap.data() : { name: user.displayName || 'Tú', coupleId: null }
        );
      },
      () => setProfile({ name: user.displayName || 'Tú', coupleId: null })
    );
  }, [user]);

  let content;
  if (!fontsLoaded || welcome === undefined || user === undefined || (user && profile === undefined)) {
    content = (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  } else if (welcome) {
    content = <WelcomeScreen onDone={finishWelcome} />;
  } else if (!user) {
    content = <AuthScreen />;
  } else if (profile?.privacyVersion !== LEGAL.version) {
    content = <ConsentScreen user={user} isUpdate={!!profile?.privacyVersion} />;
  } else if (!profile?.coupleId) {
    content = <PairScreen user={user} name={profile?.name || user.displayName || 'Tú'} />;
  } else {
    content = <HomeScreen user={user} coupleId={profile.coupleId} />;
  }

  return (
    <ThemeContext.Provider value={theme}>
     <WelcomeContext.Provider value={() => setWelcome(true)}>
      <SafeAreaProvider>
        <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
        <ToastProvider>
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            {content}
          </View>
        </ToastProvider>
      </SafeAreaProvider>
     </WelcomeContext.Provider>
    </ThemeContext.Provider>
  );
}
