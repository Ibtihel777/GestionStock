import { useEffect, useState } from 'react';
import { createDepot, updateDepot } from '../services/depotService';

const emptyDepot = { reference: '', nom: '', depotParentId: '' };

function DepotForm({ depot, depots, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyDepot);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(depot);

  useEffect(() => {
    setFormData(depot
      ? { reference: depot.reference ?? '', nom: depot.nom ?? '', depotParentId: depot.depotParentId ?? '' }
      : emptyDepot);
    setError(null);
  }, [depot]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = {
        ...formData,
        depotParentId: formData.depotParentId === '' ? null : Number(formData.depotParentId),
      };
      if (isEditing) await updateDepot(depot.id, data);
      else await createDepot(data);
      await onSaved();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Le dépôt n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  };

  return <section className="entity-form" aria-labelledby="depot-form-title">
    <h2 id="depot-form-title">{isEditing ? 'Modifier le dépôt' : 'Nouveau dépôt'}</h2>
    <form onSubmit={handleSubmit}>
      <label>Référence
        <input name="reference" value={formData.reference} onChange={(event) => setFormData({ ...formData, reference: event.target.value })} />
      </label>
      <label>Nom
        <input name="nom" value={formData.nom} onChange={(event) => setFormData({ ...formData, nom: event.target.value })} required />
      </label>
      <label>Dépôt parent
        <select name="depotParentId" value={formData.depotParentId} onChange={(event) => setFormData({ ...formData, depotParentId: event.target.value })}>
          <option value="">Aucun</option>
          {depots.filter((item) => item.id !== depot?.id).map((item) => <option key={item.id} value={item.id}>{item.reference} — {item.nom}</option>)}
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

export default DepotForm;
