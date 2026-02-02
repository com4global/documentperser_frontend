import React from 'react';

const HeroSection = () => {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '4rem 2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />

      {/* Main Content */}
      <div style={{
        maxWidth: '900px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Main Heading */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '1.5rem',
          lineHeight: 1.2,
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)',
          animation: 'fadeInUp 0.8s ease'
        }}>
          Data Extraction From Your Business Documents
        </h1>

        {/* Subtitle/Description */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'rgba(255, 255, 255, 0.95)',
          marginBottom: '3rem',
          lineHeight: 1.6,
          maxWidth: '700px',
          margin: '0 auto 3rem',
          textShadow: '0 1px 10px rgba(0, 0, 0, 0.1)',
          animation: 'fadeInUp 1s ease'
        }}>
          Extract important data from Word, PDF, CSV, XLS, TXT, XML and image files. 
          Send to Excel, Google Sheets and 100's of other formats and integrations.
        </p>

        {/* CTA Buttons Container */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          animation: 'fadeInUp 1.2s ease'
        }}>
          {/* Primary CTA - Upload File */}
          <a
            href="https://app.docparser.com/account/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 2.5rem',
              background: '#ffffff',
              color: '#667eea',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            }}
          >
            <span style={{ marginRight: '0.5rem', fontSize: '1.3rem' }}>📄</span>
            Upload File
          </a>

          {/* Secondary CTA - See All Plans */}
          <a
            href="https://docparser.com/pricing/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 2.5rem',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '12px',
              textDecoration: 'none',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            <span style={{ marginRight: '0.5rem', fontSize: '1.3rem' }}>💳</span>
            See All Plans
          </a>
        </div>

        {/* No Credit Card Required Text */}
        <p style={{
          fontSize: '0.95rem',
          color: 'rgba(255, 255, 255, 0.85)',
          fontWeight: 500,
          animation: 'fadeInUp 1.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          No credit card required
        </p>

        {/* Trust Badges (Optional Enhancement) */}
        <div style={{
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          opacity: 0.9,
          animation: 'fadeInUp 1.6s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            SOC 2 Compliant
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            Lightning Fast
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '1.5rem' }}>🌍</span>
            100+ Integrations
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          section {
            padding: 2rem 1rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;