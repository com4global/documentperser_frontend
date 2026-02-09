// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
// import '../Styles/landingpage.css';

// export default function LandingPage() {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState('signin');
//   const [currentFeature, setCurrentFeature] = useState(0);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [hoveredPricing, setHoveredPricing] = useState(null);
//   const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
//   const [isVideoPlaying, setIsVideoPlaying] = useState(true);
//   const videoRef = useRef(null);
//   const navigate = useNavigate();
//   const { scrollYProgress } = useScroll();
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
//   const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

//   const videos = [
//     '/advertiseA.mp4',
//     '/advertiseb.mp4',
//     '/advertisec.mp4'
//   ];

//   const models = [
//     { 
//       id: 'gpt-3', 
//       name: 'GPT-3.5 Turbo',
//       price: '$0.002/1K tokens',
//       speed: 'Fast',
//       features: ['Basic reasoning', 'Quick responses', 'Cost-effective', 'Standard accuracy'],
//       color: '#10b981',
//       icon: '⚡'
//     },
//     { 
//       id: 'gpt-4', 
//       name: 'GPT-4 Turbo',
//       price: '$0.01/1K tokens',
//       speed: 'Moderate',
//       features: ['Advanced reasoning', 'Higher accuracy', 'Complex tasks', '128K context'],
//       color: '#3b82f6',
//       icon: '🧠',
//       popular: true
//     },
//     { 
//       id: 'claude', 
//       name: 'Claude Sonnet 4',
//       price: '$0.015/1K tokens',
//       speed: 'Fast',
//       features: ['Superior reasoning', 'Longest context', 'Best for research', '200K tokens'],
//       color: '#8b5cf6',
//       icon: '🎯'
//     },
//     { 
//       id: 'gemini', 
//       name: 'Gemini Pro',
//       price: '$0.00125/1K tokens',
//       speed: 'Very Fast',
//       features: ['Multimodal AI', 'Image & video', 'Lowest cost', 'Google integration'],
//       color: '#f59e0b',
//       icon: '💎'
//     }
//   ];

//   const features = [
//     {
//       icon: '📄',
//       title: 'Multi-Format Processing',
//       description: 'Process PDFs, DOCX, XLSX, videos, audio files, and images with advanced AI extraction',
//       demo: 'Support for 100+ file types',
//       color: '#3b82f6'
//     },
//     {
//       icon: '🎥',
//       title: 'Video Intelligence',
//       description: 'Extract insights from video content with automated transcription and scene analysis',
//       demo: 'Process hours of video in minutes',
//       color: '#8b5cf6'
//     },
//     {
//       icon: '🎵',
//       title: 'Audio Transcription',
//       description: 'Convert audio to searchable text with speaker identification and timestamps',
//       demo: '99% accuracy transcription',
//       color: '#ec4899'
//     },
//     {
//       icon: '🔍',
//       title: 'Semantic Search',
//       description: 'Find information using natural language across all your documents',
//       demo: 'Query millions of docs instantly',
//       color: '#10b981'
//     },
//     {
//       icon: '🧠',
//       title: 'AI Model Selection',
//       description: 'Choose between GPT-4, Claude, and Gemini for optimal results',
//       demo: 'Smart model routing',
//       color: '#f59e0b'
//     },
//     {
//       icon: '⚡',
//       title: 'Real-time Processing',
//       description: 'Upload and process documents in real-time with instant AI responses',
//       demo: 'Lightning fast performance',
//       color: '#06b6d4'
//     }
//   ];

//   const pricingPlans = [
//     {
//       name: 'Starter',
//       price: '$29',
//       period: '/month',
//       description: 'Perfect for individuals and small teams',
//       features: [
//         '10K AI tokens/month',
//         'All AI models access',
//         '100 documents storage',
//         'Email support',
//         'Basic analytics',
//         'API access'
//       ],
//       cta: 'Start Free Trial',
//       popular: false
//     },
//     {
//       name: 'Professional',
//       price: '$99',
//       period: '/month',
//       description: 'For growing teams and businesses',
//       features: [
//         '100K AI tokens/month',
//         'All AI models access',
//         'Unlimited documents',
//         'Priority support',
//         'Advanced analytics',
//         'Full API access',
//         'Custom integrations',
//         'Webhook support'
//       ],
//       cta: 'Start Free Trial',
//       popular: true
//     },
//     {
//       name: 'Enterprise',
//       price: 'Custom',
//       period: '',
//       description: 'For large organizations',
//       features: [
//         'Unlimited AI tokens',
//         'All AI models access',
//         'Unlimited documents',
//         '24/7 dedicated support',
//         'Custom AI training',
//         'SLA guarantee',
//         'On-premise deployment',
//         'White-label solution',
//         'Advanced security'
//       ],
//       cta: 'Contact Sales',
//       popular: false
//     }
//   ];

//   const stats = [
//     { value: '10M+', label: 'Documents Processed', icon: '📊' },
//     { value: '99.9%', label: 'Uptime SLA', icon: '⚡' },
//     { value: '< 200ms', label: 'Average Response', icon: '🚀' },
//     { value: '50K+', label: 'Happy Users', icon: '😊' }
//   ];

//   const trustedCompanies = [
//     'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'
//   ];

//   // Video management
//   useEffect(() => {
//     const videoElement = videoRef.current;
//     if (!videoElement) return;

//     const handleVideoEnd = () => {
//       setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
//     };

//     videoElement.addEventListener('ended', handleVideoEnd);
//     return () => videoElement.removeEventListener('ended', handleVideoEnd);
//   }, [videos.length]);

//   useEffect(() => {
//     const videoElement = videoRef.current;
//     if (videoElement) {
//       videoElement.src = videos[currentVideoIndex];
//       videoElement.load();
//       if (isVideoPlaying) {
//         videoElement.play().catch(err => console.log('Video autoplay prevented:', err));
//       }
//     }
//   }, [currentVideoIndex, videos, isVideoPlaying]);

//   // Scroll handler
//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 50);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Feature slider
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentFeature((prev) => (prev + 1) % features.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [features.length]);

//   const handleAuth = (e) => {
//     e.preventDefault();
//     localStorage.setItem('token', 'your-temp-token-123');
//     setShowAuthModal(false);
//     navigate('/chat');
//   };

//   const toggleVideoPlayback = () => {
//     const videoElement = videoRef.current;
//     if (videoElement) {
//       if (isVideoPlaying) {
//         videoElement.pause();
//       } else {
//         videoElement.play();
//       }
//       setIsVideoPlaying(!isVideoPlaying);
//     }
//   };

//   return (
//     <div className="landing-page">
      
//       {/* Navigation */}
//       <motion.nav 
//         className={`nav-bar ${isScrolled ? 'scrolled' : ''}`}
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//       >
//         <div className="nav-container">
//           <motion.div 
//             className="nav-logo"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <div className="logo-icon">
//               <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//                 <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#gradient)" />
//                 <defs>
//                   <linearGradient id="gradient" x1="3" y1="2" x2="13" y2="22" gradientUnits="userSpaceOnUse">
//                     <stop stopColor="#6366f1" />
//                     <stop offset="1" stopColor="#8b5cf6" />
//                   </linearGradient>
//                 </defs>
//               </svg>
//             </div>
//             <span className="logo-text">DocuMind AI</span>
//           </motion.div>
          
//           <div className="nav-links">
//             <a href="#features" className="nav-link">Features</a>
//             <a href="#how-it-works" className="nav-link">How It Works</a>
//             <a href="#pricing" className="nav-link">Pricing</a>
//             <a href="#docs" className="nav-link">Docs</a>
//           </div>

//           <div className="nav-actions">
//             <motion.button 
//               onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
//               className="btn-secondary"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Sign In
//             </motion.button>
//             <motion.button 
//               onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
//               className="btn-primary"
//               whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)" }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Start Free Trial
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <line x1="5" y1="12" x2="19" y2="12"/>
//                 <polyline points="12 5 19 12 12 19"/>
//               </svg>
//             </motion.button>
//           </div>
//         </div>
//       </motion.nav>

//       {/* Hero Section with Video Background */}
//       <section className="hero-section">
//         {/* Video Background */}
//         <div className="video-background">
//           <video
//             ref={videoRef}
//             className="hero-video"
//             autoPlay
//             muted
//             playsInline
//           />
//           <div className="video-overlay" />
          
//           {/* Video Controls */}
//           <div className="video-controls">
//             <motion.button
//               className="video-control-btn"
//               onClick={toggleVideoPlayback}
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//             >
//               {isVideoPlaying ? (
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <rect x="6" y="4" width="4" height="16" rx="1"/>
//                   <rect x="14" y="4" width="4" height="16" rx="1"/>
//                 </svg>
//               ) : (
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <polygon points="5 3 19 12 5 21 5 3"/>
//                 </svg>
//               )}
//             </motion.button>
            
//             <div className="video-indicators">
//               {videos.map((_, index) => (
//                 <motion.button
//                   key={index}
//                   className={`video-indicator ${currentVideoIndex === index ? 'active' : ''}`}
//                   onClick={() => setCurrentVideoIndex(index)}
//                   whileHover={{ scale: 1.2 }}
//                   whileTap={{ scale: 0.9 }}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Hero Content */}
//         <motion.div 
//           className="hero-content"
//           style={{ opacity: heroOpacity, scale: heroScale }}
//         >
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="hero-badge"
//           >
//             <span className="badge-icon">✨</span>
//             <span className="badge-text">AI-Powered Document Intelligence</span>
//           </motion.div>

//           <motion.h1 
//             className="hero-title"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//           >
//             Transform Your Documents Into
//             <span className="gradient-text"> Intelligent Knowledge</span>
//           </motion.h1>

//           <motion.p 
//             className="hero-description"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//           >
//             Upload any document, video, or audio file. Ask questions in natural language. 
//             Get instant AI-powered answers from your entire knowledge base.
//           </motion.p>

