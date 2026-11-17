# 04 · Exportar a SQL

Hay dos formas de hacerlo.

## Opción A: botón en la app (la más simple)
1. En la pantalla principal toca **Exportar**, arriba a la derecha.
2. Elige dónde mandarlo: WhatsApp, Gmail, Drive, etc.

- **Incluye:** los datos de *su* pareja, ya cargados en pantalla.
- **Formato:** MySQL.
- **Tablas:** `users`, `questions` y `answers`.
- **Código:** [`src/exportSql.js`](../src/exportSql.js).
- **No necesita** claves ni terminal.

## Opción B: script en la computadora (respaldo completo)
Exporta **todas** las parejas, en MySQL o PostgreSQL.

### Preparación (una sola vez)
1. En Firebase: **⚙️ Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**.
2. Renombra el archivo a `serviceAccount.json` y guárdalo en la carpeta `exportar/`.

   ⚠️ **Es secreta**: da acceso de administrador a todo el proyecto. Ya está en `.gitignore`. No la compartas.
3. Instala las dependencias:
```bash
cd exportar
npm install
```

### Uso
```bash
node export-sql.js            # MySQL
node export-sql.js postgres   # PostgreSQL
```
Genera un archivo como `nosotros-mysql-2026-11-17.sql` dentro de `exportar/`.

## Esquema SQL generado

```sql
couples   (id PK, invite_code, created_at)                 -- solo en el script
users     (id PK, name, couple_id FK)
questions (id PK, couple_id FK, author_id, text, created_at)
answers   (question_id FK, user_id, text, answered_at)     -- PK compuesta
```

Las respuestas, que en Firestore son un mapa dentro de la pregunta, se convierten en **una fila por persona**. Eso las hace fáciles de consultar:

```sql
-- Todas las preguntas con las respuestas de cada quien
SELECT q.text AS pregunta, u.name AS quien, a.text AS respuesta
FROM answers a
JOIN questions q ON q.id = a.question_id
JOIN users u     ON u.id = a.user_id
ORDER BY q.created_at;

-- Preguntas que solo una persona ha respondido
SELECT q.text, COUNT(a.user_id) AS respuestas
FROM questions q
LEFT JOIN answers a ON a.question_id = q.id
GROUP BY q.id, q.text
HAVING COUNT(a.user_id) < 2;
```

## Notas
- El archivo empieza con `DROP TABLE IF EXISTS`, así que cada importación reemplaza la anterior.
- **Las fechas van en UTC.** México va 6 horas atrás.
- Para importarlo: `mysql -u root -p nombre_bd < archivo.sql`, o desde phpMyAdmin, DBeaver o Workbench.
