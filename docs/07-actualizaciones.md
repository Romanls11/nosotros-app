# 07 · Actualizaciones sin recompilar (EAS Update)

> Estado: **configurado (v0.3.0)**. Se activa a partir del primer APK que incluya `expo-updates`.

## Para qué sirve
Un build en la nube (fila gratuita) puede tardar más de una hora. Con **EAS Update**:
- Los cambios de **código JavaScript** (pantallas, colores, textos, lógica) se publican en 1 o 2 minutos, **sin fila y sin reinstalar**.
- Cada teléfono descarga la actualización sola al abrir la app y la aplica la siguiente vez que se abre.

## Cuándo SÍ hace falta un APK nuevo
- Al agregar una librería con código nativo (por ejemplo, cámara o una nueva librería `expo-*`).
- Al cambiar permisos, ícono, nombre o paquete en `app.json`.
- Al cambiar `version` en `app.json`: con la política `appVersion`, el *runtime* cambia y las updates viejas ya no aplican.

## Configuración (ya hecha)
- `package.json`: dependencia `expo-updates` y script `publicar`.
- `app.json`:
  - `runtimeVersion: { policy: "appVersion" }`
  - `updates.url: https://u.expo.dev/<projectId>`
- `eas.json`: cada perfil tiene su `channel` (`development`, `preview` y `production`).

## Publicar una actualización
```bash
eas update --channel preview --environment preview --message "Qué cambió"
```
o, con el atajo:
```bash
npm run publicar -- --message "Qué cambió"
```
Después, en los teléfonos: cierren y abran la app dos veces. La primera vez la descarga y la segunda la aplica.

## Flujo de trabajo recomendado
| Qué haces | Herramienta | Tiempo |
|---|---|---|
| Diseñar y probar cambios de UI | Expo Go (`npx expo start --go`) | Instantáneo |
| Mandar los cambios a los dos teléfonos | `eas update` | 1-2 min |
| Agregar algo nativo | `eas build -p android --profile preview` | Fila gratuita |