//           <motion.div 
//             className="hero-actions"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.8 }}
//           >
//             <motion.button 
//               onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
//               className="btn-hero-primary"
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <span>Get Started Free</span>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                 <line x1="5" y1="12" x2="19" y2="12"/>
//                 <polyline points="12 5 19 12 12 19"/>
//               </svg>
//             </motion.button>
//             <motion.button 
//               className="btn-hero-secondary"
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => {
//                 const videoSection = document.getElementById('how-it-works');
//                 videoSection?.scrollIntoView({ behavior: 'smooth' });
//               }}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10"/>
//                 <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
//               </svg>
//               <span>Watch Demo</span>
//             </motion.button>
//           </motion.div>

//           {/* Stats */}
//           <motion.div 
//             className="hero-stats"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 1 }}
//           >
//             {stats.map((stat, i) => (
//               <motion.div 
//                 key={i} 
//                 className="stat-item"
//                 whileHover={{ scale: 1.05, y: -4 }}
//               >
//                 <div className="stat-icon">{stat.icon}</div>
//                 <div className="stat-value">{stat.value}</div>
//                 <div className="stat-label">{stat.label}</div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </motion.div>

//         {/* Scroll Indicator */}
//         <motion.div
//           className="scroll-indicator"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1.5, duration: 1 }}
//         >
//           <motion.div
//             animate={{ y: [0, 10, 0] }}
//             transition={{ repeat: Infinity, duration: 2 }}
//           >
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <line x1="12" y1="5" x2="12" y2="19"/>
//               <polyline points="19 12 12 19 5 12"/>
//             </svg>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* Trusted By Section */}
//       <section className="trusted-section">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//         >
//           <p className="trusted-title">Trusted by leading companies worldwide</p>
//           <div className="trusted-companies">
//             {trustedCompanies.map((company, i) => (
//               <motion.div
//                 key={i}
//                 className="company-badge"
//                 initial={{ opacity: 0, x: -20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{ scale: 1.1, y: -4 }}
//               >
//                 {company}
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </section>

//       {/* How It Works Section with Featured Video */}
//       <section id="how-it-works" className="how-it-works-section">
//         <div className="section-container">
//           <motion.div
//             className="section-header"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             <h2 className="section-title">
//               See DocuMind AI <span className="gradient-text">In Action</span>
//             </h2>
//             <p className="section-description">
//               Watch how businesses transform their document workflows with AI
//             </p>
//           </motion.div>

//           <div className="featured-video-grid">
//             <motion.div
//               className="video-showcase"
//               initial={{ opacity: 0, x: -30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6 }}
//             >
//               <div className="video-player">
//                 <video
//                   className="showcase-video"
//                   controls
//                   poster="/video-poster.jpg"
//                 >
//                   <source src={videos[0]} type="video/mp4" />
//                 </video>
//               </div>
//             </motion.div>

//             <motion.div
//               className="video-features"
//               initial={{ opacity: 0, x: 30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//             >
//               <h3 className="features-title">Key Capabilities</h3>
//               <div className="feature-list">
//                 {[
//                   { icon: '📤', title: 'Upload Any Format', desc: 'PDF, DOCX, XLSX, MP4, MP3, images' },
//                   { icon: '🤖', title: 'AI Processing', desc: 'Automatic extraction and indexing' },
//                   { icon: '💬', title: 'Natural Language Q&A', desc: 'Ask questions, get instant answers' },
//                   { icon: '🔗', title: 'Cross-Document Search', desc: 'Find info across all your files' }
//                 ].map((item, i) => (
//                   <motion.div
//                     key={i}
//                     className="feature-item"
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     viewport={{ once: true }}
//                     transition={{ delay: i * 0.1 }}
//                     whileHover={{ x: 10 }}
//                   >
//                     <div className="feature-icon">{item.icon}</div>
//                     <div className="feature-content">
//                       <h4>{item.title}</h4>
//                       <p>{item.desc}</p>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="features-section">
//         <div className="section-container">
//           <motion.div
//             className="section-header"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="section-title">
//               Powerful <span className="gradient-text">Features</span>
//             </h2>
//             <p className="section-description">
//               Everything you need to unlock the knowledge in your documents
//             </p>
//           </motion.div>

//           <div className="features-grid">
//             {features.map((feature, i) => (
//               <motion.div
//                 key={i}
//                 className="feature-card"
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{ y: -8, scale: 1.02 }}
//               >
//                 <div className="feature-card-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
//                   <span className="icon-emoji">{feature.icon}</span>
//                 </div>
//                 <h3 className="feature-card-title">{feature.title}</h3>
//                 <p className="feature-card-description">{feature.description}</p>
//                 <div className="feature-card-demo">{feature.demo}</div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Model Selection */}
//       <section className="models-section">
//         <div className="section-container">
//           <motion.div
//             className="section-header"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="section-title">
//               Choose Your <span className="gradient-text">AI Model</span>
//             </h2>
//             <p className="section-description">
//               Select the perfect AI model for your use case
//             </p>
//           </motion.div>

//           <div className="models-grid">
//             {models.map((model, i) => (
//               <motion.div
//                 key={model.id}
//                 className={`model-card ${selectedModel === model.id ? 'selected' : ''} ${model.popular ? 'popular' : ''}`}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 onMouseEnter={() => setSelectedModel(model.id)}
//                 onMouseLeave={() => setSelectedModel(null)}
//                 whileHover={{ y: -8, scale: 1.02 }}
//               >
//                 {model.popular && (
//                   <div className="model-badge">Most Popular</div>
//                 )}
                
//                 <div className="model-icon" style={{ color: model.color }}>
//                   {model.icon}
//                 </div>
                
//                 <h3 className="model-name" style={{ color: model.color }}>
//                   {model.name}
//                 </h3>
                
//                 <div className="model-price">{model.price}</div>
//                 <div className="model-speed">Speed: <span style={{ color: model.color }}>{model.speed}</span></div>

//                 <AnimatePresence>
//                   {selectedModel === model.id && (
//                     <motion.div
//                       className="model-features"
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: 'auto' }}
//                       exit={{ opacity: 0, height: 0 }}
//                     >
//                       <div className="features-label">Key Features:</div>
//                       {model.features.map((feature, j) => (
//                         <div key={j} className="model-feature">
//                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={model.color} strokeWidth="3">
//                             <polyline points="20 6 9 17 4 12"/>
//                           </svg>
//                           {feature}
//                         </div>
//                       ))}
//                       <motion.button
//                         className="model-select-btn"
//                         style={{ background: model.color }}
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                       >
//                         Select {model.name}
//                       </motion.button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" className="pricing-section">
//         <div className="section-container">
//           <motion.div
//             className="section-header"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="section-title">
//               Simple, Transparent <span className="gradient-text">Pricing</span>
//             </h2>
//             <p className="section-description">
//               Choose the plan that's right for you. All plans include 14-day free trial.
//             </p>
//           </motion.div>

//           <div className="pricing-grid">
//             {pricingPlans.map((plan, i) => (
//               <motion.div
//                 key={i}
//                 className={`pricing-card ${plan.popular ? 'popular' : ''}`}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//                 onMouseEnter={() => setHoveredPricing(i)}
//                 onMouseLeave={() => setHoveredPricing(null)}
//                 whileHover={{ y: -12, scale: 1.02 }}
//               >
//                 {plan.popular && (
//                   <div className="pricing-badge">Best Value</div>
//                 )}

//                 <div className="pricing-header">
//                   <h3 className="pricing-name">{plan.name}</h3>
//                   <div className="pricing-price">
//                     {plan.price}
//                     <span className="pricing-period">{plan.period}</span>
//                   </div>
//                   <p className="pricing-description">{plan.description}</p>
//                 </div>

//                 <div className="pricing-features">
//                   {plan.features.map((feature, j) => (
//                     <motion.div
//                       key={j}
//                       className="pricing-feature"
//                       initial={{ opacity: 0, x: -10 }}
//                       whileInView={{ opacity: 1, x: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ delay: j * 0.05 }}
//                     >
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                         <polyline points="20 6 9 17 4 12"/>
//                       </svg>
//                       {feature}
//                     </motion.div>
//                   ))}
//                 </div>

//                 <motion.button
//                   className={`pricing-btn ${plan.popular ? 'primary' : 'secondary'}`}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
//                 >
//                   {plan.cta}
//                 </motion.button>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="cta-section">
//         <motion.div
//           className="cta-container"
//           initial={{ opacity: 0, scale: 0.95 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//         >
//           <h2 className="cta-title">Ready to Transform Your Documents?</h2>
//           <p className="cta-description">
//             Join thousands of teams using AI to unlock knowledge from their documents
//           </p>
//           <motion.button
//             className="btn-cta"
//             whileHover={{ scale: 1.05, y: -2 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
//           >
//             Start Your Free Trial
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//               <line x1="5" y1="12" x2="19" y2="12"/>
//               <polyline points="12 5 19 12 12 19"/>
//             </svg>
//           </motion.button>
//           <p className="cta-note">No credit card required • 14-day free trial • Cancel anytime</p>
//         </motion.div>
//       </section>

//       {/* Auth Modal */}
//       <AnimatePresence>
//         {showAuthModal && (
//           <motion.div
//             className="modal-overlay"
//             onClick={() => setShowAuthModal(false)}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="auth-modal"
//               onClick={(e) => e.stopPropagation()}
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", damping: 25 }}
//             >
//               <button className="modal-close" onClick={() => setShowAuthModal(false)}>
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <line x1="18" y1="6" x2="6" y2="18"/>
//                   <line x1="6" y1="6" x2="18" y2="18"/>
//                 </svg>
//               </button>

//               <div className="modal-header">
//                 <div className="modal-icon">
//                   {authMode === 'signin' ? '👋' : '🚀'}
//                 </div>
//                 <h2 className="modal-title">
//                   {authMode === 'signin' ? 'Welcome Back' : 'Get Started Free'}
//                 </h2>
//                 <p className="modal-subtitle">
//                   {authMode === 'signin' ? 'Sign in to your account' : 'Create your account in seconds'}
//                 </p>
//               </div>

