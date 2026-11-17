# 06 · Generar el APK

> Estado: **pendiente.**

Un APK permite instalar la app en los dos teléfonos como una app normal, sin Expo Go y sin tener la computadora prendida.
Se compila en la nube con **EAS Build**, que tiene plan gratuito.

## Pasos
```bash
npm install -g eas-cli     # instalar la herramienta
eas login                  # cuenta gratuita de expo.dev
eas build:configure        # crea eas.json
```

En `eas.json`, dentro del perfil `preview`, agrega:
```json
"preview": {
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```

Compila:
```bash
eas build -p android --profile preview
```

Al terminar (entre 10 y 20 minutos, en la fila gratuita), EAS da un **enlace de descarga**. Ábranlo en cada teléfono e instalen el APK. Android pedirá permitir "instalar apps de origen desconocido".

## Actualizar la app después
- **Cambios solo de código JS**: se pueden mandar sin reinstalar, con `eas update`.
- **Cambios nativos** (por ejemplo, agregar notificaciones): hay que generar un APK nuevo.
