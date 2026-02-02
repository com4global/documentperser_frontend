import React from 'react';
// 1. Fixed the casing here (HeroSection)
import HeroSection from '../components/HeroSection'; 
import HowItWorksSection from '../components/HowItWorksSection';
import TrustBadgesAndAISection from '../components/TrustBadgesAndAISection';
import ParseDocumentsSection from '../components/ParseDocumentsSection';
import FeaturesTabsSection from '../components/FeaturesTabsSection';
import PricingSection from '../components/PricingSection'; 
import Footer from '../components/Footer';

const home = () => {
    // Debugging logs - if any of these show "undefined" or "{}", that's the broken file
    console.log("HeroSection:", HeroSection);
    console.log("TrustBadgesAndAISection:", TrustBadgesAndAISection);
    console.log("PricingSection:", PricingSection); 

  return (
    <div>
      {/* 2. Fixed the tag casing here */}
      <HeroSection />
      <HowItWorksSection />
      <TrustBadgesAndAISection />
      <ParseDocumentsSection />
      <FeaturesTabsSection />
      <PricingSection /> 
      <Footer />
    </div>
  );
};

export default home;