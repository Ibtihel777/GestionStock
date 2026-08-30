import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { deleteArticle, getAllArticles } from '../services/articleService';
import ArticleForm from './ArticleForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Modal from './Modal';
import TableRowsToggle from './TableRowsToggle';

const typeLabels = ['Standard', 'Gamme'];
const suiviLabels = ['Suivi', 'Non suivi', 'Lot'];
const getPriceLabel = (modeGestion) => modeGestion === 'CMUP' ? 'CMUP' : 'Prix du premier lot';

const ArticleList = forwardRef(function ArticleList({ canManage }, ref) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [articleToEdit, setArticleToEdit] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setArticles(await getAllArticles());
      setShowAllRows(false);
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les articles. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);
  useImperativeHandle(ref, () => ({ refresh: fetchArticles }));

  const filteredArticles = [...articles]
    .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
    .filter((article) => {
      const search = searchTerm.trim().toLocaleLowerCase();
      return [article.reference, article.designation, article.modeGestion, article.familleReference, article.familleNom]
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(search));
    });
  const isSearching = Boolean(searchTerm.trim());
  const displayedArticles = showAllRows || isSearching ? filteredArticles : filteredArticles.slice(0, 5);
  const closeForm = () => { setIsFormOpen(false); setArticleToEdit(null); };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteArticle(articleToDelete.id);
      setArticleToDelete(null);
      await fetchArticles();
    } catch (requestError) {
      setActionError(requestError.response?.data?.message ?? "L'article n'a pas pu être supprimé.");
    } finally {
      setIsDeleting(false);
    }
  };

  return <section className="entity-section" aria-labelledby="articles-title">
    <div className="entity-list-header">
      <div><h2 id="articles-title">Articles</h2><p>Références, familles, suivi et règles de valorisation.</p>{canManage && <span className="management-hint">Les actions de modification et de suppression sont réservées au SuperAdmin.</span>}</div>
      {canManage && <button type="button" onClick={() => { setArticleToEdit(null); setActionError(null); setIsFormOpen(true); }}>Nouvel article</button>}
    </div>
    {isFormOpen && <Modal title={articleToEdit ? 'Modifier l’article' : 'Nouvel article'} onClose={closeForm} size="wide"><ArticleForm article={articleToEdit} onSaved={async () => { await fetchArticles(); closeForm(); }} onCancel={closeForm} /></Modal>}
    {articleToDelete && <DeleteConfirmationModal itemName={'l’article « ' + articleToDelete.designation + ' »'} impact="Cette action supprime aussi tous ses stocks,vérifications et signalements." onConfirm={confirmDelete} onCancel={() => setArticleToDelete(null)} isDeleting={isDeleting} />}
    {actionError && <p className="form-error" role="alert">{actionError}</p>}
    {loading && <p>Chargement des articles...</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {!loading && !error && <><div className="table-search"><label htmlFor="articles-search">Rechercher</label><input id="articles-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Référence, désignation ou famille…" /></div><div className="table-wrapper"><table><thead><tr><th>Référence</th><th>Désignation</th><th>Famille</th><th>Type</th><th>Suivi</th><th>Mode</th><th>Prix </th><th>Unité</th><th>Créé le</th>{canManage && <th>Actions</th>}</tr></thead><tbody>
      {articles.length === 0 ? <tr><td colSpan={canManage ? 10 : 9} className="empty-cell">Aucun article enregistré.</td></tr> : filteredArticles.length === 0 ? <tr><td colSpan={canManage ? 10 : 9} className="empty-cell">Aucun article ne correspond à cette recherche.</td></tr> : displayedArticles.map((article) => <tr key={article.id}><td>{article.reference}</td><td>{article.designation}</td><td>{article.familleReference || '—'}</td><td>{typeLabels[article.type] ?? '—'}</td><td>{suiviLabels[article.suiviStock] ?? '—'}</td><td>{article.modeGestion}</td><td className="article-price"><span>{getPriceLabel(article.modeGestion)}</span><strong>{article.cmup}</strong></td><td>{article.uniteMesure}</td><td>{new Date(article.dateCreation).toLocaleDateString('fr-FR')}</td>{canManage && <td className="table-actions"><button type="button" className="edit-article-button" onClick={() => { setArticleToEdit(article); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => setArticleToDelete(article)}>Supprimer</button></td>}</tr>)}
    </tbody></table></div>{!isSearching && filteredArticles.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((current) => !current)} />}</>}
  </section>;
});

export default ArticleList;
