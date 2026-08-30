import { useState } from 'react';
import { login, register } from '../services/authService';

function Login({ onLogin, onBack, initialMode = 'login' }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isRegistering, setIsRegistering] = useState(initialMode === 'register');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const switchMode = () => {
    setIsRegistering((current) => !current);
    setPassword('');
    setPasswordConfirmation('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (isRegistering && password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegistering) {
        const response = await register({ nom, prenom, telephone, email, password });
        setNom('');
        setPrenom('');
        setTelephone('');
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
        setIsRegistering(false);
        setSuccess(response.message ?? 'Votre demande a été envoyée. Vous pourrez vous connecter après validation par un administrateur.');
      } else {
        onLogin(await login(email, password));
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Opération impossible. Vérifiez que l’API est démarrée.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <form className={`login-card${isRegistering ? ' login-card--register' : ''}`} onSubmit={handleSubmit}>
        {onBack && <button className="login-back-button" type="button" onClick={onBack}>← Accueil</button>}
        <p className="eyebrow">ERPStock</p>
        <h1>{isRegistering ? 'Créer un compte' : 'Connexion'}</h1>
        <p>{isRegistering ? 'Votre demande de compte Consultant doit être validée par un administrateur.' : 'Accédez à la gestion de stock selon votre rôle.'}</p>
        {isRegistering && <div className="login-form-grid">
          <label>Prénom<input type="text" value={prenom} onChange={(event) => setPrenom(event.target.value)} required autoComplete="given-name" maxLength="100" /></label>
          <label>Nom<input type="text" value={nom} onChange={(event) => setNom(event.target.value)} required autoComplete="family-name" maxLength="100" /></label>
        </div>}
        {isRegistering && <label>Numéro de téléphone<input type="tel" value={telephone} onChange={(event) => setTelephone(event.target.value)} required autoComplete="tel" minLength="6" maxLength="25" /></label>}
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength="8" autoComplete={isRegistering ? 'new-password' : 'current-password'} /></label>
        {isRegistering && <label>Confirmer le mot de passe<input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength="8" autoComplete="new-password" /></label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Veuillez patienter…' : isRegistering ? 'Envoyer ma demande' : 'Se connecter'}</button>
        <button className="login-mode-button" type="button" onClick={switchMode} disabled={submitting}>{isRegistering ? 'J’ai déjà un compte' : 'Créer un compte'}</button>
      </form>
    </main>
  );
}

export default Login;
