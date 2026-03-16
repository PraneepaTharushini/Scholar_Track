import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="st-sidebar">
      <h1>Scholar-Track</h1>
      <nav>
        <a className="active" href="#dashboard">Dashboard</a>
        <a href="#upload">Upload Documents</a>
        <a href="#tasks">Tasks</a>
        <a href="#calendar">Calendar</a>
        <a href="#analytics">Analytics</a>
        <a href="#settings">Settings</a>
      </nav>
    </aside>
  );
};

export default Sidebar;