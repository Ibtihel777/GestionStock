function Modal({ title, children, onClose, size = 'default' }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`modal-dialog modal-dialog--${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default Modal;
