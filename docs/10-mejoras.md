# 10 · Plan de mejoras (app moderna)

Se implementan **una por una**. Cada una se publica con `npm run publicar`, salvo que necesite algo nativo.

| # | Mejora | Estado | Versión |
|---|---|---|---|
| 1 | ☀️ **Pregunta del día** + racha 🔥 | ✅ Hecha | 0.4.0 |
| 2 | 🌙 Modo oscuro (paleta ciruela) | ✅ Hecha | 0.5.0 |
| 3 | 👆 Deslizar tarjetas para responder o posponer | ✅ Hecha | 0.6.0 |
| 4 | 😍 Reacciones y mini chat por pregunta | ✅ Hecha | 0.7.0 |
| 5 | 📊 "Nuestro mapa": estadísticas visuales | ✅ Hecha | 0.8.0 |
| 6 | 🏷️ Categorías con color (profundas, divertidas, futuro…) | ✅ Hecha | 0.9.0 |
| 7 | ⏳ Cápsula del tiempo (preguntas que se abren en una fecha) | ✅ Hecha | 1.0.0 |

## ⏸️ Pendientes por probar
- **Notificaciones push** (desde la v0.2.0). Las reglas completas se publicaron el 22-nov-2026 con la regla de tokens que faltaba. Falta confirmar en los dos teléfonos:
  1. **⚙️ Ajustes → Notificaciones** debe decir 🔔 *Activas* en ambos.
  2. Hacer una pregunta con la app cerrada en el otro teléfono y ver que llegue 💌.
  3. Si no llega: tocar la campanita y anotar en qué paso falla.
- **Opción "Sistema" del modo oscuro:** se activa con el próximo APK.

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

## 4. Reacciones y mini chat
- **Reacciones** (❤️ 😂 🥹 😮 🔥 🙏) a la respuesta de tu pareja, cuando los dos ya respondieron. Tocar la misma la quita. Tu respuesta muestra la reacción que te pusieron, con animación.
  - Se guardan en `questions/{id}.reactions[uid]`.
- **Mini chat** "💬 Platiquen sobre esto" debajo de las respuestas, con burbujas, hora, en tiempo real y máximo 500 caracteres por mensaje.
  - Se guarda en `questions/{id}/comments/{commentId}` y `commentCount` suma 1 por mensaje.
- **Tarjetas:** muestran las reacciones y el contador 💬.
- **Notificaciones:** "❤️ Román reaccionó a tu respuesta" y "💬 Román: …".
- **Reglas nuevas:** reacciones (solo la tuya), contador (solo +1) y `comments` (solo integrantes, autor = tú, de 1 a 500 caracteres). Se agregó la función `onlyMyKey()`.

## 5. Nuestro mapa
Se abre con el botón **📊** del encabezado (cuando ya hay pareja). Todo se calcula en el teléfono con las preguntas ya cargadas (`src/stats.js`), así que **no gasta lecturas extra** de Firebase.
- **Números grandes:** preguntas, respondidas juntos y % de complicidad (preguntas que respondieron los dos ÷ total).
- **Rachas:** actual 🔥 y la mejor 🏆 de preguntas del día.
- **¿Quién pregunta más?:** barra dividida en los colores de cada quien. No cuenta las preguntas del día.
- **¿Quién responde más rápido?:** tiempo promedio desde que se crea la pregunta hasta que se responde, con ⚡ para quien gana.
- **Su semana:** barras por día con las respuestas de cada quien en los últimos 7 días.
- **Lo que comparten 💛:** palabras que los dos usan en sus respuestas, sin contar palabras comunes ("que", "para"…) ni acentos.
- **Las palabras de cada quien** y **datos curiosos**: reacción favorita, mensajes del chat y respuesta más larga.
- Las barras crecen animadas y las tarjetas aparecen escalonadas. No usa librerías de gráficas.

