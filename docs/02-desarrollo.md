# 02 · Desarrollo y pruebas

## Requisitos
- **Node.js LTS**: compruébalo con `node -v`. Si no responde, descárgalo de <https://nodejs.org>.
- **Expo Go** en el teléfono Android, desde la Play Store.
- El teléfono y la computadora en la **misma red Wi-Fi**, o usar el modo túnel.

## Correr la app
```bash
cd "C:\Users\roman\Desktop\Claude Code Test\app-pareja"
npm install        # solo la primera vez (tarda unos minutos)
npx expo start --go   # muestra un código QR para Expo Go
```

1. Abre **Expo Go** y toca **Scan QR code**.
   El QR se escanea **desde Expo Go**. Con la cámara normal se abre Chrome y solo verás texto JSON.
2. La primera vez tarda en compilar. En la terminal verás `Android Bundled ... index.js` cuando esté lista.

### Comandos útiles
| Comando | Para qué |
|---|---|
| `npx expo start --go` | Arranca el servidor para Expo Go |
| `npx expo start` | Arranca el servidor para el *development build* (APK de desarrollo) |
| `npx expo start -c` | Igual, pero borra la caché (cuando un cambio no se refleja) |
| `npx expo start --tunnel` | Conecta aunque estén en redes distintas o el firewall bloquee |
| Sacudir el teléfono → **Reload** | Recarga la app |

## Probar con dos personas
1. Ambos teléfonos con Expo Go escanean el **mismo QR**.
2. Cada quien crea su cuenta.
3. Uno toca **Crear pareja** y comparte el código de 6 letras.
4. El otro toca **Unirme** y escribe el código.
5. Prueben: crear pregunta → responder → ver la respuesta del otro.

## Avisos de npm que se pueden ignorar
- `X vulnerabilities`: vienen de dependencias internas de Expo. **No** corras `npm audit fix --force`, porque cambia versiones y rompe el proyecto.
- `New major version of npm available`: solo informativo.
- `packages are looking for funding`: solo informativo.

## Solución de errores

### Se abre Chrome con texto JSON
**Causa:** el QR se escaneó con la cámara del teléfono.
**Solución:** escanearlo desde Expo Go, o en Expo Go tocar *Enter URL manually* y escribir `exp://<IP-de-tu-pc>:8081`.

### `java.io.IOException: Failed to download remote update`
**Causa:** la primera compilación tardó demasiado, o el Firewall de Windows cortó la descarga.
**Solución, en orden:**
1. Esperar a que la terminal diga `Android Bundled` y tocar ⟳ en el teléfono.
2. *Seguridad de Windows → Firewall → Permitir una aplicación*: activar **Node.js** en redes Privada y Pública. Revisar también que el Wi-Fi esté como red **Privada**.
3. Usar `npx expo start --tunnel`.

### `auth/api-key-not-valid`
**Causa:** `firebaseConfig.js` todavía tiene `PEGA_AQUI`.
**Solución:** poner los datos reales (ver [01](01-configuracion-firebase.md)) y recargar con `npx expo start -c`.

### `permission-denied` / `Missing or insufficient permissions`
**Causas posibles:**
1. No se publicaron las reglas de [`firestore.rules`](../firestore.rules).
2. *(Ya corregido en el código)* Al crear la pareja, la pantalla principal leía antes de que el servidor terminara de guardar. Ahora `App.js` ignora las escrituras pendientes (`hasPendingWrites`) y `HomeScreen.js` reintenta los listeners cada 2 s si fallan.

### `auth/operation-not-allowed`
**Causa:** no está activado el método **Correo electrónico/contraseña** en Authentication.
