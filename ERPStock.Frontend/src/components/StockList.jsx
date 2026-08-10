import { useEffect, useState } from 'react';
import { getAllArticles } from '../services/articleService';
import { getAllEmplacements } from '../services/emplacementService';
import { deleteStock, getAllStocks } from '../services/stockService';
import StockForm from './StockForm';

function StockList() {
  const [stocks, setStocks] = useState([]);
  const [articles, setArticles] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [stockToEdit, setStockToEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stocksData, articlesData, emplacementsData] = await Promise.all([
        getAllStocks(), getAllArticles(), getAllEmplacements(),
      ]);
      setStocks(stocksData);
      setArticles(articlesData);
      setEmplacements(emplacementsData);
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les stocks. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const closeForm = () => { setIsFormOpen(false); setStockToEdit(null); };
  const handleDelete = async (stock) => {
    if (!window.confirm(`Supprimer le stock de ${stock.articleReference} à l’emplacement ${stock.codeEmplacement} ?`)) return;
    try {
      setActionError(null);
      await deleteStock(stock.id);
      await fetchData();
    } catch (requestError) {
      console.error(requestError);
      setActionError("Le stock n'a pas pu être supprimé.");
    }
  };

  return (
    <section className="entity-section" aria-labelledby="stocks-title">
      <div className="entity-list-header"><div><h2 id="stocks-title">Stocks</h2><p>Suivez les quantités par article et emplacement.</p></div><button type="button" onClick={() => { setStockToEdit(null); setActionError(null); setIsFormOpen(true); }}>Nouveau stock</button></div>
      {isFormOpen && <StockForm stock={stockToEdit} articles={articles} emplacements={emplacements} onSaved={async () => { await fetchData(); closeForm(); }} onCancel={closeForm} />}
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      {loading && <p>Chargement des stocks...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <div className="table-wrapper"><table><thead><tr><th>Article</th><th>Emplacement</th><th>Quantité</th><th>Actions</th></tr></thead><tbody>{stocks.length === 0 ? <tr><td colSpan="4" className="empty-cell">Aucun stock enregistré.</td></tr> : stocks.map((stock) => <tr key={stock.id}><td>{stock.articleReference}</td><td>{stock.codeEmplacement}</td><td>{stock.quantite}</td><td className="table-actions"><button type="button" onClick={() => { setStockToEdit(stock); setActionError(null); setIsFormOpen(true); }}>Modifier</button><button type="button" className="danger-button" onClick={() => handleDelete(stock)}>Supprimer</button></td></tr>)}</tbody></table></div>}
    </section>
  );
}

export default StockList;
