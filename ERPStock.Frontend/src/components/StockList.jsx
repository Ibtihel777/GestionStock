import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { deleteStock, getAllStocks } from '../services/stockService';
import StockForm from './StockForm';
import TableRowsToggle from './TableRowsToggle';

const StockList = forwardRef(function StockList({ canManage }, ref) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);
  const [stockToEdit, setStockToEdit] = useState(null);
  const [actionError, setActionError] = useState(null);

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
  const closeForm = () => setStockToEdit(null);

  const handleDelete = async (stock) => {
    if (!window.confirm(`Supprimer le stock de « ${stock.articleReference} » à l'emplacement « ${stock.codeEmplacement} » ?`)) return;
    try {
      setActionError(null);
      await deleteStock(stock.id);
      await fetchStocks();
    } catch (requestError) {
      console.error(requestError);
      setActionError('Le stock n’a pas pu être supprimé.');
    }
  };

  return (
    <section className="entity-section" aria-labelledby="stocks-title">
      <div className="entity-list-header"><div><h2 id="stocks-title">Stocks disponibles</h2><p>Les quantités sont mises à jour par les mouvements ou les ajustements validés par le SuperAdmin.</p></div></div>
      {stockToEdit && <StockForm stock={stockToEdit} onSaved={async () => { await fetchStocks(); closeForm(); }} onCancel={closeForm} />}
      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      {loading && <p>Chargement des stocks...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <>
        <div className="table-search"><label htmlFor="stocks-search">Rechercher</label><input id="stocks-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Article ou emplacement…" /></div>
        <div className="table-wrapper"><table><thead><tr><th>Article</th><th>Emplacement</th><th>Quantité disponible</th>{canManage && <th>Actions</th>}</tr></thead><tbody>
          {stocks.length === 0 ? <tr><td colSpan={canManage ? 4 : 3} className="empty-cell">Aucun stock disponible.</td></tr>
            : filteredStocks.length === 0 ? <tr><td colSpan={canManage ? 4 : 3} className="empty-cell">Aucun stock ne correspond à cette recherche.</td></tr>
              : displayedStocks.map((stock) => <tr key={stock.id}><td>{stock.articleReference}</td><td>{stock.codeEmplacement}</td><td>{stock.quantite}</td>{canManage && <td className="table-actions"><button type="button" className="edit-article-button" onClick={() => { setStockToEdit(stock); setActionError(null); }} aria-label={`Modifier le stock de ${stock.articleReference}`}>Modifier</button><button type="button" className="danger-button" onClick={() => handleDelete(stock)} aria-label={`Supprimer le stock de ${stock.articleReference}`}>Supprimer</button></td>}</tr>)}
        </tbody></table></div>
        {!isSearching && filteredStocks.length > 5 && <TableRowsToggle isExpanded={showAllRows} onToggle={() => setShowAllRows((current) => !current)} />}
      </>}
    </section>
  );
});

export default StockList;