//               <form onSubmit={handleAuth} className="auth-form">
//                 <div className="form-group">
//                   <label>Email Address</label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     placeholder="you@company.com"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Password</label>
//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     placeholder="••••••••"
//                   />
//                 </div>

//                 {authMode === 'signin' && (
//                   <div className="form-extra">
//                     <a href="#forgot" className="forgot-link">Forgot password?</a>
//                   </div>
//                 )}

//                 <motion.button
//                   type="submit"
//                   className="btn-submit"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   {authMode === 'signin' ? 'Sign In' : 'Create Account'}
//                 </motion.button>

//                 <div className="form-footer">
//                   {authMode === 'signin' ? (
//                     <>
//                       Don't have an account?{' '}
//                       <button type="button" onClick={() => setAuthMode('signup')} className="switch-mode">
//                         Sign up
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       Already have an account?{' '}
//                       <button type="button" onClick={() => setAuthMode('signin')} className="switch-mode">
//                         Sign in
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Footer */}
//       <footer className="footer">
//         <div className="footer-container">
//           <div className="footer-grid">
//             <div className="footer-brand">
//               <div className="footer-logo">
//                 <div className="logo-icon">
//                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//                     <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#footerGradient)" />
//                     <defs>
//                       <linearGradient id="footerGradient" x1="3" y1="2" x2="13" y2="22">
//                         <stop stopColor="#6366f1" />
//                         <stop offset="1" stopColor="#8b5cf6" />
//                       </linearGradient>
//                     </defs>
//                   </svg>
//                 </div>
//                 <span>DocuMind AI</span>
//               </div>
//               <p className="footer-description">
//                 Transform your documents into intelligent knowledge with AI-powered processing and search.
//               </p>
//             </div>

//             <div className="footer-links">
//               <h4>Product</h4>
//               <a href="#features">Features</a>
//               <a href="#pricing">Pricing</a>
//               <a href="#security">Security</a>
//               <a href="#integrations">Integrations</a>
//             </div>

//             <div className="footer-links">
//               <h4>Company</h4>
//               <a href="#about">About</a>
//               <a href="#blog">Blog</a>
//               <a href="#careers">Careers</a>
//               <a href="#contact">Contact</a>
//             </div>

//             <div className="footer-links">
//               <h4>Resources</h4>
//               <a href="#docs">Documentation</a>
//               <a href="#api">API Reference</a>
//               <a href="#support">Support</a>
//               <a href="#status">Status</a>
//             </div>
//           </div>

//           <div className="footer-bottom">
//             <div className="footer-copyright">
//               © 2024 DocuMind AI. All rights reserved.
//             </div>
//             <div className="footer-social">
//               <a href="#twitter" className="social-link">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
//                 </svg>
//               </a>
//               <a href="#linkedin" className="social-link">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
//                 </svg>
//               </a>
//               <a href="#github" className="social-link">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
//                 </svg>
//               </a>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }






// import { useNavigate } from 'react-router-dom';
// import React, { useState, useEffect, useRef } from 'react';
// import '../Styles/AdminDashboard.css';

// const DEMO_VIDEOS = [
//   { id: 1, title: 'Platform Overview', url: '/advertiseA.mp4' },
//   { id: 2, title: 'AI Features Demo', url: '/advertiseb.mp4' },
//   { id: 3, title: 'Enterprise Workflow', url: '/advertisec.mp4' }
// ];

// export default function LandingPage() {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState('signin');
//   const [currentFeature, setCurrentFeature] = useState(0);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [hoveredPricing, setHoveredPricing] = useState(null);
//   const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
//   const [isVideoPlaying, setIsVideoPlaying] = useState(false);
//   const [showDemoModal, setShowDemoModal] = useState(false);
//   const videoRef = useRef(null);
//   const navigate = useNavigate();

//   // Professional Video Rotation Logic
//   useEffect(() => {
//     const videoElement = videoRef.current;
//     if (!videoElement) return;

//     const handleVideoEnd = () => {
//       setCurrentVideoIndex((prev) => (prev + 1) % DEMO_VIDEOS.length);
//     };

//     videoElement.addEventListener('ended', handleVideoEnd);
//     return () => videoElement.removeEventListener('ended', handleVideoEnd);
//   }, []);

//   // Video Source Management
//   useEffect(() => {
//     const videoElement = videoRef.current;
//     if (videoElement && showDemoModal) {
//       videoElement.src = DEMO_VIDEOS[currentVideoIndex].url;
//       videoElement.load();
//       if (isVideoPlaying) {
//         videoElement.play().catch(err => console.warn('Autoplay blocked', err));
//       }
//     }
//   }, [currentVideoIndex, isVideoPlaying, showDemoModal]);

//   // ESC key to close modal
//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === 'Escape' && showDemoModal) {
//         setShowDemoModal(false);
//         setIsVideoPlaying(false);
//       }
//     };
//     window.addEventListener('keydown', handleEsc);
//     return () => window.removeEventListener('keydown', handleEsc);
//   }, [showDemoModal]);

//   const models = [
//     { 
//       id: 'gpt-3', 
//       name: 'GPT-3.5 Turbo',
//       price: '$0.002/1K tokens',
//       speed: 'Fast',
//       features: ['Basic reasoning', 'Quick responses', 'Cost-effective', 'Standard accuracy'],
//       color: '#10b981'
//     },
//     { 
//       id: 'gpt-4', 
//       name: 'GPT-4 Turbo',
//       price: '$0.01/1K tokens',
//       speed: 'Moderate',
//       features: ['Advanced reasoning', 'Higher accuracy', 'Complex tasks', '128K context'],
//       color: '#3b82f6',
//       popular: true
//     },
//     { 
//       id: 'claude', 
//       name: 'Claude Sonnet 4',
//       price: '$0.015/1K tokens',
//       speed: 'Fast',
//       features: ['Superior reasoning', 'Longest context', 'Best for research', '200K tokens'],
//       color: '#8b5cf6'
//     },
//     { 
//       id: 'gemini', 
//       name: 'Gemini Pro',
//       price: '$0.00125/1K tokens',
//       speed: 'Very Fast',
//       features: ['Multimodal AI', 'Image & video', 'Lowest cost', 'Google integration'],
//       color: '#f59e0b'
//     }
//   ];

//   const features = [
//     {
//       icon: '🎯',
//       title: 'Multi-Source RAG',
//       description: 'Upload PDFs, videos, audio, images, YouTube links - we handle it all',
//       demo: 'Process 100+ file types instantly'
//     },
//     {
//       icon: '🚀',
//       title: 'Lightning Fast Search',
//       description: 'Get answers in milliseconds with advanced vector search',
//       demo: 'Query 1M+ documents in <200ms'
//     },
//     {
//       icon: '🧠',
//       title: 'Smart Model Selection',
//       description: 'Choose GPT-4, Claude, or Gemini based on your needs',
//       demo: 'Auto-route to best model'
//     },
//     {
//       icon: '💼',
//       title: 'Enterprise Security',
//       description: 'SOC 2, GDPR compliant with end-to-end encryption',
//       demo: 'Bank-level encryption'
//     },
//     {
//       icon: '📊',
//       title: 'Analytics Dashboard',
//       description: 'Track usage, costs, and performance in real-time',
//       demo: 'Live insights & reporting'
//     },
//     {
//       icon: '🔗',
//       title: 'Seamless Integration',
//       description: 'REST API, webhooks, and SDKs for easy integration',
//       demo: 'Deploy in 5 minutes'
//     }
//   ];

//   const pricingPlans = [
//     {
//       name: 'Starter',
//       price: '$29',
//       period: '/month',
//       description: 'Perfect for individuals',
//       features: [
//         '10K tokens/month',
//         'All AI models',
//         '100 documents',
//         'Email support',
//         'Basic analytics'
//       ],
//       cta: 'Start Free Trial',
//       popular: false
//     },
//     {
//       name: 'Professional',
//       price: '$99',
//       period: '/month',
//       description: 'For growing teams',
//       features: [
//         '100K tokens/month',
//         'All AI models',
//         'Unlimited documents',
//         'Priority support',
//         'Advanced analytics',
//         'API access',
//         'Custom integrations'
//       ],
//       cta: 'Start Free Trial',
//       popular: true
//     },
//     {
//       name: 'Enterprise',
//       price: 'Custom',
//       period: '',
//       description: 'For large organizations',
//       features: [
//         'Unlimited tokens',
//         'All AI models',
//         'Unlimited documents',
//         '24/7 dedicated support',
//         'Custom AI training',
//         'SLA guarantee',
//         'On-premise deployment',
//         'White-label solution'
//       ],
//       cta: 'Contact Sales',
//       popular: false
//     }
//   ];

