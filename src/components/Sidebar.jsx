// src/components/Sidebar.jsx
import React from "react";

const NAV = [
  "Dashboard",
  "Upload Documents",
  "Review Tasks",
  "Tasks",
  "Calendar",
  "Analytics",
  "Settings",
];

export default function Sidebar({ active, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Scholar-Track</div>
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item}
            className={`nav-item${active === item ? " active" : ""}`}
            onClick={() => onNav(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
