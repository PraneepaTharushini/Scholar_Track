import React from 'react';

const StatCard = ({ title, value, icon }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-content">
                <h3 className="stat-card-title">{title}</h3>
                <p className="stat-card-value">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;