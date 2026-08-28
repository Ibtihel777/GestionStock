import { useEffect, useState } from 'react';
import { deleteFamilleArticle, getAllFamillesArticles } from '../services/familleArticleService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import FamilleArticleForm from './FamilleArticleForm';
import Modal from './Modal';
import TableRowsToggle from './TableRowsToggle';

function FamilleArticleList({ canManage }) {
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [familleToEdit, setFamilleToEdit] = useState(null);
  const [familleToDelete, setFamilleToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  const fetchFamilles = async () => {
    try {
      setLoading(true);
      setFamilles(await getAllFamillesArticles());
      setError(null);
      setShowAllRows(false);
    } catch {
      setError('Impossible de charger les familles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFamilles(); }, []);
  const closeForm = () => { setIsFormOpen(false); setFamilleToEdit(null); };
  const displayedFamilles = showAllRows ? familles : familles.slice(0, 5);
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
    {!loading && !error && <><div className="table-wrapper"><table><thead><tr><th>Référence</th><th>Nom</th><th>Famille parente</th>{canManage && <th>Actions</th>}</tr></thead><tbody>{familles.length === 0 ? <tr><td colSpan={canManage ? 4 : 3} className="empty-cell">Aucune famille enregistrée.</td></tr> : displayedFamilles.map((famille) => <tr key={famille.id}><td>{famille.reference || '—'}</td><td>{famille.nom}</td><td>{famille.referenceFamilleParent ?? '—'}</td>{canManage && <td className="table-actions"><button type="button" onClick={() => { setFamilleToEdit(famille); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => setFamilleToDelete(famille)}>Supprimer</button></td>}</tr>)}</tbody></table></div>{familles.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((value) => !value)} />}</>}
  </section>;
}

export default FamilleArticleList;
