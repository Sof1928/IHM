const { getDb } = require('../database/db');

async function createCv({ candidatId, nomFichier, dateAjout }) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO cv (candidat_id, nomFichier, dateAjout)
     VALUES (?, ?, ?)` ,
    candidatId,
    nomFichier,
    dateAjout
  );
  return result.lastID;
}

async function listByCandidat(candidatId) {
  const db = await getDb();
  return db.all('SELECT * FROM cv WHERE candidat_id = ? ORDER BY dateAjout DESC', candidatId);
}

async function findByIdForCandidat(idCV, candidatId) {
  const db = await getDb();
  return db.get('SELECT * FROM cv WHERE idCV = ? AND candidat_id = ?', idCV, candidatId);
}

module.exports = { createCv, listByCandidat, findByIdForCandidat };
