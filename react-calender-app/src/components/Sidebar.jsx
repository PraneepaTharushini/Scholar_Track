const items = [
  'Dashboard',
  'Upload Documents',
  'Review Tasks',
  'Tasks',
  'Calendar',
  'Analytics',
  'Settings'
];

export default function Sidebar() {
  return (
    <aside className="rc-sidebar">
      <h1>Scholar Track</h1>
      <nav>
        {items.map((item) => (
          <a
            key={item}
            href="#"
            className={item === 'Calendar' ? 'active' : ''}
            onClick={(e) => e.preventDefault()}
          >
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}
