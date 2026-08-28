import { useEffect, useState } from 'react';
import { getAllArticles } from '../services/articleService';
import { getAllEmplacements } from '../services/emplacementService';
import { getAllMouvementsStock } from '../services/mouvementStockService';
import MouvementStockForm from './MouvementStockForm';
import Modal from './Modal';
import TableRowsToggle from './TableRowsToggle';

const labels = { 1: 'Entrée', 2: 'Sortie', 3: 'Transfert' };

function MouvementStockList({ canManage, onMovementRecorded }) {
  const [mouvements, setMouvements] = useState([]);
  const [articles, setArticles] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);

  const filteredMouvements = [...mouvements]
    .sort((a, b) => new Date(b.dateMouvement) - new Date(a.dateMouvement))
    .filter((mouvement) => {
      const search = searchTerm.trim().toLocaleLowerCase();
      return [labels[mouvement.type], mouvement.articleReference, mouvement.codeEmplacementSource, mouvement.codeEmplacementDestination]
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(search));
    });
  const isSearching = Boolean(searchTerm.trim());
  const displayedMouvements = showAllRows || isSearching ? filteredMouvements : filteredMouvements.slice(0, 5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mouvementsData, articlesData, emplacementsData] = await Promise.all([getAllMouvementsStock(), getAllArticles(), getAllEmplacements()]);
      setMouvements(mouvementsData);
      setArticles(articlesData);
      setEmplacements(emplacementsData);
      setShowAllRows(false);
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les mouvements. Vérifiez que l'API est démarrée.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  const handleSaved = async () => { await fetchData(); await onMovementRecorded?.(); setIsFormOpen(false); };

  return (
    <section className="entity-section" aria-labelledby="mouvements-title">
      <div className="entity-list-header"><div><h2 id="mouvements-title">Mouvements de stock</h2><p>Historique des entrées, sorties et transferts.</p></div>{canManage && <button type="button" onClick={() => setIsFormOpen(true)}>Nouveau mouvement</button>}</div>
      {isFormOpen && <Modal title="Nouveau mouvement" onClose={() => setIsFormOpen(false)}><MouvementStockForm articles={articles} emplacements={emplacements} onSaved={handleSaved} onCancel={() => setIsFormOpen(false)} /></Modal>}
      {loading && <p>Chargement des mouvements...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <>
        <div className="table-search"><label htmlFor="mouvements-search">Rechercher</label><input id="mouvements-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Type, article ou emplacement…" /></div>
        <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Type</th><th>Article</th><th>Source</th><th>Destination</th><th>Quantité</th><th>Prix entrée</th></tr></thead><tbody>
          {mouvements.length === 0 ? <tr><td colSpan="7" className="empty-cell">Aucun mouvement enregistré.</td></tr>
            : filteredMouvements.length === 0 ? <tr><td colSpan="7" className="empty-cell">Aucun mouvement ne correspond à cette recherche.</td></tr>
              : displayedMouvements.map((mouvement) => <tr key={mouvement.id}><td>{new Date(mouvement.dateMouvement).toLocaleString('fr-FR')}</td><td><span className={`movement-badge movement-${mouvement.type}`}>{labels[mouvement.type]}</span></td><td>{mouvement.articleReference}</td><td>{mouvement.codeEmplacementSource ?? '—'}</td><td>{mouvement.codeEmplacementDestination ?? '—'}</td><td>{mouvement.quantite}</td><td>{mouvement.prixUnitaireEntree ? `${mouvement.prixUnitaireEntree} DT` : '—'}</td></tr>)}
        </tbody></table></div>
        {!isSearching && filteredMouvements.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((current) => !current)} />}
      </>}
    </section>
  );
}

export default MouvementStockList;
