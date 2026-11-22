# Changelog

Bitácora de cambios del proyecto. Formato: fecha, qué cambió y por qué.

## [1.4.0] - 2026-11-22

### Agregado
- **🎲 ¿Quién es más probable que…?** (`src/whoMore.js`, `WhoMoreCard` y `WhoMoreModal`): 45 situaciones, voto secreto con avatares, revelado animado (¡Coincidieron! 💞 / ¡No coincidieron! 😅), marcador de sintonía, historial de rondas, "Otra situación" y notificaciones. Se guarda en `couples/{id}/games`.
- Reglas para `games`: cada quien solo vota por sí mismo y solo por uno de los dos integrantes.

### Cambiado
- **😍 Reacciones rediseñadas** (`src/components/Reactions.js`):
  - Botón "Reaccionar" que abre una bandeja flotante con emojis que entran escalonados y se agrandan al presionarlos, con su nombre ("Me encanta", "Me hace reír"…).
  - Tu reacción aparece como un chip con su nombre.
  - La insignia en tu respuesta muestra el nombre de tu pareja y la reacción, con un pequeño balanceo.
  - Las tarjetas muestran las reacciones como círculos encimados.
- Eliminar cuenta también borra tus votos del juego.

## [1.3.0] - 2026-11-22

### Agregado
- **🔐 Aviso de Privacidad Integral** y **📄 Términos y Condiciones** conforme a la LFPDPPP (DOF 20-03-2025). Están en la app (Ajustes → Privacidad y legal) y en `PRIVACIDAD.md` y `TERMINOS.md`, con `src/legal.js` como única fuente.
- **Consentimiento expreso** al registrarse (mayoría de edad, términos, aviso y datos sensibles), guardado con versión y fecha. `ConsentScreen` para cuentas existentes o cuando cambie el aviso.
- **🗑️ Eliminar mi cuenta**: borra respuestas, reacciones, mensajes, vínculo, perfil y cuenta (derecho de cancelación).
- `npm run legales`: genera los `.md` desde la app.
- Documentación en `docs/11-privacidad.md`.

### Cambiado
- Correo de contacto: romanls.sistemasc@gmail.com.
- Acerca de y README: enlaces a LinkedIn y al portafolio.
- `firestore.rules`: borrar invitación propia, y quitar el propio nombre al salir de la pareja.

## [1.2.0] - 2026-11-22

### Agregado
- **👋 Bienvenida:** 3 pantallas animadas con paralaje, puntos que se estiran y botón *Saltar*. Aparece la primera vez y se puede repetir en **Ajustes → Ver bienvenida** (`src/screens/WelcomeScreen.js`).
- **📅 Un día como hoy:** tarjeta con una pregunta que respondieron juntos hace 1 semana, 1 mes, 3 meses, 6 meses o 1 año, y las dos respuestas (`src/memories.js` y `src/components/MemoryCard.js`).
- **Acerca de** con todos los datos del desarrollador: trabajos, ubicación, correo y GitHub.

## [1.1.0] - 2026-11-22

### Agregado
- **👨‍💻 Acerca de** (en Ajustes → Información): logo, versión, datos del desarrollador con enlaces, tecnologías, créditos y licencia (`src/components/AboutModal.js`).
- Los datos se editan en un solo archivo: `src/about.js`.
- 🥚 Sorpresa escondida: tocar el logo 5 veces.

## [1.0.0] - 2026-11-22 🎉

Se completan las 7 mejoras del plan (`docs/10-mejoras.md`).

### Agregado
- **⏳ Cápsula del tiempo** (`src/capsule.js`): preguntas cuyas respuestas se abren en una fecha, con opciones rápidas o una fecha propia, aviso local el día que se abren y animación de revelar.
- Notificación "guardó su respuesta en la cápsula".

### Cambiado
- La ventana de nueva pregunta ahora se puede desplazar.
- *Nuestro mapa* ignora las cápsulas cerradas.

## [0.9.0] - 2026-11-22

### Agregado
- **🏷️ Categorías** con color: Profundas, Divertidas, Futuro, Infancia, Nosotros y Picantes (`src/categories.js` y `src/components/CategoryPill.js`).
- Selector de categoría al crear una pregunta, con ideas de *Inspírame* según la categoría.
- Filtro por categoría en la pantalla principal.
- Categoría favorita en *Nuestro mapa*.

### Cambiado
- Exportación SQL (app y script): nueva columna `category` en `questions`.

## [0.8.0] - 2026-11-22

### Agregado
- **📊 Nuestro mapa** (`src/components/StatsModal.js` y `src/stats.js`): complicidad, rachas, quién pregunta más, quién responde más rápido, actividad de la semana, palabras en común y datos curiosos.
- Botón 📊 en el encabezado.

## [0.7.0] - 2026-11-22

### Agregado
- **😍 Reacciones** a la respuesta de tu pareja e insignia con la reacción que te pusieron (`src/components/Conversation.js`).
- **💬 Mini chat por pregunta** en tiempo real, con contador en las tarjetas.
- Notificaciones de reacción y de mensaje.
- `setReaction()` y `addComment()` en `services.js`.

### Corregido
- **`firestore.rules` había perdido la regla de los tokens de notificación**, y por eso los teléfonos no podían registrarse para recibir avisos. El archivo se rehízo completo con todas las reglas.

## [0.6.0] - 2026-11-22

### Agregado
- **👆 Deslizar tarjetas:** → para responder o ver, ← para dejar "para después" (`src/components/SwipeRow.js`).
- Las preguntas "para después" se van al final de *Por responder*, atenuadas y con la etiqueta ⏰. Se guarda solo en el teléfono.
- Pista de uso la primera vez.

## [0.5.0] - 2026-11-22

### Agregado
- **🌙 Modo oscuro** con paleta "noche ciruela". Se elige en **Ajustes → Apariencia** (Sistema, Claro u Oscuro).
- `src/themeContext.js` (preferencia guardada) y `applyScheme()` en `src/theme.js`.

### Cambiado
- Fondos que estaban fijos en blanco ahora usan `colors.card`.
- `app.json`: `userInterfaceStyle: automatic` y dependencia `expo-system-ui`. "Sistema" requiere el próximo APK.

## [0.4.0] - 2026-11-21

### Agregado
- **☀️ Pregunta del día** con **racha 🔥** de días seguidos respondiendo juntos (`src/daily.js` y `src/components/DailyCard.js`). Ver `docs/10-mejoras.md`.
- `ensureDailyQuestion()` en `services.js`.

### Corregido
- **El botón + no respondía en Android:** el `position: absolute` estaba dentro del `Pressable`, y Android ignora los toques fuera de los límites del padre. Ahora el contenedor absoluto envuelve al botón.

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

### Identidad visual
- **Nuevo logo e ícono:** dos mitades de un corazón que se cruzan (ver `docs/09-identidad.md`).
- **Nueva paleta:** coral → rosa → violeta, con acento dorado y textos en ciruela.
- **Tipografía Bricolage Grotesque** en títulos y botones; el nombre se escribe en minúsculas, `nosotros`.
- Pantalla de carga e ícono de notificación con la marca.

### Corregido
- **El teclado tapaba la contraseña:** `KeyboardAvoidingView` ahora usa `padding` también en Android, en login, vinculación y modales.
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
