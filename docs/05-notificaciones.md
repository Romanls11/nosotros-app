# 05 · Notificaciones push (plan)

> Estado: **planeado, no implementado todavía.**

## Objetivo
Avisar en el teléfono de la pareja cuando:
- 📩 Te hicieron una pregunta nueva: *"Román te hizo una pregunta"*.
- 💬 Tu pareja respondió una pregunta: *"Ana ya respondió, te toca 👀"* o *"¡Ya pueden ver sus respuestas!"*.

## Cómo funciona (sin servidor)

```
Teléfono A ──(1) guarda pregunta──► Firestore
     │
     └──(2) POST a la API de Expo Push con el token de B──► Expo ──► FCM ──► Teléfono B 🔔
```

1. Al iniciar sesión, cada teléfono pide permiso y obtiene su **Expo Push Token**, que se guarda en `users/{uid}.pushToken`.
2. Al crear una pregunta o responder, la app manda una petición a `https://exp.host/--/api/v2/push/send` con el token de la pareja.
3. Expo la entrega mediante **Firebase Cloud Messaging (FCM)**, que es gratis.

Se usa este método porque la alternativa "correcta" serían Cloud Functions, y esas requieren el plan de pago Blaze.

## Requisitos importantes
1. **No funciona en Expo Go.** Desde el SDK 53, las notificaciones push en Android requieren un **development build** o un APK propio, así que este paso va junto con [06 · Generar el APK](06-apk.md).
2. **Registrar una app Android en Firebase** con el paquete `com.romanluna.nosotros` y descargar `google-services.json`. Sirve para FCM; es distinto del registro "Web" que usa la base de datos.
3. **Subir la clave de FCM (V1)** a Expo: `eas credentials` → Android → Google Service Account Key.
4. **Cuenta gratuita en expo.dev** para EAS.

## Cambios de código previstos
- Dependencias nuevas: `expo-notifications` y `expo-device`.
- `src/notifications.js`: pedir permiso, obtener el token, guardarlo y enviar el aviso.
- `services.js`: enviar el aviso después de `addQuestion` y de `saveAnswer`.
- `firestore.rules`: permitir que cada quien lea el `pushToken` de su pareja. Este es el cambio de seguridad que hay que pensar con calma.
- `app.json`: plugin `expo-notifications` y `googleServicesFile`.
