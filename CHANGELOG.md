# Changelog

Bitácora de cambios del proyecto. Formato: fecha, qué cambió y por qué.

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
- Notificaciones push (ver `docs/05-notificaciones.md`).
- Generar el APK (ver `docs/06-apk.md`).
- Mejoras de UI/UX: categorías, modo oscuro, animación al revelar respuestas, reacciones, pregunta del día.
