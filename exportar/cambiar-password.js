/**
 * Herramienta de administrador para cuentas de "Nosotros".
 * Usa la misma clave serviceAccount.json que el exportador SQL.
 *
 * Ver los correos registrados:
 *   node cambiar-password.js --lista
 *
 * Poner una contraseña nueva a una cuenta:
 *   node cambiar-password.js correo@ejemplo.com NuevaContraseña123
 */
const path = require('path');
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const keyPath = path.join(__dirname, 'serviceAccount.json');
if (!fs.existsSync(keyPath)) {
  console.error('No encontré serviceAccount.json en la carpeta "exportar".');
  process.exit(1);
}
initializeApp({ credential: cert(require(keyPath)) });
const auth = getAuth();

const [, , arg1, arg2] = process.argv;

(async () => {
  if (arg1 === '--lista' || !arg1) {
    const { users } = await auth.listUsers(100);
    console.log(`Cuentas registradas (${users.length}):`);
    for (const u of users) {
      const last = u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime).toLocaleString('es-MX') : 'nunca';
      console.log(`  - ${u.email}  (${u.displayName || 'sin nombre'}, último acceso: ${last})`);
    }
    if (!arg1) console.log('\nPara cambiar una contraseña: node cambiar-password.js correo NuevaContraseña');
    process.exit(0);
  }

  const email = arg1.trim();
  const password = arg2;
  if (!password || password.length < 6) {
    console.error('❌ La contraseña nueva debe tener al menos 6 caracteres.');
    process.exit(1);
  }
  const user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password });
  console.log(`✅ Contraseña actualizada para ${email}. Ya puedes iniciar sesión en la app.`);
  process.exit(0);
})().catch((e) => {
  const msg = e.code === 'auth/user-not-found' ? 'No existe una cuenta con ese correo. Usa --lista para verlas.' : e.message;
  console.error('❌', msg);
  process.exit(1);
});
