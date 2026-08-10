import { useEffect, useState } from 'react';
import { deleteArticle, getAllArticles } from '../services/articleService';
import ArticleForm from './ArticleForm';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleToEdit, setArticleToEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setArticles(await getAllArticles());
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les articles. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);
  const closeForm = () => { setIsFormOpen(false); setArticleToEdit(null); };
  const handleDelete = async (article) => {
    if (!window.confirm(`Supprimer l’article « ${article.reference} » ?`)) return;
    try {
      setActionError(null);
      await deleteArticle(article.id);
      await fetchArticles();
    } catch (requestError) {
      console.error(requestError);
      setActionError("L'article n'a pas pu être supprimé. Il est peut-être utilisé par un stock.");
    }
  };

  return (
    <section className="entity-section" aria-labelledby="articles-title">
      <div className="entity-list-header"><div><h2 id="articles-title">Articles</h2><p>Références et règles de valorisation.</p></div><button type="button" onClick={() => { setArticleToEdit(null); setActionError(null); setIsFormOpen(true); }}>Nouvel article</button></div>
      {isFormOpen && <ArticleForm article={articleToEdit} onSaved={async () => { await fetchArticles(); closeForm(); }} onCancel={closeForm} />}
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      {loading && <p>Chargement des articles...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <div className="table-wrapper"><table><thead><tr><th>Référence</th><th>Désignation</th><th>Mode</th><th>CMUP</th><th>Créé le</th><th>Actions</th></tr></thead><tbody>{articles.length === 0 ? <tr><td colSpan="6" className="empty-cell">Aucun article enregistré.</td></tr> : articles.map((article) => <tr key={article.id}><td>{article.reference}</td><td>{article.designation}</td><td>{article.modeGestion}</td><td>{article.cmup}</td><td>{new Date(article.dateCreation).toLocaleDateString('fr-FR')}</td><td className="table-actions"><button type="button" onClick={() => { setArticleToEdit(article); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => handleDelete(article)}>Supprimer</button></td></tr>)}</tbody></table></div>}
    </section>
  );
}

export default ArticleList;
