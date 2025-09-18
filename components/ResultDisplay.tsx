import React from 'react';

interface ResultsDisplayProps {
  results: {
    image: string; // The base64 data URL for the satellite image
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results || !results.image) {
    return null; // Don't render anything if there's no image
  }

  return (
    <div className="w-full max-w-4xl mt-8 p-4 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Satellite Image Result</h2>
      <div className="rounded-lg overflow-hidden">
        <img 
          src={results.image} 
          alt="Satellite view from Sentinel Hub" 
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default ResultsDisplay;