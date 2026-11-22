<p align="center"><img src="assets/icon.png" width="120" alt="nosotros"/></p>

# nosotros

App móvil para parejas: **háganse preguntas, respóndanlas cuando quieran y conózcanse mejor.**
Las preguntas y respuestas quedan guardadas para volver a leerlas cuando quieran.

Hecha con **Expo (React Native)** y **Firebase** en su plan gratuito: sin servidor propio y sin costo.

---

## ✨ Funciones

- 🔐 **Cuentas** con correo y contraseña.
- 💑 **Vinculación de pareja** con un código de 6 caracteres.
- ❓ **Preguntas** que cualquiera de los dos puede crear, con el botón ✨ *Inspírame* para sugerencias.
- ✍️ **Respuestas** a su ritmo, que se pueden editar después.
- 🔒 **Sin spoilers:** la respuesta de tu pareja se ve hasta que respondes tú.
- 🗂️ **Pestañas:** *Por responder*, *Esperando* y *Respondidas*.
- ⚡ **Tiempo real:** los cambios aparecen al instante en los dos teléfonos.
- ☀️ **Pregunta del día** con racha 🔥 de días seguidos.
- 😍 **Reacciones** y 💬 **mini chat** en cada pregunta.
- 🏷️ **Categorías** con color y filtro.
- ⏳ **Cápsula del tiempo**: respuestas que se abren en una fecha especial.
- 📊 **Nuestro mapa**: estadísticas de la pareja.
- 👆 **Deslizar tarjetas** para responder o dejar para después.
- 🌙 **Modo oscuro**.
- 🔔 **Notificaciones push** cuando hay pregunta nueva o respuesta.
- 💔 **Desvincular pareja** y volver a vincularse desde Ajustes.
- ✨ **Interfaz animada:** degradados, revelado de respuestas con corazones y vibración sutil.
- 📤 **Exportar a SQL** desde la app (MySQL) o con un script en la computadora (MySQL o PostgreSQL).

## 🧱 Tecnologías

| Parte | Tecnología |
|---|---|
| App móvil | Expo SDK 58, React Native 0.88, JavaScript |
| Autenticación | Firebase Authentication (correo/contraseña) |
| Base de datos | Cloud Firestore (tiempo real) |
| Seguridad | Reglas de Firestore (`firestore.rules`) |
| Exportación | Generador SQL en la app y script Node con `firebase-admin` |
| Plan | Firebase Spark (gratuito, sin tarjeta) |

## 🚀 Inicio rápido

```bash
git clone https://github.com/<tu-usuario>/nosotros-app.git
cd nosotros-app
npm install
npx expo start
```

Luego abre **Expo Go** en tu teléfono Android y escanea el código QR.

> Para usar tu propio Firebase, sigue la guía [docs/01-configuracion-firebase.md](docs/01-configuracion-firebase.md).

## 📁 Estructura

```
.
├── App.js                    # Decide la pantalla: login → vincular → inicio
├── firebaseConfig.js         # Datos de conexión a Firebase (públicos)
├── firestore.rules           # Reglas de seguridad de la base de datos
├── src/
│   ├── firebase.js           # Inicializa Firebase (auth con sesión persistente)
│   ├── services.js           # Registro, pareja, preguntas, respuestas
│   ├── exportSql.js          # Genera el SQL desde la app
│   ├── suggestions.js        # Preguntas sugeridas
│   ├── theme.js              # Colores y estilos
│   ├── screens/
│   │   ├── AuthScreen.js     # Login / registro
│   │   ├── PairScreen.js     # Crear pareja o unirse con código
│   │   └── HomeScreen.js     # Lista de preguntas y pestañas
│   └── components/
│       ├── QuestionCard.js   # Tarjeta de pregunta
│       ├── NewQuestionModal.js
│       └── QuestionModal.js  # Ver y responder una pregunta
├── exportar/                 # Script para exportar todo a SQL
└── docs/                     # Documentación detallada
```

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [01 · Configuración de Firebase](docs/01-configuracion-firebase.md) | Crear el proyecto, Firestore, reglas, Auth y app Web |
| [02 · Desarrollo y pruebas](docs/02-desarrollo.md) | Correr la app, Expo Go y solución de errores |
| [03 · Arquitectura](docs/03-arquitectura.md) | Flujo de la app, modelo de datos y reglas explicadas |
| [04 · Exportar a SQL](docs/04-exportar-sql.md) | Botón en la app y script de respaldo |
| [05 · Notificaciones (plan)](docs/05-notificaciones.md) | Cómo se van a implementar los avisos push |
| [06 · Generar el APK](docs/06-apk.md) | Instalar la app sin depender de la computadora |
| [07 · Actualizaciones](docs/07-actualizaciones.md) | Publicar cambios sin recompilar (EAS Update) |
| [08 · Compilar local](docs/08-compilar-local.md) | Generar el APK en tu PC sin esperar la fila |
| [09 · Identidad visual](docs/09-identidad.md) | Logo, paleta y tipografía |
| [10 · Plan de mejoras](docs/10-mejoras.md) | Mejoras modernas, una por una |
| [11 · Privacidad y legal](docs/11-privacidad.md) | Aviso, términos, consentimiento y eliminación de cuenta |
| [CHANGELOG](CHANGELOG.md) | Bitácora de cambios |

## 🔐 Nota sobre seguridad

`firebaseConfig.js` **sí** está en el repositorio, a propósito: esos valores identifican al proyecto,
pero no dan acceso. Toda app web o móvil con Firebase los incluye. La protección real está en
[`firestore.rules`](firestore.rules): solo los dos integrantes de una pareja pueden leer y escribir sus datos.

Lo que **nunca** se sube es `exportar/serviceAccount.json` (clave de administrador); está en `.gitignore`.

## 👨‍💻 Autor

**Román Luna Soto**: desarrollador de software e instructor de informática.
- 💻 Desarrollador en Genio Inventivo SAPI de CV
- 🎓 Instructor de informática en BEONE
- 📍 Huatusco, Veracruz, México
- ✉️ romanls.sistemasc@gmail.com
- 🐙 GitHub: [@Romanls11](https://github.com/Romanls11)

## 🔐 Privacidad

- [Aviso de Privacidad](PRIVACIDAD.md)
- [Términos y Condiciones](TERMINOS.md)

Sin publicidad, sin rastreo y sin venta de datos. Cada quien puede eliminar su cuenta desde la app.

## 📄 Licencia

[MIT](LICENSE) © 2026 Román Luna Soto