//   const stats = [
//     { value: '10M+', label: 'Documents Processed' },
//     { value: '99.9%', label: 'Uptime SLA' },
//     { value: '< 200ms', label: 'Average Response' },
//     { value: '50K+', label: 'Happy Users' }
//   ];

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 50);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentFeature((prev) => (prev + 1) % features.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleAuth = (e) => {
//     e.preventDefault();
//     localStorage.setItem('token', 'your-temp-token-123');
//     setShowAuthModal(false);
//     navigate('/chat');
//   };

//   return (
//     <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: '#fff', overflow: 'hidden' }}>
      
//       {/* Navigation - Same as before */}
//       <nav style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         zIndex: 1000,
//         background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
//         backdropFilter: isScrolled ? 'blur(10px)' : 'none',
//         borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
//         transition: 'all 0.3s ease',
//         padding: '1.25rem 2rem'
//       }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//             <div style={{ 
//               width: '45px', 
//               height: '45px', 
//               background: 'linear-gradient(135deg, #667eea, #764ba2)',
//               borderRadius: '12px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '1.5rem',
//               fontWeight: 'bold',
//               boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
//             }}>
//               🚀
//             </div>
//             <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
//               RAG.AI
//             </span>
//           </div>
          
//           <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
//             <a href="#features" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
//             <a href="#pricing" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Pricing</a>
//             <a href="#docs" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Docs</a>
//             <button onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }} style={{ background: 'none', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
//               Sign In
//             </button>
//             <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
//               Start Free →
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section style={{ 
//         minHeight: '100vh', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center',
//         background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.15), transparent 50%), radial-gradient(circle at 0% 100%, rgba(118, 75, 162, 0.15), transparent 50%)',
//         position: 'relative',
//         padding: '8rem 2rem 4rem'
//       }}>
//         <div style={{ maxWidth: '1400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          
//           {/* Animated Badge */}
//           <div style={{ 
//             display: 'inline-flex', 
//             alignItems: 'center', 
//             gap: '0.5rem',
//             background: 'rgba(102, 126, 234, 0.1)',
//             border: '1px solid rgba(102, 126, 234, 0.3)',
//             padding: '0.5rem 1.25rem',
//             borderRadius: '50px',
//             marginBottom: '2rem',
//             animation: 'fadeInDown 0.8s ease'
//           }}>
//             <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#667eea' }}>✨ NEW</span>
//             <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>Claude Sonnet 4 Now Available</span>
//           </div>

//           <h1 style={{ 
//             fontSize: 'clamp(2.5rem, 6vw, 5rem)', 
//             fontWeight: 900, 
//             lineHeight: 1.1,
//             marginBottom: '1.5rem',
//             background: 'linear-gradient(135deg, #fff 0%, #d1d5db 100%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             animation: 'fadeInUp 1s ease'
//           }}>
//             Your Enterprise<br/>
//             <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
//               Knowledge Assistant
//             </span>
//           </h1>

//           <p style={{ 
//             fontSize: '1.35rem', 
//             color: '#9ca3af', 
//             maxWidth: '700px', 
//             margin: '0 auto 3rem',
//             lineHeight: 1.6,
//             animation: 'fadeInUp 1.2s ease'
//           }}>
//             Process any document, video, or audio file. Get instant AI-powered answers from your data with GPT-4, Claude, or Gemini.
//           </p>

//           {/* CTA Buttons */}
//           <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem', animation: 'fadeInUp 1.4s ease' }}>
//             <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{
//               background: 'linear-gradient(135deg, #667eea, #764ba2)',
//               border: 'none',
//               padding: '1rem 2.5rem',
//               borderRadius: '12px',
//               color: '#fff',
//               fontSize: '1.1rem',
//               fontWeight: 700,
//               cursor: 'pointer',
//               boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
//               transition: 'transform 0.2s',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem'
//             }}>
//               Start Free Trial <span style={{ fontSize: '1.2rem' }}>→</span>
//             </button>
            
//             {/* Professional Watch Demo Button */}
//             <button 
//               onClick={() => {
//                 setShowDemoModal(true);
//                 setIsVideoPlaying(true);
//               }}
//               style={{
//                 background: 'rgba(255, 255, 255, 0.08)',
//                 backdropFilter: 'blur(10px)',
//                 border: '1px solid rgba(255, 255, 255, 0.2)',
//                 padding: '1rem 2.5rem',
//                 borderRadius: '12px',
//                 color: '#fff',
//                 fontSize: '1.1rem',
//                 fontWeight: 600,
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.8rem'
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
//                 e.currentTarget.style.transform = 'translateY(-2px)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
//                 e.currentTarget.style.transform = 'translateY(0)';
//               }}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                 <circle cx="12" cy="12" r="10" opacity="0.2"/>
//                 <polygon points="10 8 16 12 10 16 10 8" />
//               </svg>
//               Watch Demo
//             </button>
//           </div>

//           {/* Stats */}
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//             gap: '2rem',
//             maxWidth: '1000px',
//             margin: '0 auto',
//             animation: 'fadeInUp 1.6s ease'
//           }}>
//             {stats.map((stat, i) => (
//               <div key={i} style={{ textAlign: 'center' }}>
//                 <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
//                   {stat.value}
//                 </div>
//                 <div style={{ color: '#9ca3af', fontSize: '0.95rem' }}>{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Floating Elements */}
//         <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15), transparent)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite' }} />
//         <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15), transparent)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }} />
//       </section>

//       {/* Rest of the sections remain the same... */}
//       {/* I'll skip these for brevity as they're unchanged */}

//       {/* Professional Video Demo Modal */}
//       {showDemoModal && (
//         <div 
//           onClick={() => { setShowDemoModal(false); setIsVideoPlaying(false); }}
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100vw',
//             height: '100vh',
//             backgroundColor: 'rgba(0, 0, 0, 0.95)',
//             backdropFilter: 'blur(12px)',
//             zIndex: 9999,
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             padding: '2rem',
//             animation: 'fadeIn 0.3s ease'
//           }}
//         >
//           <div 
//             onClick={(e) => e.stopPropagation()}
//             style={{ 
//               width: '100%', 
//               maxWidth: '1100px',
//               position: 'relative',
//               animation: 'slideUp 0.4s ease'
//             }}
//           >
            
//             {/* Modal Header */}
//             <div style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '1.5rem',
//               padding: '0 0.5rem'
//             }}>
//               <div>
//                 <h3 style={{
//                   fontSize: '1.5rem',
//                   fontWeight: 700,
//                   color: '#fff',
//                   margin: 0,
//                   marginBottom: '0.25rem'
//                 }}>
//                   {DEMO_VIDEOS[currentVideoIndex].title}
//                 </h3>
//                 <p style={{
//                   fontSize: '0.9rem',
//                   color: '#9ca3af',
//                   margin: 0
//                 }}>
//                   Video {currentVideoIndex + 1} of {DEMO_VIDEOS.length}
//                 </p>
//               </div>
              
//               {/* Close Button */}
//               <button 
//                 onClick={() => { setShowDemoModal(false); setIsVideoPlaying(false); }}
//                 style={{
//                   background: 'rgba(255, 255, 255, 0.1)',
//                   border: '1px solid rgba(255, 255, 255, 0.2)',
//                   borderRadius: '50%',
//                   width: '48px',
//                   height: '48px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   color: '#fff',
//                   fontSize: '1.5rem',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
//                   e.currentTarget.style.transform = 'scale(1.1)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
//                   e.currentTarget.style.transform = 'scale(1)';
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Video Container with 16:9 Aspect Ratio */}
//             <div style={{ 
//               position: 'relative',
//               width: '100%',
//               paddingBottom: '56.25%', // 16:9 aspect ratio
//               backgroundColor: '#000',
//               borderRadius: '16px',
//               overflow: 'hidden',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 80px rgba(102, 126, 234, 0.3)',
//               border: '1px solid rgba(255, 255, 255, 0.1)'
//             }}>
//               <video 
//                 ref={videoRef}
//                 controls
//                 autoPlay
//                 style={{ 
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   width: '100%',
//                   height: '100%',
//                   objectFit: 'contain'
//                 }}
//               />
//             </div>

//             {/* Video Playlist Navigation */}
//             <div style={{
//               marginTop: '2rem',
//               background: 'rgba(255, 255, 255, 0.05)',
//               backdropFilter: 'blur(10px)',
//               borderRadius: '16px',
//               padding: '1.5rem',
//               border: '1px solid rgba(255, 255, 255, 0.1)'
//             }}>
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '1rem'
//               }}>
//                 <h4 style={{
//                   fontSize: '0.9rem',
//                   fontWeight: 600,
//                   color: '#d1d5db',
//                   margin: 0,
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.05em'
//                 }}>
//                   Playlist
//                 </h4>
//                 <div style={{
//                   fontSize: '0.85rem',
//                   color: '#9ca3af'
//                 }}>
//                   {currentVideoIndex + 1}/{DEMO_VIDEOS.length}
//                 </div>
//               </div>
              
//               <div style={{ 
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//                 gap: '1rem'
//               }}>
//                 {DEMO_VIDEOS.map((vid, idx) => (
//                   <button
//                     key={vid.id}
//                     onClick={() => setCurrentVideoIndex(idx)}
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '0.75rem',
//                       padding: '1rem',
//                       background: currentVideoIndex === idx 
//                         ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))'
//                         : 'rgba(255, 255, 255, 0.03)',
//                       border: currentVideoIndex === idx 
//                         ? '2px solid #667eea' 
//                         : '1px solid rgba(255, 255, 255, 0.1)',
//                       borderRadius: '12px',
//                       cursor: 'pointer',
//                       transition: 'all 0.2s',
//                       textAlign: 'left'
//                     }}
//                     onMouseEnter={(e) => {
//                       if (currentVideoIndex !== idx) {
//                         e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
//                         e.currentTarget.style.transform = 'translateY(-2px)';
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (currentVideoIndex !== idx) {
//                         e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
//                         e.currentTarget.style.transform = 'translateY(0)';
//                       }
//                     }}
//                   >
//                     <div style={{
//                       width: '40px',
//                       height: '40px',
//                       borderRadius: '8px',
//                       background: currentVideoIndex === idx 
//                         ? 'linear-gradient(135deg, #667eea, #764ba2)'
//                         : 'rgba(255, 255, 255, 0.1)',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontSize: '1.2rem',
//                       flexShrink: 0
//                     }}>
//                       {currentVideoIndex === idx ? '▶' : '🎥'}
//                     </div>
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <div style={{
//                         fontSize: '0.9rem',
//                         fontWeight: 600,
//                         color: currentVideoIndex === idx ? '#fff' : '#d1d5db',
//                         marginBottom: '0.25rem',
//                         whiteSpace: 'nowrap',
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis'
//                       }}>
//                         {vid.title}
//                       </div>
//                       <div style={{
//                         fontSize: '0.75rem',
//                         color: '#9ca3af'
//                       }}>
//                         Video {idx + 1}
//                       </div>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Keyboard Shortcut Hint */}
//             <div style={{
//               marginTop: '1rem',
//               textAlign: 'center',
//               fontSize: '0.8rem',
//               color: '#6b7280'
//             }}>
//               Press <kbd style={{
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 padding: '0.2rem 0.5rem',
//                 borderRadius: '4px',
//                 fontFamily: 'monospace',
//                 fontSize: '0.75rem'
//               }}>ESC</kbd> to close
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }

//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(30px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes fadeInDown {
//           from { opacity: 0; transform: translateY(-30px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(50px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-20px); }
//         }
//       `}</style>
//     </div>
//   );
// }

import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import '../Styles/AdminDashboard.css';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [hoveredPricing, setHoveredPricing] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to chat if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  // Video Demo State
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const videoRef = useRef(null);
  
  const DEMO_VIDEOS = [
    { id: 1, title: 'Platform Overview', url: '/advertiseA.mp4' },
    { id: 2, title: 'AI Features', url: '/advertiseb.mp4' },
    { id: 3, title: 'Enterprise Workflow', url: '/advertisec.mp4' }
  ];

  // Professional Video Rotation Logic
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleVideoEnd = () => {
      setCurrentVideoIndex((prev) => (prev + 1) % DEMO_VIDEOS.length);
    };

    videoElement.addEventListener('ended', handleVideoEnd);
    return () => videoElement.removeEventListener('ended', handleVideoEnd);
  }, []);

  // Source Management
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && showDemoModal) {
      videoElement.src = DEMO_VIDEOS[currentVideoIndex].url;
      videoElement.load();
      if (isVideoPlaying) {
        videoElement.play().catch(err => console.warn('Autoplay blocked', err));
      }
    }
  }, [currentVideoIndex, isVideoPlaying, showDemoModal]);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showDemoModal) {
        setShowDemoModal(false);
        setIsVideoPlaying(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showDemoModal]);

  // (Rest of your original arrays: models, features, pricingPlans, stats remain the same)
  const models = [
    { 
      id: 'gpt-3', 
      name: 'GPT-3.5 Turbo',
      price: '$0.002/1K tokens',
      speed: 'Fast',
      features: ['Basic reasoning', 'Quick responses', 'Cost-effective', 'Standard accuracy'],
      color: '#10b981'
    },
    { 
      id: 'gpt-4', 
      name: 'GPT-4 Turbo',
      price: '$0.01/1K tokens',
      speed: 'Moderate',
      features: ['Advanced reasoning', 'Higher accuracy', 'Complex tasks', '128K context'],
      color: '#3b82f6',
      popular: true
    },
    { 
      id: 'claude', 
      name: 'Claude Sonnet 4',
      price: '$0.015/1K tokens',
      speed: 'Fast',
      features: ['Superior reasoning', 'Longest context', 'Best for research', '200K tokens'],
      color: '#8b5cf6'
    },
    { 
      id: 'gemini', 
      name: 'Gemini Pro',
      price: '$0.00125/1K tokens',
      speed: 'Very Fast',
      features: ['Multimodal AI', 'Image & video', 'Lowest cost', 'Google integration'],
      color: '#f59e0b'
    }
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Multi-Source RAG',
      description: 'Upload PDFs, videos, audio, images, YouTube links - we handle it all',
      demo: 'Process 100+ file types instantly'
    },
    {
      icon: '🚀',
      title: 'Lightning Fast Search',
      description: 'Get answers in milliseconds with advanced vector search',
      demo: 'Query 1M+ documents in <200ms'
    },
    {
      icon: '🧠',
      title: 'Smart Model Selection',
      description: 'Choose GPT-4, Claude, or Gemini based on your needs',
      demo: 'Auto-route to best model'
    },
    {
      icon: '💼',
      title: 'Enterprise Security',
      description: 'SOC 2, GDPR compliant with end-to-end encryption',
      demo: 'Bank-level encryption'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track usage, costs, and performance in real-time',
      demo: 'Live insights & reporting'
    },
    {
      icon: '🔗',
      title: 'Seamless Integration',
      description: 'REST API, webhooks, and SDKs for easy integration',
      demo: 'Deploy in 5 minutes'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individuals',
      features: [
        '10K tokens/month',
        'All AI models',
        '100 documents',
        'Email support',
        'Basic analytics'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'For growing teams',
      features: [
        '100K tokens/month',
        'All AI models',
        'Unlimited documents',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom integrations'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited tokens',
        'All AI models',
        'Unlimited documents',
        '24/7 dedicated support',
        'Custom AI training',
        'SLA guarantee',
        'On-premise deployment',
        'White-label solution'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const stats = [
    { value: '10M+', label: 'Documents Processed' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 200ms', label: 'Average Response' },
    { value: '50K+', label: 'Happy Users' }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // AuthContext will handle the redirect
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: '#fff', overflow: 'hidden' }}>
      
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s ease',
        padding: '1.25rem 2rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '45px', 
              height: '45px', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
            }}>
              🚀
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RAG.AI
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
            <a href="#pricing" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Pricing</a>
            <a href="#docs" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Docs</a>
            <button 
              onClick={() => { 
                setAuthMode('signin'); 
                setShowAuthModal(true); 
              }} 
              style={{ background: 'none', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { 
                setAuthMode('signup'); 
                setShowAuthModal(true); 
              }} 
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}
            >
              Start Free →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.15), transparent 50%), radial-gradient(circle at 0% 100%, rgba(118, 75, 162, 0.15), transparent 50%)',
        position: 'relative',
        padding: '8rem 2rem 4rem'
      }}>
        <div style={{ maxWidth: '1400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* Animated Badge */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            marginBottom: '2rem',
            animation: 'fadeInDown 0.8s ease'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#667eea' }}>✨ NEW</span>
            <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>Claude Sonnet 4 Now Available</span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 5rem)', 
            fontWeight: 900, 
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #fff 0%, #d1d5db 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeInUp 1s ease'
          }}>
            Your Enterprise<br/>
            <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Knowledge Assistant
            </span>
          </h1>

          <p style={{ 
            fontSize: '1.35rem', 
            color: '#9ca3af', 
            maxWidth: '700px', 
            margin: '0 auto 3rem',
            lineHeight: 1.6,
            animation: 'fadeInUp 1.2s ease'
          }}>
            Process any document, video, or audio file. Get instant AI-powered answers from your data with GPT-4, Claude, or Gemini.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem', animation: 'fadeInUp 1.4s ease' }}>
            <button 
              onClick={() => { 
                setAuthMode('signup'); 
                setShowAuthModal(true); 
              }} 
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Start Free Trial <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
            <button 
              onClick={() => {
                setShowDemoModal(true);
                setIsVideoPlaying(true);
                setCurrentVideoIndex(0);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '1rem 2.5rem',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.2"/>
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto',
            animation: 'fadeInUp 1.6s ease'
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                  {stat.value}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.95rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15), transparent)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15), transparent)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }} />
      </section>

      {/* Rest of sections (Model Selection, Features, Pricing) remain the same... */}
      {/* I'm keeping them brief here for space, but they're identical to your original */}

      {/* Auth Modal - NEW COMPONENT */}
      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* Demo Video Modal remains the same */}
      {/* Footer remains the same */}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

