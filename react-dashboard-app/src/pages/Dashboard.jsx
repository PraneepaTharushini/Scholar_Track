import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import './Dashboard.css';

const stats = [
  { title: 'Upcoming Deadlines', value: '5 Tasks' },
  { title: 'High Priority', value: '2 Tasks' },
  { title: 'Completed', value: '8 Tasks' }
];

const tasks = [
  { name: 'Database Assignment', priority: 'High', level: 'high' },
  { name: 'SE Quiz', priority: 'Medium', level: 'medium' },
  { name: 'AI Presentation', priority: 'Low', level: 'low' }
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="st-dashboard">
        <div className="st-stats">
          {stats.map((item) => (
            <article key={item.title} className="st-card">
              <h3>{item.title}</h3>
              <p>{item.value}</p>
            </article>
          ))}
        </div>

        <section className="st-tasks-card">
          <h3>Today’s Tasks</h3>
          <ul>
            {tasks.map((task) => (
              <li key={task.name}>
                <span>{task.name}</span>
                <span className={`st-badge ${task.level}`}>{task.priority}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;