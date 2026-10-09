import React, { createContext, useContext, useState, useEffect } from 'react';

const ResultContext = createContext();

export const ResultProvider = ({ children }) => {
  const [resultData, setResultData] = useState(() => {
    const saved = sessionStorage.getItem('tp_resultData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse result data", e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (resultData) {
      sessionStorage.setItem('tp_resultData', JSON.stringify(resultData));
    } else {
      sessionStorage.removeItem('tp_resultData');
    }
  }, [resultData]);

  const setAnalysisResult = (originalInput, analysisResult) => {
    setResultData({
      originalInput,
      analysisResult,
      timestamp: new Date().toISOString()
    });
  };

  const clearResult = () => {
    setResultData(null);
  };

  return (
    <ResultContext.Provider value={{ resultData, setAnalysisResult, clearResult }}>
      {children}
    </ResultContext.Provider>
  );
};

export const useResult = () => {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResult must be used within a ResultProvider");
  }
  return context;
};
