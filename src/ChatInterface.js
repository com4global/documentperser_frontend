// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from './contexts/AuthContext';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import AdminDashboard from './components/AdminDashboard';
// import { APP_CONFIG } from './utils/constants';

// const API_URL = APP_CONFIG.API_URL || 'http://localhost:10000';
// console.log('Using API URL:', API_URL); // Debug log to verify API URL

// function ChatInterface() {
//   const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hi there! I'm your AI-powered Document Assistant. I can help you with company policies, benefits information, leave requests, and more. What would you like to know?",
//       sender: 'bot',
//       timestamp: new Date(),
//       suggestions: [
//         "What's our vacation policy?",
//         "How do I request time off?",
//         "Tell me about health benefits",
//         "What's the remote work policy?"
//       ]
//     }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [conversationHistory, setConversationHistory] = useState([]);
//   const messagesEndRef = useRef(null);
//   const { logout, user } = useAuth();
//   const navigate = useNavigate();

//  const handleLogout = async () => {
//     console.log('Logging out from ChatInterface...');
//     console.log('Access Token:', localStorage.getItem('access_token'));
//     console.log('Refresh Token:', localStorage.getItem('refresh_token'));
    
//     await logout(); // This will call AuthContext logout
//     // Navigation is handled by AuthContext
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleOpenSource = (source, messageText) => {
//     if (!source || !source.path) return;
//     const fileName = source.path.split('\\').pop();
//     const baseUrl = `${API_URL}/static_files/${encodeURIComponent(fileName)}`;
//     const pageNumber = source.page.replace(/\D/g, '');
//     window.open(`${baseUrl}#page=${pageNumber}`, '_blank');
//   };

//   const handleSuggestionClick = (suggestion) => {
//     setInputValue(suggestion);
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim()) return;

//     const userMessage = {
//       id: Date.now(),
//       text: inputValue,
//       sender: 'user',
//       timestamp: new Date()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setInputValue('');
//     setLoading(true);

//     try {
//      // const response = await axios.post('http://127.0.0.1:10000/chat', 
//         const response = await axios.post(`${API_URL}/chat`,
//         {
//         query: inputValue
//       },
//     {
//       headers:{
//         'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//       }
//     });

//       const botMessage = {
//         id: Date.now() + 1,
//         text: response.data.response,
//         sources: response.data.sources || [],
//         sender: 'bot',
//         timestamp: new Date()
//       };
      
//       setMessages(prev => [...prev, botMessage]);
//     } catch (error) {
//       console.error('Error:', error);
      
