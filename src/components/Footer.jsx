import React from 'react';

// Import all your section components
// import HeroSection from './components/HeroSection';
// import HowItWorksSection from './components/HowItWorksSection';
// import TrustBadgesAndAISection from './components/TrustBadgesAndAISection';
// import ParseDocumentsSection from './components/ParseDocumentsSection';
// import FeaturesTabsSection from './components/FeaturesTabsSection';

const Footer = () => {
  const footerSections = {
    product: {
      title: 'Product',
      links: [
        { label: 'Features', url: 'https://docparser.com/features/' },
        { label: 'Pricing', url: 'https://docparser.com/pricing/' },
        { label: 'Solutions', url: 'https://docparser.com/solutions/' },
        { label: 'API Documentation', url: 'https://docparser.com/api/' },
        { label: 'Integrations', url: 'https://docparser.com/integrations/' }
      ]
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About Us', url: 'https://docparser.com/about/' },
        { label: 'Blog', url: 'https://docparser.com/blog/' },
        { label: 'Customers', url: 'https://docparser.com/customers/' },
        { label: 'Careers', url: 'https://docparser.com/careers/' },
        { label: 'Contact', url: 'https://docparser.com/contact/' }
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Help Center', url: 'https://docparser.com/help/' },
        { label: 'Tutorials', url: 'https://docparser.com/tutorials/' },
        { label: 'Templates', url: 'https://docparser.com/templates/' },
        { label: 'Case Studies', url: 'https://docparser.com/case-studies/' },
        { label: 'Status', url: 'https://status.docparser.com/' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', url: 'https://docparser.com/privacy/' },
        { label: 'Terms of Service', url: 'https://docparser.com/terms/' },
        { label: 'Cookie Policy', url: 'https://docparser.com/cookies/' },
        { label: 'GDPR', url: 'https://docparser.com/gdpr/' },
        { label: 'Security', url: 'https://docparser.com/security/' }
      ]
    }
  };

  return (
    <footer style={{
      background: 'linear-gradient(to bottom, #1f2937, #111827)',
      color: '#ffffff',
      padding: '4rem 2rem 2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Footer Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Section */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '45px',
                height: '45px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}>
                🚀
              </div>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Zenzee
              </span>
            </div>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              Enterprise AI-powered document parsing and data extraction platform
            </p>

            {/* Social Links */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              {[
                { icon: '𝕏', url: 'https://twitter.com/docparser' },
                { icon: 'in', url: 'https://linkedin.com/company/docparser' },
                { icon: '📘', url: 'https://facebook.com/docparser' },
                { icon: '▶', url: 'https://youtube.com/docparser' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#9ca3af';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {section.title}
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {section.links.map((link, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem' }}>
                    <a
                      href={link.url}
                      style={{
                        color: '#9ca3af',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        transition: 'color 0.2s ease',
                        display: 'inline-block'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#667eea';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                Stay Updated
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.95rem'
              }}>
                Get the latest updates on new features and integrations
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: '0.875rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button style={{
                padding: '0.875rem 2rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                whiteSpace: 'nowrap'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            © 2024 Zenzee. All rights reserved.
          </div>
          <div style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <a href="#privacy" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>
              Privacy
            </a>
            <a href="#terms" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>
              Terms
            </a>
            <a href="#cookies" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>
              Cookies
            </a>
            <a href="#sitemap" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;