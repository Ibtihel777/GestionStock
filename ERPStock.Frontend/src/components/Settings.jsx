import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/authService';

const profileFromSession = (session) => ({
  nom: session?.nom ?? '',
  prenom: session?.prenom ?? '',
  email: session?.email ?? '',
  telephone: session?.telephone ?? '',
  role: session?.role ?? '',
});

function Settings({ session, preferences, onPreferencesChange, onProfileChange }) {
  const [profile, setProfile] = useState(() => profileFromSession(session));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try { setProfile(await getProfile()); }
      catch (requestError) { setError(requestError.response?.data?.message ?? 'Impossible de charger vos informations personnelles.'); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, []);

  const updatePreference = (name, value) => onPreferencesChange((current) => ({ ...current, [name]: value }));
  const changeProfile = (name, value) => setProfile((current) => ({ ...current, [name]: value }));
  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setError(null); setSuccess(null);
    try {
      const savedProfile = await updateProfile(profile);
      setProfile(savedProfile);
      onProfileChange?.(savedProfile);
      setSuccess('Vos informations ont été mises à jour.');
    }
    catch (requestError) { setError(requestError.response?.data?.message ?? 'Impossible d’enregistrer vos informations.'); }
    finally { setSaving(false); }
  };

  return <section className="settings-page" aria-labelledby="settings-title">
    {loading && <p>Chargement des paramètres…</p>}
    {!loading && <div className="settings-grid">
      <section className="settings-card settings-profile-card"><div className="settings-card-heading"><span className="settings-icon">◉</span><div><h3>Informations personnelles</h3><p>Ces informations sont visibles par l’administrateur.</p></div></div><form onSubmit={saveProfile} className="settings-form"><label>Prénom<input value={profile.prenom} onChange={(event) => changeProfile('prenom', event.target.value)} required maxLength="100" /></label><label>Nom<input value={profile.nom} onChange={(event) => changeProfile('nom', event.target.value)} required maxLength="100" /></label><label>Email<input type="email" value={profile.email} onChange={(event) => changeProfile('email', event.target.value)} required /></label><label>Numéro de téléphone<input type="tel" value={profile.telephone} onChange={(event) => changeProfile('telephone', event.target.value)} required minLength="6" maxLength="25" /></label>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}<div className="settings-form-action"><button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button></div></form></section>
      <section className="settings-card"><div className="settings-card-heading"><span className="settings-icon is-purple">◐</span><div><h3>Apparence</h3><p>Choisissez le confort visuel qui vous convient.</p></div></div><div className="settings-option"><div><strong>Thème de l’application</strong><span>Le réglage est enregistré sur cet appareil.</span></div><div className="theme-selector"><button type="button" className={preferences.theme === 'light' ? 'is-selected' : ''} onClick={() => updatePreference('theme', 'light')}>☀ Clair</button><button type="button" className={preferences.theme === 'dark' ? 'is-selected' : ''} onClick={() => updatePreference('theme', 'dark')}>☾ Sombre</button></div></div><label className="settings-toggle"><input type="checkbox" checked={preferences.compact} onChange={(event) => updatePreference('compact', event.target.checked)} /><span /><div><strong>Affichage compact</strong><small>Réduit les espacements dans les tableaux.</small></div></label></section>
      <section className="settings-card"><div className="settings-card-heading"><span className="settings-icon is-green">文</span><div><h3>Langue et notifications</h3><p>Définissez vos préférences d’utilisation.</p></div></div><label className="settings-select"><span>Langue préférée</span><select value={preferences.language} onChange={(event) => updatePreference('language', event.target.value)}><option value="fr">Français</option><option value="en">English</option><option value="ar">العربية</option></select></label><label className="settings-toggle"><input type="checkbox" checked={preferences.notifications} onChange={(event) => updatePreference('notifications', event.target.checked)} /><span /><div><strong>Notifications dans l’application</strong><small>Recevez les alertes et mises à jour importantes.</small></div></label></section>
    </div>}
  </section>;
}

export default Settings;
