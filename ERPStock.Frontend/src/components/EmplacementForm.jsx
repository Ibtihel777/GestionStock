import { useEffect, useState } from 'react';
import { createEmplacement, updateEmplacement } from '../services/emplacementService';
import { getAllDepots } from '../services/depotService';

const emptyEmplacement = { depotId: '', zone: '', etagere: '', tiroir: '' };

function EmplacementForm({ emplacement, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyEmplacement);
  const [depots, setDepots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(emplacement);
  useEffect(() => { setFormData(emplacement ? { depotId: emplacement.depotId ?? '', zone: emplacement.zone, etagere: emplacement.etagere, tiroir: emplacement.tiroir } : emptyEmplacement); setError(null); }, [emplacement]);
  useEffect(() => { getAllDepots().then(setDepots).catch(() => setError("Impossible de charger les dépôts.")); }, []);
  const handleChange = ({ target: { name, value } }) => setFormData((current) => ({ ...current, [name]: value }));
  const handleSubmit = async (event) => { event.preventDefault(); setSubmitting(true); setError(null); try { const data = { ...formData, depotId: Number(formData.depotId) }; if (isEditing) await updateEmplacement(emplacement.id, data); else await createEmplacement(data); await onSaved(); } catch (requestError) { setError(requestError.response?.data?.message ?? "L'emplacement n'a pas pu être enregistré."); } finally { setSubmitting(false); } };
  return <section className="entity-form" aria-labelledby="emplacement-form-title"><h2 id="emplacement-form-title">{isEditing ? 'Modifier l’emplacement' : 'Nouvel emplacement'}</h2><form onSubmit={handleSubmit}>
    <label>Dépôt<select name="depotId" value={formData.depotId} onChange={handleChange} required><option value="" disabled>Sélectionnez un dépôt</option>{depots.map((depot) => <option key={depot.id} value={depot.id}>{depot.reference} — {depot.nom}</option>)}</select></label>
    <label>Zone<input name="zone" value={formData.zone} onChange={handleChange} required /></label><label>Étagère<input name="etagere" value={formData.etagere} onChange={handleChange} required /></label><label>Tiroir<input name="tiroir" value={formData.tiroir} onChange={handleChange} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}</button><button type="button" onClick={onCancel} disabled={submitting}>Annuler</button></div>
  </form></section>;
}

export default EmplacementForm;
