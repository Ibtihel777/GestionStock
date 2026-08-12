import { useEffect, useState } from 'react';
import { deleteEmplacement, getAllEmplacements } from '../services/emplacementService';
import EmplacementForm from './EmplacementForm';

function EmplacementList({ canManage }) {
  const [emplacements, setEmplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [emplacementToEdit, setEmplacementToEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmplacements = emplacements.filter((emplacement) => {
    const search = searchTerm.trim().toLocaleLowerCase();
    return [emplacement.codeEmplacement, emplacement.zone, emplacement.etagere, emplacement.tiroir]
      .some((value) => String(value ?? '').toLocaleLowerCase().includes(search));
  });

  const fetchEmplacements = async () => {
    try {
      setLoading(true);
      setEmplacements(await getAllEmplacements());
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les emplacements. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmplacements(); }, []);
  const closeForm = () => { setIsFormOpen(false); setEmplacementToEdit(null); };

  const handleDelete = async (emplacement) => {
    if (!window.confirm(`Supprimer l’emplacement « ${emplacement.codeEmplacement} » ?`)) return;
    try {
      setActionError(null);
      await deleteEmplacement(emplacement.id);
      await fetchEmplacements();
    } catch (requestError) {
      console.error(requestError);
      setActionError("L'emplacement n'a pas pu être supprimé. Il est peut-être utilisé par un stock.");
    }
  };

  return (
    <section className="entity-section" aria-labelledby="emplacements-title">
      <div className="entity-list-header"><div><h2 id="emplacements-title">Emplacements</h2><p>Organisez les zones de stockage.</p></div>{canManage && <button type="button" onClick={() => { setEmplacementToEdit(null); setActionError(null); setIsFormOpen(true); }}>Nouvel emplacement</button>}</div>
      {isFormOpen && <EmplacementForm emplacement={emplacementToEdit} onSaved={async () => { await fetchEmplacements(); closeForm(); }} onCancel={closeForm} />}
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      {loading && <p>Chargement des emplacements...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <><div className="table-search"><label htmlFor="emplacements-search">Rechercher</label><input id="emplacements-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Code, zone, étagère ou tiroir…" /></div><div className="table-wrapper"><table><thead><tr><th>Code</th><th>Zone</th><th>Étagère</th><th>Tiroir</th>{canManage && <th>Actions</th>}</tr></thead><tbody>
        {emplacements.length === 0 ? <tr><td colSpan={canManage ? 5 : 4} className="empty-cell">Aucun emplacement enregistré.</td></tr> : filteredEmplacements.length === 0 ? <tr><td colSpan={canManage ? 5 : 4} className="empty-cell">Aucun emplacement ne correspond à cette recherche.</td></tr> : filteredEmplacements.map((emplacement) => <tr key={emplacement.id}><td>{emplacement.codeEmplacement}</td><td>{emplacement.zone}</td><td>{emplacement.etagere}</td><td>{emplacement.tiroir}</td>{canManage && <td className="table-actions"><button type="button" onClick={() => { setEmplacementToEdit(emplacement); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => handleDelete(emplacement)}>Supprimer</button></td>}</tr>)}
      </tbody></table></div></>}
    </section>
  );
}

export default EmplacementList;
