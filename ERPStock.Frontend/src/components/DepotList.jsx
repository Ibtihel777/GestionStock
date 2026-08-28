import { useEffect, useState } from 'react';
import { deleteDepot, getAllDepots } from '../services/depotService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DepotForm from './DepotForm';
import Modal from './Modal';
import TableRowsToggle from './TableRowsToggle';

function DepotList({ canManage }) {
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [depotToEdit, setDepotToEdit] = useState(null);
  const [depotToDelete, setDepotToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  const fetchDepots = async () => {
    try {
      setLoading(true);
      setDepots(await getAllDepots());
      setError(null);
      setShowAllRows(false);
    } catch {
      setError('Impossible de charger les dépôts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepots(); }, []);
  const closeForm = () => { setIsFormOpen(false); setDepotToEdit(null); };
  const displayedDepots = showAllRows ? depots : depots.slice(0, 5);
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
    {!loading && !error && <><div className="table-wrapper"><table><thead><tr><th>Référence</th><th>Nom</th><th>Dépôt parent</th>{canManage && <th>Actions</th>}</tr></thead><tbody>{depots.length === 0 ? <tr><td colSpan={canManage ? 4 : 3} className="empty-cell">Aucun dépôt enregistré.</td></tr> : displayedDepots.map((depot) => <tr key={depot.id}><td>{depot.reference || '—'}</td><td>{depot.nom}</td><td>{depot.referenceDepotParent ?? '—'}</td>{canManage && <td className="table-actions"><button type="button" onClick={() => { setDepotToEdit(depot); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => setDepotToDelete(depot)}>Supprimer</button></td>}</tr>)}</tbody></table></div>{depots.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((value) => !value)} />}</>}
  </section>;
}

export default DepotList;