//       // ✅ Handle 401 errors by logging out
//       if (error.response?.status === 401) {
//         await handleLogout();
//         return;
//       }
//       const errorMessage = {
//         id: Date.now() + 2,
//         text: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
//         sender: 'bot',
//         timestamp: new Date(),
//         isError: true
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startNewChat = () => {
//     // Save current conversation to history
//     if (messages.length > 1) {
//       const conversationTitle = messages[1]?.text.slice(0, 50) + '...' || 'New Conversation';
//       setConversationHistory(prev => [{
//         id: Date.now(),
//         title: conversationTitle,
//         timestamp: new Date(),
//         messages: messages
//       }, ...prev.slice(0, 9)]); // Keep last 10 conversations
//     }

//     setMessages([{
//       id: Date.now(),
//       text: "Hi there! I'm your AI-powered HR Assistant. I can help you with company policies, benefits information, leave requests, and more. What would you like to know?",
//       sender: 'bot',
//       timestamp: new Date(),
//       suggestions: [
//         "What's our vacation policy?",
//         "How do I request time off?",
//         "Tell me about health benefits",
//         "What's the remote work policy?"
//       ]
//     }]);
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        
//         * {
//           box-sizing: border-box;
//           margin: 0;
//           padding: 0;
//         }

//         body {
//           margin: 0;
//           padding: 0;
//           overflow: hidden;
//         }

//         @keyframes gradient-shift {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }

//         @keyframes pulse-glow {
//           0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
//           50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
//         }

//         @keyframes slide-up {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes bounce {
//           0%, 80%, 100% { transform: translateY(0); }
//           40% { transform: translateY(-8px); }
//         }

//         .scrollbar-custom::-webkit-scrollbar {
//           width: 6px;
//         }

//         .scrollbar-custom::-webkit-scrollbar-track {
//           background: transparent;
//         }

//         .scrollbar-custom::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 3px;
//         }

//         .scrollbar-custom::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//       `}</style>

//       <div style={{
//         display: 'flex',
//         height: '100vh',
//         width: '100vw',
//         background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
//         fontFamily: '"Outfit", system-ui, -apple-system, sans-serif',
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         overflow: 'hidden'
//       }}>
        
//         {/* SIDEBAR */}
//         <div style={{
//           width: sidebarCollapsed ? '80px' : '280px',
//           minWidth: sidebarCollapsed ? '80px' : '280px',
//           background: 'rgba(255, 255, 255, 0.95)',
//           backdropFilter: 'blur(20px)',
//           borderRight: '1px solid rgba(226, 232, 240, 0.8)',
//           display: 'flex',
//           flexDirection: 'column',
//           transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//           zIndex: 100,
//           boxShadow: '4px 0 24px rgba(0, 0, 0, 0.04)',
//           height: '100vh',
//           overflowY: 'auto'
//         }}>
//           {/* Logo & Toggle */}
//           <div style={{
//             padding: '24px 20px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: sidebarCollapsed ? 'center' : 'space-between',
//             borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
//             minHeight: '80px'
//           }}>
//             {!sidebarCollapsed && (
//               <div style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 fontSize: '20px',
//                 fontWeight: 700,
//                 background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 letterSpacing: '-0.02em'
//               }}>
//                 <div style={{
//                   width: '36px',
//                   height: '36px',
//                   borderRadius: '10px',
//                   background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '20px',
//                   boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
//                   flexShrink: 0
//                 }}>
//                   ✨
//                 </div>
//                 <span>Document Assistant</span>
//               </div>
//             )}
//             {sidebarCollapsed && (
//               <div style={{
//                 width: '36px',
//                 height: '36px',
//                 borderRadius: '10px',
//                 background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '20px',
//                 boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
//               }}>
//                 ✨
//               </div>
//             )}
//             {!sidebarCollapsed && (
//               <button
//                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//                 style={{
//                   background: 'rgba(241, 245, 249, 0.8)',
//                   border: 'none',
//                   cursor: 'pointer',
//                   padding: '10px',
//                   borderRadius: '10px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   transition: 'all 0.2s',
//                   color: '#64748b',
//                   flexShrink: 0
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = '#e2e8f0';
//                   e.currentTarget.style.transform = 'scale(1.05)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
//                   e.currentTarget.style.transform = 'scale(1)';
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <line x1="3" y1="12" x2="21" y2="12"/>
//                   <line x1="3" y1="6" x2="21" y2="6"/>
//                   <line x1="3" y1="18" x2="21" y2="18"/>
//                 </svg>
//               </button>
//             )}
//           </div>

//           {/* Expand button when collapsed */}
//           {sidebarCollapsed && (
//             <div style={{ padding: '16px', textAlign: 'center' }}>
//               <button
//                 onClick={() => setSidebarCollapsed(false)}
//                 style={{
//                   background: 'rgba(241, 245, 249, 0.8)',
//                   border: 'none',
//                   cursor: 'pointer',
//                   padding: '10px',
//                   borderRadius: '10px',
//                   width: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   transition: 'all 0.2s',
//                   color: '#64748b'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = '#e2e8f0';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <polyline points="9 18 15 12 9 6"/>
//                 </svg>
//               </button>
//             </div>
//           )}

//           {/* New Chat Button */}
//           <div style={{ padding: '16px' }}>
//             <button
//               onClick={startNewChat}
//               style={{
//                 width: '100%',
//                 padding: '14px 20px',
//                 borderRadius: '12px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '10px',
//                 cursor: 'pointer',
//                 fontSize: '15px',
//                 fontWeight: 600,
//                 color: '#6366f1',
//                 transition: 'all 0.3s',
//                 background: 'white',
//                 border: '2px solid #e2e8f0'
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.transform = 'translateY(-2px)';
//                 e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.2)';
//                 e.currentTarget.style.borderColor = '#6366f1';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform = 'translateY(0)';
//                 e.currentTarget.style.boxShadow = 'none';
//                 e.currentTarget.style.borderColor = '#e2e8f0';
//               }}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                 <line x1="12" y1="5" x2="12" y2="19"/>
//                 <line x1="5" y1="12" x2="19" y2="12"/>
//               </svg>
//               {!sidebarCollapsed && <span>New Chat</span>}
//             </button>
//           </div>

//           {/* Navigation */}
//           <div style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }} className="scrollbar-custom">
//             <NavButton
//               icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
//               </svg>}
//               label="Chat"
//               active={!showAdminPanel}
//               onClick={() => setShowAdminPanel(false)}
//               collapsed={sidebarCollapsed}
//             />
//             <NavButton
//               icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="3"/>
//                 <path d="M12 1v6m0 6v6m8.66-11.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m12.48 0l-4.24-4.24m-4.24-4.24l-4.24-4.24"/>
//               </svg>}
//               label="Admin Panel"
//               active={showAdminPanel}
//               onClick={() => setShowAdminPanel(true)}
//               collapsed={sidebarCollapsed}
//             />

//             {!sidebarCollapsed && conversationHistory.length > 0 && (
//               <div style={{ marginTop: '24px' }}>
//                 <div style={{
//                   fontSize: '12px',
//                   fontWeight: 600,
//                   color: '#94a3b8',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em',
//                   padding: '0 12px',
//                   marginBottom: '8px'
//                 }}>
//                   Recent
//                 </div>
//                 {conversationHistory.slice(0, 5).map((conv) => (
//                   <div
//                     key={conv.id}
//                     style={{
//                       padding: '10px 12px',
//                       margin: '4px 0',
//                       borderRadius: '8px',
//                       fontSize: '13px',
//                       color: '#64748b',
//                       cursor: 'pointer',
//                       transition: 'all 0.2s',
//                       whiteSpace: 'nowrap',
//                       overflow: 'hidden',
//                       textOverflow: 'ellipsis'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = '#f8fafc';
//                       e.currentTarget.style.color = '#334155';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'transparent';
//                       e.currentTarget.style.color = '#64748b';
//                     }}
//                     onClick={() => setMessages(conv.messages)}
//                   >
//                     {conv.title}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Bottom Actions */}
//           <div style={{ padding: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
//             <NavButton
//               icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
//                 <polyline points="16 17 21 12 16 7"/>
//                 <line x1="21" y1="12" x2="9" y2="12"/>
//               </svg>}
//               label="Log out"
//               onClick={handleLogout}
//               collapsed={sidebarCollapsed}
//             />
//           </div>
//         </div>

//         {/* MAIN CONTENT */}
//         <div style={{ 
//           flex: 1, 
//           display: 'flex', 
//           flexDirection: 'column', 
//           width: '100%',
//           height: '100vh',
//           overflow: 'hidden'
//         }}>
          
//           {/* Enhanced Chat Header */}
//           <div style={{
//             padding: '20px 32px',
//             background: 'rgba(255, 255, 255, 0.95)',
//             backdropFilter: 'blur(20px)',
//             borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
//             minHeight: '80px'
//           }}>
//             <div>
//               <h1 style={{
//                 margin: 0,
//                 fontSize: '24px',
//                 fontWeight: 700,
//                 color: '#0f172a',
//                 letterSpacing: '-0.02em'
//               }}>
//                 AI HR Assistant
//               </h1>
//               <div style={{
//                 margin: '6px 0 0 0',
//                 fontSize: '14px',
//                 color: '#64748b',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}>
//                 <div style={{
//                   width: '8px',
//                   height: '8px',
//                   borderRadius: '50%',
//                   background: '#10b981',
//                   animation: 'pulse-glow 2s ease-in-out infinite'
//                 }}/>
//                 Online & Ready to Help
//               </div>
//             </div>
//             <button style={{
//               padding: '10px 18px',
//               background: 'white',
//               border: '1px solid #e2e8f0',
//               borderRadius: '10px',
//               fontSize: '14px',
//               fontWeight: 500,
//               color: '#64748b',
//               cursor: 'pointer',
//               transition: 'all 0.2s',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.borderColor = '#cbd5e1';
//               e.currentTarget.style.background = '#f8fafc';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.borderColor = '#e2e8f0';
//               e.currentTarget.style.background = 'white';
//             }}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10"/>
//                 <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
//                 <line x1="12" y1="17" x2="12.01" y2="17"/>
//               </svg>
//               Help
//             </button>
//           </div>

//           {/* Messages Area */}
//           <div style={{
//             flex: 1,
//             overflowY: 'auto',
//             padding: '32px',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '24px'
//           }} className="scrollbar-custom">
//             {messages.map((msg) => (
//               <MessageBubble
//                 key={msg.id}
//                 message={msg}
//                 onOpenSource={handleOpenSource}
//                 onSuggestionClick={handleSuggestionClick}
//               />
//             ))}
            
//             {loading && (
//               <div style={{
//                 display: 'flex',
//                 gap: '16px',
//                 alignItems: 'flex-start',
//                 maxWidth: '85%'
//               }}>
//                 <div style={{
//                   width: '40px',
//                   height: '40px',
//                   borderRadius: '12px',
//                   background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '20px',
//                   flexShrink: 0,
//                   boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
//                 }}>
//                   ✨
//                 </div>
//                 <div style={{
//                   padding: '16px 20px',
//                   background: 'white',
//                   borderRadius: '16px',
//                   boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
//                   border: '1px solid #f1f5f9'
//                 }}>
//                   <TypingIndicator />
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Enhanced Input Area */}
//           <div style={{
//             padding: '24px 32px 32px',
//             background: 'rgba(255, 255, 255, 0.95)',
//             backdropFilter: 'blur(20px)',
//             borderTop: '1px solid rgba(226, 232, 240, 0.8)'
//           }}>
//             <form onSubmit={handleSendMessage} style={{
//               maxWidth: '900px',
//               margin: '0 auto'
//             }}>
//               <div style={{
//                 display: 'flex',
//                 alignItems: 'flex-end',
//                 background: 'white',
//                 borderRadius: '16px',
//                 padding: '6px',
//                 border: '2px solid #e2e8f0',
//                 transition: 'all 0.3s',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
//               }}
//               onFocus={(e) => {
//                 e.currentTarget.style.borderColor = '#6366f1';
//                 e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)';
//               }}
//               onBlur={(e) => {
//                 e.currentTarget.style.borderColor = '#e2e8f0';
//                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
//               }}
//               >
//                 <textarea
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter' && !e.shiftKey) {
//                       e.preventDefault();
//                       handleSendMessage(e);
//                     }
//                   }}
//                   placeholder="Ask me anything about HR policies, benefits, or procedures..."
//                   disabled={loading}
//                   rows={1}
//                   style={{
//                     flex: 1,
//                     border: 'none',
//                     background: 'transparent',
//                     outline: 'none',
//                     fontSize: '15px',
//                     color: '#0f172a',
//                     padding: '12px 16px',
//                     resize: 'none',
//                     fontFamily: '"Outfit", system-ui, sans-serif',
//                     lineHeight: '1.5',
//                     maxHeight: '120px'
//                   }}
//                 />
//                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '0 4px' }}>
//                   <button
//                     type="submit"
//                     disabled={loading || !inputValue.trim()}
//                     style={{
//                       background: inputValue.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e2e8f0',
//                       border: 'none',
//                       borderRadius: '12px',
//                       width: '44px',
//                       height: '44px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
//                       transition: 'all 0.3s',
//                       boxShadow: inputValue.trim() ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
//                     }}
//                     onMouseEnter={(e) => {
//                       if (inputValue.trim()) {
//                         e.currentTarget.style.transform = 'scale(1.05)';
//                         e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = 'scale(1)';
//                       e.currentTarget.style.boxShadow = inputValue.trim() ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none';
//                     }}
//                   >
//                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={inputValue.trim() ? 'white' : '#94a3b8'} strokeWidth="2.5">
//                       <line x1="22" y1="2" x2="11" y2="13"/>
//                       <polygon points="22 2 15 22 11 13 2 9 22 2"/>
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//               <p style={{
//                 textAlign: 'center',
//                 fontSize: '12px',
//                 color: '#94a3b8',
//                 marginTop: '12px',
//                 fontWeight: 500
//               }}>
//                 Press <kbd style={{
//                   background: '#f1f5f9',
//                   padding: '2px 6px',
//                   borderRadius: '4px',
//                   fontSize: '11px',
//                   fontFamily: '"JetBrains Mono", monospace',
//                   border: '1px solid #e2e8f0'
//                 }}>Enter</kbd> to send, <kbd style={{
//                   background: '#f1f5f9',
//                   padding: '2px 6px',
//                   borderRadius: '4px',
//                   fontSize: '11px',
//                   fontFamily: '"JetBrains Mono", monospace',
//                   border: '1px solid #e2e8f0'
//                 }}>Shift + Enter</kbd> for new line
//               </p>
//             </form>
//           </div>
//         </div>

