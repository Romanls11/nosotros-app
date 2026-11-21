// Notificaciones push con Expo (sin servidor propio).
// - Cada teléfono guarda su "Expo Push Token" en couples/{coupleId}.tokens[uid]
// - Para avisar a la pareja se llama directo a la API de Expo Push.
//
// ⚠️ En Expo Go (Android) NO funcionan las push remotas: hace falta un
// development build o el APK. En Expo Go este código simplemente no hace nada.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Cómo se muestra una notificación si la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Pide permiso, obtiene el token y lo guarda en la pareja.
 * Devuelve { ok, step, message } para poder diagnosticar si algo falla.
 */
export async function registerForPush(coupleId, uid) {
  let step = 'inicio';
  try {
    step = 'dispositivo';
    if (!Device.isDevice) return { ok: false, step, message: 'No es un teléfono físico.' };
    if (isExpoGo) return { ok: false, step, message: 'En Expo Go no hay notificaciones push.' };

    if (Platform.OS === 'android') {
      step = 'canal';
      // En Android 13+ el canal debe existir antes de pedir permiso
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Preguntas y respuestas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 120, 200],
        lightColor: '#E2557A',
      });
    }

    step = 'permiso';
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') {
      return { ok: false, step, message: `Permiso: ${status}. Actívalo en Ajustes → Apps → Nosotros → Notificaciones.` };
    }

    step = 'projectId';
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) return { ok: false, step, message: 'Falta extra.eas.projectId en app.json.' };

    step = 'token';
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    step = 'guardar';
    await updateDoc(doc(db, 'couples', coupleId), { [`tokens.${uid}`]: token });
    return { ok: true, step: 'listo', message: token };
  } catch (e) {
    console.warn(`Notificaciones (${step}):`, e?.code || '', e?.message);
    return { ok: false, step, message: `${e?.code ? e.code + ': ' : ''}${e?.message || e}` };
  }
}

/** Envía una notificación al token de la pareja. Nunca lanza error. */
export async function sendPush(token, title, body) {
  if (!token) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: 'default',
        channelId: 'default',
        priority: 'high',
      }),
    });
  } catch (e) {
    console.warn('No se pudo enviar la notificación:', e?.message);
  }
}

/** Recorta textos largos para el cuerpo de la notificación */
export function preview(text, max = 90) {
  const t = (text || '').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
