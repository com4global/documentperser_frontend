


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/AdminDashboard.css';
export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hoveredPricing, setHoveredPricing] = useState(null);
  const navigate = useNavigate();

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

  const handleAuth = (e) => {
    e.preventDefault();
    console.log('Auth:', { email, password, mode: authMode });
     localStorage.setItem('token', 'your-temp-token-123');
    setShowAuthModal(false);
    navigate('/chat');
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
            <button onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }} style={{ background: 'none', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Sign In
            </button>
            <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
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
            <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} style={{
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
            }}>
              Start Free Trial <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
            <button style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Watch Demo 🎥
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
      <section style={{ padding: '6rem 2rem', background: 'rgba(0, 0, 0, 0.3)', position: 'relative' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
              Choose Your <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Model</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>Hover to see pricing and features for each model</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {models.map((model) => (
              <div
                key={model.id}
                onMouseEnter={() => setSelectedModel(model.id)}
                onMouseLeave={() => setSelectedModel(null)}
                style={{
                  background: selectedModel === model.id ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: `2px solid ${selectedModel === model.id ? model.color : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedModel === model.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
                  boxShadow: selectedModel === model.id ? `0 20px 40px ${model.color}33` : 'none',
                  position: 'relative'
                }}
              >
                {model.popular && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    right: '20px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  {model.id === 'gpt-3' && '⚡'}
                  {model.id === 'gpt-4' && '🧠'}
                  {model.id === 'claude' && '🎯'}
                  {model.id === 'gemini' && '💎'}
                </div>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: model.color }}>
                  {model.name}
                </h3>
                
                <div style={{ fontSize: '1.1rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                  {model.price}
                </div>
                
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Speed: <span style={{ color: model.color, fontWeight: 600 }}>{model.speed}</span>
                </div>

                {selectedModel === model.id && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.75rem' }}>
                        KEY FEATURES:
                      </div>
                      {model.features.map((feature, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                          <span style={{ color: model.color }}>✓</span> {feature}
                        </div>
                      ))}
                    </div>
                    <button style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: model.color,
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}>
                      Select {model.name}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Slider */}
      <section id="features" style={{ padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
              Powerful <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Features</span>
            </h2>
          </div>

          <div style={{ position: 'relative', minHeight: '400px' }}>
            {features.map((feature, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: currentFeature === i ? 1 : 0,
                  transform: currentFeature === i ? 'translateX(0)' : 'translateX(50px)',
                  transition: 'all 0.5s ease',
                  pointerEvents: currentFeature === i ? 'auto' : 'none'
                }}
              >
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  padding: '4rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '4rem',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{feature.icon}</div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{feature.title}</h3>
                    <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.6 }}>
                      {feature.description}
                    </p>
                    <div style={{ 
                      display: 'inline-block',
                      background: 'rgba(102, 126, 234, 0.2)',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontWeight: 600,
                      color: '#667eea'
                    }}>
                      {feature.demo}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '16px',
                    padding: '3rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '5rem'
                  }}>
                    {feature.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentFeature(i)}
                style={{
                  width: currentFeature === i ? '40px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: currentFeature === i ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '6rem 2rem', background: 'rgba(0, 0, 0, 0.3)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
              Simple <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pricing</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>Start free. Scale as you grow.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredPricing(i)}
                onMouseLeave={() => setHoveredPricing(null)}
                style={{
                  background: plan.popular ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))' : 'rgba(255, 255, 255, 0.03)',
                  border: plan.popular ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  position: 'relative',
                  transform: hoveredPricing === i ? 'translateY(-10px)' : 'translateY(0)',
                  transition: 'all 0.3s ease',
                  boxShadow: hoveredPricing === i ? '0 20px 40px rgba(102, 126, 234, 0.2)' : 'none'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}>
                    BEST VALUE
                  </div>
                )}

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                    {plan.price}
                    <span style={{ fontSize: '1.2rem', fontWeight: 400, color: '#9ca3af' }}>{plan.period}</span>
                  </div>
                  <p style={{ color: '#9ca3af' }}>{plan.description}</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  {plan.features.map((feature, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                      <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
                      <span style={{ color: '#d1d5db' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button style={{
                  width: '100%',
                  padding: '1rem',
                  background: plan.popular ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)',
                  border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: plan.popular ? '0 10px 25px rgba(102, 126, 234, 0.3)' : 'none'
                }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div onClick={() => setShowAuthModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '3rem',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 0.4s ease'
          }}>
            <button onClick={() => setShowAuthModal(false)} style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '2rem',
              cursor: 'pointer',
              lineHeight: 1
            }}>×</button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {authMode === 'signin' ? '👋' : '🚀'}
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {authMode === 'signin' ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p style={{ color: '#9ca3af' }}>
                {authMode === 'signin' ? 'Sign in to your account' : 'Create your free account'}
              </p>
            </div>

            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#d1d5db' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div style={{ marginBottom: authMode === 'signup' ? '1.5rem' : '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#d1d5db' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              {authMode === 'signup' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#d1d5db' }}>
                    Choose Your AI Model
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}>
                    <option value="">Select a model...</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.price}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    💡 You can change this later in settings
                  </p>
                </div>
              )}

              {authMode === 'signin' && (
                <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                  <a href="#forgot" style={{ color: '#667eea', fontSize: '0.9rem', textDecoration: 'none' }}>
                    Forgot password?
                  </a>
                </div>
              )}

              <button type="submit" style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '1rem',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.2s'
              }}>
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                {authMode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setAuthMode('signup')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setAuthMode('signin')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </form>

            {authMode === 'signup' && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
                  By signing up, you agree to our{' '}
                  <a href="#terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms</a>
                  {' '}and{' '}
                  <a href="#privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy Policy</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '4rem 2rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚀</div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>RAG.AI</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                Enterprise AI-powered knowledge management platform
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#d1d5db' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Features</a>
                <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
                <a href="#security" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Security</a>
                <a href="#changelog" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Changelog</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#d1d5db' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="#about" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>About</a>
                <a href="#blog" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Blog</a>
                <a href="#careers" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Careers</a>
                <a href="#contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#d1d5db' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="#docs" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Documentation</a>
                <a href="#api" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>API Reference</a>
                <a href="#support" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Support</a>
                <a href="#status" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>Status</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              © 2024 RAG.AI. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#twitter" style={{ color: '#9ca3af', fontSize: '1.25rem', transition: 'color 0.2s' }}>𝕏</a>
              <a href="#linkedin" style={{ color: '#9ca3af', fontSize: '1.25rem', transition: 'color 0.2s' }}>in</a>
              <a href="#github" style={{ color: '#9ca3af', fontSize: '1.25rem', transition: 'color 0.2s' }}>⚡</a>
            </div>
          </div>
        </div>
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

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        * {
          box-sizing: border-box;
        }

        input:focus, select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }

        button:hover {
          transform: translateY(-2px);
        }

        button:active {
          transform: translateY(0);
        }

        a:hover {
          color: #667eea !important;
        }

        @media (max-width: 768px) {
          nav > div {
            flex-direction: column;
            gap: 1rem;
          }

          nav > div > div:last-child {
            width: 100%;
            justify-content: space-between;
          }

          section > div > div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}