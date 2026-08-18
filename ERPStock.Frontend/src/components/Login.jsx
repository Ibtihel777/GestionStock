import { useState } from 'react';
import { login, register } from '../services/authService';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
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
        await register(email, password);
        setPassword('');
        setPasswordConfirmation('');
        setIsRegistering(false);
        setSuccess('Votre compte Consultant a été créé. Vous pouvez maintenant vous connecter.');
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
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">ERPStock</p>
        <h1>{isRegistering ? 'Créer un compte' : 'Connexion'}</h1>
        <p>{isRegistering ? 'Chaque nouveau compte est créé avec le rôle Consultant.' : 'Accédez à la gestion de stock selon votre rôle.'}</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength="8" autoComplete={isRegistering ? 'new-password' : 'current-password'} /></label>
        {isRegistering && <label>Confirmer le mot de passe<input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength="8" autoComplete="new-password" /></label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Veuillez patienter…' : isRegistering ? 'Créer mon compte' : 'Se connecter'}</button>
        <button className="login-mode-button" type="button" onClick={switchMode} disabled={submitting}>{isRegistering ? 'J’ai déjà un compte' : 'Créer un compte '}</button>
      </form>
    </main>
  );
}

export default Login;
