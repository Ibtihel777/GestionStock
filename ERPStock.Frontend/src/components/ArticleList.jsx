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
      const data = await getAllArticles();
      setArticles(data);
      setError(null);
    } catch (requestError) {
      setError("Impossible de charger les articles. Vérifie que l'API tourne.");
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openCreateForm = () => {
    setArticleToEdit(null);
    setActionError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (article) => {
    setArticleToEdit(article);
    setActionError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setArticleToEdit(null);
  };

  const handleSaved = async () => {
    await fetchArticles();
    closeForm();
  };

  const handleDelete = async (article) => {
    const shouldDelete = window.confirm(`Supprimer l’article « ${article.reference} » ?`);
    if (!shouldDelete) return;

    try {
      setActionError(null);
      await deleteArticle(article.id);
      await fetchArticles();
    } catch (requestError) {
      console.error(requestError);
      setActionError("L'article n'a pas pu être supprimé.");
    }
  };

  return (
    <div>
      <div className="article-list-header">
        <h2>Liste des articles</h2>
        <button type="button" onClick={openCreateForm}>Nouvel article</button>
      </div>

      {isFormOpen && (
        <ArticleForm
          article={articleToEdit}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      {loading && <p>Chargement des articles...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Référence</th>
              <th>Désignation</th>
              <th>Mode de gestion</th>
              <th>CMUP</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.id}</td>
                <td>{article.reference}</td>
                <td>{article.designation}</td>
                <td>{article.modeGestion}</td>
                <td>{article.cmup}</td>
                <td>{new Date(article.dateCreation).toLocaleDateString()}</td>
                <td className="table-actions">
                  <button type="button" onClick={() => openEditForm(article)}>Modifier</button>
                  <button type="button" onClick={() => handleDelete(article)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ArticleList;
