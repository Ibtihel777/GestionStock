import { useEffect, useState } from 'react';
import { createFamilleArticle, updateFamilleArticle } from '../services/familleArticleService';

const emptyFamille = { reference: '', nom: '', familleParentId: '' };

function FamilleArticleForm({ famille, familles, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyFamille);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(famille);

  useEffect(() => {
    setFormData(famille
      ? { reference: famille.reference ?? '', nom: famille.nom ?? '', familleParentId: famille.familleParentId ?? '' }
      : emptyFamille);
    setError(null);
  }, [famille]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = {
        ...formData,
        familleParentId: formData.familleParentId === '' ? null : Number(formData.familleParentId),
      };
      if (isEditing) await updateFamilleArticle(famille.id, data);
      else await createFamilleArticle(data);
      await onSaved();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "La famille n'a pas pu être enregistrée.");
    } finally {
      setSubmitting(false);
    }
  };

  return <section className="entity-form" aria-labelledby="famille-form-title">
    <h2 id="famille-form-title">{isEditing ? 'Modifier la famille' : 'Nouvelle famille'}</h2>
    <form onSubmit={handleSubmit}>
      <label>Référence
        <input value={formData.reference} onChange={(event) => setFormData({ ...formData, reference: event.target.value })} />
      </label>
      <label>Nom
        <input value={formData.nom} onChange={(event) => setFormData({ ...formData, nom: event.target.value })} required />
      </label>
      <label>Famille parente
        <select value={formData.familleParentId} onChange={(event) => setFormData({ ...formData, familleParentId: event.target.value })}>
          <option value="">Aucune</option>
          {familles.filter((item) => item.id !== famille?.id).map((item) => <option key={item.id} value={item.id}>{item.reference} — {item.nom}</option>)}
        </select>
      </label>
      <p className="form-hint">La référence est libre et facultative.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}</button>
        <button type="button" onClick={onCancel} disabled={submitting}>Annuler</button>
      </div>
    </form>
  </section>;
}

export default FamilleArticleForm;
