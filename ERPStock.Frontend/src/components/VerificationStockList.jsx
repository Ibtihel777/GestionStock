import { useEffect, useMemo, useState } from 'react';
import { getAllArticles } from '../services/articleService';
import { getAllEmplacements } from '../services/emplacementService';
import { getAllStocks } from '../services/stockService';
import { createVerification, getAllVerifications } from '../services/verificationService';
import Modal from './Modal';
import TableRowsToggle from './TableRowsToggle';

const getArticleLabel = (article) => `${article.reference} — ${article.designation}`;

function VerificationStockList() {
  const [verifications, setVerifications] = useState([]);
  const [articles, setArticles] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [formData, setFormData] = useState({ articleId: '', emplacementId: '', photo: null });
  const [articleSearch, setArticleSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const displayedVerifications = [...verifications]
    .sort((a, b) => new Date(b.dateVerification) - new Date(a.dateVerification));
  const visibleVerifications = showAllRows ? displayedVerifications : displayedVerifications.slice(0, 5);
  const availableEmplacements = useMemo(() => {
    const emplacementIds = new Set(
      stocks
        .filter((stock) => String(stock.articleId) === String(formData.articleId) && Number(stock.quantite) > 0)
        .map((stock) => String(stock.emplacementId)),
    );

    return emplacements.filter((emplacement) => emplacementIds.has(String(emplacement.id)));
  }, [emplacements, formData.articleId, stocks]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [articleData, emplacementData, stockData] = await Promise.all([getAllArticles(), getAllEmplacements(), getAllStocks()]);
      setArticles(articleData);
      setEmplacements(emplacementData);
      setStocks(stockData);
      setFormData((current) => ({
        ...current,
        articleId: current.articleId || articleData[0]?.id || '',
        emplacementId: (() => {
          const articleId = current.articleId || articleData[0]?.id;
          const validEmplacementIds = new Set(
            stockData
              .filter((stock) => String(stock.articleId) === String(articleId) && Number(stock.quantite) > 0)
              .map((stock) => String(stock.emplacementId)),
          );

          return validEmplacementIds.has(String(current.emplacementId))
            ? current.emplacementId
            : emplacementData.find((emplacement) => validEmplacementIds.has(String(emplacement.id)))?.id || '';
        })(),
      }));
      setVerifications(await getAllVerifications());
      setShowAllRows(false);
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les vérifications. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const canSubmit = articles.length > 0 && availableEmplacements.length > 0 && formData.photo;

  const handleArticleChange = (event) => {
    const articleSearchValue = event.target.value;
    setArticleSearch(articleSearchValue);
    const normalizedValue = articleSearchValue.trim().toLocaleLowerCase();
    const selectedArticle = articles.find((article) => (
      getArticleLabel(article).toLocaleLowerCase() === normalizedValue
      || String(article.reference).toLocaleLowerCase() === normalizedValue
    ));

    if (!selectedArticle) {
      setFormData((current) => ({ ...current, articleId: '', emplacementId: '' }));
      return;
    }

    const articleId = selectedArticle.id;
    const emplacementIds = new Set(
      stocks
        .filter((stock) => String(stock.articleId) === String(articleId) && Number(stock.quantite) > 0)
        .map((stock) => String(stock.emplacementId)),
    );
    const emplacementId = emplacements.find((emplacement) => emplacementIds.has(String(emplacement.id)))?.id || '';

    setFormData((current) => ({ ...current, articleId, emplacementId }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const verification = await createVerification(formData);
      setResult(verification);
      setFormData((current) => ({ ...current, photo: null }));
      await fetchData();
      setIsFormOpen(false);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message ?? "La vérification IA n'a pas pu être effectuée.");
    } finally {
      setSubmitting(false);
    }
  };

  return <section className="entity-section" aria-labelledby="verifications-title">
    <div className="entity-list-header"><div><h2 id="verifications-title">Vérification de stock par IA</h2><p>Compare le stock visible sur une photo avec la quantité théorique.</p></div><button type="button" onClick={() => { const selectedArticle = articles.find((article) => String(article.id) === String(formData.articleId)); setArticleSearch(selectedArticle ? getArticleLabel(selectedArticle) : ''); setIsFormOpen(true); }}>Nouvelle vérification</button></div>
    {isFormOpen && <Modal title="Nouvelle vérification IA" onClose={() => setIsFormOpen(false)} size="wide"><form className="entity-form verification-form" onSubmit={handleSubmit}>
      <label>Article<input type="search" list="verification-articles" value={articleSearch} onChange={handleArticleChange} placeholder="Référence ou désignation…" disabled={loading} required /><datalist id="verification-articles">{articles.map((article) => <option key={article.id} value={getArticleLabel(article)} />)}</datalist></label>
      <label>Emplacement<select value={formData.emplacementId} onChange={(event) => setFormData((current) => ({ ...current, emplacementId: event.target.value }))} disabled={loading || availableEmplacements.length === 0} required>{availableEmplacements.length === 0 && <option value="">Aucun emplacement avec du stock pour cet article</option>}{availableEmplacements.map((emplacement) => <option key={emplacement.id} value={emplacement.id}>{emplacement.codeEmplacement} — Zone {emplacement.zone}, étagère {emplacement.etagere}, tiroir {emplacement.tiroir}</option>)}</select></label>
      <label className="photo-input">Photo de la zone<input type="file" accept="image/png,image/jpeg,image/webp" capture="environment" onChange={(event) => setFormData((current) => ({ ...current, photo: event.target.files[0] ?? null }))} disabled={loading} required /><span>{formData.photo?.name ?? 'JPEG, PNG ou WebP — 10 Mo maximum'}</span></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button type="submit" disabled={submitting || !canSubmit}>{submitting ? 'Analyse…' : 'Compter'}</button><button type="button" onClick={() => setIsFormOpen(false)} disabled={submitting}>Annuler</button></div>
    </form></Modal>}
    {result && !error && <div className={`verification-result ${result.ecart === 0 ? 'is-balanced' : 'is-different'}`} role="status"><strong>{result.ecart === 0 ? 'Stock conforme' : 'Écart détecté'}</strong><span>Théorique : {result.quantiteTheorique} · Détection : {result.quantiteDetectee} · Écart : {result.ecart > 0 ? '+' : ''}{result.ecart}</span></div>}
    {loading && <p>Chargement des vérifications...</p>}
    {!loading && <><div className="table-wrapper"><table><thead><tr><th>Date</th><th>Article</th><th>Emplacement</th><th>Théorique</th><th>Détectée par Gemini</th><th>Écart</th></tr></thead><tbody>
      {verifications.length === 0 ? <tr><td colSpan="6" className="empty-cell">Aucune vérification enregistrée.</td></tr> : visibleVerifications.map((verification) => <tr key={verification.id}><td>{new Date(verification.dateVerification).toLocaleString('fr-FR')}</td><td>{verification.articleReference} — {verification.articleDesignation}</td><td>{verification.codeEmplacement}</td><td>{verification.quantiteTheorique}</td><td>{verification.quantiteDetectee}</td><td><span className={`gap-value ${verification.ecart === 0 ? 'is-balanced' : verification.ecart > 0 ? 'is-positive' : 'is-negative'}`}>{verification.ecart > 0 ? '+' : ''}{verification.ecart}</span></td></tr>)}
    </tbody></table></div>{verifications.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((current) => !current)} />}</>}
  </section>;
}

export default VerificationStockList;
