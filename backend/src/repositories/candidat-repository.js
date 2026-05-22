const { getDb } = require('../database/db');

async function createCandidat({ userId, adresse, dateNaissance, niveauEtude, experience }) {
  const db = await getDb();
  await db.run(
    `INSERT INTO candidats (user_id, adresse, dateNaissance, niveauEtude, experience)
     VALUES (?, ?, ?, ?, ?)` ,
    userId,
    adresse,
    dateNaissance,
    niveauEtude,
    experience
  );
}

async function getByUserId(userId) {
  const db = await getDb();
  return db.get('SELECT * FROM candidats WHERE user_id = ?', userId);
}

async function updateCandidat(userId, payload) {
  const fields = [];
  const values = [];

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  if (fields.length === 0) {
    return;
  }

  const db = await getDb();
  values.push(userId);
  await db.run(`UPDATE candidats SET ${fields.join(', ')} WHERE user_id = ?`, values);
}

async function listCandidats() {
  const db = await getDb();
  return db.all(
    `SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
            c.adresse, c.dateNaissance, c.niveauEtude, c.experience
     FROM users u
     JOIN candidats c ON c.user_id = u.id
     WHERE u.role = 'CANDIDAT'
     ORDER BY u.id DESC`
  );
}

module.exports = { createCandidat, getByUserId, updateCandidat, listCandidats };