// import { useNavigate } from 'react-router-dom';
// import React, { useState, useEffect, useRef } from 'react';
// import '../Styles/AdminDashboard.css';

// export default function LandingPage() {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState('signin');
//   const [currentFeature, setCurrentFeature] = useState(0);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [hoveredPricing, setHoveredPricing] = useState(null);
//   const navigate = useNavigate();

//   // Inside your Component:
// const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
// const [isVideoPlaying, setIsVideoPlaying] = useState(false);
// const [showDemoModal, setShowDemoModal] = useState(false); // Modal control
// const videoRef = useRef(null);
// const DEMO_VIDEOS = [
//   { id: 1, title: 'Platform Overview', url: '/advertiseA.mp4' },
//   { id: 2, title: 'AI Features', url: '/advertiseb.mp4' },
//   { id: 3, title: 'Enterprise Workflow', url: '/advertisec.mp4' }
// ];

// // Professional Video Rotation Logic
// useEffect(() => {
//   const videoElement = videoRef.current;
//   if (!videoElement) return;

//   const handleVideoEnd = () => {
//     // Smoothly cycle to next video
//     setCurrentVideoIndex((prev) => (prev + 1) % DEMO_VIDEOS.length);
//   };

//   videoElement.addEventListener('ended', handleVideoEnd);
//   return () => videoElement.removeEventListener('ended', handleVideoEnd);
// }, []); // Dependency fixed: DEMO_VIDEOS is outside, length won't change

// // Source Management
// useEffect(() => {
//   const videoElement = videoRef.current;
//   if (videoElement && showDemoModal) {
//     videoElement.src = DEMO_VIDEOS[currentVideoIndex].url;
//     videoElement.load();
//     if (isVideoPlaying) {
//       videoElement.play().catch(err => console.warn('Autoplay blocked', err));
//     }
//   }
// }, [currentVideoIndex, isVideoPlaying, showDemoModal]);
// // ESC key to close modal
// useEffect(() => {
//   const handleEsc = (e) => {
//     if (e.key === 'Escape' && showDemoModal) {
//       setShowDemoModal(false);
//       setIsVideoPlaying(false);
//     }
//   };
//   window.addEventListener('keydown', handleEsc);
//   return () => window.removeEventListener('keydown', handleEsc);
// }, [showDemoModal]);
//   const models = [
//     { 
//       id: 'gpt-3', 
//       name: 'GPT-3.5 Turbo',
//       price: '$0.002/1K tokens',
//       speed: 'Fast',
//       features: ['Basic reasoning', 'Quick responses', 'Cost-effective', 'Standard accuracy'],
//       color: '#10b981'
//     },
//     { 
//       id: 'gpt-4', 
//       name: 'GPT-4 Turbo',
//       price: '$0.01/1K tokens',
//       speed: 'Moderate',
//       features: ['Advanced reasoning', 'Higher accuracy', 'Complex tasks', '128K context'],
//       color: '#3b82f6',
//       popular: true
//     },
//     { 
//       id: 'claude', 
//       name: 'Claude Sonnet 4',
//       price: '$0.015/1K tokens',
//       speed: 'Fast',
//       features: ['Superior reasoning', 'Longest context', 'Best for research', '200K tokens'],
//       color: '#8b5cf6'
//     },
//     { 
//       id: 'gemini', 
//       name: 'Gemini Pro',
//       price: '$0.00125/1K tokens',
//       speed: 'Very Fast',
//       features: ['Multimodal AI', 'Image & video', 'Lowest cost', 'Google integration'],
//       color: '#f59e0b'
//     }
//   ];

