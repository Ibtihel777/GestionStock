import { useEffect, useState } from 'react';
import { createArticle, updateArticle } from '../services/articleService';

const emptyArticle = {
  reference: '',
  designation: '',
  modeGestion: 'FIFO',
  cmup: '',
};

function ArticleForm({ article, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyArticle);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(article);

  useEffect(() => {
    if (article) {
      setFormData({
        reference: article.reference ?? '',
        designation: article.designation ?? '',
        modeGestion: article.modeGestion ?? 'FIFO',
        cmup: article.cmup ?? '',
      });
    } else {
      setFormData(emptyArticle);
    }
    setError(null);
  }, [article]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const articleData = { ...formData, cmup: Number(formData.cmup) };

      if (isEditing) {
        await updateArticle(article.id, articleData);
      } else {
        await createArticle(articleData);
      }

      await onSaved();
    } catch (requestError) {
      console.error(requestError);
      setError("L'article n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="article-form" aria-labelledby="article-form-title">
      <h2 id="article-form-title">{isEditing ? 'Modifier l’article' : 'Nouvel article'}</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Référence
          <input name="reference" value={formData.reference} onChange={handleChange} required />
        </label>

        <label>
          Désignation
          <input name="designation" value={formData.designation} onChange={handleChange} required />
        </label>

        <label>
          Mode de gestion
          <select name="modeGestion" value={formData.modeGestion} onChange={handleChange} required>
            <option value="FIFO">FIFO</option>
            <option value="LIFO">LIFO</option>
            <option value="CMUP">CMUP</option>
          </select>
        </label>

        <label>
          CMUP
          <input name="cmup" type="number" min="0" step="0.01" value={formData.cmup} onChange={handleChange} required />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>Annuler</button>
        </div>
      </form>
    </section>
  );
}

export default ArticleForm;
