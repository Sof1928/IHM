const { getDb } = require('../database/db');

async function createEntreprise({ userId, nomEntreprise, adresseEntreprise, secteurActivite, description, logo }) {
  const db = await getDb();
  await db.run(
    `INSERT INTO entreprises (user_id, nomEntreprise, adresseEntreprise, secteurActivite, description, logo)
     VALUES (?, ?, ?, ?, ?, ?)` ,
    userId,
    nomEntreprise,
    adresseEntreprise,
    secteurActivite,
    description,
    logo || null
  );
}

async function getByUserId(userId) {
  const db = await getDb();
  return db.get('SELECT * FROM entreprises WHERE user_id = ?', userId);
}

async function updateEntreprise(userId, payload) {
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
  await db.run(`UPDATE entreprises SET ${fields.join(', ')} WHERE user_id = ?`, values);
}

async function listEntreprises() {
  const db = await getDb();
  return db.all(
    `SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
            e.nomEntreprise, e.adresseEntreprise, e.secteurActivite, e.description, e.logo
     FROM users u
     JOIN entreprises e ON e.user_id = u.id
     WHERE u.role = 'ENTREPRISE'
     ORDER BY u.id DESC`
  );
}

module.exports = { createEntreprise, getByUserId, updateEntreprise, listEntreprises };
