import React, { useState, useEffect } from 'react';

const TrustBadgesAndAISection = () => {
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const badges = [
    {
      id: 1,
      name: 'High Performer Spring 2021',
      image: 'https://docparser.com/wp-content/uploads/2021/05/medal-1.svg',
      link: 'https://www.g2.com/products/docparser/reviews?utm_source=rewards-badge',
      width: 100
    },
    {
      id: 2,
      name: 'Users Love Us',
      image: 'https://docparser.com/wp-content/uploads/2021/04/users-love-us-2008b519df49af90dcfa7db4b5fe13c8ec24ced0348f0a6bd039711ad8bbffc7.svg',
      link: 'https://www.g2.com/products/docparser/reviews?utm_source=rewards-badge',
      width: 100
    },
    {
      id: 3,
      name: 'Software Advice',
      image: 'https://docparser.com/wp-content/uploads/2026/01/software-advice-badge.svg',
      link: '#',
      width: 110
    },
    {
      id: 4,
      name: 'Capterra',
      image: 'https://docparser.com/wp-content/uploads/2021/04/acc4bec07ea40166dde2e298462ff233.png',
      link: 'https://www.capterra.com/reviews/154445/Docparser',
      width: 150
    },
    {
      id: 5,
      name: 'FinancesOnline',
      image: 'https://docparser.com/wp-content/uploads/2021/04/badge-finances-online-5-star-docparser-300x83.png',
      link: 'https://reviews.financesonline.com/p/docparser/',
      width: 200
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      {/* Trust Badges Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Optional Heading */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Trusted By Thousands
            </h3>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              margin: '0 auto',
              borderRadius: '2px'
            }}></div>
          </div>

          {/* Badges Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
            justifyItems: 'center'
          }}>
            {badges.map((badge, index) => (
              <a
                key={badge.id}
                href={badge.link}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredBadge(badge.id)}
                onMouseLeave={() => setHoveredBadge(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  background: hoveredBadge === badge.id ? '#ffffff' : 'transparent',
                  borderRadius: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredBadge === badge.id ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredBadge === badge.id 
                    ? '0 20px 40px rgba(102, 126, 234, 0.15)'
                    : '0 4px 6px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  opacity: isVisible ? 1 : 0,
                  animation: `fadeInUp ${0.5 + index * 0.1}s ease forwards`
                }}
              >
                <img
                  src={badge.image}
                  alt={badge.name}
                  style={{
                    width: `${badge.width}px`,
                    height: 'auto',
                    maxWidth: '100%',
                    filter: hoveredBadge === badge.id ? 'none' : 'grayscale(0.3)',
                    transition: 'filter 0.3s ease'
                  }}
                  loading="lazy"
                />
              </a>
            ))}
          </div>

          {/* Stats Bar (Optional Enhancement) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '4rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            borderRadius: '16px',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                4.8/5
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: 600 }}>
                ⭐ Average Rating
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                50K+
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: 600 }}>
                👥 Active Users
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                10M+
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: 600 }}>
                📄 Documents Processed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Feature Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f9fafb 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorations */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1), transparent)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1), transparent)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div style={{
              animation: 'fadeInLeft 0.8s ease'
            }}>
              {/* AI Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                padding: '0.5rem 1.5rem',
                borderRadius: '50px',
                marginBottom: '2rem',
                animation: 'pulse 3s infinite'
              }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  POWERED BY AI
                </span>
              </div>

              {/* Heading */}
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                color: '#1f2937',
                marginBottom: '1.5rem',
                lineHeight: 1.2
              }}>
                Unlock the Power<br />
                <span style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  of AI with Docparser
                </span>
              </h2>

              {/* Description */}
              <p style={{
                fontSize: '1.15rem',
                color: '#4b5563',
                lineHeight: 1.8,
                marginBottom: '2rem'
              }}>
                Introducing <strong style={{ 
                  color: '#667eea',
                  fontWeight: 700
                }}>DocparserAI</strong> – Our versatile, powerful AI engine that simplifies data extraction. Automate your document parsing, customize outputs to fit your needs, and enjoy seamless integration with your existing workflows.
              </p>

              {/* Features List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '2.5rem'
              }}>
                {[
                  { icon: '⚡', text: 'Lightning-fast processing' },
                  { icon: '🎯', text: '99% accuracy rate' },
                  { icon: '🔄', text: 'Seamless integration' },
                  { icon: '🛡️', text: 'Enterprise-grade security' }
                ].map((feature, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: `fadeInLeft ${0.8 + i * 0.1}s ease`
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      {feature.icon}
                    </div>
                    <span style={{
                      fontSize: '1rem',
                      color: '#374151',
                      fontWeight: 600
                    }}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <a
                href="https://docparser.com/ai/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
                }}
              >
                Learn More About AI
                <span style={{ fontSize: '1.3rem' }}>→</span>
              </a>
            </div>

            {/* Right Image */}
            <div style={{
              position: 'relative',
              animation: 'fadeInRight 1s ease'
            }}>
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                transform: 'perspective(1000px) rotateY(-5deg)',
                transition: 'transform 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) scale(1)';
              }}
              >
                <img
                  src="https://docparser.com/wp-content/uploads/2024/09/dpai-2x.png"
                  alt="DocparserAI Interface"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                  loading="lazy"
                />
                
                {/* Overlay Gradient */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent)',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* Floating Stats Cards */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '-20px',
                background: '#ffffff',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Processing Speed
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
                  ⚡ 10x faster
                </div>
              </div>

              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '-20px',
                background: '#ffffff',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                animation: 'float 3s ease-in-out infinite',
                animationDelay: '1s'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Accuracy Rate
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#667eea' }}>
                  🎯 99.9%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          section {
            padding: 3rem 1rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default TrustBadgesAndAISection;