const { getDb } = require('../database/db');

async function createCandidature({ candidatId, offreId, cvId, lettreId, datePostulation, statut, commentaire }) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO candidatures (candidat_id, offre_id, cv_id, lettre_id, datePostulation, statut, commentaire)
     VALUES (?, ?, ?, ?, ?, ?, ?)` ,
    candidatId,
    offreId,
    cvId || null,
    lettreId || null,
    datePostulation,
    statut,
    commentaire || null
  );
  return result.lastID;
}

async function findById(idCandidature) {
  const db = await getDb();
  return db.get('SELECT * FROM candidatures WHERE idCandidature = ?', idCandidature);
}

async function findByCandidatAndOffre(candidatId, offreId) {
  const db = await getDb();
  return db.get('SELECT * FROM candidatures WHERE candidat_id = ? AND offre_id = ?', candidatId, offreId);
}

async function listByOffre(offreId) {
  const db = await getDb();
  return db.all(
    `SELECT c.*, u.nom, u.prenom, u.email, u.telephone,
            cv.nomFichier as cvNomFichier,
            lm.contenu as lettreContenu
     FROM candidatures c
     JOIN candidats ca ON ca.user_id = c.candidat_id
     JOIN users u ON u.id = ca.user_id
     LEFT JOIN cv ON cv.idCV = c.cv_id
     LEFT JOIN lettres_motivation lm ON lm.idLettre = c.lettre_id
     WHERE c.offre_id = ?
     ORDER BY c.datePostulation DESC`,
    offreId
  );
}

async function listByCandidat(candidatId) {
  const db = await getDb();
  return db.all(
    `SELECT c.*, o.titre, o.localisation, o.typeContrat, o.salaire, o.datePublication,
            e.nomEntreprise,
            cv.nomFichier as cvNomFichier,
            lm.contenu as lettreContenu
     FROM candidatures c
     JOIN offres o ON o.idOffre = c.offre_id
     JOIN entreprises e ON e.user_id = o.entreprise_id
     LEFT JOIN cv ON cv.idCV = c.cv_id
     LEFT JOIN lettres_motivation lm ON lm.idLettre = c.lettre_id
     WHERE c.candidat_id = ?
     ORDER BY c.datePostulation DESC`,
    candidatId
  );
}

async function listByEntreprise(entrepriseId) {
  const db = await getDb();
  return db.all(
    `SELECT c.*, o.titre, o.localisation, o.typeContrat, o.salaire,
            u.nom, u.prenom, u.email, u.telephone,
            cv.nomFichier as cvNomFichier,
            lm.contenu as lettreContenu
     FROM candidatures c
     JOIN offres o ON o.idOffre = c.offre_id
     JOIN candidats ca ON ca.user_id = c.candidat_id
     JOIN users u ON u.id = ca.user_id
     LEFT JOIN cv ON cv.idCV = c.cv_id
     LEFT JOIN lettres_motivation lm ON lm.idLettre = c.lettre_id
     WHERE o.entreprise_id = ?
     ORDER BY c.datePostulation DESC`,
    entrepriseId
  );
}

async function updateStatus(idCandidature, statut) {
  const db = await getDb();
  await db.run('UPDATE candidatures SET statut = ? WHERE idCandidature = ?', statut, idCandidature);
}

module.exports = {
  createCandidature,
  findById,
  findByCandidatAndOffre,
  listByOffre,
  listByCandidat,
  listByEntreprise,
  updateStatus
};
