# 11 · Privacidad y aspectos legales

> ⚠️ Estos textos se redactaron con base en la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares** (nueva ley, DOF 20-mar-2025), pero **no sustituyen la revisión de un abogado**. Si la app crece o se publica en tiendas, conviene que un especialista los revise.

## Documentos
| Documento | En la app | En GitHub |
|---|---|---|
| Aviso de Privacidad Integral | Ajustes → Aviso de privacidad | [`PRIVACIDAD.md`](../PRIVACIDAD.md) |
| Términos y Condiciones | Ajustes → Términos y condiciones | [`TERMINOS.md`](../TERMINOS.md) |

**Una sola fuente:** los textos viven en `src/legal.js`. La app los lee de ahí, y `npm run legales` vuelve a generar los `.md`.

## Qué pide la ley y cómo se cumple
| Requisito (art. 15 LFPDPPP) | Dónde |
|---|---|
| Identidad y domicilio del responsable | Sección 1 (`LEGAL.owner` y `LEGAL.address`) |
| Datos que se tratan, indicando los sensibles | Secciones 2 y 3 |
| Finalidades, distinguiendo las que requieren consentimiento | Sección 4 (solo finalidades necesarias, sin secundarias) |
| Opciones para limitar el uso | Sección 9 |
| Medios para ejercer derechos ARCO | Sección 8 (en la app y por correo; 20 días hábiles para responder y 15 para hacerlo efectivo) |
| Cómo se avisan los cambios | Sección 12 (en la app + nuevo consentimiento si el cambio es relevante) |

### Datos sensibles (art. 8)
Las respuestas pueden contener datos sensibles que la persona escriba de forma voluntaria, así que se pide **consentimiento expreso por medio electrónico**:
- Al registrarse: casilla obligatoria (`ConsentCheck`) que incluye mayoría de edad, términos, aviso y datos sensibles.
- Se guarda `users/{uid}.privacyVersion` y `privacyAcceptedAt`, ligados a la cuenta autenticada.
- Las cuentas que no han aceptado la versión vigente ven `ConsentScreen` antes de entrar. Si se cambia `LEGAL.version`, se vuelve a pedir a todos.

### Derecho de cancelación: Eliminar mi cuenta
En **Ajustes → Eliminar mi cuenta** (`DeleteAccountModal` → `deleteMyAccount()`):
1. Pide la contraseña (reautenticación) y escribir **ELIMINAR**.
2. Borra tus respuestas, reacciones y mensajes del chat.
3. Te saca de la pareja y borra tu token y tu nombre.
4. Borra `users/{uid}` y la cuenta de Firebase Authentication.

Las preguntas que escribiste se quedan sin tu nombre, para no borrar las respuestas de tu pareja; esto está explicado en el aviso. Google Play también exige poder borrar la cuenta desde la app.

### Reglas de Firestore actualizadas
- `invites`: quien creó el código lo puede borrar.
- Salir de la pareja ahora también permite borrar **solo tu** entrada de `names`.

## Pendientes recomendados
- [ ] **Domicilio completo** en `src/legal.js` → `LEGAL.address`. La ley pide "identidad y domicilio". Puede ser un domicilio para recibir notificaciones, como una oficina.
- [ ] Revisión por un abogado si la app se distribuye a más personas o se publica en tiendas.
- [ ] En Firebase: aceptar los términos de procesamiento de datos de Google Cloud (*Configuración del proyecto → Privacidad*).
- [ ] Para Play Store: usar como URL de privacidad `https://github.com/Romanls11/nosotros-app/blob/main/PRIVACIDAD.md`.

## Nota sobre "uso personal"
El artículo 1 de la ley excluye el tratamiento que sea *"para uso exclusivamente personal, y sin fines de divulgación o utilización comercial"*. Mientras la usen solo ustedes dos, eso podría aplicar. Aun así, tener el aviso y los mecanismos listos es lo correcto y protege a cualquiera que la use.
