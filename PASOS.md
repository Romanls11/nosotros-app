# Nosotros 💞: pasos y notas

## Datos del proyecto
- **Carpeta:** `C:\Users\roman\Desktop\Claude Code Test\app-pareja`
- **Firebase:** proyecto `pareja-app-c855e` (plan Spark, gratis)
- **Servicios activos:** Authentication (correo y contraseña) y Firestore `(default)` en `us-central1`
- **Tecnología:** Expo SDK 58 (React Native) + Firebase JS SDK 13

---

## 1. Configuración en Firebase (ya hecha ✅)
1. Crear el proyecto en console.firebase.google.com.
2. **Firestore → Crear base de datos**: ID `(default)`, ubicación `us-central1`, modo producción.
3. **Firestore → Reglas**: pegar el contenido de `firestore.rules` y **Publicar**.
4. **Authentication → Método de acceso**: activar **Correo electrónico/contraseña**.
5. **Agregar app → Web `</>`**: copiar `firebaseConfig` a `firebaseConfig.js`.
   Se registra como **Web**, no como Android, porque Expo usa el SDK de JavaScript.

## 2. Correr la app en modo desarrollo
```bash
cd "C:\Users\roman\Desktop\Claude Code Test\app-pareja"
npm install          # solo la primera vez
npx expo start       # muestra el QR
```
- En el teléfono: instalar **Expo Go** y escanear el QR **desde Expo Go**, no con la cámara.
- El teléfono y la compu deben estar en el mismo Wi-Fi.
- Si no conecta: `npx expo start --tunnel`.
- Si un cambio no se refleja: `npx expo start -c` (borra la caché).

## 3. Usar la app
1. Cada quien crea su cuenta.
2. Uno toca **Crear pareja** y comparte el código de 6 letras.
3. El otro toca **Unirme** y escribe el código.
4. Hacer preguntas con **+** (el botón ✨ *Inspírame* sugiere ideas).
5. Responder cuando quieran. La respuesta del otro se ve hasta que tú respondes.

## 4. Exportar a SQL

### Opción fácil: desde la app
Toca **Exportar**, arriba a la derecha, y mándate el SQL por WhatsApp, Gmail o Drive.
Crea las tablas `users`, `questions` y `answers` (MySQL). No necesita claves ni terminal.

### Opción completa: script en la compu (todas las parejas, MySQL o PostgreSQL)
1. Firebase → ⚙️ Configuración del proyecto → **Cuentas de servicio** → **Generar nueva clave privada**.
2. Renombrar el archivo a `serviceAccount.json` y guardarlo en la carpeta `exportar\`.
   ⚠️ Es secreta: no compartirla ni subirla a GitHub (ya está en `.gitignore`).
3. Ejecutar:
```bash
cd exportar
npm install                  # solo la primera vez
node export-sql.js           # MySQL
node export-sql.js postgres  # PostgreSQL
```

Importar el archivo: `mysql -u root -p nombre_bd < archivo.sql`, o abrirlo en phpMyAdmin o DBeaver.

## 5. Siguiente paso: generar el APK
Para que la app quede instalada sin depender de la compu:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
En `eas.json`, dentro de `preview`, agregar `"android": { "buildType": "apk" }`.

---

## Errores que ya resolvimos
| Error | Causa | Solución |
|---|---|---|
| Se abre texto JSON en Chrome | Se escaneó el QR con la cámara | Escanear desde Expo Go |
| `Failed to download remote update` | Primera compilación lenta o firewall | Recargar ⟳, permitir Node en el firewall o usar `--tunnel` |
| `auth/api-key-not-valid` | `firebaseConfig.js` con `PEGA_AQUI` | Poner los datos reales de Firebase |
| `permission-denied` al crear la pareja | La app leía antes de que el servidor guardara | Ya corregido en el código (espera la confirmación y reintenta) |

## Modelo de datos (Firestore)
```
users/{uid}                         name, coupleId
invites/{CODIGO}                    coupleId, createdBy
couples/{coupleId}                  members[], names{}, inviteCode
couples/{coupleId}/questions/{id}   text, authorId, createdAt, answers{ uid: {text, answeredAt} }
```
