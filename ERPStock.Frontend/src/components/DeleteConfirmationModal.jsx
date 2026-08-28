import Modal from './Modal';

function DeleteConfirmationModal({ itemName, impact, onConfirm, onCancel, isDeleting }) {
  return (
    <Modal title="Confirmer la suppression" onClose={isDeleting ? () => {} : onCancel} size="small">
      <div className="delete-confirmation">
        <p>Vous êtes sur le point de supprimer <strong>{itemName}</strong>.</p>
        <p className="delete-warning">{impact}</p>
        <div className="form-actions">
          <button type="button" className="danger-button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          </button>
          <button type="button" onClick={onCancel} disabled={isDeleting}>Annuler</button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmationModal;