//         {/* Enhanced Admin Panel Modal */}
//         <AnimatePresence>
//           {showAdminPanel && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               style={{
//                 position: 'fixed',
//                 inset: 0,
//                 backgroundColor: 'rgba(15, 23, 42, 0.6)',
//                 backdropFilter: 'blur(8px)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 zIndex: 9999,
//                 padding: '2rem'
//               }}
//               onClick={() => setShowAdminPanel(false)}
//             >
//               <motion.div
//                 initial={{ scale: 0.95, opacity: 0, y: 20 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 exit={{ scale: 0.95, opacity: 0, y: 20 }}
//                 transition={{ type: "spring", damping: 30, stiffness: 300 }}
//                 style={{
//                   width: '100%',
//                   maxWidth: '1400px',
//                   height: '90vh',
//                   backgroundColor: '#ffffff',
//                   borderRadius: '20px',
//                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//                   overflow: 'hidden',
//                   display: 'flex',
//                   flexDirection: 'column'
//                 }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div style={{
//                   padding: '24px 32px',
//                   borderBottom: '1px solid #e2e8f0',
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   background: 'linear-gradient(to right, #f8fafc, #ffffff)'
//                 }}>
//                   <div>
//                     <h2 style={{ 
//                       margin: 0, 
//                       fontSize: '24px', 
//                       fontWeight: 700, 
//                       color: '#0f172a',
//                       letterSpacing: '-0.02em'
//                     }}>
//                       System Administration
//                     </h2>
//                     <p style={{ 
//                       margin: '4px 0 0 0', 
//                       fontSize: '14px', 
//                       color: '#64748b' 
//                     }}>
//                       Manage HR RAG Pipeline & Analytics
//                     </p>
//                   </div>
                  
//                   <button
//                     onClick={() => setShowAdminPanel(false)}
//                     style={{
//                       padding: '10px 20px',
//                       backgroundColor: '#f1f5f9',
//                       color: '#475569',
//                       border: 'none',
//                       borderRadius: '10px',
//                       fontWeight: 600,
//                       cursor: 'pointer',
//                       transition: 'all 0.2s ease',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '8px',
//                       fontSize: '14px'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = '#e2e8f0';
//                       e.currentTarget.style.transform = 'scale(1.02)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = '#f1f5f9';
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }}
//                   >
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <line x1="18" y1="6" x2="6" y2="18"/>
//                       <line x1="6" y1="6" x2="18" y2="18"/>
//                     </svg>
//                     Close
//                   </button>
//                 </div>

//                 <div style={{ 
//                   flex: 1, 
//                   overflowY: 'auto', 
//                   padding: '32px', 
//                   backgroundColor: '#f8fafc' 
//                 }} className="scrollbar-custom">
//                   <AdminDashboard />
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </>
//   );
// }

// // Enhanced Nav Button Component
// const NavButton = ({ icon, label, active, onClick, collapsed }) => (
//   <button
//     onClick={onClick}
//     style={{
//       width: '100%',
//       padding: '12px 16px',
//       background: active ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' : 'transparent',
//       border: 'none',
//       borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
//       borderRadius: collapsed ? '10px' : '0 10px 10px 0',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '12px',
//       cursor: 'pointer',
//       fontSize: '14px',
//       fontWeight: 500,
//       color: active ? '#6366f1' : '#64748b',
//       marginBottom: '4px',
//       transition: 'all 0.2s',
//       justifyContent: collapsed ? 'center' : 'flex-start'
//     }}
//     onMouseEnter={(e) => {
//       if (!active) {
//         e.currentTarget.style.background = 'rgba(248, 250, 252, 0.8)';
//         e.currentTarget.style.transform = 'translateX(4px)';
//       }
//     }}
//     onMouseLeave={(e) => {
//       if (!active) {
//         e.currentTarget.style.background = 'transparent';
//         e.currentTarget.style.transform = 'translateX(0)';
//       }
//     }}
//   >
//     <div style={{ display: 'flex', alignItems: 'center' }}>{icon}</div>
//     {!collapsed && <span>{label}</span>}
//   </button>
// );

// // Enhanced Message Bubble Component
// const MessageBubble = ({ message, onOpenSource, onSuggestionClick }) => {
//   const isBot = message.sender === 'bot';
  
//   return (
//     <div style={{
//       display: 'flex',
//       gap: '16px',
//       alignItems: 'flex-start',
//       maxWidth: '85%',
//       marginLeft: isBot ? 0 : 'auto'
//     }}>
//       {isBot && (
//         <div style={{
//           width: '40px',
//           height: '40px',
//           borderRadius: '12px',
//           background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           fontSize: '20px',
//           flexShrink: 0,
//           boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
//         }}>
//           ✨
//         </div>
//       )}
//       <div style={{
//         flex: 1,
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '12px'
//       }}>
//         <div style={{
//           padding: '16px 20px',
//           background: isBot 
//             ? message.isError 
//               ? 'linear-gradient(135deg, #fee2e2, #fecaca)' 
//               : 'white'
//             : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//           color: isBot ? (message.isError ? '#991b1b' : '#1e293b') : '#ffffff',
//           borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
//           fontSize: '15px',
//           lineHeight: '1.6',
//           boxShadow: isBot 
//             ? '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(0, 0, 0, 0.03)'
//             : '0 4px 12px rgba(99, 102, 241, 0.3)',
//           border: isBot ? '1px solid #f1f5f9' : 'none',
//           fontWeight: isBot ? 400 : 500
//         }}>
//           {message.text}
//         </div>

