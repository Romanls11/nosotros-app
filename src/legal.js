// Textos legales de "nosotros". Este archivo es la ÚNICA fuente:
// la app los muestra y `npm run legales` genera PRIVACIDAD.md y TERMINOS.md para GitHub.
// Si cambias algo importante, sube LEGAL.version para pedir de nuevo el consentimiento.

export const LEGAL = {
  version: '2026-11-22',
  updated: '22 de noviembre de 2026',
  app: 'nosotros',
  owner: 'Román Luna Soto',
  ownerType: 'persona física',
  // La ley pide el domicilio del responsable. Puedes poner uno completo (o de oficina) para recibir notificaciones.
  address: 'Huatusco, Veracruz, México',
  email: 'romanls.sistemasc@gmail.com',
  repo: 'https://github.com/Romanls11/nosotros-app',
  minAge: 18,
};

const L = LEGAL;

export const PRIVACY = {
  title: 'Aviso de Privacidad Integral',
  intro: `En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (publicada en el DOF el 20 de marzo de 2025), se emite el presente Aviso de Privacidad de la aplicación "${L.app}".`,
  sections: [
    {
      title: '1. Responsable',
      body: `${L.owner}, ${L.ownerType}, con domicilio en ${L.address}, es responsable del tratamiento de tus datos personales.\nContacto para cualquier asunto de privacidad: ${L.email}`,
    },
    {
      title: '2. Datos personales que tratamos',
      body: `• Identificación y contacto: nombre (o apodo) y correo electrónico.\n• Autenticación: contraseña (se guarda cifrada por el proveedor; el responsable nunca la conoce).\n• Contenido que tú escribes: preguntas, respuestas, reacciones, mensajes del chat y fechas de cápsulas del tiempo.\n• Datos técnicos: identificador de cuenta, identificador de notificaciones del dispositivo (token) y fechas de creación o respuesta.\n• Preferencias guardadas solo en tu teléfono: tema claro u oscuro, preguntas "para después" y si ya viste la bienvenida.\n\nNo recabamos ubicación, contactos, fotografías, datos financieros ni datos biométricos. La app no usa publicidad, cookies de rastreo ni herramientas de analítica.`,
    },
    {
      title: '3. Datos personales sensibles',
      body: `La app no te pide datos sensibles. Sin embargo, por su naturaleza (preguntas personales entre pareja), tú podrías escribir voluntariamente información sensible en tus respuestas o mensajes (por ejemplo, sobre salud, creencias, vida sexual o emociones).\n\nPara ello solicitamos tu consentimiento expreso y por escrito por medio electrónico: al crear tu cuenta marcas la casilla de aceptación y la app registra la fecha y versión del aviso aceptado, vinculadas a tu cuenta autenticada. Esa información solo la verá tu pareja vinculada y se usa únicamente para mostrarla dentro de la app.`,
    },
    {
      title: '4. Finalidades',
      body: `Finalidades necesarias (indispensables para el servicio):\n• Crear y administrar tu cuenta e iniciar sesión.\n• Vincularte con tu pareja mediante un código.\n• Guardar y mostrar preguntas, respuestas, reacciones, mensajes y cápsulas del tiempo entre tú y tu pareja.\n• Enviarte notificaciones sobre la actividad de tu pareja (si las permites).\n• Permitirte exportar tu información y atender tus solicitudes de derechos.\n\nNo existen finalidades secundarias: tus datos no se usan para mercadotecnia, publicidad, perfilamiento ni se venden.`,
    },
    {
      title: '5. Quién ve tus datos',
      body: `• Tu pareja vinculada: ve tus preguntas, respuestas (según las reglas de la app), reacciones y mensajes.\n• El responsable: solo accede a la información cuando sea necesario para mantenimiento técnico, seguridad o para atender una solicitud tuya.\n• Nadie más dentro de la app puede ver tu contenido; el acceso está restringido con reglas de seguridad en la base de datos.`,
    },
    {
      title: '6. Proveedores (encargados) y transferencias',
      body: `Para funcionar, la app usa proveedores que tratan datos por cuenta del responsable, con servidores que pueden ubicarse fuera de México (principalmente en Estados Unidos):\n• Google Firebase (Google LLC): autenticación y base de datos (Cloud Firestore).\n• Expo (650 Industries, Inc.): envío de notificaciones push y actualizaciones de la app. El texto de la notificación (por ejemplo, el inicio de una pregunta) pasa por este servicio.\n\nEstos proveedores actúan como encargados y no usan tus datos para fines propios. No realizamos transferencias de datos a terceros para sus propias finalidades. Solo compartiremos información si una autoridad competente lo requiere conforme a la ley.`,
    },
    {
      title: '7. Conservación y eliminación',
      body: `Conservamos tus datos mientras tu cuenta esté activa. Puedes eliminar tu cuenta en cualquier momento desde Ajustes → Eliminar mi cuenta: se borran tu cuenta, tu perfil, tus respuestas, reacciones y mensajes, y sales de la pareja. Las preguntas que escribiste se conservan sin tu nombre para no borrar las respuestas de tu pareja; si quieres que también se eliminen, solicítalo por correo.\n\nAl desvincularte de tu pareja, tus respuestas anteriores permanecen visibles para ella mientras no elimines tu cuenta. Las copias técnicas de los proveedores pueden tardar algunos días en borrarse por completo.`,
    },
    {
      title: '8. Tus derechos ARCO y revocación del consentimiento',
      body: `Tienes derecho a Acceder a tus datos, Rectificarlos, Cancelarlos u Oponerte a su tratamiento, así como a revocar tu consentimiento.\n\nCómo ejercerlos:\n• Desde la app: puedes editar tu respuesta (rectificación), exportar tu información (acceso), desvincularte o eliminar tu cuenta (cancelación y revocación).\n• Por correo a ${L.email}, con el asunto "Derechos ARCO", indicando: tu nombre, el correo de tu cuenta, el derecho que deseas ejercer y una descripción clara de lo que solicitas. Podremos pedirte información adicional para confirmar tu identidad.\n\nTe responderemos en un plazo máximo de 20 días hábiles y, si procede, lo haremos efectivo dentro de los 15 días hábiles siguientes. Estos plazos podrán ampliarse una sola vez por un periodo igual cuando se justifique. El ejercicio de estos derechos es gratuito.`,
    },
    {
      title: '9. Cómo limitar el uso de tus datos',
      body: `• Puedes desactivar las notificaciones desde los ajustes de tu teléfono.\n• Tú decides qué escribir: evita compartir información que no quieras que tu pareja conozca.\n• Puedes desvincularte de tu pareja o eliminar tu cuenta en cualquier momento.`,
    },
    {
      title: '10. Seguridad',
      body: `Aplicamos medidas razonables de seguridad: conexión cifrada, contraseñas administradas por Firebase Authentication y reglas de acceso que solo permiten a los dos integrantes de una pareja leer y escribir su información. Ningún sistema es 100% infalible; si ocurre una vulneración que afecte de forma significativa tus derechos, te lo informaremos a la brevedad.`,
    },
    {
      title: '11. Menores de edad',
      body: `La app está dirigida exclusivamente a personas mayores de ${L.minAge} años. Si eres menor de edad, no debes usarla. Si detectamos una cuenta de un menor, la eliminaremos.`,
    },
    {
      title: '12. Cambios a este aviso',
      body: `Cualquier cambio se publicará dentro de la app (Ajustes → Aviso de privacidad) y en ${L.repo}. Si el cambio es relevante, la app te pedirá aceptarlo de nuevo antes de seguir usándola.`,
    },
    {
      title: '13. Autoridad',
      body: `Si consideras que tu derecho a la protección de datos personales ha sido vulnerado, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno, autoridad en materia de protección de datos personales en posesión de particulares.`,
    },
  ],
};

