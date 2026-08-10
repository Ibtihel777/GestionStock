import ArticleList from './components/ArticleList';
import EmplacementList from './components/EmplacementList';
import StockList from './components/StockList';
import './App.css';

function App() {
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
        <StockList />
      </div>
    </main>
  );
}

export default App;
