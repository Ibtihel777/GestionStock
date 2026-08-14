function TableRowsToggle({ isExpanded, onToggle }) {
  return (
    <div className="table-rows-toggle">
      <button type="button" onClick={onToggle} aria-expanded={isExpanded}>
        {isExpanded ? 'Voir moins' : 'Voir plus'}
      </button>
    </div>
  );
}

export default TableRowsToggle;
