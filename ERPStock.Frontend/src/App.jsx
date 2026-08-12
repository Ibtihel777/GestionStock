import { useRef, useState } from 'react';
import ArticleList from './components/ArticleList';
import EmplacementList from './components/EmplacementList';
import Login from './components/Login';
import MouvementStockList from './components/MouvementStockList';
import SignalementList from './components/SignalementList';
import StockList from './components/StockList';
import VerificationStockList from './components/VerificationStockList';
import { getStoredSession } from './services/api';
import './App.css';

function App() {
  const stockListRef = useRef(null);
  const articleListRef = useRef(null);
  const [session, setSession] = useState(getStoredSession);

  const handleLogin = (newSession) => {
    localStorage.setItem('erpstock_session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    localStorage.removeItem('erpstock_session');
    setSession(null);
  };

  if (!session) return <Login onLogin={handleLogin} />;

  const isSuperAdmin = session.role === 'SuperAdmin';

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header-top">
          <p className="eyebrow">ERPStock</p>
          <button className="logout-button" type="button" onClick={handleLogout}>Déconnexion</button>
        </div>
        <h1>Gestion des stocks</h1>
        <p>{isSuperAdmin ? 'Administration complète des articles, emplacements et mouvements.' : 'Consultation du stock et vérification par IA.'}</p>
        <p className="session-summary">{session.email} <span>{isSuperAdmin ? 'SuperAdmin' : 'Consultant'}</span></p>
      </header>
      <div className="dashboard">
        {isSuperAdmin && <SignalementList />}
        <ArticleList ref={articleListRef} canManage={isSuperAdmin} />
        <EmplacementList canManage={isSuperAdmin} />
        <MouvementStockList canManage={isSuperAdmin} onMovementRecorded={() => { stockListRef.current?.refresh(); articleListRef.current?.refresh(); }} />
        <StockList ref={stockListRef} />
        <VerificationStockList />
      </div>
    </main>
  );
}

export default App;
