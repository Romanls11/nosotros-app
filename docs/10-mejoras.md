# 10 · Plan de mejoras (app moderna)

Se implementan **una por una**. Cada una se publica con `npm run publicar`, salvo que necesite algo nativo.

| # | Mejora | Estado | Versión |
|---|---|---|---|
| 1 | ☀️ **Pregunta del día** + racha 🔥 | ✅ Hecha | 0.4.0 |
| 2 | 🌙 Modo oscuro (paleta ciruela) | ✅ Hecha | 0.5.0 |
| 3 | 👆 Deslizar tarjetas para responder o posponer | ✅ Hecha | 0.6.0 |
| 4 | 😍 Reacciones y mini chat por pregunta | Pendiente | — |
| 5 | 📊 "Nuestro mapa": estadísticas visuales | Pendiente | — |
| 6 | 🏷️ Categorías con color (profundas, divertidas, futuro…) | Pendiente | — |
| 7 | ⏳ Cápsula del tiempo (preguntas que se abren en una fecha) | Pendiente | — |

## 1. Pregunta del día
- Una pregunta **igual para los dos**, que cambia a medianoche (hora del teléfono).
- Sale de una lista de 50 preguntas (`src/daily.js`) y la recorre en orden sin repetir. Cada pareja empieza en un punto distinto.
- Se guarda como `couples/{id}/questions/daily-AAAA-MM-DD`, con el campo `daily`. El primero que la abre la crea.
- **Racha 🔥:** días seguidos en que **los dos** respondieron. Si hoy aún no terminan, la racha sigue viva desde ayer.
- Tarjeta con degradado arriba de la lista (`src/components/DailyCard.js`), con estado ("te toca", "esperando", "¡toca para ver!").
- Las preguntas del día no se pueden borrar y aparecen con la etiqueta ☀️ en las pestañas.
- No requiere cambios en las reglas: usa la regla de crear pregunta que ya existe.

## 2. Modo oscuro
- **⚙️ Ajustes → Apariencia:** 📱 Sistema · ☀️ Claro · 🌙 Oscuro. La elección se guarda en el teléfono (`AsyncStorage`).
- **Paleta "noche ciruela":** fondo `#140C22`, tarjetas `#221638` y texto `#F6F0FF`, con los mismos acentos de la marca (rosa, violeta, sol).
- **Cómo funciona:** `src/theme.js` tiene dos paletas (`LIGHT` y `DARK`) y `applyScheme()` actualiza `colors`, `gradients`, `shadow` y `ui` en su lugar. `src/themeContext.js` decide el tema y la app se vuelve a dibujar sin perder la pantalla en la que estás.
- La barra de estado cambia a texto claro en modo oscuro.
- **"Sistema"** sigue el modo del teléfono **a partir del próximo APK** (`userInterfaceStyle: automatic` + `expo-system-ui`). Claro y Oscuro funcionan desde ya con `npm run publicar`.

## 3. Deslizar tarjetas
- **→ Derecha:** abre la pregunta ("✍️ Responder" o "👀 Ver"). Funciona en todas las pestañas.
- **← Izquierda:** "⏰ Para después", solo en *Por responder*. La tarjeta se va al final, se ve atenuada y lleva la etiqueta ⏰. Al deslizarla otra vez a la izquierda se quita.
- "Para después" se guarda **solo en tu teléfono** (`AsyncStorage`, `nosotros.despues.<uid>`). Tu pareja no lo ve.
- Hay vibración al cruzar el punto de acción y el fondo de la tarjeta muestra la acción que se va a hacer.
- Una pista 👆 aparece la primera vez y desaparece al usarla o al tocar ✕.
- Está hecho con `PanResponder` y `Animated` (`src/components/SwipeRow.js`), sin librerías nativas, así que se puede publicar con `npm run publicar`.
