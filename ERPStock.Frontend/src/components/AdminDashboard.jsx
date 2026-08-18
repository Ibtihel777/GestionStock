import { useEffect, useMemo, useState } from 'react';
import { getAllArticles } from '../services/articleService';
import { getAllEmplacements } from '../services/emplacementService';
import { getAllMouvementsStock } from '../services/mouvementStockService';
import { getAllSignalements } from '../services/signalementService';
import { getAllStocks } from '../services/stockService';
import { getAllVerifications } from '../services/verificationService';

const LOW_STOCK_THRESHOLD = 5;
const INACTIVE_DAYS = 30;
const COLORS = ['#4969df', '#55a66f', '#e69c24', '#9a64d8', '#dd6b75', '#4ba8b6'];

const formatCurrency = (value) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 2 }).format(value || 0);
const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value || 0);
const formatDate = (value) => new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const dayKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const isSameDay = (value, date) => dayKey(value) === dayKey(date);

function buildDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - 1 - index));
    return { date, key: dayKey(date), label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) };
  });
}

function PieChart({ items, emptyLabel, formatValue = formatCurrency }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (!total) return <p className="empty-dashboard">{emptyLabel}</p>;

  const visibleItems = items.slice(0, 5);
  const others = items.slice(5).reduce((sum, item) => sum + item.value, 0);
  if (others) visibleItems.push({ label: 'Autres', value: others });
  let position = 0;
  const gradient = visibleItems.map((item, index) => {
    const nextPosition = position + (item.value / total) * 100;
    const color = COLORS[index % COLORS.length];
    const segment = `${color} ${position}% ${nextPosition}%`;
    position = nextPosition;
    return segment;
  }).join(', ');

  return <div className="pie-chart-layout"><div className="pie-chart" style={{ background: `conic-gradient(${gradient})` }} aria-label="Répartition du stock"><span>{formatValue(total)}</span></div><ul className="chart-legend">{visibleItems.map((item, index) => <li key={item.label}><i style={{ background: COLORS[index % COLORS.length] }} /><span title={item.label}>{item.label}</span><strong>{Math.round((item.value / total) * 100)} %</strong></li>)}</ul></div>;
}

function HorizontalBars({ items, emptyLabel }) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);
  if (!maxValue) return <p className="empty-dashboard">{emptyLabel}</p>;
  return <div className="horizontal-bars">{items.map((item, index) => <div className="horizontal-bar-row" key={item.label}><div><span title={item.label}>{item.label}</span><strong>{formatCurrency(item.value)}</strong></div><i><b style={{ width: `${(item.value / maxValue) * 100}%`, background: COLORS[index % COLORS.length] }} /></i></div>)}</div>;
}

function LineChart({ series, labels, emptyLabel }) {
  const allValues = series.flatMap((item) => item.values);
  const maxValue = Math.max(...allValues, 0);
  if (!maxValue) return <p className="empty-dashboard">{emptyLabel}</p>;
  const chartWidth = 480;
  const chartHeight = 150;
  const padding = 12;
  const pointString = (values) => values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return <div className="line-chart-wrap"><svg className="line-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Évolution temporelle"><line x1={padding} x2={chartWidth - padding} y1={padding} y2={padding} /><line x1={padding} x2={chartWidth - padding} y1={chartHeight / 2} y2={chartHeight / 2} /><line x1={padding} x2={chartWidth - padding} y1={chartHeight - padding} y2={chartHeight - padding} />{series.map((item, index) => <polyline key={item.label} points={pointString(item.values)} style={{ stroke: item.color ?? COLORS[index] }} />)}</svg><div className="line-chart-labels"><span>{labels[0]}</span><span>{labels[Math.floor(labels.length / 2)]}</span><span>{labels.at(-1)}</span></div><div className="line-chart-legend">{series.map((item, index) => <span key={item.label}><i style={{ background: item.color ?? COLORS[index] }} />{item.label}</span>)}</div></div>;
}