//         {/* Suggestion chips */}
//         {message.suggestions && message.suggestions.length > 0 && (
//           <div style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: '8px',
//             marginTop: '4px'
//           }}>
//             {message.suggestions.map((suggestion, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => onSuggestionClick(suggestion)}
//                 style={{
//                   background: 'white',
//                   border: '1px solid #e2e8f0',
//                   borderRadius: '20px',
//                   padding: '8px 16px',
//                   fontSize: '13px',
//                   color: '#475569',
//                   cursor: 'pointer',
//                   fontWeight: 500,
//                   boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
//                   transition: 'all 0.2s'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
//                   e.currentTarget.style.color = 'white';
//                   e.currentTarget.style.borderColor = 'transparent';
//                   e.currentTarget.style.transform = 'translateY(-2px)';
//                   e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.2)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'white';
//                   e.currentTarget.style.color = '#475569';
//                   e.currentTarget.style.borderColor = '#e2e8f0';
//                   e.currentTarget.style.transform = 'translateY(0)';
//                   e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
//                 }}
//               >
//                 {suggestion}
//               </button>
//             ))}
//           </div>
//         )}
        
//         {/* Sources */}
//         {message.sources && message.sources.length > 0 && (
//           <div style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: '8px'
//           }}>
//             {[...new Map(message.sources.map(s => [`${s.path}-${s.page}`, s])).values()]
//               .filter(source => message.text.includes(source.doc_name))
//               .map((source, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => onOpenSource(source, message.text)}
//                   style={{
//                     background: 'rgba(99, 102, 241, 0.05)',
//                     border: '1px solid rgba(99, 102, 241, 0.2)',
//                     borderRadius: '10px',
//                     padding: '8px 14px',
//                     fontSize: '12px',
//                     color: '#6366f1',
//                     cursor: 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     transition: 'all 0.2s',
//                     fontWeight: 500
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = '#6366f1';
//                     e.currentTarget.style.color = '#ffffff';
//                     e.currentTarget.style.transform = 'translateY(-1px)';
//                     e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.2)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
//                     e.currentTarget.style.color = '#6366f1';
//                     e.currentTarget.style.transform = 'translateY(0)';
//                     e.currentTarget.style.boxShadow = 'none';
//                   }}
//                 >
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
//                     <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
//                   </svg>
//                   <span>{source.doc_name} · {source.page}</span>
//                 </button>
//               ))}
//           </div>
//         )}
        
//         <span style={{
//           fontSize: '11px',
//           color: '#94a3b8',
//           paddingLeft: '4px',
//           fontWeight: 500,
//           letterSpacing: '0.02em'
//         }}>
//           {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </span>
//       </div>
//     </div>
//   );
// };

// // Enhanced Typing Indicator
// const TypingIndicator = () => (
//   <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
//     {[0, 1, 2].map((i) => (
//       <div
//         key={i}
//         style={{
//           width: '8px',
//           height: '8px',
//           borderRadius: '50%',
//           background: '#6366f1',
//           animation: `bounce 1.4s infinite ease-in-out`,
//           animationDelay: `${i * 0.16}s`
//         }}
//       />
//     ))}
//   </div>
// );

// export default ChatInterface;




import { APP_CONFIG } from './utils/constants';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from './services/api';
import AdminDashboard from './components/AdminDashboard';
import LegalAnalyzer from './components/LegalAnalyzer';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

function ChatInterface() {
  const { t, language } = useLanguage();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLegalAnalyzer, setShowLegalAnalyzer] = useState(false);
  const API_URL = APP_CONFIG.API_URL || 'http://localhost:10001';
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Document Assistant. Ask me anything about your uploaded documents, contracts, or agreements.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => prev.map(msg => 
      msg.id === 1 ? { ...msg, text: t('welcomeMessage') } : msg
    ));
  }, [language, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenSource = (source, messageText) => {
    if (!source || !source.path) return;
    const fileName = source.path.split('\\').pop();
    const baseUrl = `${API_URL}/static_files/${encodeURIComponent(fileName)}`;
    const pageNumber = source.page.replace(/\D/g, '');
    window.open(`${baseUrl}#page=${pageNumber}`, '_blank');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const data = await apiService.sendMessage(inputValue, null, language);

      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sources: data.sources || [],
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 2,
        text: error.message || t('error') + ': ' + t('tryAgain'),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: Date.now(),
      text: "Hello! I'm your Document Assistant. Ask me anything about your uploaded documents, contracts, or agreements.",
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f8f9fa',
      fontFamily: 'Google Sans, Roboto, sans-serif'
    }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: sidebarCollapsed ? '72px' : '260px',
        background: '#ffffff',
        borderRight: '1px solid #e8eaed',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'relative'
      }}>
        {/* Logo & Toggle */}
        <div style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!sidebarCollapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '20px',
              fontWeight: 500,
              color: '#202124'
            }}>
              <span style={{ fontSize: '28px' }}>🚀</span>
              {t('appName')}
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span style={{ fontSize: '20px' }}>☰</span>
          </button>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: '8px 16px' }}>
          <button
            onClick={startNewChat}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: '1px solid #dadce0',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#202124',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '20px' }}>✨</span>
            {!sidebarCollapsed && <span>{t('newChat')}</span>}
          </button>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          <NavButton
            icon="💬"
            label={t('navChat')}
            active={!showAdminPanel}
            onClick={() => setShowAdminPanel(false)}
            collapsed={sidebarCollapsed}
          />
          <NavButton
            icon="⚙️"
            label={t('navAdmin')}
            active={showAdminPanel}
            onClick={() => setShowAdminPanel(true)}
            collapsed={sidebarCollapsed}
          />
          <NavButton
            icon="⚖️"
            label={t('navLegal')}
            active={showLegalAnalyzer}
            onClick={() => setShowLegalAnalyzer(true)}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Bottom Actions */}
        <div style={{ padding: '8px', borderTop: '1px solid #e8eaed' }}>
          <NavButton
            icon="🚪"
            label={t('navLogout')}
            onClick={handleLogout}
            collapsed={sidebarCollapsed}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Chat Interface */}
        <>
          {/* Chat Header */}
          <div style={{
            padding: '16px 24px',
            background: '#ffffff',
            borderBottom: '1px solid #e8eaed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 400,
                color: '#202124'
              }}>
                {t('subTitle')}
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: '#5f6368'
              }}>
                {t('poweredBy')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onOpenSource={handleOpenSource}
              />
            ))}
            {loading && (
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  🤖
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: '#f8f9fa',
                  borderRadius: '18px',
                  maxWidth: '85%'
                }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px 24px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e8eaed'
          }}>
            <form onSubmit={handleSendMessage} style={{
              maxWidth: '800px',
              margin: '0 auto',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f1f3f4',
                borderRadius: '24px',
                padding: '4px 4px 4px 20px',
                border: '1px solid transparent',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.border = '1px solid #dadce0';
                e.currentTarget.style.boxShadow = '0 1px 6px rgba(32,33,36,0.28)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = '#f1f3f4';
                e.currentTarget.style.border = '1px solid transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('chatPlaceholder')}
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '16px',
                    color: '#202124',
                    padding: '12px 0'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  style={{
                    background: inputValue.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e8eaed',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    fontSize: '20px'
                  }}
                  onMouseEnter={(e) => {
                    if (inputValue.trim()) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ filter: inputValue.trim() ? 'none' : 'grayscale(1)' }}>
                    {loading ? '⏳' : '🚀'}
                  </span>
                </button>
              </div>
              <p style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#5f6368',
                marginTop: '12px'
              }}>
                {t('mistakeWarning')}
              </p>
            </form>
          </div>
        </>
      </div>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem'
            }}
            onClick={() => setShowAdminPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: '1280px',
                height: '85vh',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header with Close Button */}
              <div style={{
                padding: '1.25rem 2rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)'
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                    System Administration
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Manage HR RAG Pipeline & User Metrics
                  </p>
                </div>
                
                <button
                  onClick={() => setShowAdminPanel(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                >
                  Close ✕
                </button>
              </div>

              {/* Scrollable Dashboard Area */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '2rem', 
                backgroundColor: '#f8fafc' 
              }}>
                <AdminDashboard />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal Analyzer Modal */}
      {showLegalAnalyzer && (
        <LegalAnalyzer onClose={() => setShowLegalAnalyzer(false)} />
      )}
    </div>
  );
}

