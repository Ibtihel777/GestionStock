import { useEffect, useState } from 'react';
import { createArticle, updateArticle } from '../services/articleService';
import { getAllEmplacements } from '../services/emplacementService';
import { getAllFamillesArticles } from '../services/familleArticleService';

const DEFAULT_UNIT = 'Unit\u00e9';

const emptyArticle = {
  reference: '',
  designation: '',
  modeGestion: 'FIFO',
  familleArticleId: '',
  type: '0',
  suiviStock: '0',
  cmup: '',
  uniteMesure: DEFAULT_UNIT,
  seuilMinimum: '',
  initialStockQuantity: '',
  initialStockEmplacementId: '',
};

function ArticleForm({ article, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyArticle);
  const [familles, setFamilles] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(article);
  const initialQuantity = Number(formData.initialStockQuantity || 0);
  const initialCostLabel = formData.modeGestion === 'CMUP'
    ? 'Coût moyen pondéré initial (CMUP)'
    : 'Prix du premier lot';

  useEffect(() => {
    setFormData(article ? {
      reference: article.reference ?? '',
      designation: article.designation ?? '',
      modeGestion: article.modeGestion ?? 'FIFO',
      familleArticleId: article.familleArticleId ?? '',
      type: String(article.type ?? 0),
      suiviStock: String(article.suiviStock ?? 0),
      cmup: article.cmup ?? '',
      uniteMesure: article.uniteMesure?.trim() || DEFAULT_UNIT,
      seuilMinimum: article.seuilMinimum || '',
      initialStockQuantity: '',
      initialStockEmplacementId: '',
    } : emptyArticle);
    setError(null);
  }, [article]);

  useEffect(() => {
    Promise.all([getAllFamillesArticles(), getAllEmplacements()])
      .then(([famillesData, emplacementsData]) => {
        setFamilles(famillesData);
        setEmplacements(emplacementsData);
      })
      .catch(() => setError("Impossible de charger les familles ou les emplacements."));
  }, []);

  const handleChange = ({ target: { name, value } }) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!isEditing && initialQuantity > 0 && !formData.initialStockEmplacementId) {
        throw new Error('Sélectionnez un emplacement pour le stock initial.');
      }
      if (!isEditing && initialQuantity > 0 && Number(formData.cmup) <= 0) {
        throw new Error('Le CMUP doit être supérieur à zéro pour créer un stock initial.');
      }

      const articleData = {
        reference: formData.reference,
        designation: formData.designation,
        modeGestion: formData.modeGestion,
        familleArticleId: Number(formData.familleArticleId),
        type: Number(formData.type),
        suiviStock: Number(formData.suiviStock),
        cmup: Number(formData.cmup),
        uniteMesure: formData.uniteMesure?.trim() || DEFAULT_UNIT,
        seuilMinimum: Number(formData.seuilMinimum),
        initialStockQuantity: isEditing ? 0 : initialQuantity,
        initialStockEmplacementId: isEditing || initialQuantity === 0 ? null : Number(formData.initialStockEmplacementId),
      };
      if (isEditing) await updateArticle(article.id, articleData);
      else await createArticle(articleData);
      await onSaved();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? requestError.message ?? "L'article n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  };

  return <section className="entity-form" aria-labelledby="article-form-title">
    <h2 id="article-form-title">{isEditing ? 'Modifier l’article' : 'Nouvel article'}</h2>
    <form onSubmit={handleSubmit}>
      <label>Référence<input name="reference" value={formData.reference} onChange={handleChange} required /></label>
      <label>Désignation<input name="designation" value={formData.designation} onChange={handleChange} required /></label>
      <label>Mode de gestion<select name="modeGestion" value={formData.modeGestion} onChange={handleChange} required><option value="FIFO">FIFO</option><option value="LIFO">LIFO</option><option value="CMUP">CMUP</option></select></label>
      <label>Famille<select name="familleArticleId" value={formData.familleArticleId} onChange={handleChange} required><option value="" disabled>Sélectionnez une famille</option>{familles.map((famille) => <option key={famille.id} value={famille.id}>{famille.reference} — {famille.nom}</option>)}</select></label>
      <label>Type d'article<select name="type" value={formData.type} onChange={handleChange} required><option value="0">Standard</option><option value="1">Gamme</option></select></label>
      <label>Suivi en stock<select name="suiviStock" value={formData.suiviStock} onChange={handleChange} required><option value="0">Suivi</option><option value="1">Non suivi</option><option value="2">Lot</option></select></label>
      <label>{initialCostLabel}<input name="cmup" type="number" min="0" step="0.01" value={formData.cmup} onChange={handleChange} required /></label>
      <label>Unité de mesure<select name="uniteMesure" value={formData.uniteMesure} onChange={handleChange} required><option value={DEFAULT_UNIT}>{DEFAULT_UNIT}</option><option value="kg">kg</option><option value="g">g</option><option value="litre">litre</option><option value="mL">mL</option><option value="mètre">mètre</option><option value="m²">m²</option></select></label>
      <label>Seuil minimum<input name="seuilMinimum" type="number" min="1" step="1" value={formData.seuilMinimum} onChange={handleChange} required /><small>Une alerte rouge s’affiche lorsque la quantité atteint ce seuil.</small></label>
      {!isEditing && <fieldset className="initial-stock-fields">
        <legend>Stock initial </legend>
        <label>Emplacement<select name="initialStockEmplacementId" value={formData.initialStockEmplacementId} onChange={handleChange}><option value="">Aucun stock initial</option>{emplacements.map((emplacement) => <option key={emplacement.id} value={emplacement.id}>{emplacement.codeEmplacement} — {emplacement.depotNom ?? emplacement.depotReference}</option>)}</select></label>
        <label>Quantité initiale ({formData.uniteMesure})<input name="initialStockQuantity" type="number" min="0" step="1" value={formData.initialStockQuantity} onChange={handleChange} /></label>
      </fieldset>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}</button><button type="button" onClick={onCancel} disabled={submitting}>Annuler</button></div>
    </form>
  </section>;
}

export default ArticleForm;
