const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { Roles } = require('../config/roles');
const { getDb } = require('./db');

async function seedSuperAdmin() {
  const db = await getDb();
  const existing = await db.get('SELECT id FROM users WHERE email = ?', env.seedSuperAdminEmail);

  const hash = await bcrypt.hash(env.seedSuperAdminPassword, 10);

  if (existing) {
    await db.run(
      `UPDATE users
       SET nom = ?, prenom = ?, motDePasse = ?, telephone = ?, role = ?
       WHERE id = ?`,
      env.seedSuperAdminNom,
      env.seedSuperAdminPrenom,
      hash,
      env.seedSuperAdminTelephone,
      Roles.SUPER_ADMIN,
      existing.id
    );
    return;
  }

  await db.run(
    `INSERT INTO users (nom, prenom, email, motDePasse, telephone, role)
     VALUES (?, ?, ?, ?, ?, ?)` ,
    env.seedSuperAdminNom,
    env.seedSuperAdminPrenom,
    env.seedSuperAdminEmail,
    hash,
    env.seedSuperAdminTelephone,
    Roles.SUPER_ADMIN
  );
}

module.exports = { seedSuperAdmin };