// Nav Button Component
const NavButton = ({ icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '12px 16px',
      background: active ? '#e8f0fe' : 'transparent',
      border: 'none',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      color: active ? '#1967d2' : '#5f6368',
      marginBottom: '4px',
      transition: 'background 0.2s',
      justifyContent: collapsed ? 'center' : 'flex-start'
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.background = '#f1f3f4';
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.background = 'transparent';
    }}
  >
    <span style={{ fontSize: '18px' }}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </button>
);

// Message Bubble Component
const MessageBubble = ({ message, onOpenSource }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      maxWidth: '85%',
      marginLeft: isBot ? 0 : 'auto'
    }}>
      {isBot && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0
        }}>
          🤖
        </div>
      )}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          padding: '12px 16px',
          background: isBot ? '#f8f9fa' : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: isBot ? '#202124' : '#ffffff',
          borderRadius: '18px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          {message.text}
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {[...new Map(message.sources.map(s => [`${s.path}-${s.page}`, s])).values()]
              .filter(source => message.text.includes(source.doc_name))
              .map((source, idx) => (
                <button
                  key={idx}
                  onClick={() => onOpenSource(source, message.text)}
                  style={{
                    background: '#e8f0fe',
                    border: '1px solid #1967d2',
                    borderRadius: '16px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    color: '#1967d2',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1967d2';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#e8f0fe';
                    e.currentTarget.style.color = '#1967d2';
                  }}
                >
                  <span>📖</span>
                  <span>{source.doc_name} ({source.page})</span>
                </button>
              ))}
          </div>
        )}
        
        <span style={{
          fontSize: '11px',
          color: '#5f6368',
          paddingLeft: '4px'
        }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// Typing Indicator
const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#5f6368',
          animation: `bounce 1.4s infinite ease-in-out`,
          animationDelay: `${i * 0.16}s`
        }}
      />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-8px); }
      }
    `}</style>
  </div>
);

export default ChatInterface;



// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import AdminDashboard from './components/AdminDashboard';

// function ChatInterface() {
//   const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hello! I'm your HR Assistant. Ask me anything about company policies, benefits, or procedures.",
//       sender: 'bot',
//       timestamp: new Date()
//     }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleOpenSource = (source, messageText) => {
//     if (!source || !source.path) return;
//     const fileName = source.path.split('\\').pop();
//     const baseUrl = `http://localhost:8000/static_files/${encodeURIComponent(fileName)}`;
//     const pageNumber = source.page.replace(/\D/g, '');
//     window.open(`${baseUrl}#page=${pageNumber}`, '_blank');
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim()) return;

//     const userMessage = {
//       id: Date.now(),
//       text: inputValue,
//       sender: 'user',
//       timestamp: new Date()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setInputValue('');
//     setLoading(true);

//     try {
//       const response = await axios.post('http://localhost:8000/chat', {
//         query: inputValue
//       });

//       const botMessage = {
//         id: Date.now() + 1,
//         text: response.data.response,
//         sources: response.data.sources || [],
//         sender: 'bot',
//         timestamp: new Date()
//       };
      
