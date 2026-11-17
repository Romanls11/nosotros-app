// Genera un script SQL (MySQL) con los datos de la pareja que ya están cargados en la app.
// No necesita servidor ni claves: usa los mismos datos que ves en pantalla.

function str(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function ts(v) {
  if (!v || typeof v.toDate !== 'function') return 'NULL';
  return `'${v.toDate().toISOString().slice(0, 19).replace('T', ' ')}'`; // UTC
}

function insert(table, cols, rows) {
  if (!rows.length) return `-- (sin datos en ${table})\n`;
  return (
    `INSERT INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES\n` +
    rows.map((r) => `  (${r.join(', ')})`).join(',\n') +
    ';\n'
  );
}

export function buildSql(coupleId, couple, questions) {
  const users = Object.entries(couple?.names || {}).map(([uid, name]) => [str(uid), str(name)]);
  const qRows = [];
  const aRows = [];
  for (const q of questions || []) {
    qRows.push([str(q.id), str(q.authorId), str(q.text), ts(q.createdAt)]);
    for (const [uid, a] of Object.entries(q.answers || {})) {
      aRows.push([str(q.id), str(uid), str(a?.text), ts(a?.answeredAt)]);
    }
  }

  return `-- Exportación de "Nosotros" (MySQL) - ${new Date().toLocaleString('es-MX')}
-- Fechas en UTC (México = UTC-6)

DROP TABLE IF EXISTS \`answers\`;
DROP TABLE IF EXISTS \`questions\`;
DROP TABLE IF EXISTS \`users\`;

CREATE TABLE \`users\` (
  \`id\`   VARCHAR(128) PRIMARY KEY,
  \`name\` VARCHAR(255)
);

CREATE TABLE \`questions\` (
  \`id\`         VARCHAR(64) PRIMARY KEY,
  \`author_id\`  VARCHAR(128),
  \`text\`       TEXT NOT NULL,
  \`created_at\` TIMESTAMP NULL
);

CREATE TABLE \`answers\` (
  \`question_id\` VARCHAR(64) NOT NULL,
  \`user_id\`     VARCHAR(128) NOT NULL,
  \`text\`        TEXT NOT NULL,
  \`answered_at\` TIMESTAMP NULL,
  PRIMARY KEY (\`question_id\`, \`user_id\`),
  FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`)
);

${insert('users', ['id', 'name'], users)}
${insert('questions', ['id', 'author_id', 'text', 'created_at'], qRows)}
${insert('answers', ['question_id', 'user_id', 'text', 'answered_at'], aRows)}`;
}
