import React, { useState } from 'react';

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      icon: '🚀',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        '1,000 pages/month',
        'All document types',
        'Basic OCR',
        'Email support',
        '5 parsing rules',
        'REST API access',
        '30-day data retention'
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: '#10b981'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing teams and businesses',
      icon: '💼',
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        '10,000 pages/month',
        'All document types',
        'Advanced OCR + AI',
        'Priority support',
        'Unlimited parsing rules',
        'REST API + Webhooks',
        '90-day data retention',
        'Custom integrations',
        'Team collaboration'
      ],
      cta: 'Start Free Trial',
      popular: true,
      color: '#667eea'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      icon: '🏢',
      monthlyPrice: null,
      yearlyPrice: null,
      customPricing: true,
      features: [
        'Unlimited pages',
        'All document types',
        'Premium AI models',
        '24/7 dedicated support',
        'Unlimited parsing rules',
        'Full API access',
        'Unlimited data retention',
        'Custom integrations',
        'SLA guarantee',
        'On-premise deployment',
        'White-label solution',
        'Dedicated account manager'
      ],
      cta: 'Contact Sales',
      popular: false,
      color: '#8b5cf6'
    }
  ];

  const getPrice = (plan) => {
    if (plan.customPricing) return 'Custom';
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    if (plan.customPricing) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
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
            Simple, <span style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Transparent</span> Pricing
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Start free, scale as you grow. No hidden fees.
          </p>

          {/* Billing Toggle */}
          <div style={{
            display: 'inline-flex',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '0.75rem 2rem',
                background: billingCycle === 'monthly' 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                  : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '0.75rem 2rem',
                background: billingCycle === 'yearly' 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                  : 'transparent',
                color: billingCycle === 'yearly' ? '#ffffff' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              Yearly
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '0.7rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '10px',
                fontWeight: 700
              }}>
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {plans.map((plan, index) => {
            const savings = getSavings(plan);
            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  position: 'relative',
                  background: plan.popular 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
                    : '#ffffff',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  border: plan.popular 
                    ? '2px solid #667eea'
                    : hoveredPlan === plan.id ? `2px solid ${plan.color}` : '2px solid #e5e7eb',
                  transition: 'all 0.4s ease',
                  transform: hoveredPlan === plan.id ? 'translateY(-10px) scale(1.02)' : 'translateY(0)',
                  boxShadow: hoveredPlan === plan.id 
                    ? `0 20px 40px ${plan.color}30`
                    : plan.popular ? '0 10px 30px rgba(102, 126, 234, 0.15)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
                  animation: `fadeInUp ${0.5 + index * 0.1}s ease`
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#ffffff',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}>
                    MOST POPULAR
                  </div>
                )}

                {/* Icon */}
                <div style={{
                  fontSize: '3.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  {plan.icon}
                </div>

                {/* Plan Name */}
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>
                  {plan.name}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.95rem',
                  color: '#6b7280',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  minHeight: '40px'
                }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    color: plan.color,
                    marginBottom: '0.5rem'
                  }}>
                    {plan.customPricing ? (
                      'Custom'
                    ) : (
                      <>
                        ${getPrice(plan)}
                        <span style={{
                          fontSize: '1.5rem',
                          fontWeight: 600,
                          color: '#6b7280'
                        }}>
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'yearly' && savings && (
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#10b981',
                      fontWeight: 600
                    }}>
                      💰 Save ${savings.amount}/year ({savings.percentage}% off)
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 2rem 0'
                }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.95rem',
                      color: '#374151'
                    }}>
                      <span style={{
                        color: plan.color,
                        fontSize: '1.2rem',
                        fontWeight: 700
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button style={{
                  width: '100%',
                  padding: '1rem',
                  background: plan.popular 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : hoveredPlan === plan.id ? plan.color : 'transparent',
                  color: plan.popular || hoveredPlan === plan.id ? '#ffffff' : plan.color,
                  border: `2px solid ${plan.color}`,
                  borderRadius: '12px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: plan.popular || hoveredPlan === plan.id 
                    ? `0 10px 25px ${plan.color}30` 
                    : 'none'
                }}>
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div style={{
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
            All plans include
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {[
              { icon: '🔒', text: 'Bank-level encryption' },
              { icon: '⚡', text: 'Lightning-fast processing' },
              { icon: '🌍', text: '100+ integrations' },
              { icon: '📊', text: 'Real-time analytics' },
              { icon: '🔄', text: 'Automatic updates' },
              { icon: '💳', text: 'No credit card required' }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                justifyContent: 'center',
                fontSize: '1rem',
                color: '#374151',
                fontWeight: 600
              }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
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
      `}</style>
    </section>
  );
};

export default PricingSection;