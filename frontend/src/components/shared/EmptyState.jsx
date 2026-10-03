export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state fade-in">
      <i className={`bi ${icon}`}></i>
      <h5>{title}</h5>
      {message && <p style={{ fontSize: '0.9rem' }}>{message}</p>}
      {action}
    </div>
  );
}
