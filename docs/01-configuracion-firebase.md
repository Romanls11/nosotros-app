# 01 · Configuración de Firebase

Guía para conectar la app a un proyecto de Firebase propio. Todo se hace en el **plan Spark (gratis)**, que no pide tarjeta.

> Proyecto actual: `pareja-app-c855e`

## 1. Crear el proyecto
1. Entra a <https://console.firebase.google.com> y dale **Agregar proyecto**.
2. Ponle un nombre, por ejemplo `pareja-app`. Google Analytics es opcional y la app no lo usa.
3. Revisa que abajo a la izquierda diga **Spark**.

## 2. Crear la base de datos (Firestore)
1. En el menú izquierdo, entra a **Firestore**.

   ⚠️ No uses **Realtime Database**, que es otra base distinta y la app no funciona con ella.
2. Dale **Crear base de datos**:
   - **Edición:** Standard.
   - **ID:** `(default)`. Tiene que quedar así, porque la app busca esa base.
   - **Ubicación:** `us-central1`. Ya no se puede cambiar después.
   - **Modo:** producción.
3. No crees colecciones a mano; la app las crea sola.

## 3. Publicar las reglas de seguridad
1. **Firestore → pestaña Reglas**.
2. Borra lo que hay y pega el contenido completo de [`firestore.rules`](../firestore.rules).
3. Dale **Publicar**.

Sin este paso, la app marca `permission-denied`, porque las reglas por defecto bloquean todo.

## 4. Activar el inicio de sesión
1. **Authentication → Comenzar**.
2. En **Método de acceso** elige **Correo electrónico/contraseña**.
3. Activa el **primer** interruptor (el de enlace sin contraseña déjalo apagado) y dale **Guardar**.

## 5. Registrar la app y copiar la configuración
1. **Descripción general → + Agregar app → Web `</>`**.

   ⚠️ Elige **Web**, no Android. Expo usa el SDK de JavaScript de Firebase, que se configura como app Web.
2. Apodo: `nosotros`. No marques Firebase Hosting.
3. Copia los valores del bloque `firebaseConfig` a [`firebaseConfig.js`](../firebaseConfig.js):

```js
export const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```

El `measurementId` es de Analytics y no hace falta.

## Límites del plan gratuito (Firestore)
| Recurso | Límite diario |
|---|---|
| Lecturas | 50,000 |
| Escrituras | 20,000 |
| Borrados | 20,000 |
| Almacenamiento | 1 GiB total |

Para una pareja, estos límites no se acercan ni de lejos. Si alguno se agotara, el servicio solo se pausa hasta el día siguiente: **nunca genera cobros**.

⚠️ **Cloud Storage** (subir fotos) ya no está incluido en Spark desde febrero de 2026. Por eso la app es solo de texto.
