# Nosotros 💞: guía rápida

Carpeta de trabajo: `C:\Users\roman\Desktop\Claude Code Test\app-pareja` (aquí editas)
Carpeta de compilación: `C:\dev\nosotros` (aquí se genera el APK)

---

## 1. Probar cambios rápido (Expo Go)
```powershell
cd "C:\Users\roman\Desktop\Claude Code Test\app-pareja"
npx expo start --go
```
Escanea el QR **desde Expo Go**. En Expo Go no hay notificaciones push.

## 2. Guardar cambios en GitHub
```powershell
cd "C:\Users\roman\Desktop\Claude Code Test\app-pareja"
git add .
git commit -m "Qué cambié"
git push
```

## 3. Mandar cambios a los teléfonos SIN compilar
Para cambios de pantallas, colores, textos o lógica:
```powershell
cd "C:\Users\roman\Desktop\Claude Code Test\app-pareja"
npm run publicar -- --message "Qué cambié"
```
En los teléfonos: cierren y abran la app **dos veces**.

## 4. Compilar el APK
Solo cuando se agrega algo nativo (librerías `expo-*` nuevas, permisos, ícono o nombre).
```powershell
# 1) Subir cambios (paso 2) y traerlos a la carpeta de compilación
cd C:\dev\nosotros
git reset --hard   # descarta cambios locales (esta carpeta solo es para compilar)
git pull
npm install

# 2) Generar y compilar
npx expo prebuild --platform android --clean
cd android
.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```
APK listo en: `C:\dev\nosotros\android\app\build\outputs\apk\release\app-release.apk`
Mándalo por WhatsApp o Drive y se instala **encima**.

## 5. Cambiar las reglas de Firebase
Cuando cambie `firestore.rules`: cópialo completo → **Firebase → Firestore → Reglas → Publicar**.

## 6. Olvidé mi contraseña
- **En la app:** Entrar → escribe tu correo → **¿Olvidaste tu contraseña?**
- **Desde la PC:**
```powershell
cd "C:\Users\roman\Desktop\Claude Code Test\app-pareja\exportar"
node cambiar-password.js --lista                       # ver correos
node cambiar-password.js correo@ejemplo.com Nueva123   # poner contraseña nueva
```

## 7. Exportar a SQL
- **En la app:** ⚙️ Ajustes → Exportar a SQL.
- **Desde la PC:**
```powershell
cd "C:\Users\roman\Desktop\Claude Code Test\app-pareja\exportar"
node export-sql.js            # MySQL
node export-sql.js postgres   # PostgreSQL
```

---

## Configuración inicial (ya hecha, solo en una PC nueva)
1. Instalar **Node LTS**, **Git** y **Android Studio** (asistente *Standard*).
2. Variables de entorno:
```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```
3. Rutas largas: PowerShell **como administrador**, y después reiniciar:
```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```
4. Ninja 1.12.1 (después de compilar una vez, para que exista la carpeta `cmake`):
```powershell
$ninja = "$env:LOCALAPPDATA\Android\Sdk\cmake\3.22.1\bin\ninja.exe"
Invoke-WebRequest https://github.com/ninja-build/ninja/releases/download/v1.12.1/ninja-win.zip -OutFile "$env:TEMP\ninja.zip"
Expand-Archive "$env:TEMP\ninja.zip" -DestinationPath "$env:TEMP\ninja" -Force
Copy-Item "$env:TEMP\ninja\ninja.exe" $ninja -Force
```
5. Clonar la carpeta de compilación:
```powershell
git config --global core.longpaths true
mkdir C:\dev; cd C:\dev
git clone https://github.com/Romanls11/nosotros-app.git nosotros
```
6. Expo (para publicar actualizaciones): `npm install -g eas-cli` y luego `eas login`.
7. `exportar\serviceAccount.json`: Firebase → ⚙️ Configuración → Cuentas de servicio → Generar clave. ⚠️ Es secreta.

## Si algo falla
| Error | Qué hacer |
|---|---|
| `SDK location not found` | `$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"` |
| `ninja: error: mkdir` | Pasos 3 y 4 de la configuración inicial, luego borrar `android\app\.cxx` |
| "No se instaló la app" | Desinstala la versión anterior (firma distinta) y vuelve a instalar |
| `permission-denied` | Publicar las reglas (paso 5) |
| Un cambio no se ve en Expo Go | `npx expo start --go -c` |
| El APK sale igual que antes | En `C:\dev\nosotros`: `git reset --hard` y `git pull` antes de compilar |

Guía detallada: carpeta `docs/`.
