# 10 · Plan de mejoras (app moderna)

Se implementan **una por una**. Cada una se publica con `npm run publicar`, salvo que necesite algo nativo.

| # | Mejora | Estado | Versión |
|---|---|---|---|
| 1 | ☀️ **Pregunta del día** + racha 🔥 | ✅ Hecha | 0.4.0 |
| 2 | 🌙 Modo oscuro (paleta ciruela) | Pendiente | — |
| 3 | 👆 Deslizar tarjetas para responder o posponer | Pendiente | — |
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
