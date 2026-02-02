import React, { useState } from 'react';

const ParseDocumentsSection = () => {
  const [activeCard, setActiveCard] = useState(null);

  const documentTypes = [
    {
      id: 'invoices',
      icon: '📄',
      title: 'Invoices',
      description: 'Extract important invoice data, then integrate with your accounting system or download as a spreadsheet. Pull data such as reference number, dates, totals or line items.',
      features: ['Reference Numbers', 'Date Extraction', 'Total Amounts', 'Line Items'],
      link: 'https://docparser.com/solutions/pdf-invoice-parsing-api/',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
      id: 'purchase-orders',
      icon: '🛒',
      title: 'Purchase Orders',
      description: 'Extract purchase order data and move it directly to your order management system, accounting system or any endpoint of your choice.',
      features: ['Order Numbers', 'Vendor Details', 'Product Info', 'Quantities'],
      link: 'https://docparser.com/solutions/pdf-purchase-order-workflow-automation/',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      id: 'bank-statements',
      icon: '🏦',
      title: 'Bank Statements',
      description: 'Convert credit card and bank statements into spreadsheets such as Excel, or another format for your accounting system.',
      features: ['Transactions', 'Account Balances', 'Date Ranges', 'Categories'],
      link: 'https://docparser.com/solutions/process-bank-credit-card-statements/',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      id: 'contracts',
      icon: '📋',
      title: 'Contracts & Agreements',
      description: 'Extract recurring data from all types of legal agreements, such as rental & leasing contracts, warranty & insurance agreements or form based contracts.',
      features: ['Contract Dates', 'Party Names', 'Terms & Conditions', 'Signatures'],
      link: 'https://docparser.com/solutions/legal-documents/',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
      id: 'hr-forms',
      icon: '👥',
      title: 'HR Forms & Applications',
      description: 'Easily pull data HR forms, such as enrollment forms, application forms, reports, feedback forms, payroll or any other HR related documents and convert into an actionable format of your choice.',
      features: ['Enrollment Forms', 'Applications', 'Payroll Data', 'Feedback Forms'],
      link: 'https://docparser.com/solutions/hr-process-automation/',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      id: 'shipping-orders',
      icon: '📦',
      title: 'Shipping Orders & Delivery Notes',
      description: 'For brick & mortar stores, dropshipping businesses, or anything in between, automate processing of your delivery and shipping notes, including barcodes and QR codes.',
      features: ['Tracking Numbers', 'Barcodes/QR Codes', 'Delivery Addresses', 'Package Details'],
      link: 'https://docparser.com/solutions/shipping-delivery-reports/',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    {
      id: 'price-lists',
      icon: '💰',
      title: 'Product & Price Lists',
      description: 'Extract tables from PDF product lists and input to your POS, eCommerce site or even Excel. Even parsing scanned documents is easy with the built-in OCR PDF Scanner feature.',
      features: ['Product Names', 'Pricing Tables', 'SKU Numbers', 'OCR Support'],
      link: 'https://docparser.com/solutions/price-list-pdf-processing/',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      id: 'zonal-ocr',
      icon: '🎯',
      title: 'Zonal OCR',
      description: 'Drag a rectangle to outline the data area you\'d like to select. Perfect for extracting specific zones from any document type with precision and accuracy.',
      features: ['Zone Selection', 'OCR Technology', 'Flexible Parsing', 'Any Document Type'],
      link: 'https://docparser.com/features/',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
    }
  ];

  return (
    <>
      {/* Section Header */}
      <section style={{
        padding: '6rem 2rem 3rem',
        background: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#1f2937',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.6s ease'
          }}>
            Parse Your <span style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Documents</span>
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#6b7280',
            lineHeight: 1.8,
            maxWidth: '700px',
            margin: '0 auto',
            animation: 'fadeInUp 0.8s ease'
          }}>
            Choose from a selection of Docparser rules templates, or build your own custom document rules.
          </p>
        </div>
      </section>

      {/* Document Cards Grid */}
      <section style={{
        padding: '3rem 2rem 6rem',
        background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '2rem'
          }}>
            {documentTypes.map((doc, index) => (
              <div
                key={doc.id}
                onMouseEnter={() => setActiveCard(doc.id)}
                onMouseLeave={() => setActiveCard(null)}
                style={{
                  position: 'relative',
                  background: activeCard === doc.id 
                    ? `linear-gradient(135deg, ${doc.color}08, ${doc.color}15)`
                    : '#ffffff',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  border: activeCard === doc.id 
                    ? `2px solid ${doc.color}`
                    : '2px solid #e5e7eb',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: activeCard === doc.id ? 'translateY(-10px) scale(1.02)' : 'translateY(0)',
                  boxShadow: activeCard === doc.id 
                    ? `0 20px 40px ${doc.color}30`
                    : '0 4px 6px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  animation: `fadeInUp ${0.6 + index * 0.1}s ease`
                }}
              >
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: activeCard === doc.id 
                    ? `radial-gradient(circle, ${doc.color}15, transparent)`
                    : 'transparent',
                  borderRadius: '50%',
                  transition: 'all 0.4s ease',
                  transform: activeCard === doc.id ? 'scale(1.5)' : 'scale(1)',
                  opacity: activeCard === doc.id ? 1 : 0
                }} />

                {/* Icon Circle */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: activeCard === doc.id ? doc.gradient : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  marginBottom: '1.5rem',
                  transition: 'all 0.4s ease',
                  transform: activeCard === doc.id ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                  boxShadow: activeCard === doc.id 
                    ? `0 10px 30px ${doc.color}40`
                    : '0 4px 6px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {doc.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  marginBottom: '1rem',
                  lineHeight: 1.3,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {doc.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                  minHeight: '80px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {doc.description}
                </p>

                {/* Features List (visible on hover) */}
                <div style={{
                  maxHeight: activeCard === doc.id ? '200px' : '0',
                  opacity: activeCard === doc.id ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  marginBottom: activeCard === doc.id ? '1.5rem' : '0',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: `1px solid ${doc.color}30`
                  }}>
                    {doc.features.map((feature, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#374151',
                        fontWeight: 500
                      }}>
                        <span style={{ 
                          color: doc.color, 
                          fontSize: '1.1rem',
                          fontWeight: 700 
                        }}>✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learn More Button */}
                <a
                  href={doc.link}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1.75rem',
                    background: activeCard === doc.id ? doc.gradient : 'transparent',
                    color: activeCard === doc.id ? '#ffffff' : doc.color,
                    border: `2px solid ${doc.color}`,
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    if (activeCard !== doc.id) {
                      e.currentTarget.style.background = doc.gradient;
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCard !== doc.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = doc.color;
                    }
                  }}
                >
                  Learn More
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </a>

                {/* Popular Badge (for first card) */}
                {index === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: doc.gradient,
                    color: '#ffffff',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: `0 4px 15px ${doc.color}40`,
                    zIndex: 2
                  }}>
                    POPULAR
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            textAlign: 'center',
            marginTop: '4rem',
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            borderRadius: '24px',
            border: '2px solid rgba(102, 126, 234, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Don't see your document type?
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              We support 100+ document types. Create custom parsing rules for any document format.
            </p>
            <a
              href="https://docparser.com/features/"
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
                transition: 'all 0.3s ease'
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
              View All Features
              <span style={{ fontSize: '1.3rem' }}>→</span>
            </a>
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

        /* Responsive Grid */
        @media (max-width: 768px) {
          section {
            padding: 3rem 1rem !important;
          }
          
          [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default ParseDocumentsSection;