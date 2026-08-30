import { useEffect, useRef, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import ArticleList from './components/ArticleList';
import ConsultantAccountRequestList from './components/ConsultantAccountRequestList';
import DepotList from './components/DepotList';
import EmplacementList from './components/EmplacementList';
import FamilleArticleList from './components/FamilleArticleList';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import MouvementStockList from './components/MouvementStockList';
import SignalementList from './components/SignalementList';
import Settings from './components/Settings';
import StockList from './components/StockList';
import UserList from './components/UserList';
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
  { id: 'inventaires', label: 'Inventaires', icon: '☷' },
  { id: 'alertes', label: 'Alertes', icon: '!' },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: '♙' },
  { id: 'parametres', label: 'Paramètres', icon: '⚙' },
];

const consultantNavigation = superAdminNavigation.filter((item) => !['dashboard', 'alertes', 'inventaires', 'utilisateurs'].includes(item.id));

const navigationLabels = {
  fr: {},
  en: { dashboard: 'Dashboard', articles: 'Items', familles: 'Categories', depots: 'Warehouses', emplacements: 'Locations', stock: 'Stock', mouvements: 'Movements', verifications: 'AI checks', inventaires: 'Inventories', alertes: 'Alerts', utilisateurs: 'Users', parametres: 'Settings' },
  ar: { dashboard: 'لوحة التحكم', articles: 'المنتجات', familles: 'الفئات', depots: 'المستودعات', emplacements: 'المواقع', stock: 'المخزون', mouvements: 'الحركات', verifications: 'فحوصات الذكاء الاصطناعي', inventaires: 'الجرد', alertes: 'التنبيهات', utilisateurs: 'المستخدمون', parametres: 'الإعدادات' },
};

const preferencesKey = 'erpstock_preferences';
const getStoredPreferences = () => {
  try { return { theme: 'light', language: 'fr', notifications: true, compact: false, ...JSON.parse(localStorage.getItem(preferencesKey) ?? '{}') }; }
  catch { return { theme: 'light', language: 'fr', notifications: true, compact: false }; }
};

function App() {
  const stockListRef = useRef(null);
  const articleListRef = useRef(null);
  const [session, setSession] = useState(getStoredSession);
  const [view, setView] = useState('dashboard');
  const [authMode, setAuthMode] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [preferences, setPreferences] = useState(getStoredPreferences);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.density = preferences.compact ? 'compact' : 'comfortable';
    document.documentElement.lang = preferences.language;
    document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(preferencesKey, JSON.stringify(preferences));
  }, [preferences]);

  const handleLogin = (newSession) => {
    localStorage.setItem('erpstock_session', JSON.stringify(newSession));
    setSession(newSession);
    setShowLanding(false);
    setView(newSession.role === 'SuperAdmin' ? 'dashboard' : 'articles');
  };
  const handleProfileChange = (profile) => {
    setSession((currentSession) => {
      const nextSession = { ...currentSession, ...profile };
      localStorage.setItem('erpstock_session', JSON.stringify(nextSession));
      return nextSession;
    });
  };
  const handleLogout = () => { localStorage.removeItem('erpstock_session'); setSession(null); setAuthMode(null); setShowLanding(true); };
  const isSuperAdmin = session?.role === 'SuperAdmin';
  const navigation = (isSuperAdmin ? superAdminNavigation : consultantNavigation).map((item) => ({ ...item, label: navigationLabels[preferences.language]?.[item.id] ?? item.label }));

  useEffect(() => {
    if (session && !navigation.some((item) => item.id === view)) setView(navigation[0].id);
  }, [session, view, navigation]);

  if (showLanding || !session) return <LandingPage onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')}>
    {authMode && <div className="auth-modal" role="dialog" aria-modal="true" aria-label={authMode === 'register' ? 'Créer un compte' : 'Connexion'}><Login key={authMode} initialMode={authMode} onBack={() => setAuthMode(null)} onLogin={handleLogin} /></div>}
  </LandingPage>;

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
      case 'alertes': return isSuperAdmin ? <ConsultantAccountRequestList /> : null;
      case 'inventaires': return isSuperAdmin ? <SignalementList onStockAdjusted={() => stockListRef.current?.refresh()} /> : null;
      case 'utilisateurs': return isSuperAdmin ? <UserList /> : null;
      case 'parametres': return <Settings session={session} preferences={preferences} onPreferencesChange={setPreferences} onProfileChange={handleProfileChange} />;
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
