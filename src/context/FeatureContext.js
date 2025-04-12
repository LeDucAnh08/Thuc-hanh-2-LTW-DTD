import React, { createContext, useState, useContext } from 'react';

const FeatureContext = createContext();

export function FeatureProvider({ children }) {
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);

  const toggleAdvancedFeatures = () => {
    setAdvancedFeaturesEnabled(prev => !prev);
  };

  return (
    <FeatureContext.Provider 
      value={{ 
        advancedFeaturesEnabled, 
        toggleAdvancedFeatures 
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
} 