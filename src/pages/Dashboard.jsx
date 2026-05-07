export default function Dashboard({ title = "Welcome to Scholar Track", icon = "📊" }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-text">{title}</div>
      <div className="empty-subtext">This module is under development in the React version.</div>
    </div>
  );
}
