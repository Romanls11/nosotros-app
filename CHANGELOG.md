# Changelog

Bitácora de cambios del proyecto. Formato: fecha, qué cambió y por qué.

## [0.3.0] - 2026-11-17

### Agregado
- **EAS Update** (`expo-updates`): los cambios de JS se publican sin recompilar ni esperar la fila. Ver `docs/07-actualizaciones.md`.
- Script `npm run publicar`.
- **Pantalla de Ajustes ⚙️** (`SettingsModal`): datos de la pareja, estado de notificaciones, exportar, **desvincular pareja** y cerrar sesión.
- **Desvincular pareja** (`leaveCouple`): sales de la pareja, tu pareja conserva las preguntas y puedes volver con el mismo código o unirte a otra.
- **Botón 👁️ para ver la contraseña** (`PasswordInput`).
- **¿Olvidaste tu contraseña?** en el login (`resetPassword` → correo de Firebase).
- Herramienta `exportar/cambiar-password.js`: lista los correos registrados (`--lista`) y cambia la contraseña de una cuenta con la clave de administrador.
- **Diagnóstico de notificaciones**: `registerForPush` devuelve en qué paso falló y Ajustes lo muestra.
- **Nueva interfaz con animaciones** (`src/components/ui.js`):
  - Degradados en encabezados, botones y botón flotante (`expo-linear-gradient`).
  - Tarjetas que aparecen escalonadas, botones que se encogen al tocarlos y un indicador de pestañas que se desliza.
  - Corazones flotando en login y vinculación, y logo que late.
  - Animación de **revelar** (respuesta que crece con explosión de corazones) cuando respondes y tu pareja ya había respondido.
  - El formulario vibra y se sacude si hay un error.
  - Vibración sutil al tocar, enviar y responder (`expo-haptics`).
  - Resumen con contadores en el encabezado.

### Corregido
- Las notificaciones no se registraban y no había forma de saber por qué (ver el diagnóstico de arriba).

### Cambiado
- `app.json`: `runtimeVersion` (política `appVersion`) y `updates.url`.
- `eas.json`: `channel` por perfil.
- `firestore.rules`: nueva regla para desvincularse (cada quien solo puede quitarse a sí mismo).
- Unirse ya no rechaza el código de una pareja que tú creaste, por si saliste y quieres volver.

## [0.2.0] - 2026-11-17

### Agregado
- **Notificaciones push**, sin servidor: Expo Push API + FCM.
  - Aviso de pregunta nueva y de respuesta ("te toca" o "ya pueden ver sus respuestas").
  - Token de cada teléfono guardado en `couples/{id}.tokens[uid]`.
  - Archivo nuevo: `src/notifications.js`.
- `eas.json` con perfiles `development` y `preview` (APK).
- Repositorio público: https://github.com/Romanls11/nosotros-app

### Cambiado
- `firestore.rules`: regla para que cada integrante guarde solo su token.
- `app.json`: plugin `expo-notifications` y `googleServicesFile`.
- Para usar Expo Go ahora se corre `npx expo start --go`, porque se instaló `expo-dev-client`.

## [0.1.0] - 2026-11-17

### Agregado
- Proyecto base con **Expo SDK 58** (plantilla *blank*, JavaScript).
- Conexión a **Firebase** (plan Spark): Authentication con correo/contraseña y Cloud Firestore.
- Pantallas:
  - `AuthScreen`: registro e inicio de sesión.
  - `PairScreen`: crear pareja (código de 6 caracteres) o unirse con un código.
  - `HomeScreen`: lista de preguntas con pestañas *Por responder*, *Esperando* y *Respondidas*.
- Crear preguntas con sugerencias aleatorias (✨ *Inspírame*, 22 preguntas fijas, sin IA).
- Responder y editar respuestas. La respuesta de la pareja se ve hasta responder la propia.
- Borrar preguntas (solo el autor).
- Compartir el código de pareja con el menú nativo del teléfono.
- Reglas de seguridad en `firestore.rules`.
- **Exportar a SQL:**
  - Botón *Exportar* en la app (MySQL, sin claves).
  - Script `exportar/export-sql.js` con `firebase-admin` (MySQL o PostgreSQL, todas las parejas).
- Documentación en `docs/` y guía rápida en `PASOS.md`.

### Corregido
- **`permission-denied` al crear la pareja:** la pantalla principal empezaba a leer la pareja antes de que el servidor confirmara que existía.
  - `App.js` ahora ignora snapshots con `hasPendingWrites`.
  - `HomeScreen.js` reintenta los listeners cada 2 s si fallan.
- **`auth/api-key-not-valid`:** `firebaseConfig.js` se había quedado con los valores de ejemplo.

### Pendiente
- Configurar EAS/FCM y probar las notificaciones en el APK.
- Generar el APK (ver `docs/06-apk.md`).
- Mejoras de UI/UX: categorías, modo oscuro, animación al revelar respuestas, reacciones, pregunta del día.
