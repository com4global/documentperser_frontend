import React, { useState, useEffect } from 'react';

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const steps = [
    {
      number: 1,
      title: 'Upload / Import Document',
      description: 'Either upload your document directly, connect to cloud storage (Dropbox, Box, Google Drive, OneDrive), email your files as attachments or use the REST API.',
      icon: '📤',
      color: '#667eea',
      features: ['Direct Upload', 'Cloud Storage', 'Email Import', 'REST API']
    },
    {
      number: 2,
      title: 'Define Rules',
      description: 'Train Docparser to extract the data you need, with zero coding. Select preset rules specific to your PDF or image document, using options that fit your document type.',
      icon: '⚙️',
      color: '#764ba2',
      features: ['No Coding', 'Preset Rules', 'Custom Options', 'Pattern Recognition']
    },
    {
      number: 3,
      title: 'Download / Export Data',
      description: 'Either download directly to Excel, CSV, JSON, or XML formats, or connect Docparser to thousands of cloud applications, such as Zapier, Workato, MS Power Automate and more.',
      icon: '📊',
      color: '#10b981',
      features: ['Excel/CSV Export', 'JSON/XML', 'Zapier', '1000+ Integrations']
    }
  ];

  // Auto-rotate steps every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Video Demo Section */}
      <section style={{
        padding: '4rem 2rem',
        background: '#f9fafb',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            background: '#000',
            cursor: 'pointer'
          }}
          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
          >
            <video
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              src="https://docparser.com/wp-content/uploads/2021/05/how-docparser-works.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            
            {/* Play Overlay (shows when paused) */}
            {!isVideoPlaying && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(102, 126, 234, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: '#fff',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
                  animation: 'pulse 2s infinite'
                }}>
                  ▶
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Header */}
      <section style={{
        padding: '5rem 2rem 3rem',
        background: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#1f2937',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.6s ease'
          }}>
            How it <span style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Works</span>
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#6b7280',
            lineHeight: 1.8,
            maxWidth: '800px',
            margin: '0 auto',
            animation: 'fadeInUp 0.8s ease'
          }}>
            Docparser identifies and extracts data from Word, PDF, and image-based documents using Zonal OCR technology, advanced pattern recognition, and the help of anchor keywords. There are 3 steps to set up your <strong style={{ color: '#667eea' }}>document parser</strong>.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section style={{
        padding: '3rem 2rem 6rem',
        background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Desktop View - Three Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {steps.map((step, index) => (
              <div
                key={step.number}
                onMouseEnter={() => setActiveStep(index)}
                style={{
                  background: activeStep === index 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
                    : '#ffffff',
                  borderRadius: '24px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  border: activeStep === index 
                    ? `2px solid ${step.color}`
                    : '2px solid #e5e7eb',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: activeStep === index ? 'translateY(-10px) scale(1.02)' : 'translateY(0)',
                  boxShadow: activeStep === index 
                    ? `0 20px 40px ${step.color}30`
                    : '0 4px 6px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  position: 'relative',
                  animation: `fadeInUp ${0.6 + index * 0.2}s ease`
                }}
              >
                {/* Step Number Badge */}
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: activeStep === index 
                    ? `linear-gradient(135deg, ${step.color}, ${step.color}dd)`
                    : '#e5e7eb',
                  color: activeStep === index ? '#fff' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  margin: '0 auto 1.5rem',
                  boxShadow: activeStep === index 
                    ? `0 10px 30px ${step.color}40`
                    : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.4s ease',
                  transform: activeStep === index ? 'scale(1.1)' : 'scale(1)'
                }}>
                  {step.number}
                </div>

                {/* Icon */}
                <div style={{
                  fontSize: '3.5rem',
                  marginBottom: '1.5rem',
                  transition: 'transform 0.3s ease',
                  transform: activeStep === index ? 'scale(1.1)' : 'scale(1)'
                }}>
                  {step.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  marginBottom: '1rem',
                  lineHeight: 1.3
                }}>
                  {step.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem'
                }}>
                  {step.description}
                </p>

                {/* Features List (shows on hover) */}
                {activeStep === index && (
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e5e7eb',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '1.5rem'
                    }}>
                      {step.features.map((feature, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          <span style={{ color: step.color, fontSize: '1.2rem' }}>✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learn More Button */}
                <a
                  href="https://docparser.com/features/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 2rem',
                    background: activeStep === index 
                      ? step.color
                      : 'transparent',
                    color: activeStep === index ? '#fff' : step.color,
                    border: `2px solid ${step.color}`,
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    marginTop: activeStep === index ? '0' : '1rem'
                  }}
                  onMouseEnter={(e) => {
                    if (activeStep !== index) {
                      e.currentTarget.style.background = step.color;
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeStep !== index) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = step.color;
                    }
                  }}
                >
                  Learn More
                  <span style={{ fontSize: '1.2rem' }}>+</span>
                </a>

                {/* Active Indicator */}
                {activeStep === index && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: '#fff',
                    boxShadow: `0 4px 15px ${step.color}50`,
                    animation: 'pulse 2s infinite'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '3rem'
          }}>
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                style={{
                  width: activeStep === index ? '50px' : '15px',
                  height: '15px',
                  borderRadius: '10px',
                  background: activeStep === index 
                    ? `linear-gradient(135deg, ${step.color}, ${step.color}dd)`
                    : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  boxShadow: activeStep === index 
                    ? `0 4px 15px ${step.color}40`
                    : 'none'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

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

export default HowItWorksSection;