//       setMessages(prev => [...prev, botMessage]);
//     } catch (error) {
//       console.error('Error:', error);
//       const errorMessage = {
//         id: Date.now() + 2,
//         text: 'Sorry, there was an error processing your query.',
//         sender: 'bot',
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startNewChat = () => {
//     setMessages([{
//       id: Date.now(),
//       text: "Hello! I'm your HR Assistant. Ask me anything about company policies, benefits, or procedures.",
//       sender: 'bot',
//       timestamp: new Date()
//     }]);
//   };

//   return (
//     <div style={{
//       display: 'flex',
//       height: '100vh',
//       background: '#f8f9fa',
//       fontFamily: 'Google Sans, Roboto, sans-serif'
//     }}>
      
//       {/* SIDEBAR */}
//       <div style={{
//         width: sidebarCollapsed ? '72px' : '260px',
//         background: '#ffffff',
//         borderRight: '1px solid #e8eaed',
//         display: 'flex',
//         flexDirection: 'column',
//         transition: 'width 0.3s ease',
//         position: 'relative'
//       }}>
//         {/* Logo & Toggle */}
//         <div style={{
//           padding: '16px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between'
//         }}>
//           {!sidebarCollapsed && (
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '12px',
//               fontSize: '20px',
//               fontWeight: 500,
//               color: '#202124'
//             }}>
//               <span style={{ fontSize: '28px' }}>🚀</span>
//               RAG.AI
//             </div>
//           )}
//           <button
//             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//             style={{
//               background: 'none',
//               border: 'none',
//               cursor: 'pointer',
//               padding: '8px',
//               borderRadius: '50%',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//             onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
//             onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
//           >
//             <span style={{ fontSize: '20px' }}>☰</span>
//           </button>
//         </div>

//         {/* New Chat Button */}
//         <div style={{ padding: '8px 16px' }}>
//           <button
//             onClick={startNewChat}
//             style={{
//               width: '100%',
//               padding: '12px 16px',
//               background: 'none',
//               border: '1px solid #dadce0',
//               borderRadius: '24px',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '12px',
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: 500,
//               color: '#202124',
//               transition: 'all 0.2s'
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = '#f8f9fa';
//               e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.3)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = 'none';
//               e.currentTarget.style.boxShadow = 'none';
//             }}
//           >
//             <span style={{ fontSize: '20px' }}>✨</span>
//             {!sidebarCollapsed && <span>New chat</span>}
//           </button>
//         </div>

//         {/* Navigation */}
//         <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
//           <NavButton
//             icon="💬"
//             label="Chat"
//             active={!showAdminPanel}
//             onClick={() => setShowAdminPanel(false)}
//             collapsed={sidebarCollapsed}
//           />
//           <NavButton
//             icon="⚙️"
//             label="Admin Panel"
//             active={showAdminPanel}
//             onClick={() => setShowAdminPanel(true)}
//             collapsed={sidebarCollapsed}
//           />
//         </div>

//         {/* Bottom Actions */}
//         <div style={{ padding: '8px', borderTop: '1px solid #e8eaed' }}>
//           <NavButton
//             icon="🚪"
//             label="Log out"
//             onClick={handleLogout}
//             collapsed={sidebarCollapsed}
//           />
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
//         {!showAdminPanel ? (
//           <>
//             {/* Chat Header */}
//             <div style={{
//               padding: '16px 24px',
//               background: '#ffffff',
//               borderBottom: '1px solid #e8eaed',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between'
//             }}>
//               <div>
//                 <h1 style={{
//                   margin: 0,
//                   fontSize: '22px',
//                   fontWeight: 400,
//                   color: '#202124'
//                 }}>
//                   Document Assistant
//                 </h1>
//                 <p style={{
//                   margin: '4px 0 0 0',
//                   fontSize: '13px',
//                   color: '#5f6368'
//                 }}>
//                   Powered by Zenzee
//                 </p>
//               </div>
//             </div>

//             {/* Messages Area */}
//             <div style={{
//               flex: 1,
//               overflowY: 'auto',
//               padding: '24px',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '24px'
//             }}>
//               {messages.map((msg) => (
//                 <MessageBubble
//                   key={msg.id}
//                   message={msg}
//                   onOpenSource={handleOpenSource}
//                 />
//               ))}
//               {loading && (
//                 <div style={{
//                   display: 'flex',
//                   gap: '12px',
//                   alignItems: 'flex-start'
//                 }}>
//                   <div style={{
//                     width: '32px',
//                     height: '32px',
//                     borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #667eea, #764ba2)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontSize: '18px',
//                     flexShrink: 0
//                   }}>
//                     🤖
//                   </div>
//                   <div style={{
//                     padding: '12px 16px',
//                     background: '#f8f9fa',
//                     borderRadius: '18px',
//                     maxWidth: '85%'
//                   }}>
//                     <TypingIndicator />
//                   </div>
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input Area */}
//             <div style={{
//               padding: '16px 24px 24px',
//               background: '#ffffff',
//               borderTop: '1px solid #e8eaed'
//             }}>
//               <form onSubmit={handleSendMessage} style={{
//                 maxWidth: '800px',
//                 margin: '0 auto',
//                 position: 'relative'
//               }}>
//                 <div style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   background: '#f1f3f4',
//                   borderRadius: '24px',
//                   padding: '4px 4px 4px 20px',
//                   border: '1px solid transparent',
//                   transition: 'all 0.2s'
//                 }}
//                 onFocus={(e) => {
//                   e.currentTarget.style.background = '#ffffff';
//                   e.currentTarget.style.border = '1px solid #dadce0';
//                   e.currentTarget.style.boxShadow = '0 1px 6px rgba(32,33,36,0.28)';
//                 }}
//                 onBlur={(e) => {
//                   e.currentTarget.style.background = '#f1f3f4';
//                   e.currentTarget.style.border = '1px solid transparent';
//                   e.currentTarget.style.boxShadow = 'none';
//                 }}
//                 >
//                   <input
//                     type="text"
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     placeholder="Ask me about HR policies..."
//                     disabled={loading}
//                     style={{
//                       flex: 1,
//                       border: 'none',
//                       background: 'transparent',
//                       outline: 'none',
//                       fontSize: '16px',
//                       color: '#202124',
//                       padding: '12px 0'
//                     }}
//                   />
//                   <button
//                     type="submit"
//                     disabled={loading || !inputValue.trim()}
//                     style={{
//                       background: inputValue.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e8eaed',
//                       border: 'none',
//                       borderRadius: '50%',
//                       width: '40px',
//                       height: '40px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
//                       transition: 'all 0.2s',
//                       fontSize: '20px'
//                     }}
//                     onMouseEnter={(e) => {
//                       if (inputValue.trim()) {
//                         e.currentTarget.style.transform = 'scale(1.05)';
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = 'scale(1)';
//                     }}
//                   >
//                     <span style={{ filter: inputValue.trim() ? 'none' : 'grayscale(1)' }}>
//                       {loading ? '⏳' : '🚀'}
//                     </span>
//                   </button>
//                 </div>
//                 <p style={{
//                   textAlign: 'center',
//                   fontSize: '12px',
//                   color: '#5f6368',
//                   marginTop: '12px'
//                 }}>
//                   RAG AI can make mistakes. Check important info.
//                 </p>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div style={{
//             width: '100%',
//             height: '100%',
//             overflowY: 'auto',
//             background: '#ffffff'
//           }}>
//             {/* You would import and use AdminDashboard component here */}
//             <div style={{ padding: '24px' }}>
//               <h2 style={{ color: '#202124', marginBottom: '16px' }}>Admin Panel</h2>
//               <p style={{ color: '#5f6368' }}>Admin Dashboard component would go here</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Nav Button Component
// const NavButton = ({ icon, label, active, onClick, collapsed }) => (
//   <button
//     onClick={onClick}
//     style={{
//       width: '100%',
//       padding: '12px 16px',
//       background: active ? '#e8f0fe' : 'transparent',
//       border: 'none',
//       borderRadius: '24px',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '12px',
//       cursor: 'pointer',
//       fontSize: '14px',
//       fontWeight: 500,
//       color: active ? '#1967d2' : '#5f6368',
//       marginBottom: '4px',
//       transition: 'background 0.2s',
//       justifyContent: collapsed ? 'center' : 'flex-start'
//     }}
//     onMouseEnter={(e) => {
//       if (!active) e.currentTarget.style.background = '#f1f3f4';
//     }}
//     onMouseLeave={(e) => {
//       if (!active) e.currentTarget.style.background = 'transparent';
//     }}
//   >
//     <span style={{ fontSize: '18px' }}>{icon}</span>
//     {!collapsed && <span>{label}</span>}
//   </button>
// );

// // Message Bubble Component
// const MessageBubble = ({ message, onOpenSource }) => {
//   const isBot = message.sender === 'bot';
  
//   return (
//     <div style={{
//       display: 'flex',
//       gap: '12px',
//       alignItems: 'flex-start',
//       maxWidth: '85%',
//       marginLeft: isBot ? 0 : 'auto'
//     }}>
//       {isBot && (
//         <div style={{
//           width: '32px',
//           height: '32px',
//           borderRadius: '50%',
//           background: 'linear-gradient(135deg, #667eea, #764ba2)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           fontSize: '18px',
//           flexShrink: 0
//         }}>
//           🤖
//         </div>
//       )}
//       <div style={{
//         flex: 1,
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '8px'
//       }}>
//         <div style={{
//           padding: '12px 16px',
//           background: isBot ? '#f8f9fa' : 'linear-gradient(135deg, #667eea, #764ba2)',
//           color: isBot ? '#202124' : '#ffffff',
//           borderRadius: '18px',
//           fontSize: '14px',
//           lineHeight: '1.6'
//         }}>
//           {message.text}
//         </div>
        
//         {message.sources && message.sources.length > 0 && (
//           <div style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: '8px'
//           }}>
//             {[...new Map(message.sources.map(s => [`${s.path}-${s.page}`, s])).values()]
//               .filter(source => message.text.includes(source.doc_name))
//               .map((source, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => onOpenSource(source, message.text)}
//                   style={{
//                     background: '#e8f0fe',
//                     border: '1px solid #1967d2',
//                     borderRadius: '16px',
//                     padding: '6px 12px',
//                     fontSize: '12px',
//                     color: '#1967d2',
//                     cursor: 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '6px',
//                     transition: 'all 0.2s'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = '#1967d2';
//                     e.currentTarget.style.color = '#ffffff';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = '#e8f0fe';
//                     e.currentTarget.style.color = '#1967d2';
//                   }}
//                 >
//                   <span>📖</span>
//                   <span>{source.doc_name} ({source.page})</span>
//                 </button>
//               ))}
//           </div>
//         )}
        
//         <span style={{
//           fontSize: '11px',
//           color: '#5f6368',
//           paddingLeft: '4px'
//         }}>
//           {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </span>
//       </div>
//     </div>
//   );
// };

