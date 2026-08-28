import { useEffect, useState } from 'react';
import { deleteEmplacement, getAllEmplacements } from '../services/emplacementService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EmplacementForm from './EmplacementForm';
import Modal from './Modal';
import TableRowsToggle from './TableRowsToggle';

function EmplacementList({ canManage }) {
  const [emplacements, setEmplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [emplacementToEdit, setEmplacementToEdit] = useState(null);
  const [emplacementToDelete, setEmplacementToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);

  const fetchEmplacements = async () => {
    try {
      setLoading(true);
      setEmplacements(await getAllEmplacements());
      setShowAllRows(false);
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les emplacements. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmplacements(); }, []);
  const filteredEmplacements = [...emplacements].sort((a, b) => b.id - a.id).filter((emplacement) => {
    const search = searchTerm.trim().toLocaleLowerCase();
    return [emplacement.codeEmplacement, emplacement.depotReference, emplacement.depotNom, emplacement.zone, emplacement.etagere, emplacement.tiroir]
      .some((value) => String(value ?? '').toLocaleLowerCase().includes(search));
  });
  const isSearching = Boolean(searchTerm.trim());
  const displayedEmplacements = showAllRows || isSearching ? filteredEmplacements : filteredEmplacements.slice(0, 5);
  const closeForm = () => { setIsFormOpen(false); setEmplacementToEdit(null); };
  const confirmDelete = async () => {
    if (!emplacementToDelete) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteEmplacement(emplacementToDelete.id);
      setEmplacementToDelete(null);
      await fetchEmplacements();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message ?? "L'emplacement n'a pas pu être supprimé.");
    } finally {
      setIsDeleting(false);
    }
  };

  return <section className="entity-section" aria-labelledby="emplacements-title">
    <div className="entity-list-header"><div><h2 id="emplacements-title">Emplacements</h2><p>Organisez les zones de stockage par dépôt.</p></div>{canManage && <button type="button" onClick={() => { setEmplacementToEdit(null); setActionError(null); setIsFormOpen(true); }}>Nouvel emplacement</button>}</div>
    {isFormOpen && <Modal title={emplacementToEdit ? 'Modifier l’emplacement' : 'Nouvel emplacement'} onClose={closeForm}><EmplacementForm emplacement={emplacementToEdit} onSaved={async () => { await fetchEmplacements(); closeForm(); }} onCancel={closeForm} /></Modal>}
    {emplacementToDelete && <DeleteConfirmationModal itemName={'l’emplacement « ' + emplacementToDelete.codeEmplacement + ' »'} impact="Cette action supprime les stocks, mouvements, vérifications et signalements associés à cet emplacement." onConfirm={confirmDelete} onCancel={() => setEmplacementToDelete(null)} isDeleting={isDeleting} />}
    {actionError && <p className="form-error" role="alert">{actionError}</p>}{loading && <p>Chargement des emplacements...</p>}{error && <p className="form-error" role="alert">{error}</p>}
    {!loading && !error && <><div className="table-search"><label htmlFor="emplacements-search">Rechercher</label><input id="emplacements-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Dépôt, code, zone, étagère ou tiroir…" /></div><div className="table-wrapper"><table><thead><tr><th>Dépôt</th><th>Code</th><th>Zone</th><th>Étagère</th><th>Tiroir</th>{canManage && <th>Actions</th>}</tr></thead><tbody>
      {emplacements.length === 0 ? <tr><td colSpan={canManage ? 6 : 5} className="empty-cell">Aucun emplacement enregistré.</td></tr> : filteredEmplacements.length === 0 ? <tr><td colSpan={canManage ? 6 : 5} className="empty-cell">Aucun emplacement ne correspond à cette recherche.</td></tr> : displayedEmplacements.map((emplacement) => <tr key={emplacement.id}><td>{emplacement.depotReference}</td><td>{emplacement.codeEmplacement}</td><td>{emplacement.zone}</td><td>{emplacement.etagere}</td><td>{emplacement.tiroir}</td>{canManage && <td className="table-actions"><button type="button" onClick={() => { setEmplacementToEdit(emplacement); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => setEmplacementToDelete(emplacement)}>Supprimer</button></td>}</tr>)}
    </tbody></table></div>{!isSearching && filteredEmplacements.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((current) => !current)} />}</>}
  </section>;
}

export default EmplacementList;
