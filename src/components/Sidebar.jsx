import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="st-sidebar">
      <h1>Scholar-Track</h1>
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <a href="#upload">Upload Documents</a>
        <a href="#review">Review Tasks</a>
        <a href="#tasks">Tasks</a>
        <NavLink to="/calendar">Calendar</NavLink>
        <a href="#analytics">Analytics</a>
        <a href="#settings">Settings</a>
      </nav>
    </aside>
  );
};

export default Sidebar;