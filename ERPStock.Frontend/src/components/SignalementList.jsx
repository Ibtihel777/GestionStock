import { useEffect, useState } from 'react';
import { getAllSignalements, markSignalementAsProcessed } from '../services/signalementService';
import TableRowsToggle from './TableRowsToggle';

function SignalementList() {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRows, setShowAllRows] = useState(false);

  const recentSignalements = [...signalements].sort((a, b) => new Date(b.dateSignalement) - new Date(a.dateSignalement));
  const displayedSignalements = showAllRows ? recentSignalements : recentSignalements.slice(0, 5);

  const fetchSignalements = async () => {
    try {
      setLoading(true);
      setSignalements(await getAllSignalements());
      setShowAllRows(false);
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Impossible de charger les alertes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSignalements(); }, []);

  const markAsProcessed = async (id) => {
    try {
      await markSignalementAsProcessed(id);
      await fetchSignalements();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Impossible de traiter ce signalement.');
    }
  };

  const pending = signalements.filter((signalement) => signalement.statut === 'EnAttente');

  return (
    <section className="entity-section" aria-labelledby="signalements-title">
      <div className="entity-list-header"><div><h2 id="signalements-title">Alertes</h2><p>{pending.length} signalement{pending.length > 1 ? 's' : ''} en attente.</p></div></div>
      {loading && <p>Chargement des alertes…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <>
        <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Article</th><th>Emplacement</th><th>Théorique</th><th>Détectée</th><th>Écart</th><th>Signalé par</th><th>Statut</th><th>Action</th></tr></thead><tbody>
          {signalements.length === 0 ? <tr><td colSpan="9" className="empty-cell">Aucune alerte enregistrée.</td></tr>
            : displayedSignalements.map((signalement) => <tr key={signalement.id}><td>{new Date(signalement.dateSignalement).toLocaleString('fr-FR')}</td><td>{signalement.articleReference} — {signalement.articleDesignation}</td><td>{signalement.codeEmplacement}</td><td>{signalement.quantiteTheorique}</td><td>{signalement.quantiteDetectee}</td><td><span className="gap-value is-negative">{signalement.ecart > 0 ? '+' : ''}{signalement.ecart}</span></td><td>{signalement.signalePar}</td><td><span className={`alert-status ${signalement.statut === 'Traite' ? 'is-processed' : ''}`}>{signalement.statut === 'Traite' ? 'Traité' : 'En attente'}</span></td><td>{signalement.statut === 'EnAttente' && <button type="button" onClick={() => markAsProcessed(signalement.id)}>Marquer traité</button>}</td></tr>)}
        </tbody></table></div>
        {signalements.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((current) => !current)} />}
      </>}
    </section>
  );
}

export default SignalementList;
