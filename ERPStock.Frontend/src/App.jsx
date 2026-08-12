import { useRef, useState } from 'react';
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

  const handleLogin = (newSession) => {
    localStorage.setItem('erpstock_session', JSON.stringify(newSession));
    setSession(newSession);
    setView(newSession.role === 'SuperAdmin' ? 'dashboard' : 'management');
  };
  const handleLogout = () => { localStorage.removeItem('erpstock_session'); setSession(null); };
  if (!session) return <Login onLogin={handleLogin} />;

  const isSuperAdmin = session.role === 'SuperAdmin';
  const showDashboard = isSuperAdmin && view === 'dashboard';

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header-top"><p className="eyebrow">ERPStock</p><button className="logout-button" type="button" onClick={handleLogout}>Déconnexion</button></div>
        <h1>{showDashboard ? 'Tableau de bord' : 'Gestion des stocks'}</h1>
        <p>{showDashboard ? 'La synthèse opérationnelle de votre stock et des alertes à suivre.' : isSuperAdmin ? 'Gérez les données et consultez le détail opérationnel.' : 'Consultez le stock et effectuez vos vérifications par IA.'}</p>
        <p className="session-summary">{session.email} <span>{isSuperAdmin ? 'SuperAdmin' : 'Consultant'}</span></p>
      </header>

      {isSuperAdmin && <nav className="app-navigation" aria-label="Navigation principale"><button className={showDashboard ? 'is-active' : ''} type="button" onClick={() => setView('dashboard')}>Tableau de bord</button><button className={!showDashboard ? 'is-active' : ''} type="button" onClick={() => setView('management')}>Gestion détaillée</button></nav>}

      {showDashboard ? <AdminDashboard onOpenManagement={() => setView('management')} /> : <div className="dashboard">
        {isSuperAdmin && <SignalementList />}
        <ArticleList ref={articleListRef} canManage={isSuperAdmin} />
        <EmplacementList canManage={isSuperAdmin} />
        <MouvementStockList canManage={isSuperAdmin} onMovementRecorded={() => { stockListRef.current?.refresh(); articleListRef.current?.refresh(); }} />
        <StockList ref={stockListRef} />
        <VerificationStockList />
      </div>}
    </main>
  );
}

export default App;
