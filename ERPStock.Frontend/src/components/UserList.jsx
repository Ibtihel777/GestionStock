import { useEffect, useState } from 'react';
import { getUsers } from '../services/authService';

const statusLabel = { Acceptee: 'Actif', EnAttente: 'En attente', Refusee: 'Refusé' };

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try { setUsers(await getUsers()); }
      catch (requestError) { setError(requestError.response?.data?.message ?? 'Impossible de charger les utilisateurs.'); }
      finally { setLoading(false); }
    };
    loadUsers();
  }, []);

  return <section className="entity-section" aria-labelledby="users-title">
    <div className="entity-list-header"><div><h2 id="users-title">Utilisateurs</h2><p>{users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}.</p></div></div>
    {loading && <p>Chargement des utilisateurs…</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {!loading && !error && <div className="table-wrapper"><table><thead><tr><th>Utilisateur</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Statut</th></tr></thead><tbody>
      {users.length === 0 ? <tr><td colSpan="5" className="empty-cell">Aucun utilisateur enregistré.</td></tr>
        : users.map((user) => <tr key={user.id}><td><strong>{user.prenom} {user.nom}</strong></td><td>{user.email}</td><td>{user.telephone || '—'}</td><td><span className={`user-role ${user.role === 'SuperAdmin' ? 'is-admin' : ''}`}>{user.role}</span></td><td><span className={`alert-status ${user.statut === 'Acceptee' ? 'is-processed' : user.statut === 'Refusee' ? 'is-refused' : ''}`}>{statusLabel[user.statut] ?? user.statut}</span></td></tr>)}
    </tbody></table></div>}
  </section>;
}

export default UserList;
