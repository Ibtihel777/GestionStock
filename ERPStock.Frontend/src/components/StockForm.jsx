import { useEffect, useState } from 'react';
import { createStock, updateStock } from '../services/stockService';

function StockForm({ stock, articles, emplacements, onSaved, onCancel }) {
  const [formData, setFormData] = useState({ quantite: '', articleId: '', emplacementId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(stock);
  const canSubmit = articles.length > 0 && emplacements.length > 0;

  useEffect(() => {
    setFormData(stock ? {
      quantite: stock.quantite,
      articleId: stock.articleId,
      emplacementId: stock.emplacementId,
    } : {
      quantite: '',
      articleId: articles[0]?.id ?? '',
      emplacementId: emplacements[0]?.id ?? '',
    });
    setError(null);
  }, [stock, articles, emplacements]);

  const handleChange = ({ target: { name, value } }) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const stockData = {
        quantite: Number(formData.quantite),
        articleId: Number(formData.articleId),
        emplacementId: Number(formData.emplacementId),
      };
      if (isEditing) await updateStock(stock.id, stockData);
      else await createStock(stockData);
      await onSaved();
    } catch (requestError) {
      console.error(requestError);
      setError("Le stock n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="entity-form" aria-labelledby="stock-form-title">
      <h2 id="stock-form-title">{isEditing ? 'Modifier le stock' : 'Nouveau stock'}</h2>
      {!canSubmit && <p className="form-error">Créez au moins un article et un emplacement avant d’ajouter un stock.</p>}
      <form onSubmit={handleSubmit}>
        <label>Article<select name="articleId" value={formData.articleId} onChange={handleChange} disabled={!canSubmit} required>{articles.map((article) => <option key={article.id} value={article.id}>{article.reference} — {article.designation}</option>)}</select></label>
        <label>Emplacement<select name="emplacementId" value={formData.emplacementId} onChange={handleChange} disabled={!canSubmit} required>{emplacements.map((emplacement) => <option key={emplacement.id} value={emplacement.id}>{emplacement.codeEmplacement}</option>)}</select></label>
        <label>Quantité<input name="quantite" type="number" min="0" step="1" value={formData.quantite} onChange={handleChange} disabled={!canSubmit} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="submit" disabled={submitting || !canSubmit}>{submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}</button><button type="button" onClick={onCancel} disabled={submitting}>Annuler</button></div>
      </form>
    </section>
  );
}

export default StockForm;
