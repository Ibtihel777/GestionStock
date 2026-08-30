import heroImage from '../assets/hero.png';

function LandingPage({ onLogin, onRegister, children }) {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Navigation d'accueil">
        <a className="landing-brand" href="#accueil" aria-label="StockVision, accueil"><img src="/logo.jpg" alt="" /><span>StockVision</span></a>
        <div className="landing-nav-actions"><button className="landing-login-button" type="button" onClick={onLogin}>Se connecter</button><button className="landing-register-button" type="button" onClick={onRegister}>Créer un compte</button></div>
      </nav>

      <section className="landing-hero" id="accueil">
        <div className="landing-hero-copy">
          <p className="landing-kicker"><span /> Gestion intelligente des stocks</p>
          <h1>Votre stock, <em>clairement</em> sous contrôle.</h1>
          <p className="landing-lead">StockVision centralise vos articles, vos mouvements et vos vérifications pour vous permettre de prendre les bonnes décisions au bon moment.</p>
          <div className="landing-cta"><button type="button" onClick={onRegister}>Demander un accès <span aria-hidden="true">→</span></button><button className="landing-secondary-cta" type="button" onClick={onLogin}>Accéder à mon espace</button></div>
          <div className="landing-trust"><span className="landing-avatars" aria-hidden="true"><i>SM</i><i>YA</i><i>MA</i></span><p>Une gestion fiable, pensée pour vos équipes.</p></div>
        </div>
        <div className="landing-visual" aria-label="Illustration de la plateforme StockVision">
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
          <div className="landing-visual-glow" /><img src={heroImage} alt="Illustration abstraite de données de stock connectées" />
          <div className="landing-float-card landing-float-card-stock"><span>Disponibilité</span><strong>98,4 %</strong><small><b>↑ 4,8 %</b> ce mois</small></div>
          <div className="landing-float-card landing-float-card-ai"><span className="landing-ai-icon">✦</span><p>Vérification IA<br /><strong>Active</strong></p></div>
        </div>
      </section>

      <section className="landing-stats" aria-label="Indicateurs StockVision">
        <div><strong>24/7</strong><span>Accès à votre activité</span></div><div><strong>98 %</strong><span>De visibilité sur le stock</span></div><div><strong>1 espace</strong><span>Pour toute votre équipe</span></div><div><strong>IA intégrée</strong><span>Pour vos vérifications</span></div>
      </section>

      <section className="landing-features" aria-labelledby="features-title">
        <div className="landing-section-title"><p>UNE PLATEFORME, L’ESSENTIEL</p><h2>Travaillez avec une vision nette de vos stocks.</h2></div>
        <div className="landing-feature-grid"><article><span className="landing-feature-icon is-blue">▦</span><h3>Suivi en temps réel</h3><p>Consultez les quantités, emplacements et mouvements sans perdre de temps.</p></article><article><span className="landing-feature-icon is-purple">✦</span><h3>Vérifications assistées</h3><p>Détectez les écarts et centralisez les déclarations issues des vérifications IA.</p></article><article><span className="landing-feature-icon is-green">✓</span><h3>Collaboration maîtrisée</h3><p>Les demandes des Consultants sont validées par un administrateur avant l’accès.</p></article></div>
      </section>
      {children}
    </main>
  );
}

export default LandingPage;
