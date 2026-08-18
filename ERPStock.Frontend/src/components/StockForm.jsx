import { useEffect, useState } from 'react';
import { updateStock } from '../services/stockService';

function StockForm({ stock, onSaved, onCancel }) {
  const [quantite, setQuantite] = useState(stock.quantite);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setQuantite(stock.quantite);
    setError(null);
  }, [stock]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateStock(stock.id, {
        quantite: Number(quantite),
        articleId: stock.articleId,
        emplacementId: stock.emplacementId,
      });
      await onSaved();
    } catch (requestError) {
      console.error(requestError);
      setError('Le stock n’a pas pu être mis à jour.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="entity-form" aria-labelledby="stock-form-title">
      <h2 id="stock-form-title">Modifier le stock</h2>
      <form onSubmit={handleSubmit}>
        <p className="stock-form-context">{stock.articleReference} · {stock.codeEmplacement}</p>
        <label>Quantité disponible<input type="number" min="0" step="1" value={quantite} onChange={(event) => setQuantite(event.target.value)} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="submit" disabled={submitting}>{submitting ? 'Enregistrement…' : 'Enregistrer'}</button><button type="button" onClick={onCancel} disabled={submitting}>Annuler</button></div>
      </form>
    </section>
  );
}

export default StockForm;