//   const features = [
//     {
//       icon: '🎯',
//       title: 'Multi-Source RAG',
//       description: 'Upload PDFs, videos, audio, images, YouTube links - we handle it all',
//       demo: 'Process 100+ file types instantly'
//     },
//     {
//       icon: '🚀',
//       title: 'Lightning Fast Search',
//       description: 'Get answers in milliseconds with advanced vector search',
//       demo: 'Query 1M+ documents in <200ms'
//     },
//     {
//       icon: '🧠',
//       title: 'Smart Model Selection',
//       description: 'Choose GPT-4, Claude, or Gemini based on your needs',
//       demo: 'Auto-route to best model'
//     },
//     {
//       icon: '💼',
//       title: 'Enterprise Security',
//       description: 'SOC 2, GDPR compliant with end-to-end encryption',
//       demo: 'Bank-level encryption'
//     },
//     {
//       icon: '📊',
//       title: 'Analytics Dashboard',
//       description: 'Track usage, costs, and performance in real-time',
//       demo: 'Live insights & reporting'
//     },
//     {
//       icon: '🔗',
//       title: 'Seamless Integration',
//       description: 'REST API, webhooks, and SDKs for easy integration',
//       demo: 'Deploy in 5 minutes'
//     }
//   ];

//   const pricingPlans = [
//     {
//       name: 'Starter',
//       price: '$29',
//       period: '/month',
//       description: 'Perfect for individuals',
//       features: [
//         '10K tokens/month',
//         'All AI models',
//         '100 documents',
//         'Email support',
//         'Basic analytics'
//       ],
//       cta: 'Start Free Trial',
//       popular: false
//     },
//     {
//       name: 'Professional',
//       price: '$99',
//       period: '/month',
//       description: 'For growing teams',
//       features: [
//         '100K tokens/month',
//         'All AI models',
//         'Unlimited documents',
//         'Priority support',
//         'Advanced analytics',
//         'API access',
//         'Custom integrations'
//       ],
//       cta: 'Start Free Trial',
//       popular: true
//     },
//     {
//       name: 'Enterprise',
//       price: 'Custom',
//       period: '',
//       description: 'For large organizations',
//       features: [
//         'Unlimited tokens',
//         'All AI models',
//         'Unlimited documents',
//         '24/7 dedicated support',
//         'Custom AI training',
//         'SLA guarantee',
//         'On-premise deployment',
//         'White-label solution'
//       ],
//       cta: 'Contact Sales',
//       popular: false
//     }
//   ];

