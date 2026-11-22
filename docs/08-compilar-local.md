# 08 · Compilar el APK en tu computadora (sin fila)

La fila gratuita de EAS puede tardar más de una hora. Compilando en tu propia PC no hay fila:
la **primera vez** tarda de 15 a 25 minutos (descarga herramientas) y **las siguientes**, de 3 a 6 minutos.

> Recuerda: para cambios solo de código JS no hace falta compilar; usa `npm run publicar` (ver [07](07-actualizaciones.md)).

## 1. Instalar Android Studio (una sola vez)
1. Descarga **Android Studio** de <https://developer.android.com/studio> e instálalo con las opciones por defecto.
2. Ábrelo y completa el asistente (*Standard*). Acepta las licencias. Descarga el Android SDK (unos 3-5 GB).
3. Ciérralo. No hace falta abrirlo para compilar.

## 2. Variables de entorno (una sola vez)
En **PowerShell**:
```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```
**Cierra y vuelve a abrir la terminal** y comprueba:
```powershell
echo $env:ANDROID_HOME
& "$env:JAVA_HOME\bin\java" -version
```

## 3. Usar una ruta corta (importante en Windows)
Windows falla con rutas de más de 260 caracteres, y la carpeta `Desktop\Claude Code Test\...` es muy larga para la compilación nativa.
Clona el repositorio en una ruta corta:
```powershell
git config --global core.longpaths true
mkdir C:\dev
cd C:\dev
git clone https://github.com/Romanls11/nosotros-app.git nosotros
cd nosotros
npm install
```
Para las siguientes veces, solo actualiza:
```powershell
cd C:\dev\nosotros
git pull
npm install
```

## 4. Compilar
```powershell
npx expo prebuild --platform android --clean
cd android
.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
cd ..
```
- `prebuild` genera la carpeta `android/` (está en `.gitignore`, no se sube).
- `-PreactNativeArchitectures=arm64-v8a` compila solo para teléfonos modernos de 64 bits, que son casi todos, y reduce mucho el tiempo.

El APK queda en:
```
C:\dev\nosotros\android\app\build\outputs\apk\release\app-release.apk
```
Mándalo por WhatsApp o Drive a los teléfonos, o cópialo por USB.

## ⚠️ Firma: la primera vez hay que desinstalar
El APK local se firma con una llave distinta a la de EAS. Android no deja instalar "encima" una app con otra firma (sale *"No se instaló la app"*):
1. **Desinstala** la versión anterior de Nosotros en cada teléfono. Los datos están en Firebase, así que no se pierde nada.
2. Instala el APK nuevo.
3. De ahí en adelante, los APK locales sí se instalan encima.

Si vuelves a usar `eas build`, pasa lo mismo al revés. Elige un método y quédate con él.

## Notificaciones y actualizaciones
- Funcionan igual: la clave FCM está en tu proyecto de Expo y `google-services.json` se incluye al hacer `prebuild`.
- El canal de actualizaciones (`preview`) va en `app.json` → `updates.requestHeaders`, así que `npm run publicar` también llega a los APK locales.

## Errores comunes
| Error | Solución |
|---|---|
| `SDK location not found` | Revisa `ANDROID_HOME` y vuelve a abrir la terminal |
| `JAVA_HOME is not set` / versión de Java incorrecta | Revisa `JAVA_HOME` (debe apuntar a `Android Studio\jbr`) |
| `Filename longer than 260 characters` / errores de CMake | Usa la ruta corta `C:\dev\nosotros` |
| `ninja: error: mkdir(...): No such file or directory` | Rutas largas: activa `LongPathsEnabled` y reemplaza `ninja.exe` por la 1.12+ (ver abajo) |
| Se queda mucho en `Downloading...` la primera vez | Es normal: descarga Gradle, NDK y dependencias |

## Solución: rutas largas en Windows (error `ninja: error: mkdir`)
El `ninja.exe` que trae CMake 3.22.1 no soporta rutas de más de 260 caracteres, y React Native las genera aunque el proyecto esté en `C:\dev`.

1. PowerShell **como administrador**:
```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```
2. Reiniciar la PC.
3. Reemplazar `ninja.exe` por la versión 1.12.1 (PowerShell normal):
```powershell
$ninja = "$env:LOCALAPPDATA\Android\Sdk\cmake\3.22.1\bin\ninja.exe"
Copy-Item $ninja "$ninja.bak"
Invoke-WebRequest https://github.com/ninja-build/ninja/releases/download/v1.12.1/ninja-win.zip -OutFile "$env:TEMP\ninja.zip"
Expand-Archive "$env:TEMP\ninja.zip" -DestinationPath "$env:TEMP\ninja" -Force
Copy-Item "$env:TEMP\ninja\ninja.exe" $ninja -Force
& $ninja --version   # debe decir 1.12.1
```
4. Limpiar y compilar:
```powershell
cd C:\dev\nosotros\android
Remove-Item -Recurse -Force app\.cxx, app\build -ErrorAction SilentlyContinue
.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```
