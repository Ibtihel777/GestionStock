import { useEffect, useRef, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
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
  const [view, setView] = useState('dashboard');
  const [shouldFocusAlerts, setShouldFocusAlerts] = useState(false);

  const handleLogin = (newSession) => {
    localStorage.setItem('erpstock_session', JSON.stringify(newSession));
    setSession(newSession);
    setView(newSession.role === 'SuperAdmin' ? 'dashboard' : 'management');
  };
  const handleLogout = () => { localStorage.removeItem('erpstock_session'); setSession(null); };

  useEffect(() => {
    if (!shouldFocusAlerts || view !== 'management' || !session) return;

    document.getElementById('signalements-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShouldFocusAlerts(false);
  }, [session, shouldFocusAlerts, view]);

  const openAlerts = () => {
    setView('management');
    setShouldFocusAlerts(true);
  };

  if (!session) return <Login onLogin={handleLogin} />;

  const isSuperAdmin = session.role === 'SuperAdmin';
  const showDashboard = isSuperAdmin && view === 'dashboard';

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header-top"><button className="logout-button" type="button" onClick={handleLogout}>Déconnexion</button></div>
        <h1>{showDashboard ? 'Tableau de bord' : 'Gestion des stocks'}</h1>
        
        <p className="session-summary">{session.email} <span>{isSuperAdmin ? 'SuperAdmin' : 'Consultant'}</span></p>
      </header>

      {isSuperAdmin && <nav className="app-navigation" aria-label="Navigation principale"><div className="navigation-links"><button className={showDashboard ? 'is-active' : ''} type="button" onClick={() => setView('dashboard')}><span aria-hidden="true">▦</span>Tableau de bord</button><button className={!showDashboard ? 'is-active' : ''} type="button" onClick={() => setView('management')}><span aria-hidden="true">☷</span>Gestion détaillée</button></div></nav>}

      {showDashboard ? <AdminDashboard onOpenManagement={() => setView('management')} onOpenAlerts={openAlerts} /> : <div className="dashboard">
        {isSuperAdmin && <SignalementList onStockAdjusted={() => stockListRef.current?.refresh()} />}
        <ArticleList ref={articleListRef} canManage={isSuperAdmin} />
        <EmplacementList canManage={isSuperAdmin} />
        <MouvementStockList canManage={isSuperAdmin} onMovementRecorded={() => { stockListRef.current?.refresh(); articleListRef.current?.refresh(); }} />
        <StockList ref={stockListRef} canManage={isSuperAdmin} />
        <VerificationStockList />
      </div>}
    </main>
  );
}

export default App;