//   const stats = [
//     { value: '10M+', label: 'Documents Processed' },
//     { value: '99.9%', label: 'Uptime SLA' },
//     { value: '< 200ms', label: 'Average Response' },
//     { value: '50K+', label: 'Happy Users' }
//   ];

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 50);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentFeature((prev) => (prev + 1) % features.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleAuth = (e) => {
//     e.preventDefault();
//     console.log('Auth:', { email, password, mode: authMode });
//      localStorage.setItem('token', 'your-temp-token-123');
//     setShowAuthModal(false);
//     navigate('/chat');
//   };

//   return (
//     <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: '#fff', overflow: 'hidden' }}>
      
//       {/* Navigation */}
//       <nav style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         zIndex: 1000,
//         background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
//         backdropFilter: isScrolled ? 'blur(10px)' : 'none',
//         borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
//         transition: 'all 0.3s ease',
//         padding: '1.25rem 2rem'
//       }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//             <div style={{ 
//               width: '45px', 
//               height: '45px', 
//               background: 'linear-gradient(135deg, #667eea, #764ba2)',
//               borderRadius: '12px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '1.5rem',
//               fontWeight: 'bold',
//               boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
//             }}>
//               🚀
//             </div>
//             <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
//               RAG.AI
//             </span>
//           </div>
          
//           <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
//             <a href="#features" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
//             <a href="#pricing" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Pricing</a>
//             <a href="#docs" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>Docs</a>
//             <button onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }} style={{ background: 'none', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
//               Sign In
//             </button>
//             <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
//               Start Free →
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section style={{ 
//         minHeight: '100vh', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center',
//         background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.15), transparent 50%), radial-gradient(circle at 0% 100%, rgba(118, 75, 162, 0.15), transparent 50%)',
//         position: 'relative',
//         padding: '8rem 2rem 4rem'
//       }}>
//         <div style={{ maxWidth: '1400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          
//           {/* Animated Badge */}
//           <div style={{ 
//             display: 'inline-flex', 
//             alignItems: 'center', 
//             gap: '0.5rem',
//             background: 'rgba(102, 126, 234, 0.1)',
//             border: '1px solid rgba(102, 126, 234, 0.3)',
//             padding: '0.5rem 1.25rem',
//             borderRadius: '50px',
//             marginBottom: '2rem',
//             animation: 'fadeInDown 0.8s ease'
//           }}>
//             <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#667eea' }}>✨ NEW</span>
//             <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>Claude Sonnet 4 Now Available</span>
//           </div>

//           <h1 style={{ 
//             fontSize: 'clamp(2.5rem, 6vw, 5rem)', 
//             fontWeight: 900, 
//             lineHeight: 1.1,
//             marginBottom: '1.5rem',
//             background: 'linear-gradient(135deg, #fff 0%, #d1d5db 100%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             animation: 'fadeInUp 1s ease'
//           }}>
//             Your Enterprise<br/>
//             <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
//               Knowledge Assistant
//             </span>
//           </h1>

//           <p style={{ 
//             fontSize: '1.35rem', 
//             color: '#9ca3af', 
//             maxWidth: '700px', 
//             margin: '0 auto 3rem',
//             lineHeight: 1.6,
//             animation: 'fadeInUp 1.2s ease'
//           }}>
//             Process any document, video, or audio file. Get instant AI-powered answers from your data with GPT-4, Claude, or Gemini.
//           </p>

//           {/* CTA Buttons */}
//           <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem', animation: 'fadeInUp 1.4s ease' }}>
//             <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{
//               background: 'linear-gradient(135deg, #667eea, #764ba2)',
//               border: 'none',
//               padding: '1rem 2.5rem',
//               borderRadius: '12px',
//               color: '#fff',
//               fontSize: '1.1rem',
//               fontWeight: 700,
//               cursor: 'pointer',
//               boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
//               transition: 'transform 0.2s',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem'
//             }}>
//               Start Free Trial <span style={{ fontSize: '1.2rem' }}>→</span>
//             </button>
//          <button 
//   onClick={() => {
//     setShowDemoModal(true);
//     setIsVideoPlaying(true);
//     setCurrentVideoIndex(0); // Start from first video
//   }}
//   style={{
//     background: 'rgba(255, 255, 255, 0.08)',
//     backdropFilter: 'blur(10px)',
//     border: '1px solid rgba(255, 255, 255, 0.2)',
//     padding: '1rem 2.5rem',
//     borderRadius: '12px',
//     color: '#fff',
//     fontSize: '1.1rem',
//     fontWeight: 600,
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.8rem'
//   }}
//   onMouseEnter={(e) => {
//     e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
//     e.currentTarget.style.transform = 'translateY(-2px)';
//   }}
//   onMouseLeave={(e) => {
//     e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
//     e.currentTarget.style.transform = 'translateY(0)';
//   }}
// >
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//     <circle cx="12" cy="12" r="10" opacity="0.2"/>
//     <polygon points="10 8 16 12 10 16 10 8" />
//   </svg>
//   Watch Demo
// </button>
//           </div>

//           {/* Stats */}
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//             gap: '2rem',
//             maxWidth: '1000px',
//             margin: '0 auto',
//             animation: 'fadeInUp 1.6s ease'
//           }}>
//             {stats.map((stat, i) => (
//               <div key={i} style={{ textAlign: 'center' }}>
//                 <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
//                   {stat.value}
//                 </div>
//                 <div style={{ color: '#9ca3af', fontSize: '0.95rem' }}>{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Floating Elements */}
//         <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15), transparent)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite' }} />
//         <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15), transparent)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }} />
//       </section>

//       {/* Model Selection Section */}
//       <section style={{ padding: '6rem 2rem', background: 'rgba(0, 0, 0, 0.3)', position: 'relative' }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//           <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
//             <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
//               Choose Your <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Model</span>
//             </h2>
//             <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>Hover to see pricing and features for each model</p>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
//             {models.map((model) => (
//               <div
//                 key={model.id}
//                 onMouseEnter={() => setSelectedModel(model.id)}
//                 onMouseLeave={() => setSelectedModel(null)}
//                 style={{
//                   background: selectedModel === model.id ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
//                   border: `2px solid ${selectedModel === model.id ? model.color : 'rgba(255, 255, 255, 0.1)'}`,
//                   borderRadius: '16px',
//                   padding: '2rem',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   transform: selectedModel === model.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
//                   boxShadow: selectedModel === model.id ? `0 20px 40px ${model.color}33` : 'none',
//                   position: 'relative'
//                 }}
//               >
//                 {model.popular && (
//                   <div style={{ 
//                     position: 'absolute', 
//                     top: '-12px', 
//                     right: '20px',
//                     background: 'linear-gradient(135deg, #667eea, #764ba2)',
//                     padding: '0.4rem 1rem',
//                     borderRadius: '20px',
//                     fontSize: '0.75rem',
//                     fontWeight: 700,
//                     boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
//                   }}>
//                     MOST POPULAR
//                   </div>
//                 )}
                
//                 <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
//                   {model.id === 'gpt-3' && '⚡'}
//                   {model.id === 'gpt-4' && '🧠'}
//                   {model.id === 'claude' && '🎯'}
//                   {model.id === 'gemini' && '💎'}
//                 </div>
                
//                 <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: model.color }}>
//                   {model.name}
//                 </h3>
                
//                 <div style={{ fontSize: '1.1rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
//                   {model.price}
//                 </div>
                
//                 <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
//                   Speed: <span style={{ color: model.color, fontWeight: 600 }}>{model.speed}</span>
//                 </div>

//                 {selectedModel === model.id && (
//                   <div style={{ animation: 'fadeIn 0.3s ease' }}>
//                     <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
//                       <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.75rem' }}>
//                         KEY FEATURES:
//                       </div>
//                       {model.features.map((feature, i) => (
//                         <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>
//                           <span style={{ color: model.color }}>✓</span> {feature}
//                         </div>
//                       ))}
//                     </div>
//                     <button style={{
//                       width: '100%',
//                       marginTop: '1rem',
//                       padding: '0.75rem',
//                       background: model.color,
//                       border: 'none',
//                       borderRadius: '8px',
//                       color: '#fff',
//                       fontWeight: 600,
//                       cursor: 'pointer',
//                       transition: 'opacity 0.2s'
//                     }}>
//                       Select {model.name}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Slider */}
//       <section id="features" style={{ padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//           <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
//             <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
//               Powerful <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Features</span>
//             </h2>
//           </div>

//           <div style={{ position: 'relative', minHeight: '400px' }}>
//             {features.map((feature, i) => (
//               <div
//                 key={i}
//                 style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   opacity: currentFeature === i ? 1 : 0,
//                   transform: currentFeature === i ? 'translateX(0)' : 'translateX(50px)',
//                   transition: 'all 0.5s ease',
//                   pointerEvents: currentFeature === i ? 'auto' : 'none'
//                 }}
//               >
//                 <div style={{ 
//                   background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
//                   border: '1px solid rgba(255, 255, 255, 0.1)',
//                   borderRadius: '24px',
//                   padding: '4rem',
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: '4rem',
//                   alignItems: 'center'
//                 }}>
//                   <div>
//                     <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{feature.icon}</div>
//                     <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{feature.title}</h3>
//                     <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.6 }}>
//                       {feature.description}
//                     </p>
//                     <div style={{ 
//                       display: 'inline-block',
//                       background: 'rgba(102, 126, 234, 0.2)',
//                       border: '1px solid rgba(102, 126, 234, 0.3)',
//                       padding: '0.75rem 1.5rem',
//                       borderRadius: '12px',
//                       fontWeight: 600,
//                       color: '#667eea'
//                     }}>
//                       {feature.demo}
//                     </div>
//                   </div>
//                   <div style={{
//                     background: 'rgba(0, 0, 0, 0.3)',
//                     borderRadius: '16px',
//                     padding: '3rem',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     minHeight: '300px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontSize: '5rem'
//                   }}>
//                     {feature.icon}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Slider Dots */}
//           <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
//             {features.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentFeature(i)}
//                 style={{
//                   width: currentFeature === i ? '40px' : '12px',
//                   height: '12px',
//                   borderRadius: '6px',
//                   background: currentFeature === i ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.2)',
//                   border: 'none',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease'
//                 }}
//               />
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" style={{ padding: '6rem 2rem', background: 'rgba(0, 0, 0, 0.3)' }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//           <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
//             <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
//               Simple <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pricing</span>
//             </h2>
//             <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>Start free. Scale as you grow.</p>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
//             {pricingPlans.map((plan, i) => (
//               <div
//                 key={i}
//                 onMouseEnter={() => setHoveredPricing(i)}
//                 onMouseLeave={() => setHoveredPricing(null)}
//                 style={{
//                   background: plan.popular ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))' : 'rgba(255, 255, 255, 0.03)',
//                   border: plan.popular ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.1)',
//                   borderRadius: '20px',
//                   padding: '2.5rem',
//                   position: 'relative',
//                   transform: hoveredPricing === i ? 'translateY(-10px)' : 'translateY(0)',
//                   transition: 'all 0.3s ease',
//                   boxShadow: hoveredPricing === i ? '0 20px 40px rgba(102, 126, 234, 0.2)' : 'none'
//                 }}
//               >
//                 {plan.popular && (
//                   <div style={{
//                     position: 'absolute',
//                     top: '-15px',
//                     left: '50%',
//                     transform: 'translateX(-50%)',
//                     background: 'linear-gradient(135deg, #667eea, #764ba2)',
//                     padding: '0.5rem 1.5rem',
//                     borderRadius: '20px',
//                     fontSize: '0.8rem',
//                     fontWeight: 700,
//                     boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
//                   }}>
//                     BEST VALUE
//                   </div>
//                 )}

//                 <div style={{ marginBottom: '2rem' }}>
//                   <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
//                   <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>
//                     {plan.price}
//                     <span style={{ fontSize: '1.2rem', fontWeight: 400, color: '#9ca3af' }}>{plan.period}</span>
//                   </div>
//                   <p style={{ color: '#9ca3af' }}>{plan.description}</p>
//                 </div>

//                 <div style={{ marginBottom: '2rem' }}>
//                   {plan.features.map((feature, j) => (
//                     <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
//                       <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
//                       <span style={{ color: '#d1d5db' }}>{feature}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <button style={{
//                   width: '100%',
//                   padding: '1rem',
//                   background: plan.popular ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)',
//                   border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
//                   borderRadius: '12px',
//                   color: '#fff',
//                   fontSize: '1.05rem',
//                   fontWeight: 700,
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   boxShadow: plan.popular ? '0 10px 25px rgba(102, 126, 234, 0.3)' : 'none'
//                 }}>
//                   {plan.cta}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Auth Modal */}
//       {showAuthModal && (
//         <div onClick={() => setShowAuthModal(false)} style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: 'rgba(0, 0, 0, 0.8)',
//           backdropFilter: 'blur(10px)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           zIndex: 9999,
//           animation: 'fadeIn 0.3s ease'
//         }}>
//           <div onClick={(e) => e.stopPropagation()} style={{
//             background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
//             border: '1px solid rgba(255, 255, 255, 0.1)',
//             borderRadius: '24px',
//             padding: '3rem',
//             maxWidth: '450px',
//             width: '90%',
//             boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
//             animation: 'slideUp 0.4s ease'
//           }}>
//             <button onClick={() => setShowAuthModal(false)} style={{
//               position: 'absolute',
//               top: '1.5rem',
//               right: '1.5rem',
//               background: 'none',
//               border: 'none',
//               color: '#9ca3af',
//               fontSize: '2rem',
//               cursor: 'pointer',
//               lineHeight: 1
//             }}>×</button>

//             <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
//               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//                 {authMode === 'signin' ? '👋' : '🚀'}
//               </div>
//               <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
//                 {authMode === 'signin' ? 'Welcome Back' : 'Get Started'}
//               </h2>
//               <p style={{ color: '#9ca3af' }}>
//                 {authMode === 'signin' ? 'Sign in to your account' : 'Create your free account'}
//               </p>
//             </div>

//             <form onSubmit={handleAuth}>
//               <div style={{ marginBottom: '1.5rem' }}>
//                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#d1d5db' }}>
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   placeholder="you@company.com"
//                   style={{
//                     width: '100%',
//                     padding: '0.875rem',
//                     background: 'rgba(255, 255, 255, 0.05)',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     borderRadius: '12px',
//                     color: '#fff',
//                     fontSize: '1rem',
//                     outline: 'none',
//                     transition: 'all 0.2s'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: authMode === 'signup' ? '1.5rem' : '1rem' }}>
//                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#d1d5db' }}>
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   placeholder="••••••••"
//                   style={{
//                     width: '100%',
//                     padding: '0.875rem',
//                     background: 'rgba(255, 255, 255, 0.05)',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     borderRadius: '12px',
//                     color: '#fff',
//                     fontSize: '1rem',
//                     outline: 'none'
//                   }}
//                 />
//               </div>

//               {authMode === 'signup' && (
//                 <div style={{ marginBottom: '1.5rem' }}>
//                   <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#d1d5db' }}>
//                     Choose Your AI Model
//                   </label>
//                   <select style={{
//                     width: '100%',
//                     padding: '0.875rem',
//                     background: 'rgba(255, 255, 255, 0.05)',
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     borderRadius: '12px',
//                     color: '#fff',
//                     fontSize: '1rem',
//                     outline: 'none',
//                     cursor: 'pointer'
//                   }}>
//                     <option value="">Select a model...</option>
//                     {models.map(model => (
//                       <option key={model.id} value={model.id}>
//                         {model.name} - {model.price}
//                       </option>
//                     ))}
//                   </select>
//                   <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
//                     💡 You can change this later in settings
//                   </p>
//                 </div>
//               )}

//               {authMode === 'signin' && (
//                 <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
//                   <a href="#forgot" style={{ color: '#667eea', fontSize: '0.9rem', textDecoration: 'none' }}>
//                     Forgot password?
//                   </a>
//                 </div>
//               )}

//               <button type="submit" style={{
//                 width: '100%',
//                 padding: '1rem',
//                 background: 'linear-gradient(135deg, #667eea, #764ba2)',
//                 border: 'none',
//                 borderRadius: '12px',
//                 color: '#fff',
//                 fontSize: '1.1rem',
//                 fontWeight: 700,
//                 cursor: 'pointer',
//                 marginBottom: '1rem',
//                 boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
//                 transition: 'transform 0.2s'
//               }}>
//                 {authMode === 'signin' ? 'Sign In' : 'Create Account'}
//               </button>

//               <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
//                 {authMode === 'signin' ? (
//                   <>
//                     Don't have an account?{' '}
//                     <button type="button" onClick={() => setAuthMode('signup')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>
//                       Sign up
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     Already have an account?{' '}
//                     <button type="button" onClick={() => setAuthMode('signin')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>
//                       Sign in
//                     </button>
//                   </>
//                 )}
//               </div>
//             </form>

//             {authMode === 'signup' && (
//               <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
//                 <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
//                   By signing up, you agree to our{' '}
//                   <a href="#terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms</a>
//                   {' '}and{' '}
//                   <a href="#privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy Policy</a>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       {showDemoModal && (
//   <div 
//     onClick={() => { 
//       setShowDemoModal(false); 
//       setIsVideoPlaying(false); 
//     }}
//     style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       width: '100vw',
//       height: '100vh',
//       backgroundColor: 'rgba(0, 0, 0, 0.95)',
//       backdropFilter: 'blur(12px)',
//       zIndex: 9999,
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       padding: '2rem',
//       animation: 'fadeIn 0.3s ease'
//     }}
//   >
//     <div 
//       onClick={(e) => e.stopPropagation()}
//       style={{ 
//         width: '100%', 
//         maxWidth: '1100px',
//         position: 'relative',
//         animation: 'slideUp 0.4s ease'
//       }}
//     >
      
//       {/* Modal Header */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '1.5rem',
//         padding: '0 0.5rem'
//       }}>
//         <div>
//           <h3 style={{
//             fontSize: '1.5rem',
//             fontWeight: 700,
//             color: '#fff',
//             margin: 0,
//             marginBottom: '0.25rem'
//           }}>
//             {DEMO_VIDEOS[currentVideoIndex].title}
//           </h3>
//           <p style={{
//             fontSize: '0.9rem',
//             color: '#9ca3af',
//             margin: 0
//           }}>
//             Video {currentVideoIndex + 1} of {DEMO_VIDEOS.length}
//           </p>
//         </div>
        
//         {/* Close Button */}
//         <button 
//           onClick={() => { 
//             setShowDemoModal(false); 
//             setIsVideoPlaying(false); 
//           }}
//           style={{
//             background: 'rgba(255, 255, 255, 0.1)',
//             border: '1px solid rgba(255, 255, 255, 0.2)',
//             borderRadius: '50%',
//             width: '48px',
//             height: '48px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             color: '#fff',
//             fontSize: '1.5rem',
//             cursor: 'pointer',
//             transition: 'all 0.2s'
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
//             e.currentTarget.style.transform = 'scale(1.1)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
//             e.currentTarget.style.transform = 'scale(1)';
//           }}
//         >
//           ✕
//         </button>
//       </div>

//       {/* Video Container with 16:9 Aspect Ratio */}
//       <div style={{ 
//         position: 'relative',
//         width: '100%',
//         paddingBottom: '56.25%', // 16:9 aspect ratio
//         backgroundColor: '#000',
//         borderRadius: '16px',
//         overflow: 'hidden',
//         boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 80px rgba(102, 126, 234, 0.3)',
//         border: '1px solid rgba(255, 255, 255, 0.1)'
//       }}>
//         <video 
//           ref={videoRef}
//           controls
//           autoPlay
//           style={{ 
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             objectFit: 'contain'
//           }}
//         />
//       </div>

//       {/* Video Playlist Navigation */}
//       <div style={{
//         marginTop: '2rem',
//         background: 'rgba(255, 255, 255, 0.05)',
//         backdropFilter: 'blur(10px)',
//         borderRadius: '16px',
//         padding: '1.5rem',
//         border: '1px solid rgba(255, 255, 255, 0.1)'
//       }}>
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '1rem'
//         }}>
//           <h4 style={{
//             fontSize: '0.9rem',
//             fontWeight: 600,
//             color: '#d1d5db',
//             margin: 0,
//             textTransform: 'uppercase',
//             letterSpacing: '0.05em'
//           }}>
//             Playlist
//           </h4>
//           <div style={{
//             fontSize: '0.85rem',
//             color: '#9ca3af'
//           }}>
//             {currentVideoIndex + 1}/{DEMO_VIDEOS.length}
//           </div>
//         </div>
        
//         <div style={{ 
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//           gap: '1rem'
//         }}>
//           {DEMO_VIDEOS.map((vid, idx) => (
//             <button
//               key={vid.id}
//               onClick={() => setCurrentVideoIndex(idx)}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.75rem',
//                 padding: '1rem',
//                 background: currentVideoIndex === idx 
//                   ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))'
//                   : 'rgba(255, 255, 255, 0.03)',
//                 border: currentVideoIndex === idx 
//                   ? '2px solid #667eea' 
//                   : '1px solid rgba(255, 255, 255, 0.1)',
//                 borderRadius: '12px',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s',
//                 textAlign: 'left'
//               }}
//               onMouseEnter={(e) => {
//                 if (currentVideoIndex !== idx) {
//                   e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
//                   e.currentTarget.style.transform = 'translateY(-2px)';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (currentVideoIndex !== idx) {
//                   e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
//                   e.currentTarget.style.transform = 'translateY(0)';
//                 }
//               }}
//             >
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 borderRadius: '8px',
//                 background: currentVideoIndex === idx 
//                   ? 'linear-gradient(135deg, #667eea, #764ba2)'
//                   : 'rgba(255, 255, 255, 0.1)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '1.2rem',
//                 flexShrink: 0
//               }}>
//                 {currentVideoIndex === idx ? '▶' : '🎥'}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{
//                   fontSize: '0.9rem',
//                   fontWeight: 600,
//                   color: currentVideoIndex === idx ? '#fff' : '#d1d5db',
//                   marginBottom: '0.25rem',
//                   whiteSpace: 'nowrap',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis'
//                 }}>
//                   {vid.title}
//                 </div>
//                 <div style={{
//                   fontSize: '0.75rem',
//                   color: '#9ca3af'
//                 }}>
//                   Video {idx + 1}
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Keyboard Shortcut Hint */}
//       <div style={{
//         marginTop: '1rem',
//         textAlign: 'center',
//         fontSize: '0.8rem',
//         color: '#6b7280'
//       }}>
//         Press <kbd style={{
//           background: 'rgba(255, 255, 255, 0.1)',
//           padding: '0.2rem 0.5rem',
//           borderRadius: '4px',
//           fontFamily: 'monospace',
//           fontSize: '0.75rem'
//         }}>ESC</kbd> to close
//       </div>
//     </div>
//   </div>
// )}

// <style>{`
//   @keyframes fadeIn {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }

//   @keyframes slideUp {
//     from { opacity: 0; transform: translateY(50px); }
//     to { opacity: 1; transform: translateY(0); }
//   }

//   @keyframes fadeInUp {
//     from { opacity: 0; transform: translateY(30px); }
//     to { opacity: 1; transform: translateY(0); }
//   }

//   @keyframes fadeInDown {
//     from { opacity: 0; transform: translateY(-30px); }
//     to { opacity: 1; transform: translateY(0); }
//   }

//   @keyframes float {
//     0%, 100% { transform: translateY(0px); }
//     50% { transform: translateY(-20px); }
//   }
// `}</style>

//       {/* Footer */}
//       <footer style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '4rem 2rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
//                 <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚀</div>
//                 <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>RAG.AI</span>
//               </div>
//               <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
//                 Enterprise AI-powered knowledge management platform
//               </p>
//             </div>

//             <div>
//               <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#d1d5db' }}>Product</h4>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//                 <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Features</a>
//                 <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
//                 <a href="#security" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Security</a>
//                 <a href="#changelog" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Changelog</a>
//               </div>
//             </div>

//             <div>
//               <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#d1d5db' }}>Company</h4>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//                 <a href="#about" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>About</a>
//                 <a href="#blog" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Blog</a>
//                 <a href="#careers" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Careers</a>
//                 <a href="#contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
//               </div>
//             </div>

//             <div>
//               <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#d1d5db' }}>Resources</h4>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//                 <a href="#docs" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Documentation</a>
//                 <a href="#api" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>API Reference</a>
//                 <a href="#support" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Support</a>
//                 <a href="#status" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Status</a>
//               </div>
//             </div>
//           </div>

//           <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
//             <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
//               © 2024 RAG.AI. All rights reserved.
//             </div>
//             <div style={{ display: 'flex', gap: '1.5rem' }}>
//               <a href="#twitter" style={{ color: '#9ca3af', fontSize: '1.25rem', transition: 'color 0.2s' }}>𝕏</a>
//               <a href="#linkedin" style={{ color: '#9ca3af', fontSize: '1.25rem', transition: 'color 0.2s' }}>in</a>
//               <a href="#github" style={{ color: '#9ca3af', fontSize: '1.25rem', transition: 'color 0.2s' }}>⚡</a>
//             </div>
//           </div>
//         </div>
//       </footer>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }

//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(30px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes fadeInDown {
//           from { opacity: 0; transform: translateY(-30px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(50px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-20px); }
//         }

//         * {
//           box-sizing: border-box;
//         }

//         input:focus, select:focus {
//           border-color: #667eea !important;
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
//         }

//         button:hover {
//           transform: translateY(-2px);
//         }

//         button:active {
//           transform: translateY(0);
//         }

//         a:hover {
//           color: #667eea !important;
//         }

//         @media (max-width: 768px) {
//           nav > div {
//             flex-direction: column;
//             gap: 1rem;
//           }

//           nav > div > div:last-child {
//             width: 100%;
//             justify-content: space-between;
//           }

//           section > div > div[style*="grid"] {
//             grid-template-columns: 1fr !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }