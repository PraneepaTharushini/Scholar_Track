import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="st-layout">
      <Sidebar menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="st-backdrop" onClick={() => setMenuOpen(false)} />}
      <main className="st-main">
        <Topbar title={title} onMenuClick={() => setMenuOpen((v) => !v)} />
        <section className="st-content">{children}</section>
      </main>
    </div>
  );
};

export default DashboardLayout;