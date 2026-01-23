import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import AdminDashboard from './AdminDashboard';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="App">
      {isAdmin ? (
        <>
          <AdminDashboard />
          <div className="back-to-chat-container">
            <Link to="/" className="back-to-chat-button">
              ← Back to Chat
            </Link>
          </div>
        </>
      ) : (
        <>
          <ChatInterface />

        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/admin" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
