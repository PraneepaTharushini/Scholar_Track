import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  return (
    <div className="st-layout">
      <Sidebar />
      <main className="st-main">
        <Topbar title={title} />
        <section className="st-content">{children}</section>
      </main>
    </div>
  );
};

export default DashboardLayout;