// // Typing Indicator
// const TypingIndicator = () => (
//   <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
//     {[0, 1, 2].map((i) => (
//       <div
//         key={i}
//         style={{
//           width: '8px',
//           height: '8px',
//           borderRadius: '50%',
//           background: '#5f6368',
//           animation: `bounce 1.4s infinite ease-in-out`,
//           animationDelay: `${i * 0.16}s`
//         }}
//       />
//     ))}
//     <style>{`
//       @keyframes bounce {
//         0%, 80%, 100% { transform: translateY(0); }
//         40% { transform: translateY(-8px); }
//       }
//     `}</style>
//   </div>
// );
// const adm
//   <AnimatePresence>
//   {showAdminPanel && (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="modal-overlay"
//       style={{
//         position: 'fixed',
//         inset: 0,
//         backgroundColor: 'rgba(15, 23, 42, 0.75)', // Slate-900 with transparency
//         backdropFilter: 'blur(12px)', // Modern glass effect
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 9999,
//         padding: '2rem'
//       }}
//       onClick={() => setShowAdminPanel(false)} // Close when clicking outside
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0, y: 20 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.9, opacity: 0, y: 20 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         style={{
//           width: '100%',
//           maxWidth: '1280px',
//           height: '85vh',
//           backgroundColor: '#ffffff',
//           borderRadius: '24px',
//           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//           position: 'relative'
//         }}
//         onClick={(e) => e.stopPropagation()} // Prevent closing when clicking dashboard content
//       >
//         {/* Sticky Header with Close Button */}
//         <div style={{
//           padding: '1.25rem 2rem',
//           borderBottom: '1px solid #e2e8f0',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           background: 'rgba(255, 255, 255, 0.8)',
//           backdropFilter: 'blur(4px)'
//         }}>
//           <div>
//             <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
//               System Administration
//             </h2>
//             <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Manage HR RAG Pipeline & User Metrics</p>
//           </div>
          
//           <button
//             onClick={() => setShowAdminPanel(false)}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#f1f5f9',
//               color: '#475569',
//               border: 'none',
//               borderRadius: '10px',
//               fontWeight: 600,
//               cursor: 'pointer',
//               transition: 'all 0.2s ease',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}
//             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
//             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
//           >
//             Close ✕
//           </button>
//         </div>

//         {/* Scrollable Dashboard Area */}
//         <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: '#f8fafc' }}>
//            {/* Your AdminDashboard component is rendered here */}
//            <AdminDashboard />
//         </div>
//       </motion.div>
//     </motion.div>
//   )}
// </AnimatePresence>
// );
// };


// export default ChatInterface;

// import React, { useState, useRef, useEffect } from 'react';
// import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// import AdminDashboard from './components/AdminDashboard';
// import axios from 'axios';
// import './ChatInterface.css';

// function ChatInterface() {
//   // 1. ADD THIS STATE VARIABLE HERE
//   const [showAdminPanel, setShowAdminPanel] = useState(false); 
  
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hello! I'm your HR Assistant. Ask me anything about company policies.",
//       sender: 'bot',
//       timestamp: new Date()
//     }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleOpenSource = (source, messageText) => {
//     if (!source || !source.path) {
//       console.error("Source path is missing!");
//       return;
//     }
//     const fileName = source.path.split('\\').pop();
//     const baseUrl = `http://localhost:8000/static_files/${encodeURIComponent(fileName)}`;
//     const citationIndex = messageText.indexOf(`[${source.doc_name}`);
//     let searchTerm = "";
//     if (citationIndex !== -1) {
//       const textBefore = messageText.substring(0, citationIndex).trim();
//       const sentences = textBefore.split(/[.!?]\s+/);
//       searchTerm = sentences[sentences.length - 1];
//     }
//     const pageNumber = source.page.replace(/\D/g, '');
//     const finalUrl = `${baseUrl}#page=${pageNumber}&search="${encodeURIComponent(searchTerm)}"`;
    
//     console.log("Opening Source:", finalUrl);
//     window.open(finalUrl, '_blank');
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim()) return;

//     const userMessage = {
//       id: Date.now(),
//       text: inputValue,
//       sender: 'user',
//       timestamp: new Date()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setInputValue('');
//     setLoading(true);

//     try {
//       const response = await axios.post('http://localhost:8000/chat', {
//         query: inputValue
//       });

//       const botMessage = {
//         id: Date.now() + 1,
//         text: response.data.response,
//         sources: response.data.sources || [],
//         sender: 'bot',
//         timestamp: new Date()
//       };
      
//       setMessages(prev => [...prev, botMessage]);
//     } catch (error) {
//       console.error('Error:', error);
//       const errorMessage = {
//         id: Date.now() + 2,
//         text: 'Sorry, there was an error processing your query.',
//         sender: 'bot',
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-container" style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      
//       {/* SIDEBAR */}
//       <nav style={{ 
//         width: '260px', 
//         background: '#111827', 
//         borderRight: '1px solid rgba(255,255,255,0.1)',
//         padding: '1.5rem',
//         display: 'flex',
//         flexDirection: 'column'
//       }}>
//         <div style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>🚀 RAG.AI</div>
        
//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//           <button onClick={() => setShowAdminPanel(false)} style={navLinkStyle}>💬 Chat Window</button>
          
//           {/* 2. CORRECTED COMMENT AND BUTTON */}
//           <button 
//             onClick={() => setShowAdminPanel(true)} 
//             style={{...navLinkStyle, background: showAdminPanel ? '#374151' : 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer'}}
//           >
//             ⚙️ Admin Panel
//           </button>
//         </div>

//         <button onClick={handleLogout} style={logoutButtonStyle}>
//           Log Out
//         </button>
//       </nav>

//       {/* MAIN CONTENT AREA */}
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
//         <div className="chat-header">
//           <h1>HR Assistant</h1>
//           <p>Powered by RAG</p>
//         </div>

//         <div className="messages-container">
//           {messages.map((msg) => (
//             <div key={msg.id} className={`message ${msg.sender}`}>
//               <div className={`message-content ${msg.sender}`}>
//                 <p>{msg.text}</p>
//                 {msg.sources && msg.sources.length > 0 && (
//                   <div className="sources-list">
//                     <span className="source-title">Sources:</span>
//                     <div className="source-badges">
//                       {[...new Map(msg.sources.map(s => [`${s.path}-${s.page}`, s])).values()]
//                         .filter(source => msg.text.includes(source.doc_name))
//                         .map((source, idx) => (
//                           <span key={idx} className="source-badge clickable" 
//                             onClick={() => handleOpenSource(source, msg.text)}>
//                             📖 {source.doc_name} ({source.page})
//                           </span>
//                         ))}
//                     </div>
//                   </div>
//                 )}
//                 <span className="timestamp">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//               </div>
//             </div>
//           ))}
//           {loading && <div className="message bot"><div className="message-content bot loading">...</div></div>}
//           <div ref={messagesEndRef} />
//         </div>

//         <form className="input-form" onSubmit={handleSendMessage}>
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder="Ask me about HR policies..."
//             disabled={loading}
//             className="input-field"
//           />
//           <button type="submit" disabled={loading || !inputValue.trim()} className="send-button">
//             {loading ? '...' : 'Send'}
//           </button>
//         </form>

//         {/* 3. THE SLIDING ADMIN PANEL OVERLAY */}
//         {showAdminPanel && (
//           <div style={{
//             position: 'absolute',
//             top: 0,
//             right: 0,
//             width: '100%',
//             height: '100%',
//             background: '#0f172a',
//             zIndex: 100,
//             overflowY: 'auto',
//             padding: '20px'
//           }}>
//             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//               <button 
//                 onClick={() => setShowAdminPanel(false)} 
//                 style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}
//               >
//                 Close Admin Panel ✕
//               </button>
//             </div>
//             <AdminDashboard />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// const navLinkStyle = {
//   padding: '0.75rem 1rem',
//   textDecoration: 'none',
//   color: '#9ca3af',
//   borderRadius: '8px',
//   transition: '0.2s',
//   background: 'rgba(255,255,255,0.05)',
//   border: 'none',
//   width: '100%',
//   textAlign: 'left',
//   cursor: 'pointer'
// };

// const logoutButtonStyle = {
//   padding: '0.75rem',
//   background: 'transparent',
//   border: '1px solid #ef4444',
//   color: '#ef4444',
//   borderRadius: '8px',
//   cursor: 'pointer',
//   marginTop: '10px'
// };

// export default ChatInterface;




// import React, { useState, useRef, useEffect } from 'react';
// import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// import AdminDashboard from './components/AdminDashboard';
// import axios from 'axios';
// import './ChatInterface.css';

// function ChatInterface() {
//    const [showAdminPanel, setShowAdminPanel] = useState(false); 
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hello! I'm your HR Assistant. Ask me anything about company policies.",
//       sender: 'bot',
//       timestamp: new Date()
//     }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//   };


//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);
//   const handleOpenSource = (source, messageText) => {
//   // Try to find the sentence immediately preceding the citation in the text
//   // This is a simple way to get a 'search term' for the PDF highlight
//   if (!source || !source.path) {
//     console.error("Source path is missing!");
//     return;
//   }
//   const fileName = source.path.split('\\').pop();
//   const baseUrl = `http://localhost:8000/static_files/${encodeURIComponent(fileName)}`;
//   const citationIndex = messageText.indexOf(`[${source.doc_name}`);
//   let searchTerm = "";
//   if (citationIndex !== -1) {
//     const textBefore = messageText.substring(0, citationIndex).trim();
//     const sentences = textBefore.split(/[.!?]\s+/);
//     searchTerm = sentences[sentences.length - 1];
//   }
//   const pageNumber = source.page.replace(/\D/g, '');
//   const textBefore = messageText.substring(0, citationIndex);
//   const sentences = textBefore.split(/[.!?]\s+/);
//   const lastSentence = sentences[sentences.length - 1];
//   // Construct the URL with search parameter
//   // Note: This requires the file to be accessible via a URL or local server
//   const finalUrl = `${baseUrl}#page=${pageNumber}&search="${encodeURIComponent(searchTerm)}"`;
  
//   console.log("Opening Source:", finalUrl);
//   window.open(finalUrl, '_blank');
//   // const fileUrl = `file:///${source.path.replace(/\\/g, '/')}#page=${source.page.replace(/\D/g, '')}&search="${encodeURIComponent(lastSentence)}"`;
  
//   // window.open(fileUrl, '_blank');
// };
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim()) return;

