import { useEffect, useMemo, useState } from 'react';
import { getAllArticles } from '../services/articleService';
import { getAllEmplacements } from '../services/emplacementService';
import { getAllSignalements } from '../services/signalementService';
import { getAllStocks } from '../services/stockService';
import { getAllVerifications } from '../services/verificationService';

const formatDate = (value) => new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

function AdminDashboard({ onOpenManagement }) {
  const [data, setData] = useState({ articles: [], emplacements: [], stocks: [], signalements: [], verifications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [articles, emplacements, stocks, signalements, verifications] = await Promise.all([
        getAllArticles(), getAllEmplacements(), getAllStocks(), getAllSignalements(), getAllVerifications(),
      ]);
      setData({ articles, emplacements, stocks, signalements, verifications });
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Impossible de charger le tableau de bord. Vérifiez que l’API est démarrée.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, []);

  const summary = useMemo(() => {
    const pending = data.signalements.filter((signalement) => signalement.statut === 'EnAttente');
    const discrepancies = data.verifications.filter((verification) => verification.ecart !== 0);
    const totalQuantity = data.stocks.reduce((total, stock) => total + stock.quantite, 0);
    const emptyStocks = data.stocks.filter((stock) => stock.quantite === 0).length;
    const recentAlerts = [...pending].sort((a, b) => new Date(b.dateSignalement) - new Date(a.dateSignalement)).slice(0, 5);
    const lastVerification = [...data.verifications].sort((a, b) => new Date(b.dateVerification) - new Date(a.dateVerification))[0];
    return { pending, discrepancies, totalQuantity, emptyStocks, recentAlerts, lastVerification };
  }, [data]);

  return (
    <section className="admin-dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard-intro">
        <div>
          <p className="dashboard-kicker">Vue d’ensemble</p>
          <h2 id="dashboard-title">Situation du stock</h2>
          <p>Suivez les quantités disponibles, les contrôles IA et les écarts nécessitant une action.</p>
        </div>
        <div className="dashboard-actions"><button type="button" className="secondary-button" onClick={loadDashboard} disabled={loading}>Actualiser</button><button type="button" onClick={onOpenManagement}>Gérer le stock</button></div>
      </div>

      {loading && <p className="dashboard-state">Mise à jour des indicateurs…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <>
        <div className="metric-grid">
          <article className="metric-card"><span className="metric-icon blue">▦</span><div><span>Articles suivis</span><strong>{data.articles.length}</strong><small>{data.emplacements.length} emplacements configurés</small></div></article>
          <article className="metric-card"><span className="metric-icon green">▣</span><div><span>Quantité disponible</span><strong>{summary.totalQuantity}</strong><small>{data.stocks.length} lignes de stock</small></div></article>
          <article className={`metric-card ${summary.pending.length ? 'is-warning' : ''}`}><span className="metric-icon amber">!</span><div><span>Alertes à traiter</span><strong>{summary.pending.length}</strong><small>{summary.pending.length ? 'Une action SuperAdmin est attendue' : 'Aucune alerte en attente'}</small></div></article>
          <article className={`metric-card ${summary.discrepancies.length ? 'is-danger' : ''}`}><span className="metric-icon red">≠</span><div><span>Écarts détectés</span><strong>{summary.discrepancies.length}</strong><small>{data.verifications.length} vérifications IA réalisées</small></div></article>
        </div>

        <div className="dashboard-panels">
          <article className="dashboard-panel dashboard-status">
            <div className="panel-title"><div><p className="dashboard-kicker">État général</p><h3>Lecture rapide</h3></div><span className={`health-badge ${summary.pending.length || summary.discrepancies.length ? 'needs-attention' : 'healthy'}`}>{summary.pending.length || summary.discrepancies.length ? 'À surveiller' : 'Conforme'}</span></div>
            <ul className="status-list">
              <li><span className="status-dot green" />{summary.emptyStocks === 0 ? 'Aucune ligne de stock à zéro.' : `${summary.emptyStocks} ligne${summary.emptyStocks > 1 ? 's' : ''} de stock à zéro.`}</li>
              <li><span className={`status-dot ${summary.pending.length ? 'amber' : 'green'}`} />{summary.pending.length ? `${summary.pending.length} signalement${summary.pending.length > 1 ? 's' : ''} doit être traité.` : 'Tous les signalements sont traités.'}</li>
              <li><span className={`status-dot ${summary.lastVerification?.ecart === 0 ? 'green' : 'amber'}`} />{summary.lastVerification ? `Dernier contrôle : ${formatDate(summary.lastVerification.dateVerification)}.` : 'Aucun contrôle IA enregistré.'}</li>
            </ul>
          </article>

          <article className="dashboard-panel">
            <div className="panel-title"><div><p className="dashboard-kicker">Priorités</p><h3>Dernières alertes</h3></div><button type="button" className="text-button" onClick={onOpenManagement}>Voir les alertes</button></div>
            {summary.recentAlerts.length === 0 ? <p className="empty-dashboard">Aucune alerte en attente. Le stock est conforme aux derniers contrôles.</p> : <div className="alert-preview">{summary.recentAlerts.map((alert) => <div className="alert-preview-row" key={alert.id}><span className="alert-preview-icon">!</span><div><strong>{alert.articleReference} — {alert.articleDesignation}</strong><p>{alert.codeEmplacement} · écart de {alert.ecart > 0 ? '+' : ''}{alert.ecart}</p></div><time>{formatDate(alert.dateSignalement)}</time></div>)}</div>}
          </article>
        </div>

        <article className="dashboard-panel stock-explanation">
          <div><p className="dashboard-kicker">Comment interpréter les indicateurs ?</p><h3>Votre checklist quotidienne</h3></div>
          <div className="checklist"><p><b>1.</b> Traitez les alertes en attente dès qu’un écart est signalé.</p><p><b>2.</b> Vérifiez les quantités à zéro avant une nouvelle sortie de stock.</p><p><b>3.</b> Consultez la gestion détaillée pour créer des articles, emplacements ou mouvements.</p></div>
        </article>
      </>}
    </section>
  );
}

export default AdminDashboard;
