const { getDb } = require('../database/db');

async function createLettre({ candidatId, contenu, dateAjout }) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO lettres_motivation (candidat_id, contenu, dateAjout)
     VALUES (?, ?, ?)` ,
    candidatId,
    contenu,
    dateAjout
  );
  return result.lastID;
}

async function listByCandidat(candidatId) {
  const db = await getDb();
  return db.all('SELECT * FROM lettres_motivation WHERE candidat_id = ? ORDER BY dateAjout DESC', candidatId);
}

async function findByIdForCandidat(idLettre, candidatId) {
  const db = await getDb();
  return db.get('SELECT * FROM lettres_motivation WHERE idLettre = ? AND candidat_id = ?', idLettre, candidatId);
}

module.exports = { createLettre, listByCandidat, findByIdForCandidat };
