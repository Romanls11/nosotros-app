# 06 · Generar el APK

> Estado: **pendiente.**

Un APK permite instalar la app en los dos teléfonos como una app normal, sin Expo Go y sin tener la computadora prendida.
Se compila en la nube con **EAS Build**, que tiene plan gratuito.

## Pasos
```bash
npm install -g eas-cli     # instalar la herramienta
eas login                  # cuenta gratuita de expo.dev
eas init                   # vincula el proyecto (agrega el projectId)
```

`eas.json` ya viene configurado en el repositorio, con los perfiles `development` y `preview`, y los dos generan APK.

Antes de compilar, `google-services.json` tiene que estar en la raíz del proyecto (ver [05](05-notificaciones.md)).

Compila:
```bash
eas build -p android --profile preview
```

Al terminar (entre 10 y 20 minutos, en la fila gratuita), EAS da un **enlace de descarga**. Ábranlo en cada teléfono e instalen el APK. Android pedirá permitir "instalar apps de origen desconocido".

## Actualizar la app después
- **Cambios solo de código JS**: se pueden mandar sin reinstalar, con `eas update`.
- **Cambios nativos** (por ejemplo, agregar notificaciones): hay que generar un APK nuevo.
