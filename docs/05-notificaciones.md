# 05 · Notificaciones push (plan)

> Estado: **código listo (v0.2.0)**: falta configurar EAS/FCM y generar el APK para probarlas.

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

1. Al entrar a la pantalla principal, cada teléfono pide permiso y obtiene su **Expo Push Token**, que se guarda en `couples/{coupleId}.tokens[uid]`.
2. Al crear una pregunta o responder, la app manda una petición a `https://exp.host/--/api/v2/push/send` con el token de la pareja.
3. Expo la entrega mediante **Firebase Cloud Messaging (FCM)**, que es gratis.

Se usa este método porque la alternativa "correcta" serían Cloud Functions, y esas requieren el plan de pago Blaze.

## Requisitos importantes
1. **No funciona en Expo Go.** Desde el SDK 53, las notificaciones push en Android requieren un **development build** o un APK propio, así que este paso va junto con [06 · Generar el APK](06-apk.md).
2. **Registrar una app Android en Firebase** con el paquete `com.romanluna.nosotros` y descargar `google-services.json`. Sirve para FCM; es distinto del registro "Web" que usa la base de datos.
3. **Subir la clave de FCM (V1)** a Expo: `eas credentials` → Android → Google Service Account Key.
4. **Cuenta gratuita en expo.dev** para EAS.

## Cambios de código (hechos)
- Dependencias: `expo-notifications`, `expo-device`, `expo-constants` y `expo-dev-client`.
- [`src/notifications.js`](../src/notifications.js):
  - `registerForPush()`: crea el canal de Android, pide permiso, obtiene el token y lo guarda en la pareja.
  - `sendPush()`: llama a la API de Expo Push.
  - En Expo Go no hace nada, para que no truene.
- `HomeScreen.js`: registra el teléfono y envía los avisos:
  - Pregunta nueva → *"💌 Román te hizo una pregunta"*.
  - Primera respuesta, si la pareja aún no responde → *"✍️ Román respondió, te toca"*.
  - Primera respuesta, si la pareja ya había respondido → *"👀 ¡Román respondió! Ya pueden ver sus respuestas"*.
  - Editar una respuesta **no** manda aviso.
- `firestore.rules`: nueva regla en `couples`. Cada integrante solo puede escribir **su** entrada del mapa `tokens`. El token queda en el documento de la pareja, que solo leen sus dos integrantes; así no se expone `users/`.
- `app.json`: plugin `expo-notifications` y `android.googleServicesFile`.
- `eas.json`: perfiles `development` (APK con dev client) y `preview` (APK normal).

## Pasos de configuración (una vez)
1. Publicar las reglas nuevas de `firestore.rules` en Firebase.
2. Crear una cuenta gratuita en <https://expo.dev>.
3. Vincular el proyecto con EAS:
   ```bash
   npm install -g eas-cli
   eas login
   eas init        # agrega extra.eas.projectId en app.json
   ```
4. En Firebase: **Agregar app → Android**, con el paquete `com.romanluna.nosotros`. Descargar `google-services.json` y guardarlo en la raíz del proyecto.
5. Clave de FCM para Expo:
   ```bash
   eas credentials
   ```
   Elegir **Android → (perfil) → Google Service Account → Manage your Google Service Account Key for Push Notifications (FCM V1) → Upload**, y subir el `serviceAccount.json` de la carpeta `exportar/`. Sirve la misma clave.
6. Generar el APK: `eas build -p android --profile preview` (ver [06](06-apk.md)).

## Nota de desarrollo
Con `expo-dev-client` instalado, `npx expo start` abre por defecto el modo *development build*. Para seguir usando **Expo Go**:
```bash
npx expo start --go
```
