import ArticleList from './components/ArticleList';
import EmplacementList from './components/EmplacementList';
import MouvementStockList from './components/MouvementStockList';
import StockList from './components/StockList';
import { useRef } from 'react';
import './App.css';

function App() {
  const stockListRef = useRef(null);

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">ERPStock</p>
        <h1>Gestion des stocks</h1>
        <p>Articles, emplacements et quantités au même endroit.</p>
      </header>
      <div className="dashboard">
        <ArticleList />
        <EmplacementList />
        <MouvementStockList onMovementRecorded={() => stockListRef.current?.refresh()} />
        <StockList ref={stockListRef} />
      </div>
    </main>
  );
}

export default App;
