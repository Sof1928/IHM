const { getDb } = require('../database/db');

async function createOffre({
  entrepriseId,
  titre,
  description,
  typeContrat,
  salaire,
  localisation,
  datePublication,
  statut,
  competences,
  experienceDemandee
}) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO offres (entreprise_id, titre, description, typeContrat, salaire, localisation, datePublication, statut, competences, experienceDemandee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    entrepriseId,
    titre,
    description,
    typeContrat,
    salaire,
    localisation,
    datePublication,
    statut,
    competences || null,
    experienceDemandee ?? null
  );
  return result.lastID;
}

async function updateOffre(idOffre, payload) {
  const allowed = new Set([
    'titre',
    'description',
    'typeContrat',
    'salaire',
    'localisation',
    'datePublication',
    'statut',
    'competences',
    'experienceDemandee'
  ]);

  const fields = [];
  const values = [];

  Object.entries(payload).forEach(([key, value]) => {
    if (!allowed.has(key)) {
      return;
    }
    fields.push(`${key} = ?`);
    values.push(value);
  });

  if (fields.length === 0) {
    return;
  }

  const db = await getDb();
  values.push(idOffre);
  await db.run(`UPDATE offres SET ${fields.join(', ')} WHERE idOffre = ?`, values);
}

async function deleteOffre(idOffre) {
  const db = await getDb();
  await db.run('DELETE FROM offres WHERE idOffre = ?', idOffre);
}

async function findById(idOffre) {
  const db = await getDb();
  return db.get('SELECT * FROM offres WHERE idOffre = ?', idOffre);
}

async function findDetailsById(idOffre) {
  const db = await getDb();
  return db.get(
    `SELECT o.*,
            e.nomEntreprise,
            e.adresseEntreprise,
            e.secteurActivite,
            e.description as entrepriseDescription,
            e.logo,
            (SELECT COUNT(*) FROM candidatures c WHERE c.offre_id = o.idOffre) as candidaturesCount
     FROM offres o
     JOIN entreprises e ON e.user_id = o.entreprise_id
     WHERE o.idOffre = ?`,
    idOffre
  );
}

async function listOffers({
  q,
  typeContrat,
  localisation,
  statut,
  salaireMin,
  salaireMax,
  entreprise,
  entrepriseId,
  sortBy,
  sortDirection,
  page,
  pageSize
}) {
  const db = await getDb();
  const filters = [];
  const params = [];

  if (q) {
    filters.push('(o.titre LIKE ? OR o.description LIKE ? OR o.competences LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (typeContrat) {
    filters.push('o.typeContrat = ?');
    params.push(typeContrat);
  }

  if (localisation) {
    filters.push('o.localisation = ?');
    params.push(localisation);
  }

  if (statut) {
    filters.push('o.statut = ?');
    params.push(statut);
  }

  if (salaireMin !== null && salaireMin !== undefined) {
    filters.push('o.salaire >= ?');
    params.push(salaireMin);
  }

  if (salaireMax !== null && salaireMax !== undefined) {
    filters.push('o.salaire <= ?');
    params.push(salaireMax);
  }

  if (entreprise) {
    filters.push('e.nomEntreprise LIKE ?');
    params.push(`%${entreprise}%`);
  }

  if (entrepriseId) {
    filters.push('o.entreprise_id = ?');
    params.push(entrepriseId);
  }

  const whereSql = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const countRow = await db.get(
    `SELECT COUNT(*) as total
     FROM offres o
     JOIN entreprises e ON e.user_id = o.entreprise_id
     ${whereSql}`,
    params
  );
  const offset = (page - 1) * pageSize;

  const sortField = sortBy === 'salaire' ? 'o.salaire' : 'o.datePublication';
  const sortDir = sortDirection === 'asc' ? 'ASC' : 'DESC';

  const items = await db.all(
    `SELECT o.*, e.nomEntreprise, e.secteurActivite, e.logo
     FROM offres o
     JOIN entreprises e ON e.user_id = o.entreprise_id
     ${whereSql}
     ORDER BY ${sortField} ${sortDir}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return { total: countRow.total, items };
}

module.exports = {
  createOffre,
  updateOffre,
  deleteOffre,
  findById,
  findDetailsById,
  listOffers
};