## 6. Categorías
- **6 categorías** con color e ícono propios (`src/categories.js`): 💭 Profundas · 😂 Divertidas · 🔮 Futuro · 🧸 Infancia · 💞 Nosotros · 🌶️ Picantes.
- **Al crear una pregunta** se elige la categoría, que es opcional. Con categoría elegida, ✨ *Inspírame* sugiere ideas de esa categoría (6 a 8 por categoría).
- Se guarda en `questions/{id}.category`. No requiere cambios en las reglas.
- **Tarjetas y detalle** muestran la etiqueta de color (`CategoryPill`).
- **Filtro** en la pantalla principal, debajo de la pregunta del día. Aparece en cuanto hay preguntas con categoría, muestra cuántas hay en cada una y se combina con las pestañas.
- **Nuestro mapa** muestra la categoría favorita, y la **exportación SQL** incluye la columna `category`.
- Los colores suaves usan transparencia (`soft()`), así que se ven bien en modo claro y oscuro.

## 7. Cápsula del tiempo
- Al crear una pregunta se activa **⏳ Cápsula del tiempo** y se elige cuándo se abre: en 1 semana, 1 mes, 3 meses, 6 meses, 1 año, o **📅 otra fecha** escrita como DD/MM/AAAA (por ejemplo, su aniversario). Se abre a las 9:00 a.m. de ese día.
- Los dos pueden responder **cuando quieran**, pero la respuesta de la pareja **no se ve hasta la fecha**. La idea es escribir pensando en ese día.
- Se guarda en `questions/{id}.unlockAt` (Timestamp). Ninguna regla permite cambiarla después de crearla.
- **Tarjetas:** "⏳ Cápsula · se abre en 84 días" o "🔓 Cápsula abierta".
- **El día que se abre:** cada teléfono programa un **aviso local** (`expo-notifications`) que dice "⏳ ¡Se abrió su cápsula del tiempo!". La primera vez que la ven abierta se reproduce la animación de revelar 💞.
- **Al responder una cápsula cerrada** la pareja recibe "⏳ Román guardó su respuesta en la cápsula", sin contenido.
- Mientras está cerrada no hay reacciones ni chat. **Nuestro mapa** ignora las cápsulas cerradas para no adelantar palabras.
- Lo de no ver la respuesta lo controla la app, igual que en las preguntas normales.

---
🎉 **Plan de mejoras completo (v1.0.0).**

## Extras (v1.1 – v1.2)
| Mejora | Detalle |
|---|---|
| 👨‍💻 Acerca de | Ajustes → Información. Los datos se editan en `src/about.js`. Tocar el logo 5 veces tiene sorpresa 🥚 |
| 👋 Bienvenida | Primera vez que se abre la app (`nosotros.bienvenida` en `AsyncStorage`). Se puede repetir desde Ajustes |
| 📅 Un día como hoy | Busca preguntas creadas hace 1 año, 6 meses, 3 meses, 1 mes o 1 semana (prefiere la más antigua), que los dos respondieron y que no sean cápsulas cerradas |
| 🎲 ¿Quién es más probable que…? | v1.4. Tarjeta en la pantalla principal → juego con voto secreto, revelado, marcador de sintonía e historial. Datos en `couples/{id}/games/{gameId}` = `{ prompt, createdBy, createdAt, votes: { uid: uidElegido } }` |
| 😍 Reacciones 2.0 | v1.4. Bandeja flotante con nombres de reacción, chip de la reacción elegida e insignia con balanceo. La bandeja va en el flujo normal y no en posición absoluta, porque Android ignora toques fuera del contenedor |
| 💯 Test de compatibilidad | v1.5. 3 tests × 10 preguntas de opción múltiple (`src/compat.js`). Datos en `couples/{id}/tests/{packKey}` = `{ answers: { uid: [índices] } }`. Resultado = % de respuestas iguales; se muestra hasta que los dos terminan |
| 🧭 Navegación con barra inferior | v1.6. Cuatro pestañas (Hoy, Preguntas, Juegos y Nosotros) sin librerías de navegación: `HomeScreen` decide qué pestaña mostrar y `TabBar` es un componente propio. La pestaña *Hoy* reúne lo pendiente en "Te toca" |
