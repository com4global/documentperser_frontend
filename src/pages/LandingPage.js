import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../Styles/AdminDashboard.css';

const DEMO_VIDEOS = [
  { id: 1, title: 'AI Lesson Demo', url: '/advertiseA.mp4' },
  { id: 2, title: 'Voice Q&A', url: '/advertiseb.mp4' },
  { id: 3, title: 'Classroom Mode', url: '/advertisec.mp4' }
];

export default function LandingPage() {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [hoveredPricing, setHoveredPricing] = useState(null);
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAuthenticated = !!session;

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
    { id: 'individual', name: 'Self-Paced Learning', price: 'Free', speed: 'Instant', features: ['Upload any document', 'AI-generated lessons', 'Voice Q&A', 'Smart quizzes'], color: '#10b981' },
    { id: 'classroom', name: 'Classroom Mode', price: 'For Schools', speed: 'Real-time', features: ['Teacher dashboard', 'Student progress tracking', 'Assignment management', 'Join via code'], color: '#3b82f6', popular: true },
    { id: 'web', name: 'Web Content', price: 'Built-in', speed: 'Fast', features: ['Paste any URL', 'Auto-extract text', 'Instant lessons', 'YouTube transcripts'], color: '#8b5cf6' },
    { id: 'multilingual', name: 'Multi-Language', price: 'Included', speed: 'Real-time', features: ['Tamil & English', 'Voice interaction', 'Localized UI', 'Cross-language Q&A'], color: '#f59e0b' }
  ];

  const features = [
    { icon: '🎓', title: 'AI Teacher', description: 'Upload any textbook or document and get interactive AI-generated lessons with two AI tutors', demo: 'Turn PDFs into live lessons' },
    { icon: '🎙️', title: 'Voice Q&A', description: 'Ask questions by voice during lessons and get instant spoken answers from the AI', demo: 'Hands-free learning' },
    { icon: '🧠', title: 'Smart Quizzes', description: 'Auto-generated quizzes after each topic to test comprehension and retention', demo: 'Adaptive difficulty' },
    { icon: '📊', title: 'Progress Tracking', description: 'Track every student\'s learning journey — lessons watched, quizzes scored, topics completed', demo: 'Real-time dashboards' },
    { icon: '👩‍🏫', title: 'Classroom Management', description: 'Teachers create classrooms, assign topics, and monitor student progress with join codes', demo: 'One code to join' },
    { icon: '🌐', title: 'Web & Video Content', description: 'Paste any URL or YouTube link — we extract the content and turn it into lessons', demo: 'Learn from the web' },
    { icon: '✂️', title: 'PDF Splitter', description: 'Extract specific pages or batch-split large PDFs into smaller files — download or vectorize instantly', demo: 'Split & conquer' }
  ];

  const pricingPlans = [
    {
      name: 'Free', price: '$0', period: '/mo', description: 'Get started, no credit card needed',
      features: ['10 MB document uploads', '200 RAG chunks', 'Basic AI chat', '1 document at a time'],
      cta: 'Start Free', popular: false, planKey: 'free',
      accent: '#64748b', gradient: 'linear-gradient(135deg,#334155,#1e293b)'
    },
    {
      name: 'Pro', price: '$25', period: '/mo', description: 'For professionals who need more power',
      features: ['100 MB document uploads', '2,000 RAG chunks', 'AI Teacher videos', 'Legal Analysis', 'Priority support'],
      cta: 'Upgrade to Pro', popular: false, planKey: 'pro',
      accent: '#6366f1', gradient: 'linear-gradient(135deg,#312e81,#1e1b4b)'
    },
    {
      name: 'Plus', price: '$60', period: '/mo', description: 'For power users and small teams',
      features: ['500 MB document uploads', '10,000 RAG chunks', 'All Pro features', 'Multiple document sessions', 'Advanced analytics'],
      cta: 'Upgrade to Plus', popular: true, planKey: 'plus',
      accent: '#8b5cf6', gradient: 'linear-gradient(135deg,#4c1d95,#2e1065)'
    },
    {
      name: 'Corporate', price: 'Custom', period: '', description: 'Tailored for enterprises & institutions',
      features: ['Unlimited uploads', 'Unlimited RAG chunks', 'All Plus features', 'SSO / SAML', 'Dedicated support & SLA', 'On-premise option', 'Custom branding'],
      cta: 'Contact Us', popular: false, planKey: 'corporate',
      accent: '#f59e0b', gradient: 'linear-gradient(135deg,#78350f,#451a03)'
    }
  ];

  const stats = [
    { value: '50K+', label: t('statsDocs') },
    { value: '10K+', label: t('statsUptime') },
    { value: '95%', label: t('statsResponse') },
    { value: '500+', label: t('statsUsers') }
  ];

  useEffect(() => {
    const interval = setInterval(() => { setCurrentFeature((prev) => (prev + 1) % features.length); }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0a0a', color: '#fff', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s ease', padding: '1rem 1.25rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)' }}>
              🎓
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('appName')}</span>
          </div>
          {/* Desktop Nav — hidden on mobile via inline style trick */}
          <div className="nav-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <LanguageSwitcher />
            <a href="#features" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>{t('navFeatures')}</a>
            <a href="#pricing" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>{t('navPricing')}</a>
            <a href="#docs" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>{t('navDocs')}</a>
            <button onClick={() => { if (isAuthenticated) { navigate('/chat'); } else { navigate('/login'); } }} style={{ background: 'none', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>{t('signIn')}</button>
            <button onClick={handleStartTrial} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>{t('startFree')} →</button>
          </div>
          {/* Mobile: just show Sign In + Start Free */}
          <div className="nav-mobile" style={{ display: 'none', gap: '0.5rem', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button onClick={handleStartTrial} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>{t('startFree')}</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      < section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.15), transparent 50%), radial-gradient(circle at 0% 100%, rgba(118, 75, 162, 0.15), transparent 50%)', position: 'relative', padding: '8rem 2rem 4rem' }
      }>
        <div style={{ maxWidth: '1400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '50px', marginBottom: '2rem', animation: 'fadeInDown 0.8s ease' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#667eea' }}>✨ NEW</span>
            <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>AI Teacher with Voice Q&A Now Live</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, #d1d5db 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'fadeInUp 1s ease' }}>
            {t('heroTitle').split(' ').slice(0, 2).join(' ')}<br />
            <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('heroTitle').split(' ').slice(2).join(' ')}</span>
          </h1>
          <p style={{ fontSize: '1.35rem', color: '#9ca3af', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6, animation: 'fadeInUp 1.2s ease' }}>
            {t('heroSubtitle')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem', animation: 'fadeInUp 1.4s ease' }}>
            <button onClick={() => { if (isAuthenticated) { navigate('/chat'); } else { navigate('/login'); } }} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('startFree')} <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
            <button onClick={() => { setShowDemoModal(true); setIsVideoPlaying(true); setCurrentVideoIndex(0); }} style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem 2.5rem', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>&#9654;</span> {t('watchDemo')}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeInUp 1.6s ease' }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Model Selection */}
      < section id="models" style={{ padding: '6rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('modelTitle')}</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '3rem', fontSize: '1.1rem' }}>{t('modelSubtitle')}</p>
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
      </section >

      {/* Features */}
      < section id="features" style={{ padding: '6rem 2rem', background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('featuresTitle')}</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '3rem', fontSize: '1.1rem' }}>{t('featuresSubtitle')}</p>
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
      </section >

      <section id="pricing" style={{ padding: '6rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1260px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('pricingTitle')}</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '3rem', fontSize: '1.1rem' }}>{t('pricingSubtitle')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPricing(idx)}
                onMouseLeave={() => setHoveredPricing(null)}
                style={{
                  background: plan.popular ? plan.gradient : 'rgba(255,255,255,0.03)',
                  border: plan.popular ? `2px solid ${plan.accent}` : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px', padding: '2.25rem 2rem',
                  transition: 'all 0.3s ease',
                  transform: hoveredPricing === idx ? 'translateY(-6px)' : 'none',
                  boxShadow: hoveredPricing === idx ? `0 20px 50px ${plan.accent}40` : 'none',
                  position: 'relative'
                }}
              >
                {plan.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${plan.accent}, #6d28d9)`, padding: '0.3rem 1.5rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                  {plan.planKey === 'free' ? '🆓' : plan.planKey === 'pro' ? '⚡' : plan.planKey === 'plus' ? '🚀' : '🏢'}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: 900, background: `linear-gradient(135deg, #fff, ${plan.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{plan.price}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{plan.period}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem', fontSize: '0.88rem', lineHeight: 1.5 }}>{plan.description}</p>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <span style={{ color: '#4ade80', fontWeight: 800, flexShrink: 0 }}>✓</span>
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{feature}</span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    if (plan.planKey === 'corporate') {
                      window.location.href = 'mailto:sales@zenzee.com?subject=Corporate Plan Inquiry';
                    } else {
                      handleStartTrial();
                    }
                  }}
                  style={{
                    width: '100%', marginTop: '1.5rem', padding: '0.875rem',
                    borderRadius: '12px',
                    border: plan.popular ? 'none' : `1px solid ${plan.accent}60`,
                    background: plan.popular ? plan.accent : plan.planKey === 'corporate' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                    color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: plan.popular ? `0 4px 20px ${plan.accent}60` : 'none'
                  }}
                >{plan.cta}</button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '2rem' }}>🔒 Secure payments via Stripe · Cancel anytime · INR pricing also available</p>
        </div>
      </section>


      {/* Demo Video Modal */}
      {
        showDemoModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
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
        )
      }

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('footerRights')}</p>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        button:hover { transform: translateY(-2px); }
        a:hover { color: #667eea !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </div >
  );
}
