import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages & Components
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage'; // You'll need to create this
import SignupPage from './pages/SignupPage'; // You'll need to create this
import ChatInterface from './ChatInterface';
import AdminDashboard from './components/AdminDashboard';

import './App.css';

function App() {
  // Logic tip: In a real app, you'd check a token here to protect routes
  
  const isAuthenticated = !!localStorage.getItem('token'); 

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 1. Default Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />

          {/* 2. Authentication Flow */}
          {/* <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/chat"
          
           element={isAuthenticated ? <ChatInterface /> : <Navigate to="/" />} 
           />

          {/* 4. Admin Management */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}

          {/* Catch-all: Redirect unknown routes to Landing */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import ChatInterface from './ChatInterface';
// // import AdminDashboard from './AdminDashboard';
// import AdminDashboardduplicate from './components/AdminDashboard'
// import LandingPage from './pages/LandingPage';
// import './App.css';

// function AppContent() {
//   const location = useLocation();

//   const isAdmin = location.pathname === '/admin';

//   return (
//     <div className="App">
//       <LandingPage />
//       {isAdmin ? (
//         <>
//           <AdminDashboardduplicate />
//           <div className="back-to-chat-container">
//             <Link to="/ChatInterface" className="back-to-chat-button">
//               ← Back to Chat
//             </Link>
//           </div>
//         </>
//       ) : (
//         <>
//           <ChatInterface />
//           <div className="admin-link-container">
//             <Link to="/admin" className="admin-link-button" title="Go to Admin Dashboard">
//               ⚙️ Admin Panel
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <Routes>
//          <Route path="/LandingPage" element={<AppContent />} />
//         <Route path="/" element={<AppContent />} />
//         <Route path="/admin" element={<AppContent />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
