/**
 * Main App Component with Authentication
 */
//for original authentication

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';

// // Pages & Components
// import LandingPage from './pages/LandingPage';
// import ChatInterface from './ChatInterface';

// import './App.css';

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem('access_token');
//   const user = localStorage.getItem('user');
  
//   if (!token || !user) {
//     return <Navigate to="/" replace />;
//   }
  
//   return children;
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <div className="App">
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<LandingPage />} />

//             {/* Protected Routes */}
//             <Route 
//               path="/chat" 
//               element={
//                 <ProtectedRoute>
//                   <ChatInterface />
//                 </ProtectedRoute>
//               } 
//             />

//             {/* Catch-all: Redirect unknown routes to Landing */}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </div>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;


// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem('token');
//   return token ? children : <Navigate to="/" replace />;
// };

// function App() {
//   // Logic tip: In a real app, you'd check a token here to protect routes
  
//   const isAuthenticated = !!localStorage.getItem('token'); 

//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           {/* 1. Default Landing Page */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/home" element={<home />} />

//           {/* 2. Authentication Flow */}
//           {/* <Route path="/signup" element={<SignupPage />} />
//           <Route path="/login" element={<LoginPage />} /> */}
//           <Route path="/chat"
          
//            element={isAuthenticated ? <ChatInterface /> : <Navigate to="/" />} 
//            />

//           {/* 4. Admin Management */}
//           {/* <Route path="/admin" element={<AdminDashboard />} /> */}

//           {/* Catch-all: Redirect unknown routes to Landing */}
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,Link, useLocation } from 'react-router-dom';

// Pages & Components
import LandingPage from './pages/LandingPage';
import home from './pages/home';
import LoginPage from './pages/LoginPage'; // You'll need to create this
import SignupPage from './pages/SignupPage'; // You'll need to create this
import ChatInterface from './ChatInterface';
import AdminDashboard from './components/AdminDashboard';


import './App.css';
function AppContent() {
  const location = useLocation(); // This now works because it's a child of <Router>
  //const isAdmin = location.pathname === '/admin';

  return (
    <div className="App">
      {/* 1. Define your Routes - Only ONE of these will show at a time */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      {/* 2. Conditional Links - Show "Back to Chat" ONLY on Admin page, 
          and "Admin Panel" ONLY on Chat page */}
      {/* <div className="navigation-footer">
        {location.pathname === '/admin' && (
          <Link to="/chat" className="nav-link">← Back to Chat</Link>
        )}
        
        {location.pathname === '/chat' && (
          <Link to="/admin" className="nav-link">⚙️ Admin Panel</Link>
        )}
      </div> */}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import ChatInterface from './ChatInterface';
// // import AdminDashboard from './AdminDashboard';
// import AdminDashboardduplicate from './components/AdminDashboard'
// import LandingPage from './pages/LandingPage';
// import './App.css';

// function App() {
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
// export default App;

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
