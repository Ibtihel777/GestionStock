import { useState, useEffect } from 'react';
import { getAllArticles } from '../services/articleService';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les articles. Vérifie que l'API tourne.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Chargement des articles...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Liste des Articles</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Mode Gestion</th>
            <th>CMUP</th>
            <th>Date Création</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ArticleList;