// FILE: components/SourceModal.tsx
import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../app/page';

type Source = AnalysisResult['sources'][0];

interface SourceModalProps {
  source: Source | null;
  onClose: () => void;
}

const SourceModal: React.FC<SourceModalProps> = ({ source, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (source) {
      setIsLoading(true);
    }
  }, [source]);

  if (!source) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-11/12 h-5/6 max-w-5xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate" title={source.title}>{source.title}</h3>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate block">
              {source.url} (Open in new tab)
            </a>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-300 bg-gray-800">
               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p>Loading article content...</p>
               <p className="text-sm mt-2">Note: Some websites may block embedded viewing.</p>
            </div>
          )}
          <iframe
            src={source.url}
            title={source.title}
            className={`w-full h-full border-none ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin" // Security enhancement for iframes
          />
        </div>
      </div>
    </div>
  );
};

export default SourceModal;