export const TERMS = {
  title: 'Términos y Condiciones de Uso',
  intro: `Estos términos regulan el uso de la aplicación "${L.app}", desarrollada por ${L.owner}. Al crear una cuenta aceptas estos términos y el Aviso de Privacidad.`,
  sections: [
    {
      title: '1. Qué es la app',
      body: `"${L.app}" es una aplicación gratuita para que dos personas se hagan preguntas, las respondan y conserven sus respuestas. Se ofrece sin fines comerciales y "tal cual", y puede cambiar, actualizarse o dejar de estar disponible.`,
    },
    {
      title: '2. Requisitos',
      body: `• Ser mayor de ${L.minAge} años.\n• Proporcionar datos verdaderos y un correo al que tengas acceso.\n• Mantener tu contraseña en secreto. Eres responsable de lo que se haga con tu cuenta.`,
    },
    {
      title: '3. Uso aceptable',
      body: `Te comprometes a no:\n• Usar la app para acosar, amenazar, extorsionar o dañar a otra persona.\n• Compartir contenido ilegal, o información o imágenes de terceros sin su consentimiento.\n• Intentar acceder a cuentas o datos ajenos, vulnerar la seguridad o hacer un uso abusivo del servicio.\n\nPodremos suspender o eliminar cuentas que incumplan estos términos.`,
    },
    {
      title: '4. Tu contenido',
      body: `Lo que escribes es tuyo. Nos das permiso únicamente para guardarlo, mostrarlo a tu pareja vinculada y procesarlo técnicamente para que la app funcione. Tú eres responsable de lo que decides compartir con tu pareja.`,
    },
    {
      title: '5. Pareja vinculada',
      body: `Vincularte con otra persona significa que verá lo que respondas y escribas en la app. Si la relación cambia, puedes desvincularte desde Ajustes. Las respuestas que ya compartiste permanecen visibles para la otra persona hasta que elimines tu cuenta.`,
    },
    {
      title: '6. Disponibilidad y responsabilidad',
      body: `Hacemos un esfuerzo razonable para que la app funcione bien, pero no garantizamos que esté libre de errores o interrupciones, ni que la información nunca se pierda. Te recomendamos usar la opción de exportar si quieres un respaldo. En la medida que lo permita la ley, el desarrollador no será responsable por daños indirectos derivados del uso de la app ni por el contenido que los usuarios compartan entre sí.`,
    },
    {
      title: '7. Código abierto',
      body: `El código fuente se publica bajo la licencia MIT en ${L.repo}. Esa licencia aplica al código, no a tus datos ni a tu contenido.`,
    },
    {
      title: '8. Cancelación',
      body: `Puedes dejar de usar la app y eliminar tu cuenta en cualquier momento desde Ajustes → Eliminar mi cuenta.`,
    },
    {
      title: '9. Cambios',
      body: `Podemos actualizar estos términos. Te avisaremos dentro de la app y, si el cambio es relevante, te pediremos aceptarlo de nuevo.`,
    },
    {
      title: '10. Ley aplicable y contacto',
      body: `Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los tribunales competentes de Huatusco, Veracruz, salvo que la ley disponga otra cosa.\nContacto: ${L.email}`,
    },
  ],
};
