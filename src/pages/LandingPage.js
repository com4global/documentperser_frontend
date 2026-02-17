import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../Styles/AdminDashboard.css';

const DEMO_VIDEOS = [
  { id: 1, title: 'Platform Overview', url: '/advertiseA.mp4' },
  { id: 2, title: 'AI Features', url: '/advertiseb.mp4' },
  { id: 3, title: 'Enterprise Workflow', url: '/advertisec.mp4' }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [hoveredPricing, setHoveredPricing] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartTrial = () => {
    if (isAuthenticated) { navigate('/chat'); } else { navigate('/login'); }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const handleVideoEnd = () => { setCurrentVideoIndex((prev) => (prev + 1) % DEMO_VIDEOS.length); };
    videoElement.addEventListener('ended', handleVideoEnd);
    return () => videoElement.removeEventListener('ended', handleVideoEnd);
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && showDemoModal) {
      videoElement.src = DEMO_VIDEOS[currentVideoIndex].url;
      videoElement.load();
      if (isVideoPlaying) { videoElement.play().catch(err => console.warn('Autoplay blocked', err)); }
    }
  }, [currentVideoIndex, isVideoPlaying, showDemoModal]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && showDemoModal) { setShowDemoModal(false); setIsVideoPlaying(false); } };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showDemoModal]);

  const models = [
    { id: 'gpt-3', name: 'GPT-3.5 Turbo', price: '$0.002/1K tokens', speed: 'Fast', features: ['Basic reasoning', 'Quick responses', 'Cost-effective', 'Standard accuracy'], color: '#10b981' },
    { id: 'gpt-4', name: 'GPT-4 Turbo', price: '$0.01/1K tokens', speed: 'Moderate', features: ['Advanced reasoning', 'Higher accuracy', 'Complex tasks', '128K context'], color: '#3b82f6', popular: true },
    { id: 'claude', name: 'Claude Sonnet 4', price: '$0.015/1K tokens', speed: 'Fast', features: ['Superior reasoning', 'Longest context', 'Best for research', '200K tokens'], color: '#8b5cf6' },
    { id: 'gemini', name: 'Gemini Pro', price: '$0.00125/1K tokens', speed: 'Very Fast', features: ['Multimodal AI', 'Image & video', 'Lowest cost', 'Google integration'], color: '#f59e0b' }
  ];

  const features = [
    { icon: '🎯', title: 'Multi-Source RAG', description: 'Upload PDFs, videos, audio, images, YouTube links - we handle it all', demo: 'Process 100+ file types instantly' },
    { icon: '🚀', title: 'Lightning Fast Search', description: 'Get answers in milliseconds with advanced vector search', demo: 'Query 1M+ documents in <200ms' },
    { icon: '🧠', title: 'Smart Model Selection', description: 'Choose GPT-4, Claude, or Gemini based on your needs', demo: 'Auto-route to best model' },
    { icon: '💼', title: 'Enterprise Security', description: 'SOC 2, GDPR compliant with end-to-end encryption', demo: 'Bank-level encryption' },
    { icon: '📊', title: 'Analytics Dashboard', description: 'Track usage, costs, and performance in real-time', demo: 'Live insights & reporting' },
    { icon: '🔗', title: 'Seamless Integration', description: 'REST API, webhooks, and SDKs for easy integration', demo: 'Deploy in 5 minutes' }
  ];

  const pricingPlans = [
    { name: 'Starter', price: '$29', period: '/month', description: 'Perfect for individuals', features: ['10K tokens/month', 'All AI models', '100 documents', 'Email support', 'Basic analytics'], cta: 'Start Free Trial', popular: false },
    { name: 'Professional', price: '$99', period: '/month', description: 'For growing teams', features: ['100K tokens/month', 'All AI models', 'Unlimited documents', 'Priority support', 'Advanced analytics', 'API access', 'Custom integrations'], cta: 'Start Free Trial', popular: true },
    { name: 'Enterprise', price: 'Custom', period: '', description: 'For large organizations', features: ['Unlimited tokens', 'All AI models', 'Unlimited documents', '24/7 dedicated support', 'Custom AI training', 'SLA guarantee', 'On-premise deployment', 'White-label solution'], cta: 'Contact Sales', popular: false }
  ];

  const stats = [
    { value: '10M+', label: 'Documents Processed' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 200ms', label: 'Average Response' },
    { value: '50K+', label: 'Happy Users' }
  ];

  useEffect(() => {
    const interval = setInterval(() => { setCurrentFeature((prev) => (prev + 1) % features.length); }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: '#fff', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s ease', padding: '1.25rem 2rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)' }}>
              🚀
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RAG.AI</span>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>Features</a>
            <a href="#pricing" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
            <a href="#docs" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>Docs</a>
            <button onClick={() => { if (isAuthenticated) { navigate('/chat'); } else { navigate('/login'); } }} style={{ background: 'none', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Sign In</button>
            <button onClick={handleStartTrial} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>Start Free →</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.15), transparent 50%), radial-gradient(circle at 0% 100%, rgba(118, 75, 162, 0.15), transparent 50%)', position: 'relative', padding: '8rem 2rem 4rem' }}>
        <div style={{ maxWidth: '1400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '50px', marginBottom: '2rem', animation: 'fadeInDown 0.8s ease' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#667eea' }}>✨ NEW</span>
            <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>Claude Sonnet 4 Now Available</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, #d1d5db 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'fadeInUp 1s ease' }}>
            Your Enterprise<br/>
            <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Knowledge Assistant</span>
          </h1>
          <p style={{ fontSize: '1.35rem', color: '#9ca3af', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6, animation: 'fadeInUp 1.2s ease' }}>
            Process any document, video, or audio file. Get instant AI-powered answers from your data with GPT-4, Claude, or Gemini.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem', animation: 'fadeInUp 1.4s ease' }}>
            <button onClick={() => { if (isAuthenticated) { navigate('/chat'); } else { navigate('/login'); } }} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Start Free Trial <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
            <button onClick={() => { setShowDemoModal(true); setIsVideoPlaying(true); setCurrentVideoIndex(0); }} style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem 2.5rem', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>&#9654;</span> Watch Demo
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeInUp 1.6s ease' }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Selection */}
      <section id="models" style={{ padding: '6rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Choose Your AI Model</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '3rem', fontSize: '1.1rem' }}>Select the best model for your needs</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {models.map((model) => (
              <div key={model.id} onClick={() => setSelectedModel(model.id)} style={{ background: selectedModel === model.id ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: selectedModel === model.id ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '2rem', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative' }}>
                {model.popular && <div style={{ position: 'absolute', top: '-10px', right: '20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '0.25rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>POPULAR</div>}
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: model.color, marginBottom: '1rem' }}></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{model.name}</h3>
                <p style={{ color: '#667eea', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{model.price}</p>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem' }}>Speed: {model.speed}</p>
                {model.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#667eea' }}>✔</span> <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>{feature}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '6rem 2rem', background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Powerful Features</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '3rem', fontSize: '1.1rem' }}>Everything you need for enterprise AI</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ background: currentFeature === idx ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.03)', border: currentFeature === idx ? '1px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', transition: 'all 0.5s ease' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: '#9ca3af', marginBottom: '1rem', lineHeight: 1.6 }}>{feature.description}</p>
                <span style={{ color: '#667eea', fontSize: '0.85rem', fontWeight: 600 }}>{feature.demo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '6rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Simple Pricing</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '3rem', fontSize: '1.1rem' }}>Start free. Scale as you grow.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {pricingPlans.map((plan, idx) => (
              <div key={idx} onMouseEnter={() => setHoveredPricing(idx)} onMouseLeave={() => setHoveredPricing(null)} style={{ background: plan.popular ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))' : 'rgba(255, 255, 255, 0.03)', border: plan.popular ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '2.5rem', transition: 'all 0.3s ease', transform: hoveredPricing === idx ? 'translateY(-5px)' : 'none', position: 'relative' }}>
                {plan.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '0.3rem 1.5rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{plan.price}</span>
                  <span style={{ color: '#9ca3af' }}>{plan.period}</span>
                </div>
                <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>{plan.description}</p>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#667eea' }}>✔</span> <span style={{ color: '#d1d5db' }}>{feature}</span>
                  </div>
                ))}
                <button onClick={handleStartTrial} style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem', borderRadius: '12px', border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)', background: plan.popular ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease' }}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Modal */}
      {showDemoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => { setShowDemoModal(false); setIsVideoPlaying(false); }}>
          <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowDemoModal(false); setIsVideoPlaying(false); }} style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            <video ref={videoRef} controls autoPlay style={{ width: '100%', borderRadius: '12px' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
              {DEMO_VIDEOS.map((video, idx) => (
                <button key={video.id} onClick={() => { setCurrentVideoIndex(idx); setIsVideoPlaying(true); }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: currentVideoIndex === idx ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.2)', background: currentVideoIndex === idx ? 'rgba(102,126,234,0.2)' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>{video.title}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>© 2024 RAG.AI. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        button:hover { transform: translateY(-2px); }
        a:hover { color: #667eea !important; }
      `}</style>
    </div>
  );
}
