/**
 * Exporta los datos de Firestore (app "Nosotros") a un archivo .sql
 *
 * Uso:
 *   node export-sql.js            -> MySQL (por defecto)
 *   node export-sql.js postgres   -> PostgreSQL
 *
 * Requiere el archivo serviceAccount.json en esta misma carpeta
 * (Firebase → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada).
 * ⚠️ Esa clave da acceso total a tu proyecto: no la compartas ni la subas a GitHub.
 */
const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const dialect = (process.argv[2] || 'mysql').toLowerCase();
if (!['mysql', 'postgres'].includes(dialect)) {
  console.error('Dialecto no válido. Usa: mysql o postgres');
  process.exit(1);
}

const keyPath = path.join(__dirname, 'serviceAccount.json');
if (!fs.existsSync(keyPath)) {
  console.error('No encontré serviceAccount.json en la carpeta "exportar".');
  console.error('Descárgalo de Firebase → Configuración del proyecto → Cuentas de servicio.');
  process.exit(1);
}

initializeApp({ credential: cert(require(keyPath)) });
const db = getFirestore();

// ---------- Helpers SQL ----------
const q = (name) => (dialect === 'mysql' ? `\`${name}\`` : `"${name}"`);

function str(v) {
  if (v === null || v === undefined) return 'NULL';
  let s = String(v).replace(/'/g, "''");
  if (dialect === 'mysql') s = s.replace(/\\/g, '\\\\');
  return `'${s}'`;
}

function ts(v) {
  if (!v || typeof v.toDate !== 'function') return 'NULL';
  // 'YYYY-MM-DD HH:MM:SS' en UTC
  return `'${v.toDate().toISOString().slice(0, 19).replace('T', ' ')}'`;
}

function insert(table, cols, rows) {
  if (!rows.length) return `-- (sin datos en ${table})\n`;
  const header = `INSERT INTO ${q(table)} (${cols.map(q).join(', ')}) VALUES\n`;
  return header + rows.map((r) => `  (${r.join(', ')})`).join(',\n') + ';\n';
}

// ---------- Esquema ----------
const schema = `
DROP TABLE IF EXISTS ${q('answers')};
DROP TABLE IF EXISTS ${q('questions')};
DROP TABLE IF EXISTS ${q('users')};
DROP TABLE IF EXISTS ${q('couples')};

CREATE TABLE ${q('couples')} (
  ${q('id')}          VARCHAR(64) PRIMARY KEY,
  ${q('invite_code')} VARCHAR(16),
  ${q('created_at')}  TIMESTAMP NULL
);

CREATE TABLE ${q('users')} (
  ${q('id')}        VARCHAR(128) PRIMARY KEY,
  ${q('name')}      VARCHAR(255),
  ${q('couple_id')} VARCHAR(64) NULL,
  FOREIGN KEY (${q('couple_id')}) REFERENCES ${q('couples')}(${q('id')})
);

CREATE TABLE ${q('questions')} (
  ${q('id')}         VARCHAR(64) PRIMARY KEY,
  ${q('couple_id')}  VARCHAR(64) NOT NULL,
  ${q('author_id')}  VARCHAR(128),
  ${q('category')}   VARCHAR(32),
  ${q('text')}       TEXT NOT NULL,
  ${q('created_at')} TIMESTAMP NULL,
  FOREIGN KEY (${q('couple_id')}) REFERENCES ${q('couples')}(${q('id')})
);

CREATE TABLE ${q('answers')} (
  ${q('question_id')} VARCHAR(64) NOT NULL,
  ${q('user_id')}     VARCHAR(128) NOT NULL,
  ${q('text')}        TEXT NOT NULL,
  ${q('answered_at')} TIMESTAMP NULL,
  PRIMARY KEY (${q('question_id')}, ${q('user_id')}),
  FOREIGN KEY (${q('question_id')}) REFERENCES ${q('questions')}(${q('id')})
);
`;

(async () => {
  console.log('Leyendo Firestore...');
  const couples = [], users = [], questions = [], answers = [];
  const coupleIds = new Set();

  const couplesSnap = await db.collection('couples').get();
  for (const c of couplesSnap.docs) {
    const d = c.data();
    coupleIds.add(c.id);
    couples.push([str(c.id), str(d.inviteCode), ts(d.createdAt)]);

    const qs = await c.ref.collection('questions').get();
    for (const qd of qs.docs) {
      const x = qd.data();
      questions.push([str(qd.id), str(c.id), str(x.authorId), str(x.category || null), str(x.text), ts(x.createdAt)]);
      for (const [uid, a] of Object.entries(x.answers || {})) {
        answers.push([str(qd.id), str(uid), str(a?.text), ts(a?.answeredAt)]);
      }
    }
  }

  const usersSnap = await db.collection('users').get();
  for (const u of usersSnap.docs) {
    const d = u.data();
    // Si la pareja ya no existe, se deja en NULL para no romper la llave foránea
    const cid = d.coupleId && coupleIds.has(d.coupleId) ? d.coupleId : null;
    users.push([str(u.id), str(d.name), str(cid)]);
  }

  const out =
    `-- Exportación de "Nosotros" (${dialect}) - ${new Date().toLocaleString('es-MX')}\n` +
    schema + '\n' +
    insert('couples', ['id', 'invite_code', 'created_at'], couples) + '\n' +
    insert('users', ['id', 'name', 'couple_id'], users) + '\n' +
    insert('questions', ['id', 'couple_id', 'author_id', 'category', 'text', 'created_at'], questions) + '\n' +
    insert('answers', ['question_id', 'user_id', 'text', 'answered_at'], answers);

  const stamp = new Date().toISOString().slice(0, 10);
  const file = path.join(__dirname, `nosotros-${dialect}-${stamp}.sql`);
  fs.writeFileSync(file, out, 'utf8');

  console.log(`✅ Listo: ${path.basename(file)}`);
  console.log(`   ${couples.length} pareja(s), ${users.length} usuario(s), ${questions.length} pregunta(s), ${answers.length} respuesta(s)`);
  process.exit(0);
})().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
