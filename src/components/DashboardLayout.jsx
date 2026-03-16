import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="st-layout">
      <Sidebar />
      <main className="st-main">
        <Topbar />
        <section className="st-content">{children}</section>
      </main>
    </div>
  );
};

export default DashboardLayout;