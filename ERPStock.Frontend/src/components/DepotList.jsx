import { useEffect, useState } from 'react';
import { deleteDepot, getAllDepots } from '../services/depotService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DepotForm from './DepotForm';
import Modal from './Modal';
import TableRowsToggle from './TableRowsToggle';

const getVisibleDepots = (depots, expandedIds) => {
  const depotIds = new Set(depots.map((depot) => depot.id));
  const childrenByParent = new Map();
  depots.forEach((depot) => {
    const parentId = depotIds.has(depot.depotParentId) ? depot.depotParentId : null;
    childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), depot]);
  });

  const rows = [];
  const addRows = (parentId, depth) => {
    (childrenByParent.get(parentId) ?? [])
      .sort((first, second) => first.nom.localeCompare(second.nom, 'fr'))
      .forEach((depot) => {
        const hasChildren = (childrenByParent.get(depot.id) ?? []).length > 0;
        rows.push({ depot, depth, hasChildren });
        if (hasChildren && expandedIds.has(depot.id)) addRows(depot.id, depth + 1);
      });
  };

  addRows(null, 0);
  return rows;
};

function DepotList({ canManage }) {
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [depotToEdit, setDepotToEdit] = useState(null);
  const [depotToDelete, setDepotToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedDepotIds, setExpandedDepotIds] = useState(new Set());

  const fetchDepots = async () => {
    try {
      setLoading(true);
      setDepots(await getAllDepots());
      setError(null);
      setExpandedDepotIds(new Set());
    } catch {
      setError('Impossible de charger les dépôts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepots(); }, []);
  const closeForm = () => { setIsFormOpen(false); setDepotToEdit(null); };
  const displayedDepots = getVisibleDepots(depots, expandedDepotIds);
  const toggleDepot = (depotId) => setExpandedDepotIds((current) => {
    const next = new Set(current);
    if (next.has(depotId)) next.delete(depotId);
    else next.add(depotId);
    return next;
  });
  const confirmDelete = async () => {
    if (!depotToDelete) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteDepot(depotToDelete.id);
      setDepotToDelete(null);
      await fetchDepots();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message ?? "Le dépôt n'a pas pu être supprimé.");
    } finally {
      setIsDeleting(false);
    }
  };

  return <section className="entity-section" aria-labelledby="depots-title">
    <div className="entity-list-header"><div><h2 id="depots-title">Dépôts</h2><p>Organisez vos sites et leurs éventuels dépôts parents.</p></div>{canManage && <button type="button" onClick={() => { setDepotToEdit(null); setActionError(null); setIsFormOpen(true); }}>Nouveau dépôt</button>}</div>
    {isFormOpen && <Modal title={depotToEdit ? 'Modifier le dépôt' : 'Nouveau dépôt'} onClose={closeForm}><DepotForm depot={depotToEdit} depots={depots} onSaved={async () => { await fetchDepots(); closeForm(); }} onCancel={closeForm} /></Modal>}
    {depotToDelete && <DeleteConfirmationModal itemName={'le dépôt « ' + depotToDelete.nom + ' »'} impact="Cette action supprime les dépôts enfants, leurs emplacements, stocks, mouvements, vérifications et signalements associés." onConfirm={confirmDelete} onCancel={() => setDepotToDelete(null)} isDeleting={isDeleting} />}
    {actionError && <p className="form-error" role="alert">{actionError}</p>}{loading && <p>Chargement des dépôts...</p>}{error && <p className="form-error">{error}</p>}
    {!loading && !error && <div className="table-wrapper"><table><thead><tr><th>Référence</th><th>Nom</th>{canManage && <th>Actions</th>}</tr></thead><tbody>{depots.length === 0 ? <tr><td colSpan={canManage ? 3 : 2} className="empty-cell">Aucun dépôt enregistré.</td></tr> : displayedDepots.map(({ depot, depth, hasChildren }) => { const isExpanded = expandedDepotIds.has(depot.id); return <tr key={depot.id} className={depth > 0 ? 'hierarchy-row hierarchy-row--child' : 'hierarchy-row'}><td>{depot.reference || '—'}</td><td><div className="hierarchy-label" style={{ paddingLeft: `${depth * 22}px` }}>{hasChildren ? <button type="button" className="hierarchy-toggle" onClick={() => toggleDepot(depot.id)} aria-expanded={isExpanded}><span aria-hidden="true">{isExpanded ? '⌄' : '›'}</span>{depot.nom}</button> : <span className="hierarchy-leaf">{depot.nom}</span>}</div></td>{canManage && <td className="table-actions"><button type="button" onClick={() => { setDepotToEdit(depot); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => setDepotToDelete(depot)}>Supprimer</button></td>}</tr>; })}</tbody></table></div>}
  </section>;
}

export default DepotList;
