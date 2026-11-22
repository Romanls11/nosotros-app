# 12 · Ficha de "nosotros" para el portafolio

Texto listo para agregarlo como proyecto en <https://portafolio-isc-roman.vercel.app/>.

---

## nosotros 💞: app móvil para parejas
**Tipo:** Proyecto personal · App móvil Android
**Rol:** Diseño, desarrollo, identidad visual y despliegue
**Código:** https://github.com/Romanls11/nosotros-app

### Descripción corta (para la tarjeta)
App móvil para que dos personas se hagan preguntas, las respondan a su ritmo y se conozcan mejor. Tiene sincronización en tiempo real, notificaciones push y actualizaciones por internet, sin servidor propio y con costo cero.

### Descripción larga
*nosotros* nació como un proyecto personal: un espacio privado para una pareja donde cada quien hace preguntas y responde cuando quiere, sin ver la respuesta del otro hasta contestar la suya. La construí de principio a fin con **Expo (React Native)** y **Firebase**, cuidando la experiencia (animaciones, gestos, modo oscuro), la seguridad (reglas de acceso por pareja) y el cumplimiento legal (aviso de privacidad conforme a la LFPDPPP 2025, consentimiento expreso y eliminación de cuenta).

### Funcionalidades destacadas
- Vinculación de pareja con código, y preguntas y respuestas **en tiempo real** (Firestore `onSnapshot`).
- **Revelado sin spoilers**, con animación de corazones.
- **Pregunta del día** con racha 🔥, **cápsulas del tiempo** ⏳ y "**Un día como hoy**".
- **Reacciones** y **mini chat** por pregunta.
- **Nuestro mapa:** estadísticas visuales (complicidad, tiempos de respuesta, palabras en común).
- **Gestos** para deslizar tarjetas, **modo oscuro** e identidad visual propia (logo, paleta, tipografía).
- **Notificaciones push** sin backend (Expo Push + FCM) y **avisos locales programados**.
- **Actualizaciones OTA** con EAS Update: los cambios llegan a los teléfonos sin reinstalar.
- **Exportación a SQL** (MySQL y PostgreSQL) y **eliminación de cuenta**.

### Tecnologías
`React Native` · `Expo SDK 58` · `JavaScript` · `Firebase Authentication` · `Cloud Firestore` · `Firestore Security Rules` · `Expo Notifications` · `EAS Build / EAS Update` · `Animated API` · `PanResponder` · `Gradle` · `Node.js`

### Retos y logros
- **Cero costo de infraestructura:** todo corre en el plan gratuito de Firebase, sin servidor propio.
- **Seguridad por reglas:** cada integrante solo puede escribir *su* respuesta, reacción o token (`diff().affectedKeys().hasOnly()`).
- **Compilación local en Windows:** se resolvieron rutas largas de CMake/Ninja para generar el APK sin la fila de la nube.
- **Privacidad:** aviso integral, términos, consentimiento expreso para datos sensibles y borrado de cuenta (derecho de cancelación).
- **Documentación completa:** 12 guías, CHANGELOG y versiones semánticas (v0.1 → v1.3).

### Capturas sugeridas (4 a 6)
1. Bienvenida (degradado con el logo).
2. Pantalla principal: pregunta del día + tarjetas con categorías.
3. Revelado de respuestas con corazones y reacciones.
4. Nuestro mapa (estadísticas).
5. Modo oscuro.
6. Cápsula del tiempo (contador "se abre en…").

Consejo: usa un marco de teléfono en cada captura y el degradado de la marca (`#FF7A59 → #FF3D6E → #6D4BFF`) como fondo de la tarjeta del proyecto.
