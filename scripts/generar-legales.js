/**
 * Genera PRIVACIDAD.md y TERMINOS.md a partir de src/legal.js (la misma fuente que usa la app).
 * Uso:  npm run legales
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src', 'legal.js'), 'utf8').replace(/^export /gm, '');
const ctx = {};
vm.runInNewContext(`${src}\nthis.LEGAL = LEGAL; this.PRIVACY = PRIVACY; this.TERMS = TERMS;`, ctx);
const { LEGAL, PRIVACY, TERMS } = ctx;

function toMd(d) {
  const body = d.sections
    .map((s) => `## ${s.title}\n\n${s.body.replace(/\n/g, '  \n')}`)
    .join('\n\n');
  return `# ${d.title} · ${LEGAL.app}\n\n_Última actualización: ${LEGAL.updated} (versión ${LEGAL.version})_\n\n${d.intro}\n\n${body}\n\n---\n${LEGAL.owner} · ${LEGAL.email}\n`;
}

fs.writeFileSync(path.join(root, 'PRIVACIDAD.md'), toMd(PRIVACY), 'utf8');
fs.writeFileSync(path.join(root, 'TERMINOS.md'), toMd(TERMS), 'utf8');
console.log('✅ PRIVACIDAD.md y TERMINOS.md actualizados (versión ' + LEGAL.version + ')');