//     const userMessage = {
//       id: Date.now(), // Using timestamp for better ID uniqueness
//       text: inputValue,
//       sender: 'user',
//       timestamp: new Date()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setInputValue('');
//     setLoading(true);

//     try {
//       const response = await axios.post('http://localhost:8000/chat', {
//         query: inputValue
//       });

//       const botMessage = {
//         id: Date.now() + 1,
//         text: response.data.response,
//         sources: response.data.sources || [], // <--- CAPTURE SOURCES HERE
//         sender: 'bot',
//         timestamp: new Date()
//       };
//       console.log('Bot Message with Sources:', botMessage);
      
//       setMessages(prev => [...prev, botMessage]);
//     } catch (error) {
//       console.error('Error:', error);
//       const errorMessage = {
//         id: messages.length + 2,
//         text: 'Sorry, there was an error processing your query. Please try again.',
//         sender: 'bot',
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <h1>HR Assistant</h1>
//         <p>Powered by RAG</p>
//       </div>
//          <nav style={{ 
//         width: '260px', 
//         background: 'rgba(0,0,0,0.3)', 
//         borderRight: '1px solid rgba(255,255,255,0.1)',
//         padding: '1.5rem',
//         display: 'flex',
//         flexDirection: 'column'
//       }}>
//         <div style={{ marginBottom: '2rem', fontSize: '1.2rem',color: 'white', fontWeight: 'bold' }}>🚀 RAG.AI</div>
        
//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//           <Link to="/chat" style={navLinkStyle}>💬 Chat History</Link>
          
//           {/* Admin Dashboard Link */}
//           <button 
//             onClick={() => setShowAdminPanel(true)} 
//             style={{...navLinkStyle, background: showAdminPanel ? '#374151' : 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer'}}
//           >
//             ⚙️ Admin Panel
//           </button>
//         </div>

//         <button onClick={handleLogout} style={logoutButtonStyle}>
//           Log Out
//         </button>
//       </nav>
//       <main style={{flex:1, overflowY: 'auto', position: 'relative'}}>
//         <Routes>
//           <Route path="/chat" element={<ChatInterface />} />
//           <Route path="admin" element={
//             <div className="nested-admin-container">
//               <AdminDashboard />
//             </div>
//           } />
//         </Routes>
//       </main>
        
//                
//       <div className="messages-container">
//         {messages.map((msg) => (
//           <div key={msg.id} className={`message ${msg.sender}`}>
//             <div className={`message-content ${msg.sender}`}>
//               <p>{msg.text}</p>
//               {msg.sources && msg.sources.length > 0 && (
//   <div className="sources-list">
//     <span className="source-title">Sources:</span>
//     <div className="source-badges">
//       {/* 1. Deduplicate by Path and Page
//          2. Filter to only show if the doc_name is actually mentioned in the text
//       */}
//       {[...new Map(msg.sources.map(s => [`${s.path}-${s.page}`, s])).values()]
//         .filter(source => msg.text.includes(source.doc_name)) // <--- THE FILTER
//         .map((source, idx) => (
//           <span key={idx} className="source-badge clickable" title={`Full Path: ${source.path}`}
//             onClick={() => handleOpenSource(source, msg.text)}>
//             📖 {source.doc_name.length > 20 
//               ? source.doc_name.substring(0, 20) + '...' 
//               : source.doc_name} 
//             <span style={{ marginLeft: '5px', opacity: 0.7 }}>
//               ({source.page})
//             </span>
//           </span>
//       ))}
//     </div>
//   </div>
// )}

//               <span className="timestamp">
//                 {msg.timestamp.toLocaleTimeString([], { 
//                   hour: '2-digit', 
//                   minute: '2-digit' 
//                 })}
//               </span>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="message bot">
//             <div className="message-content bot loading">
//               <span className="dot"></span>
//               <span className="dot"></span>
//               <span className="dot"></span>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <form className="input-form" onSubmit={handleSendMessage}>
//         <input
//           type="text"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           placeholder="Ask me about HR policies..."
//           disabled={loading}
//           className="input-field"
//         />
//         <button 
//           type="submit" 
//           disabled={loading || !inputValue.trim()}
//           className="send-button"
//         >
//           {loading ? 'Sending...' : 'Send'}
//         </button>
//       </form>
//     </div>
//   );
// }
// const navLinkStyle = {
//   padding: '0.75rem 1rem',
//   textDecoration: 'none',
//   color: '#9ca3af',
//   borderRadius: '8px',
//   transition: '0.2s',
//   background: 'rgba(255,255,255,0.05)'
// };

// const logoutButtonStyle = {
//   padding: '0.75rem',
//   background: 'transparent',
//   border: '1px solid #ef4444',
//   color: '#ef4444',
//   borderRadius: '8px',
//   cursor: 'pointer'
// };

// export default ChatInterface;
