import { useEffect, useState } from 'react';
import { deleteFamilleArticle, getAllFamillesArticles } from '../services/familleArticleService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import FamilleArticleForm from './FamilleArticleForm';
import Modal from './Modal';

const getVisibleFamilles = (familles, expandedIds) => {
  const familyIds = new Set(familles.map((famille) => famille.id));
  const childrenByParent = new Map();
  familles.forEach((famille) => {
    const parentId = familyIds.has(famille.familleParentId) ? famille.familleParentId : null;
    childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), famille]);
  });

  const rows = [];
  const addRows = (parentId, depth) => {
    (childrenByParent.get(parentId) ?? [])
      .sort((first, second) => first.nom.localeCompare(second.nom, 'fr'))
      .forEach((famille) => {
        const hasChildren = (childrenByParent.get(famille.id) ?? []).length > 0;
        rows.push({ famille, depth, hasChildren });
        if (hasChildren && expandedIds.has(famille.id)) addRows(famille.id, depth + 1);
      });
  };

  addRows(null, 0);
  return rows;
};

function FamilleArticleList({ canManage }) {
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [familleToEdit, setFamilleToEdit] = useState(null);
  const [familleToDelete, setFamilleToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedFamilleIds, setExpandedFamilleIds] = useState(new Set());

  const fetchFamilles = async () => {
    try {
      setLoading(true);
      setFamilles(await getAllFamillesArticles());
      setError(null);
      setExpandedFamilleIds(new Set());
    } catch {
      setError('Impossible de charger les familles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFamilles(); }, []);
  const closeForm = () => { setIsFormOpen(false); setFamilleToEdit(null); };
  const displayedFamilles = getVisibleFamilles(familles, expandedFamilleIds);
  const toggleFamille = (familleId) => setExpandedFamilleIds((current) => {
    const next = new Set(current);
    if (next.has(familleId)) next.delete(familleId);
    else next.add(familleId);
    return next;
  });
  const confirmDelete = async () => {
    if (!familleToDelete) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteFamilleArticle(familleToDelete.id);
      setFamilleToDelete(null);
      await fetchFamilles();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message ?? "La famille n'a pas pu être supprimée.");
    } finally {
      setIsDeleting(false);
    }
  };

  return <section className="entity-section" aria-labelledby="familles-title">
    <div className="entity-list-header"><div><h2 id="familles-title">Familles d'articles</h2><p>Classez les articles dans une hiérarchie de familles.</p></div>{canManage && <button type="button" onClick={() => { setFamilleToEdit(null); setActionError(null); setIsFormOpen(true); }}>Nouvelle famille</button>}</div>
    {isFormOpen && <Modal title={familleToEdit ? 'Modifier la famille' : 'Nouvelle famille'} onClose={closeForm}><FamilleArticleForm famille={familleToEdit} familles={familles} onSaved={async () => { await fetchFamilles(); closeForm(); }} onCancel={closeForm} /></Modal>}
    {familleToDelete && <DeleteConfirmationModal itemName={'la famille « ' + familleToDelete.nom + ' »'} impact="Cette action supprime les sous-familles, tous leurs articles ainsi que les stocks, mouvements, vérifications et signalements associés." onConfirm={confirmDelete} onCancel={() => setFamilleToDelete(null)} isDeleting={isDeleting} />}
    {actionError && <p className="form-error" role="alert">{actionError}</p>}{loading && <p>Chargement des familles...</p>}{error && <p className="form-error">{error}</p>}
    {!loading && !error && <div className="table-wrapper"><table><thead><tr><th>Référence</th><th>Nom</th>{canManage && <th>Actions</th>}</tr></thead><tbody>{familles.length === 0 ? <tr><td colSpan={canManage ? 3 : 2} className="empty-cell">Aucune famille enregistrée.</td></tr> : displayedFamilles.map(({ famille, depth, hasChildren }) => { const isExpanded = expandedFamilleIds.has(famille.id); return <tr key={famille.id} className={depth > 0 ? 'hierarchy-row hierarchy-row--child' : 'hierarchy-row'}><td>{famille.reference || '—'}</td><td><div className="hierarchy-label" style={{ paddingLeft: `${depth * 22}px` }}>{hasChildren ? <button type="button" className="hierarchy-toggle" onClick={() => toggleFamille(famille.id)} aria-expanded={isExpanded}><span aria-hidden="true">{isExpanded ? '⌄' : '›'}</span>{famille.nom}</button> : <span className="hierarchy-leaf">{famille.nom}</span>}</div></td>{canManage && <td className="table-actions"><button type="button" onClick={() => { setFamilleToEdit(famille); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => setFamilleToDelete(famille)}>Supprimer</button></td>}</tr>; })}</tbody></table></div>}
  </section>;
}

export default FamilleArticleList;
