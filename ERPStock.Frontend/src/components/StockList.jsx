import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { getAllStocks } from '../services/stockService';

const StockList = forwardRef(function StockList(_, ref) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setStocks(await getAllStocks());
      setError(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger les stocks. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);
  useImperativeHandle(ref, () => ({ refresh: fetchStocks }));

  return (
    <section className="entity-section" aria-labelledby="stocks-title">
      <div className="entity-list-header"><div><h2 id="stocks-title">Stocks disponibles</h2><p>Les quantités sont mises à jour uniquement par les mouvements de stock.</p></div></div>
      {loading && <p>Chargement des stocks...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <div className="table-wrapper"><table><thead><tr><th>Article</th><th>Emplacement</th><th>Quantité disponible</th></tr></thead><tbody>{stocks.length === 0 ? <tr><td colSpan="3" className="empty-cell">Aucun stock disponible.</td></tr> : stocks.map((stock) => <tr key={stock.id}><td>{stock.articleReference}</td><td>{stock.codeEmplacement}</td><td>{stock.quantite}</td></tr>)}</tbody></table></div>}
    </section>
  );
});

export default StockList;
