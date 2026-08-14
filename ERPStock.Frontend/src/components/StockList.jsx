import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { getAllStocks } from '../services/stockService';
import TableRowsToggle from './TableRowsToggle';

const StockList = forwardRef(function StockList(_, ref) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);

  const filteredStocks = [...stocks]
    .sort((a, b) => b.id - a.id)
    .filter((stock) => {
      const search = searchTerm.trim().toLocaleLowerCase();
      return [stock.articleReference, stock.codeEmplacement]
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(search));
    });
  const isSearching = Boolean(searchTerm.trim());
  const displayedStocks = showAllRows || isSearching ? filteredStocks : filteredStocks.slice(0, 5);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setStocks(await getAllStocks());
      setShowAllRows(false);
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
      {!loading && !error && <>
        <div className="table-search"><label htmlFor="stocks-search">Rechercher</label><input id="stocks-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Article ou emplacement…" /></div>
        <div className="table-wrapper"><table><thead><tr><th>Article</th><th>Emplacement</th><th>Quantité disponible</th></tr></thead><tbody>
          {stocks.length === 0 ? <tr><td colSpan="3" className="empty-cell">Aucun stock disponible.</td></tr>
            : filteredStocks.length === 0 ? <tr><td colSpan="3" className="empty-cell">Aucun stock ne correspond à cette recherche.</td></tr>
              : displayedStocks.map((stock) => <tr key={stock.id}><td>{stock.articleReference}</td><td>{stock.codeEmplacement}</td><td>{stock.quantite}</td></tr>)}
        </tbody></table></div>
        {!isSearching && filteredStocks.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((current) => !current)} />}
      </>}
    </section>
  );
});

export default StockList;
