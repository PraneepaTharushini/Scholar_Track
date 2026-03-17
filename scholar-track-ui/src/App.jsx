import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ReviewTaskPage from './pages/ReviewTaskPage';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <Sidebar activePage="review" />
      <div className="app-main">
        <Header title="Review Tasks" user="Sarah" />
        <main className="app-content">
          <ReviewTaskPage />
        </main>
      </div>
    </div>
  );
}

export default App;
