const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { env } = require('../config/env');
const { schemaSql } = require('./schema');

let dbInstance;

async function columnExists(db, table, column) {
  const columns = await db.all(`PRAGMA table_info(${table})`);
  return columns.some((col) => col.name === column);
}

async function ensureColumn(db, table, column, definition) {
  if (!(await columnExists(db, table, column))) {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function applyMigrations(db) {
  const candidatureTable = await db.get(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'candidatures'"
  );
  const needsCandidatureRebuild =
    candidatureTable?.sql && (candidatureTable.sql.includes("'ACCEPTE'") || candidatureTable.sql.includes("'REJETE'"));

  if (needsCandidatureRebuild) {
    await db.exec('BEGIN');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS candidatures_new (
        idCandidature INTEGER PRIMARY KEY AUTOINCREMENT,
        candidat_id INTEGER NOT NULL,
        offre_id INTEGER NOT NULL,
        cv_id INTEGER,
        lettre_id INTEGER,
        datePostulation TEXT NOT NULL,
        statut TEXT NOT NULL CHECK (statut IN ('EN_ATTENTE', 'ACCEPTEE', 'REJETEE')),
        commentaire TEXT,
        FOREIGN KEY (candidat_id) REFERENCES candidats(user_id) ON DELETE CASCADE,
        FOREIGN KEY (offre_id) REFERENCES offres(idOffre) ON DELETE CASCADE,
        FOREIGN KEY (cv_id) REFERENCES cv(idCV) ON DELETE SET NULL,
        FOREIGN KEY (lettre_id) REFERENCES lettres_motivation(idLettre) ON DELETE SET NULL,
        UNIQUE (candidat_id, offre_id)
      );
    `);
    await db.exec(`
      INSERT INTO candidatures_new (idCandidature, candidat_id, offre_id, cv_id, lettre_id, datePostulation, statut, commentaire)
      SELECT idCandidature,
             candidat_id,
             offre_id,
             NULL,
             NULL,
             datePostulation,
             CASE
               WHEN statut = 'ACCEPTE' THEN 'ACCEPTEE'
               WHEN statut = 'REJETE' THEN 'REJETEE'
               ELSE statut
             END,
             commentaire
      FROM candidatures;
    `);
    await db.exec('DROP TABLE candidatures');
    await db.exec('ALTER TABLE candidatures_new RENAME TO candidatures');
    await db.exec('COMMIT');
  }

  await ensureColumn(db, 'entreprises', 'logo', 'TEXT');
  await ensureColumn(db, 'offres', 'competences', 'TEXT');
  await ensureColumn(db, 'offres', 'experienceDemandee', 'INTEGER');
  await ensureColumn(db, 'candidatures', 'cv_id', 'INTEGER');
  await ensureColumn(db, 'candidatures', 'lettre_id', 'INTEGER');

  await db.exec("UPDATE candidatures SET statut = 'ACCEPTEE' WHERE statut = 'ACCEPTE'");
  await db.exec("UPDATE candidatures SET statut = 'REJETEE' WHERE statut = 'REJETE'");

  if (needsCandidatureRebuild) {
    await db.exec(schemaSql);
  }
}

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: env.dbPath,
      driver: sqlite3.Database
    });
    await dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

async function initDb() {
  const db = await getDb();
  await db.exec(schemaSql);
  await applyMigrations(db);
}

module.exports = { getDb, initDb };
