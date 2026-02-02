import React, { useState } from 'react';

const FeaturesTabsSection = () => {
  const [activeTab, setActiveTab] = useState('finance');

  const tabs = [
    { id: 'finance', label: 'Finance & Accounting', icon: '💰' },
    { id: 'business', label: 'Business Documents', icon: '📊' },
    { id: 'custom', label: 'Build Your Own', icon: '🛠️' }
  ];

  const features = {
    finance: [
      {
        icon: '📄',
        title: 'Invoices',
        description: 'Extract important invoice data, then integrate with your accounting system or download as a spreadsheet. Pull data such as reference number, dates, totals or line items.',
        link: 'https://docparser.com/solutions/pdf-invoice-parsing-api'
      },
      {
        icon: '🛒',
        title: 'Purchase Orders',
        description: 'Extract purchase order data and move it directly to your order management system, accounting system or any endpoint of your choice.',
        link: 'https://docparser.com/solutions/pdf-purchase-order-workflow-automation/'
      },
      {
        icon: '🏦',
        title: 'Bank Statements',
        description: 'Convert credit card and bank statements into spreadsheets such as Excel, or another format for your accounting system.',
        link: 'https://docparser.com/solutions/process-bank-credit-card-statements/'
      },
      {
        icon: '💰',
        title: 'Product & Price Lists',
        description: 'Extract tables from PDF product lists and input to your POS, eCommerce site or even Excel.',
        link: 'https://docparser.com/solutions/price-list-pdf-processing/'
      }
    ],
    business: [
      {
        icon: '📋',
        title: 'Contracts & Agreements',
        description: 'Extract recurring data from all types of legal agreements, such as rental & leasing contracts, warranty & insurance agreements.',
        link: 'https://docparser.com/solutions/legal-documents/'
      },
      {
        icon: '👥',
        title: 'HR Forms & Applications',
        description: 'Easily pull data HR forms, such as enrollment forms, application forms, reports, feedback forms, payroll documents.',
        link: 'https://docparser.com/solutions/hr-process-automation/'
      },
      {
        icon: '📦',
        title: 'Shipping & Delivery',
        description: 'Automate processing of your delivery and shipping notes, including barcodes and QR codes.',
        link: 'https://docparser.com/solutions/shipping-delivery-reports/'
      },
      {
        icon: '🧾',
        title: 'Receipts & Expenses',
        description: 'Automatically extract data from receipts for expense tracking and reimbursement processing.',
        link: 'https://docparser.com/solutions/'
      }
    ],
    custom: [
      {
        icon: '🎯',
        title: 'Zonal OCR',
        description: 'Drag a rectangle to outline the data area you\'d like to select for precise data extraction.',
        link: 'https://docparser.com/features/'
      },
      {
        icon: '📊',
        title: 'Extract Table Data',
        description: 'Define rows/columns by dragging/dropping column dividers into place for table extraction.',
        link: 'https://docparser.com/features/'
      },
      {
        icon: '🖼️',
        title: 'Scanned Image Preprocessing',
        description: 'Deskew images, remove scanning artifacts and other image imperfections automatically.',
        link: 'https://docparser.com/features/'
      },
      {
        icon: '☑️',
        title: 'Checkboxes & Radio Buttons',
        description: 'Form data responses are recognized and the responses extracted automatically.',
        link: 'https://docparser.com/features/'
      },
      {
        icon: '🔲',
        title: 'Barcode & QR Code',
        description: 'Process Barcode and QR-codes with the built-in scanner for instant data capture.',
        link: 'https://docparser.com/features/'
      }
    ]
  };

  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Template <span style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Types</span>
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Choose from pre-built templates or create custom parsing rules
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '3rem',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          maxWidth: '800px',
          margin: '0 auto 3rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1.25rem 2rem',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#6b7280',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: activeTab === tab.id 
                  ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                  : 'none',
                transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          position: 'relative',
          minHeight: '500px'
        }}>
          {Object.entries(features).map(([key, featureList]) => (
            <div
              key={key}
              style={{
                display: activeTab === key ? 'grid' : 'none',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
                animation: activeTab === key ? 'fadeIn 0.5s ease' : 'none'
              }}
            >
              {featureList.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '2rem',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    animation: `slideUp ${0.3 + index * 0.1}s ease`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    marginBottom: '1.5rem',
                    transition: 'transform 0.3s ease'
                  }}>
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: '1rem',
                    lineHeight: 1.3
                  }}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                    minHeight: '80px'
                  }}>
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <a
                    href={feature.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      transition: 'gap 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.gap = '1rem';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.gap = '0.5rem';
                    }}
                  >
                    Learn More
                    <span style={{ fontSize: '1.2rem' }}>→</span>
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div style={{
          marginTop: '5rem',
          textAlign: 'center',
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
            Ready to automate your document processing?
          </h3>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join thousands of businesses using Docparser to extract data from documents automatically
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="https://app.docparser.com/account/signup"
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
              Get Started Free
              <span style={{ fontSize: '1.3rem' }}>→</span>
            </a>
            <a
              href="https://docparser.com/pricing/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2.5rem',
                background: 'transparent',
                color: '#667eea',
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: '12px',
                textDecoration: 'none',
                border: '2px solid #667eea',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#667eea';
              }}
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          section {
            padding: 3rem 1rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesTabsSection;