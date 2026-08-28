import { useEffect, useRef, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import ArticleList from './components/ArticleList';
import DepotList from './components/DepotList';
import EmplacementList from './components/EmplacementList';
import FamilleArticleList from './components/FamilleArticleList';
import Login from './components/Login';
import MouvementStockList from './components/MouvementStockList';
import SignalementList from './components/SignalementList';
import StockList from './components/StockList';
import VerificationStockList from './components/VerificationStockList';
import { getStoredSession } from './services/api';
import './App.css';

const superAdminNavigation = [
 
  { id: 'dashboard', label: 'Tableau de bord', icon: '▦' },
  { id: 'articles', label: 'Gestion articles', icon: '▤' },
   { id: 'familles', label: 'Gestion familles', icon: '#' },
  { id: 'depots', label: 'Gestion dépôts', icon: '⌂' },
  { id: 'emplacements', label: 'Gestion emplacements', icon: '⌗' },
  { id: 'stock', label: 'Gestion stock', icon: '◫' },
  { id: 'mouvements', label: 'Mouvements', icon: '↔' },
  { id: 'verifications', label: 'Vérifications IA', icon: '◉' },
  { id: 'alertes', label: 'Alertes', icon: '!' },
];

const consultantNavigation = superAdminNavigation.filter((item) => !['dashboard', 'alertes'].includes(item.id));

function App() {
  const stockListRef = useRef(null);
  const articleListRef = useRef(null);
  const [session, setSession] = useState(getStoredSession);
  const [view, setView] = useState('dashboard');

  const handleLogin = (newSession) => {
    localStorage.setItem('erpstock_session', JSON.stringify(newSession));
    setSession(newSession);
    setView(newSession.role === 'SuperAdmin' ? 'dashboard' : 'articles');
  };
  const handleLogout = () => { localStorage.removeItem('erpstock_session'); setSession(null); };
  const isSuperAdmin = session?.role === 'SuperAdmin';
  const navigation = isSuperAdmin ? superAdminNavigation : consultantNavigation;

  useEffect(() => {
    if (session && !navigation.some((item) => item.id === view)) setView(navigation[0].id);
  }, [session, view, navigation]);

  if (!session) return <Login onLogin={handleLogin} />;

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <AdminDashboard onOpenManagement={() => setView('stock')} onOpenAlerts={() => setView('alertes')} />;
      case 'articles': return <ArticleList ref={articleListRef} canManage={isSuperAdmin} />;
      case 'familles': return <FamilleArticleList canManage={isSuperAdmin} />;
      case 'depots': return <DepotList canManage={isSuperAdmin} />;
      case 'emplacements': return <EmplacementList canManage={isSuperAdmin} />;
      case 'stock': return <StockList ref={stockListRef} canManage={isSuperAdmin} />;
      case 'mouvements': return <MouvementStockList canManage={isSuperAdmin} onMovementRecorded={() => { stockListRef.current?.refresh(); articleListRef.current?.refresh(); }} />;
      case 'verifications': return <VerificationStockList />;
      case 'alertes': return isSuperAdmin ? <SignalementList onStockAdjusted={() => stockListRef.current?.refresh()} /> : null;
      default: return null;
    }
  };

  return <main className="app-shell app-layout">
    <aside className="sidebar" aria-label="Navigation principale">
      <div className="sidebar-brand"><img className="sidebar-logo" src="/logo.jpg" alt="Logo StockVision" /><div><strong>StockVision</strong><small>Gestion des stocks</small></div></div>
      <nav className="sidebar-navigation">{navigation.map((item) => <button key={item.id} type="button" className={view === item.id ? 'is-active' : ''} onClick={() => setView(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-footer"><span>{isSuperAdmin ? 'SuperAdmin' : 'Consultant'}</span><button className="logout-button" type="button" onClick={handleLogout}>Déconnexion</button></div>
    </aside>
    <section className="app-content"><header className="content-header"><div><h1>{navigation.find((item) => item.id === view)?.label}</h1></div></header><div className="dashboard">{renderView()}</div></section>
  </main>;
}

export default App;
