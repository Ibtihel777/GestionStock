import { useEffect, useState } from 'react';
import { createMouvementStock } from '../services/mouvementStockService';

const movementTypes = {
  1: 'Entrée',
  2: 'Sortie',
  3: 'Transfert',
};

function MouvementStockForm({ articles, emplacements, onSaved, onCancel }) {
  const [formData, setFormData] = useState({ type: '1', quantite: '', articleId: '', emplacementSourceId: '', emplacementDestinationId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const canSubmit = articles.length > 0 && emplacements.length > 0;
  const isEntry = formData.type === '1';
  const isExit = formData.type === '2';
  const isTransfer = formData.type === '3';

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      articleId: current.articleId || articles[0]?.id || '',
      emplacementSourceId: current.emplacementSourceId || emplacements[0]?.id || '',
      emplacementDestinationId: current.emplacementDestinationId || emplacements[0]?.id || '',
    }));
  }, [articles, emplacements]);

  const handleChange = ({ target: { name, value } }) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const mouvement = {
        type: Number(formData.type),
        quantite: Number(formData.quantite),
        articleId: Number(formData.articleId),
        emplacementSourceId: isEntry ? null : Number(formData.emplacementSourceId),
        emplacementDestinationId: isExit ? null : Number(formData.emplacementDestinationId),
      };
      await createMouvementStock(mouvement);
      await onSaved();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message ?? "Le mouvement n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="entity-form" aria-labelledby="movement-form-title">
      <h2 id="movement-form-title">Nouveau mouvement</h2>
      {!canSubmit && <p className="form-error">Créez au moins un article et un emplacement avant d’enregistrer un mouvement.</p>}
      <form onSubmit={handleSubmit}>
        <label>Type de mouvement<select name="type" value={formData.type} onChange={handleChange} disabled={!canSubmit}><option value="1">Entrée</option><option value="2">Sortie</option><option value="3">Transfert</option></select></label>
        <label>Article<select name="articleId" value={formData.articleId} onChange={handleChange} disabled={!canSubmit} required>{articles.map((article) => <option key={article.id} value={article.id}>{article.reference} — {article.designation}</option>)}</select></label>
        {!isEntry && <label>Emplacement source<select name="emplacementSourceId" value={formData.emplacementSourceId} onChange={handleChange} disabled={!canSubmit} required>{emplacements.map((emplacement) => <option key={emplacement.id} value={emplacement.id}>{emplacement.codeEmplacement}</option>)}</select></label>}
        {!isExit && <label>Emplacement destination<select name="emplacementDestinationId" value={formData.emplacementDestinationId} onChange={handleChange} disabled={!canSubmit} required>{emplacements.map((emplacement) => <option key={emplacement.id} value={emplacement.id}>{emplacement.codeEmplacement}</option>)}</select></label>}
        <label>Quantité<input name="quantite" type="number" min="1" step="1" value={formData.quantite} onChange={handleChange} disabled={!canSubmit} required /></label>
        {isTransfer && <p className="form-hint">Le transfert retire la quantité de la source et l’ajoute à la destination.</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="submit" disabled={submitting || !canSubmit}>{submitting ? 'Enregistrement...' : `Enregistrer l’${movementTypes[formData.type].toLowerCase()}`}</button><button type="button" onClick={onCancel} disabled={submitting}>Annuler</button></div>
      </form>
    </section>
  );
}

export default MouvementStockForm;
