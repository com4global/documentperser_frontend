import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
//import AuthModal from '../components/AuthModal';
import '../Styles/AdminDashboard.css';

const DEMO_VIDEOS = [
  { id: 1, title: 'Platform Overview', url: '/advertiseA.mp4' },
  { id: 2, title: 'AI Features', url: '/advertiseb.mp4' },
  { id: 3, title: 'Enterprise Workflow', url: '/advertisec.mp4' }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  // const [showAuthModal, setShowAuthModal] = useState(false);
  // const [authMode, setAuthMode] = useState('signin');
  const [currentFeature, setCurrentFeature] = useState(0); // Used in useEffect
  const [hoveredPricing, setHoveredPricing] = useState(null); // Used in JSX logic
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect to chat if already authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/chat');
  //   }
  // }, [isAuthenticated, navigate]);
  const handleStartTrial = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };
useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Video Demo State
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const videoRef = useRef(null);
  
  // DEMO_VIDEOS moved outside component
  // const DEMO_VIDEOS = [
  //   { id: 1, title: 'Platform Overview', url: '/advertiseA.mp4' },
  //   { id: 2, title: 'AI Features', url: '/advertiseb.mp4' },
  //   { id: 3, title: 'Enterprise Workflow', url: '/advertisec.mp4' }
  // ];

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




  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      icon: 'ðŸŽ¯',
      title: 'Multi-Source RAG',
      description: 'Upload PDFs, videos, audio, images, YouTube links - we handle it all',
      demo: 'Process 100+ file types instantly'
    },
    {
      icon: 'ðŸš€',
      title: 'Lightning Fast Search',
      description: 'Get answers in milliseconds with advanced vector search',
      demo: 'Query 1M+ documents in <200ms'
    },
    {
      icon: 'ðŸ§ ',
      title: 'Smart Model Selection',
      description: 'Choose GPT-4, Claude, or Gemini based on your needs',
      demo: 'Auto-route to best model'
    },
    {
      icon: 'ðŸ’¼',
      title: 'Enterprise Security',
      description: 'SOC 2, GDPR compliant with end-to-end encryption',
      demo: 'Bank-level encryption'
    },
    {
      icon: 'ðŸ“Š',
      title: 'Analytics Dashboard',
      description: 'Track usage, costs, and performance in real-time',
      demo: 'Live insights & reporting'
    },
    {
      icon: 'ðŸ”—',
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
  }, [features.length]);

  // const handleAuthSuccess = () => {
  //   // setShowAuthModal(false);
  //   // AuthContext will handle the redirect
  // };

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
              ðŸš€
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
                if (isAuthenticated) {
                  navigate('/chat');
                } else {
                  navigate('/login');
                }
              }} 
              style={{ background: 'none', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { 
                //handleStartTrial
                // setAuthMode('signup'); 
                // setShowAuthModal(true); 
                handleStartTrial();
              }} 
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}
            >
              Start Free â†’
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
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#667eea' }}>âœ¨ NEW</span>
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
                if (isAuthenticated) {
                  navigate('/chat');
                } else {
                  navigate('/login');
                }
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
              Start Free Trial <span style={{ fontSize: '1.2rem' }}>â†’</span>
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

      {/* Model Selection Section */}
      <section id="models" style={{ padding: '6rem 2rem', background: '#0a0a0a' }}>
         <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: '4rem' }}>
              Choose Your <span style={{ color: '#667eea' }}>Intelligence</span>
            </h2>
            <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {models.map((model) => (
                <div 
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  style={{
                    minWidth: '280px',
                    padding: '2rem',
                    borderRadius: '20px',
                    background: selectedModel?.id === model.id ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${selectedModel?.id === model.id ? model.color : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{model.name}</h3>
                      {model.popular && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: model.color, color: '#000', fontWeight: 700 }}>HOT</span>}
                   </div>
                   <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: model.color }}>
                      {model.price.split('/')[0]}<span style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 400 }}>/{model.price.split('/')[1]}</span>
                   </div>
                   <div style={{ marginBottom: '1.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Speed: <span style={{ color: '#fff' }}>{model.speed}</span></div>
                   <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {model.features.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                           <span style={{ color: model.color }}>âœ“</span> {feat}
                        </li>
                      ))}
                   </ul>
                </div >
              ))}
            </div >
         </div >
      </section >

    {/* Features Section */ }
    < section id = "features" style = {{ padding: '6rem 2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                    Everything you need to <span style={{ color: '#764ba2' }}>scale</span>
                </h2>
                <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>Enterprise-grade features built for the most demanding workloads</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {features.map((feature, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: '2.5rem',
                            borderRadius: '24px',
                            background: idx === currentFeature ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                            border: idx === currentFeature ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.5s ease'
                        }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{feature.icon}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{feature.title}</h3>
                        <p style={{ color: '#9ca3af', lineHeight: 1.6, marginBottom: '1.5rem' }}>{feature.description}</p>
                        <div style={{ fontSize: '0.9rem', color: '#667eea', fontWeight: 600 }}>{feature.demo}</div>
                    </div>
                ))}
            </div>
        </div>
      </section >

    {/* Pricing Section */ }
    < section id = "pricing" style = {{ padding: '6rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: '4rem' }}>Simple, transparent pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                {pricingPlans.map((plan, i) => (
                    <div
                        key={i}
                        onMouseEnter={() => setHoveredPricing(i)}
                        onMouseLeave={() => setHoveredPricing(null)}
                        style={{
                            padding: '3rem',
                            borderRadius: '24px',
                            background: plan.popular ? 'linear-gradient(145deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' : 'rgba(255, 255, 255, 0.03)',
                            border: plan.popular ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                            transform: hoveredPricing === i ? 'translateY(-10px)' : 'translateY(0)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {plan.popular && (
                            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                                MOST POPULAR
                            </div>
                        )}
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 900 }}>{plan.price}</span>
                            <span style={{ color: '#9ca3af' }}>{plan.period}</span>
                        </div>
                        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>{plan.description}</p>
                        <button style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: plan.popular ? '#fff' : 'rgba(255, 255, 255, 0.1)',
                            color: plan.popular ? '#000' : '#fff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginBottom: '2rem'
                        }}>
                            {plan.cta}
                        </button>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {plan.features.map((feature, f) => (
                                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#d1d5db' }}>
                                    <span style={{ color: '#667eea' }}>âœ“</span> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
      </section >

    {/* Demo Video Modal */ }
{
    showDemoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDemoModal(false)}>
            <div style={{ position: 'relative', width: '90%', maxWidth: '1000px', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <video
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    controls
                    autoPlay={isVideoPlaying}
                />
                <button
                    onClick={() => setShowDemoModal(false)}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px' }}
                >
                    Ã—
                </button>
            </div>
        </div>
    )
}

{/* Footer */ }
      <footer style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#6b7280' }}>
         <p>Â© 2024 RAG.AI. All rights reserved.</p>
      </footer>

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
    </div >
  );
}
