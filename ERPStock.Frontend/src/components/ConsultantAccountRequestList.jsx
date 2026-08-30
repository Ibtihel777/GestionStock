import { useEffect, useState } from 'react';
import { approveConsultantRequest, getConsultantRequests, rejectConsultantRequest } from '../services/authService';

function ConsultantAccountRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setRequests(await getConsultantRequests());
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Impossible de charger les demandes de comptes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const processRequest = async (id, action) => {
    try {
      setProcessingId(id);
      if (action === 'approve') await approveConsultantRequest(id);
      else await rejectConsultantRequest(id);
      await fetchRequests();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Impossible de traiter cette demande.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="entity-section" aria-labelledby="consultant-requests-title">
      <div className="entity-list-header"><div><h2 id="consultant-requests-title">Demandes de comptes Consultants</h2><p>{requests.length} demande{requests.length > 1 ? 's' : ''} en attente de validation.</p></div></div>
      {loading && <p>Chargement des demandes…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && <div className="table-wrapper"><table><thead><tr><th>Demande reçue</th><th>Consultant</th><th>Email</th><th>Téléphone</th><th>Statut</th><th>Décision</th></tr></thead><tbody>
        {requests.length === 0 ? <tr><td colSpan="6" className="empty-cell">Aucune demande de compte en attente.</td></tr>
          : requests.map((request) => <tr key={request.id}><td>{new Date(request.dateDemande).toLocaleString('fr-FR')}</td><td>{request.prenom} {request.nom}</td><td>{request.email}</td><td>{request.telephone}</td><td><span className="alert-status">En attente</span></td><td><div className="table-actions"><button type="button" onClick={() => processRequest(request.id, 'approve')} disabled={processingId === request.id}>{processingId === request.id ? 'Traitement…' : 'Accepter'}</button><button className="danger-button" type="button" onClick={() => processRequest(request.id, 'reject')} disabled={processingId === request.id}>Refuser</button></div></td></tr>) }
      </tbody></table></div>}
    </section>
  );
}

export default ConsultantAccountRequestList;
