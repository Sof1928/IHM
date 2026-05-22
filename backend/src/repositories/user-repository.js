const { getDb } = require('../database/db');

async function createUser({ nom, prenom, email, motDePasse, telephone, role }) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO users (nom, prenom, email, motDePasse, telephone, role)
     VALUES (?, ?, ?, ?, ?, ?)` ,
    nom,
    prenom,
    email,
    motDePasse,
    telephone,
    role
  );
  return result.lastID;
}

async function findByEmail(email) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE email = ?', email);
}

async function findById(id) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE id = ?', id);
}

async function listUsers() {
  const db = await getDb();
  return db.all('SELECT id, nom, prenom, email, telephone, role FROM users ORDER BY id DESC');
}

async function deleteUser(id) {
  const db = await getDb();
  return db.run('DELETE FROM users WHERE id = ?', id);
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsers,
  deleteUser
};
