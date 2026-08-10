import { useEffect, useState } from 'react';
import { createEmplacement, updateEmplacement } from '../services/emplacementService';

const emptyEmplacement = { zone: '', etagere: '', tiroir: '' };

function EmplacementForm({ emplacement, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyEmplacement);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(emplacement);

  useEffect(() => {
    setFormData(emplacement ? {
      zone: emplacement.zone,
      etagere: emplacement.etagere,
      tiroir: emplacement.tiroir,
    } : emptyEmplacement);
    setError(null);
  }, [emplacement]);

  const handleChange = ({ target: { name, value } }) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing) await updateEmplacement(emplacement.id, formData);
      else await createEmplacement(formData);
      await onSaved();
    } catch (requestError) {
      console.error(requestError);
      setError("L'emplacement n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="entity-form" aria-labelledby="emplacement-form-title">
      <h2 id="emplacement-form-title">{isEditing ? 'Modifier l’emplacement' : 'Nouvel emplacement'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Zone<input name="zone" value={formData.zone} onChange={handleChange} required /></label>
        <label>Étagère<input name="etagere" value={formData.etagere} onChange={handleChange} required /></label>
        <label>Tiroir<input name="tiroir" value={formData.tiroir} onChange={handleChange} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}</button><button type="button" onClick={onCancel} disabled={submitting}>Annuler</button></div>
      </form>
    </section>
  );
}

export default EmplacementForm;
