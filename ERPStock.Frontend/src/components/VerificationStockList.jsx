import { useEffect, useState } from 'react';
import { getAllArticles } from '../services/articleService';
import { getAllEmplacements } from '../services/emplacementService';
import { createVerification, getAllVerifications } from '../services/verificationService';

function VerificationStockList() {
  const [verifications, setVerifications] = useState([]);
  const [articles, setArticles] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [formData, setFormData] = useState({ articleId: '', emplacementId: '', photo: null });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [articleData, emplacementData] = await Promise.all([
        getAllArticles(),
        getAllEmplacements(),
      ]);
      setArticles(articleData);
      setEmplacements(emplacementData);
      setFormData((current) => ({
        ...current,
        articleId: current.articleId || articleData[0]?.id || '',
        emplacementId: current.emplacementId || emplacementData[0]?.id || '',
      }));

      try {
        setVerifications(await getAllVerifications());
        setError(null);
      } catch (requestError) {
        console.error(requestError);
        setVerifications([]);
        setError("L'historique des vérifications est indisponible. Redémarrez l'API pour charger la nouvelle fonctionnalité.");
      }
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les articles ou les emplacements. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const verification = await createVerification(formData);
      setResult(verification);
      setFormData((current) => ({ ...current, photo: null }));
      event.currentTarget.reset();
      await fetchData();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message ?? "La vérification IA n'a pas pu être effectuée.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = articles.length > 0 && emplacements.length > 0 && formData.photo;

  return (
    <section className="entity-section" aria-labelledby="verifications-title">
      <div className="entity-list-header"><div><h2 id="verifications-title">Vérification de stock par IA</h2><p>Compare le stock visible sur une photo avec la quantité théorique.</p></div></div>
      <form className="entity-form verification-form" onSubmit={handleSubmit}>
        <label>Article<select value={formData.articleId} onChange={(event) => setFormData((current) => ({ ...current, articleId: event.target.value }))} disabled={loading} required>{articles.map((article) => <option key={article.id} value={article.id}>{article.reference} — {article.designation}</option>)}</select></label>
        <label>Emplacement<select value={formData.emplacementId} onChange={(event) => setFormData((current) => ({ ...current, emplacementId: event.target.value }))} disabled={loading} required>{emplacements.map((emplacement) => <option key={emplacement.id} value={emplacement.id}>{emplacement.codeEmplacement} — Zone {emplacement.zone}, étagère {emplacement.etagere}, tiroir {emplacement.tiroir}</option>)}</select></label>
        <label className="photo-input">Photo de la zone<input type="file" accept="image/png,image/jpeg,image/webp" capture="environment" onChange={(event) => setFormData((current) => ({ ...current, photo: event.target.files[0] ?? null }))} disabled={loading} required /><span>{formData.photo?.name ?? 'JPEG, PNG ou WebP — 10 Mo maximum'}</span></label>
        <p className="form-hint">Le comptage Gemini est une estimation : les pièces doivent être visibles et non empilées. Avec l'offre gratuite, évitez d'envoyer des photos sensibles.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="submit" disabled={submitting || !canSubmit}>{submitting ? 'Analyse Gemini…' : 'Compter avec Gemini'}</button></div>
      </form>
      {result && !error && <div className={`verification-result ${result.ecart === 0 ? 'is-balanced' : 'is-different'}`} role="status"><strong>{result.ecart === 0 ? 'Stock conforme' : 'Écart détecté'}</strong><span>Théorique : {result.quantiteTheorique} · Gemini : {result.quantiteDetectee} · Écart : {result.ecart > 0 ? '+' : ''}{result.ecart}</span></div>}
      {loading && <p>Chargement des vérifications...</p>}
      {!loading && <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Article</th><th>Emplacement</th><th>Théorique</th><th>Détectée par Gemini</th><th>Écart</th></tr></thead><tbody>{verifications.length === 0 ? <tr><td colSpan="6" className="empty-cell">Aucune vérification enregistrée.</td></tr> : verifications.map((verification) => <tr key={verification.id}><td>{new Date(verification.dateVerification).toLocaleString('fr-FR')}</td><td>{verification.articleReference} — {verification.articleDesignation}</td><td>{verification.codeEmplacement}</td><td>{verification.quantiteTheorique}</td><td>{verification.quantiteDetectee}</td><td><span className={`gap-value ${verification.ecart === 0 ? 'is-balanced' : verification.ecart > 0 ? 'is-positive' : 'is-negative'}`}>{verification.ecart > 0 ? '+' : ''}{verification.ecart}</span></td></tr>)}</tbody></table></div>}
    </section>
  );
}

export default VerificationStockList;
