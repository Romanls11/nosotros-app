# 03 · Arquitectura

## Visión general

```
┌──────────────┐        ┌──────────────────────────┐        ┌──────────────┐
│  Teléfono A  │◄──────►│         Firebase         │◄──────►│  Teléfono B  │
│  (Expo app)  │  SDK   │  Auth  +  Firestore      │  SDK   │  (Expo app)  │
└──────────────┘  JS    │  (reglas de seguridad)   │  JS    └──────────────┘
                        └──────────────────────────┘
```

No hay backend propio: la app habla directo con Firebase, y las **reglas de Firestore** son las que deciden quién puede leer o escribir cada cosa.
Los teléfonos se enteran de los cambios al instante gracias a los *listeners* en tiempo real (`onSnapshot`).

## Flujo de pantallas (`App.js`)

```
¿Sesión iniciada? ── no ──► AuthScreen (login / registro)
        │ sí
        ▼
¿Tiene coupleId?  ── no ──► PairScreen (crear pareja / unirse con código)
        │ sí
        ▼
   HomeScreen (preguntas + pestañas)
```

- La sesión se guarda en el teléfono con `AsyncStorage` (`getReactNativePersistence`), así que no hay que volver a iniciar sesión cada vez.
- `App.js` escucha el documento `users/{uid}`. Cuando aparece un `coupleId` **confirmado por el servidor**, pasa a `HomeScreen`. Las escrituras pendientes se ignoran para evitar errores de permisos.

## Modelo de datos (Firestore)

```
users/{uid}
  name: string
  coupleId: string | null
  createdAt: timestamp

invites/{CODIGO}                      ← el ID del documento es el código (ej. "K7M2QX")
  coupleId: string
  createdBy: uid

couples/{coupleId}
  members: [uidA, uidB]               ← máximo 2
  names: { uidA: "Román", uidB: "..." }
  inviteCode: "K7M2QX"
  createdAt: timestamp

couples/{coupleId}/questions/{questionId}
  text: string
  authorId: uid
  createdAt: timestamp
  answers: {
    uidA: { text: string, answeredAt: timestamp },
    uidB: { text: string, answeredAt: timestamp }
  }
```

### ¿Por qué así?
- **Las preguntas cuelgan de la pareja**, así las reglas comprueban de una sola vez que eres integrante.
- **Las respuestas van en un mapa dentro de la pregunta:** una sola lectura trae la pregunta con las dos respuestas, lo que ahorra lecturas del plan gratuito.
- **`invites/{CODIGO}`** permite unirse sin dejar que nadie *liste* las parejas: solo se puede consultar un código exacto.

## Vinculación de pareja

**Crear** (`createCouple`), en un solo *batch* atómico:
1. Crea `couples/{id}` con `members: [yo]` y un código aleatorio de 6 caracteres (sin O/0 ni I/1 para que no se confundan).
2. Crea `invites/{código}`.
3. Guarda `coupleId` en `users/{yo}`.

**Unirse** (`joinCouple`):
1. Lee `invites/{código}`. Si no existe, el código es incorrecto.
2. Hace `arrayUnion(yo)` en `couples/{id}.members`. Las reglas solo lo permiten si había **exactamente 1** integrante, así que un código ya usado no sirve.
3. Guarda `coupleId` en `users/{yo}`.

**Desvincularse** (`leaveCouple`), en un *batch* atómico:
1. Quita tu uid de `members` (`arrayRemove`) y borra tu token de `tokens`.
2. Pone `coupleId: null` en `users/{yo}`, y la app regresa a la pantalla de vincular.

Las preguntas **se quedan** en la pareja, así que tu pareja las conserva. Como la pareja vuelve a tener 1 integrante, cualquiera puede unirse otra vez con el mismo código, incluido tú.

## Reglas de seguridad explicadas

| Colección | Leer | Crear | Modificar | Borrar |
|---|---|---|---|---|
| `users/{uid}` | solo el dueño | solo el dueño | solo el dueño | solo el dueño |
| `invites/{código}` | cualquier usuario con sesión, pero solo por código exacto (`get`, no `list`) | quien la crea (`createdBy` = yo) | ❌ | ❌ |
| `couples/{id}` | integrantes | solo con `members == [yo]` | **unirse:** 1 integrante → agregarme a mí · **token:** solo el mío · **salir:** quitarme a mí y mi token | ❌ |
| `questions/{id}` | integrantes | integrantes, con `authorId` = yo y `answers` vacío | integrantes, **solo su propia respuesta** | solo el autor |

La regla clave de las respuestas:
```
request.resource.data.answers.diff(resource.data.answers).affectedKeys().hasOnly([request.auth.uid])
```
Significa que solo puedes agregar o cambiar la entrada del mapa `answers` que lleva tu propio uid. No puedes escribir ni borrar la respuesta de tu pareja.

### Limitación conocida
Lo de **"no ver la respuesta del otro hasta responder"** lo controla la app, no las reglas: como los dos son integrantes, técnicamente ambos pueden leer la pregunta completa. Para una app entre dos personas es aceptable. Hacerlo estricto requeriría guardar cada respuesta en un documento aparte con reglas más complejas.