function AdminDashboard({ onOpenManagement, onOpenAlerts }) {
  const [data, setData] = useState({ articles: [], emplacements: [], stocks: [], signalements: [], verifications: [], mouvements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [articles, emplacements, stocks, signalements, verifications, mouvements] = await Promise.all([
        getAllArticles(), getAllEmplacements(), getAllStocks(), getAllSignalements(), getAllVerifications(), getAllMouvementsStock(),
      ]);
      setData({ articles, emplacements, stocks, signalements, verifications, mouvements });
      setSelectedArticleId((current) => current || String(articles[0]?.id ?? ''));
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Impossible de charger le tableau de bord. Vérifiez que l’API est démarrée.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const summary = useMemo(() => {
    const articlesById = new Map(data.articles.map((article) => [article.id, article]));
    const emplacementByCode = new Map(data.emplacements.map((emplacement) => [emplacement.codeEmplacement, emplacement]));
    const stockByArticle = new Map();
    const stockByZone = new Map();
    let stockValue = 0;
    let totalQuantity = 0;

    data.stocks.forEach((stock) => {
      const quantity = Math.max(stock.quantite, 0);
      const article = articlesById.get(stock.articleId);
      const value = quantity * Number(article?.cmup ?? 0);
      totalQuantity += quantity;
      stockValue += value;
      if (quantity > 0) {
        stockByArticle.set(stock.articleId, (stockByArticle.get(stock.articleId) ?? 0) + quantity);
        const zone = emplacementByCode.get(stock.codeEmplacement)?.zone ?? 'Zone non définie';
        stockByZone.set(zone, (stockByZone.get(zone) ?? 0) + quantity);
      }
    });

    const articleValues = [...stockByArticle.entries()].map(([articleId, quantity]) => {
      const article = articlesById.get(articleId);
      return { id: articleId, label: article ? `${article.reference} — ${article.designation}` : `Article #${articleId}`, value: quantity * Number(article?.cmup ?? 0), quantity };
    }).sort((a, b) => b.value - a.value);
    const zoneQuantities = [...stockByZone.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    const pending = data.signalements.filter((signalement) => signalement.statut === 'EnAttente');
    const treated = data.signalements.filter((signalement) => signalement.statut === 'Traite');
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const outgoingLast30Days = data.mouvements.filter((mouvement) => mouvement.type === 2 && new Date(mouvement.dateMouvement) >= new Date(now.getTime() - 30 * 86400000)).reduce((sum, mouvement) => sum + mouvement.quantite, 0);
    const days30 = buildDays(30);
    const flowDays = days30.map((day) => ({
      ...day,
      entries: data.mouvements.filter((mouvement) => mouvement.type === 1 && isSameDay(mouvement.dateMouvement, day.date)).reduce((sum, mouvement) => sum + mouvement.quantite, 0),
      exits: data.mouvements.filter((mouvement) => mouvement.type === 2 && isSameDay(mouvement.dateMouvement, day.date)).reduce((sum, mouvement) => sum + mouvement.quantite, 0),
    }));

    const stockValueByDay = new Map(flowDays.map((day) => [day.key, 0]));
    data.mouvements.forEach((mouvement) => {
      const key = dayKey(mouvement.dateMouvement);
      if (!stockValueByDay.has(key)) return;
      const articleCmup = Number(articlesById.get(mouvement.articleId)?.cmup ?? 0);
      const unitValue = mouvement.type === 1 ? Number(mouvement.prixUnitaireEntree ?? articleCmup) : articleCmup;
      stockValueByDay.set(key, stockValueByDay.get(key) + (mouvement.type === 1 ? mouvement.quantite * unitValue : -mouvement.quantite * unitValue));
    });
    let estimatedValue = stockValue;
    let estimatedQuantity = totalQuantity;
    let estimatedQuantityTotal = 0;
    const stockValueTrend = [...flowDays].reverse().map((day) => {
      const valueAtDayEnd = Math.max(estimatedValue, 0);
      estimatedValue -= stockValueByDay.get(day.key) ?? 0;
      estimatedQuantityTotal += Math.max(estimatedQuantity, 0);
      estimatedQuantity -= day.entries - day.exits;
      return valueAtDayEnd;
    }).reverse();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString('fr-FR', { month: 'short' }) };
    });
    const alertsByMonth = months.map((month) => {
      const alerts = data.signalements.filter((item) => {
        const date = new Date(item.dateSignalement);
        return `${date.getFullYear()}-${date.getMonth()}` === month.key;
      });
      return { ...month, pending: alerts.filter((item) => item.statut === 'EnAttente').length, treated: alerts.filter((item) => item.statut === 'Traite').length };
    });
    const lowStock = articleValues.filter((item) => item.quantity <= LOW_STOCK_THRESHOLD && item.quantity > 0).sort((a, b) => a.quantity - b.quantity);
    const inactiveCutoff = new Date(now.getTime() - INACTIVE_DAYS * 86400000);
    const lastMovementByArticle = new Map();
    data.mouvements.forEach((mouvement) => {
      const previous = lastMovementByArticle.get(mouvement.articleId);
      if (!previous || new Date(mouvement.dateMouvement) > new Date(previous)) lastMovementByArticle.set(mouvement.articleId, mouvement.dateMouvement);
    });
    const inactiveArticles = articleValues.filter((item) => !lastMovementByArticle.get(item.id) || new Date(lastMovementByArticle.get(item.id)) < inactiveCutoff).map((item) => ({ ...item, lastMovement: lastMovementByArticle.get(item.id) }));
    const selectedArticle = articlesById.get(Number(selectedArticleId)) ?? data.articles[0];
    const selectedEntries = data.mouvements.filter((mouvement) => mouvement.articleId === selectedArticle?.id && mouvement.type === 1).sort((a, b) => new Date(a.dateMouvement) - new Date(b.dateMouvement));
    const cmupProxy = selectedEntries.map((mouvement) => ({ label: new Date(mouvement.dateMouvement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), value: Number(mouvement.prixUnitaireEntree ?? 0) }));

    return {
      stockValue, totalQuantity, distinctArticles: stockByArticle.size, pending, treated, articleValues, zoneQuantities, days30, flowDays, stockValueTrend, alertsByMonth, lowStock, inactiveArticles, selectedArticle, cmupProxy,
      todayMovements: data.mouvements.filter((mouvement) => isSameDay(mouvement.dateMouvement, now)).length,
      weekMovements: data.mouvements.filter((mouvement) => new Date(mouvement.dateMouvement) >= weekStart).length,
      rotationRate: estimatedQuantityTotal ? outgoingLast30Days / (estimatedQuantityTotal / flowDays.length) : 0,
      recentAlerts: [...pending].sort((a, b) => new Date(b.dateSignalement) - new Date(a.dateSignalement)).slice(0, 5),
    };
  }, [data, selectedArticleId]);

  return (
    <section className="admin-dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard-intro"><div>
      <h2 id="dashboard-title">Analyse du stock</h2>
      </div>
      <div className="dashboard-actions"><button type="button" className="secondary-button" onClick={loadDashboard} disabled={loading}>Actualiser</button><button type="button" onClick={onOpenManagement}>Gérer le stock</button></div></div>
      {loading && <p className="dashboard-state">Mise à jour des indicateurs…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <>
        <div className="metric-grid dashboard-kpis">
          <article className="metric-card"><span className="metric-icon blue">DT</span><div><span>Valeur totale du stock</span><strong>{formatCurrency(summary.stockValue)}</strong><small>Quantité × CMUP actuel</small></div></article>
          <article className="metric-card"><span className="metric-icon green">#</span><div><span>Articles distincts en stock</span><strong>{formatNumber(summary.distinctArticles)}</strong><small>{formatNumber(summary.totalQuantity)} unités disponibles</small></div></article>
          <button className={`metric-card metric-card-button ${summary.pending.length ? 'is-warning' : ''}`} type="button" onClick={onOpenAlerts} aria-label={`Ouvrir les ${summary.pending.length} signalements IA en attente`}><span className="metric-icon amber">!</span><div><span>Signalements en attente</span><strong>{summary.pending.length}</strong><small>Écarts IA non traités · Voir les alertes</small></div><span className="metric-card-arrow" aria-hidden="true">→</span></button>
          <article className="metric-card"><span className="metric-icon red">↔</span><div><span>Mouvements</span><strong>{summary.todayMovements} / {summary.weekMovements}</strong><small>Aujourd’hui / 7 derniers jours</small></div></article>
          <article className="metric-card"><span className="metric-icon blue">▣</span><div><span>Total produits en stock</span><strong>{formatNumber(summary.totalQuantity)}</strong><small>Somme des quantités de tous les articles</small></div></article>
        </div>

        <div className="dashboard-chart-grid">
          <article className="dashboard-panel"><div className="panel-title"><div><p className="dashboard-kicker">Valeur</p><h3>Répartition par article</h3></div></div><PieChart items={summary.articleValues} emptyLabel="Aucune valeur de stock disponible." /></article>
          <article className="dashboard-panel"><div className="panel-title"><div><p className="dashboard-kicker">Priorités financières</p><h3>Top 10 par valeur de stock</h3></div></div><HorizontalBars items={summary.articleValues.slice(0, 10)} emptyLabel="Aucun article valorisé." /></article>
          <article className="dashboard-panel"><div className="panel-title"><div><p className="dashboard-kicker">Implantation</p><h3>Stock par zone</h3></div></div><PieChart items={summary.zoneQuantities} emptyLabel="Aucun stock réparti par zone." formatValue={(value) => `${formatNumber(value)} unités`} /></article>
        </div>

        <div className="dashboard-chart-grid dashboard-chart-grid-wide">
          <article className="dashboard-panel"><div className="panel-title"><div><p className="dashboard-kicker">Tendance</p><h3>Valeur du stock — 30 jours</h3></div><span className="chart-pill blue-pill">Estimation</span></div><LineChart series={[{ label: 'Valeur estimée', values: summary.stockValueTrend, color: COLORS[0] }]} labels={summary.days30.map((day) => day.label)} emptyLabel="Aucun mouvement sur les 30 derniers jours." /><p className="chart-helper">Calculée à partir du stock actuel et des mouvements, avec les CMUP disponibles aujourd’hui.</p></article>
          <article className="dashboard-panel"><div className="panel-title"><div><p className="dashboard-kicker">Flux</p><h3>Entrées vs sorties — 30 jours</h3></div></div><LineChart series={[{ label: 'Entrées', values: summary.flowDays.map((day) => day.entries), color: COLORS[1] }, { label: 'Sorties', values: summary.flowDays.map((day) => day.exits), color: COLORS[4] }]} labels={summary.days30.map((day) => day.label)} emptyLabel="Aucun flux de stock sur les 30 derniers jours." /></article>
        <article className="dashboard-panel"><div className="panel-title"><div><p className="dashboard-kicker">Action immédiate</p><h3>Stock faible</h3></div><span className="chart-pill amber-pill">≤ {LOW_STOCK_THRESHOLD} unités</span></div>{summary.lowStock.length === 0 ? <p className="empty-dashboard">Aucun article sous le seuil de vigilance.</p> : <ul className="watch-list">{summary.lowStock.slice(0, 5).map((item) => <li key={item.id}><span>{item.label}</span><strong>{item.quantity} unités</strong></li>)}</ul>}</article>
        </div>

        

        <div className="dashboard-panels">
          <article className="dashboard-panel"><div className="panel-title"><div><p className="dashboard-kicker">Stock dormant</p><h3>Sans mouvement depuis {INACTIVE_DAYS} jours</h3></div></div>{summary.inactiveArticles.length === 0 ? <p className="empty-dashboard">Tous les articles en stock ont eu une activité récente.</p> : <ul className="watch-list">{summary.inactiveArticles.slice(0, 5).map((item) => <li key={item.id}><span>{item.label}</span><strong>{item.lastMovement ? formatDate(item.lastMovement) : 'Jamais mouvementé'}</strong></li>)}</ul>}</article></div>
      </>}
    </section>
  );
}

export default AdminDashboard;
