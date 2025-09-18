// FILE: components/SourceModal.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      // Reset loading state for each new source
      setIsLoading(true); 
    }
  }, [source]);

  return (
    <AnimatePresence>
      {source && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-lg flex justify-center items-center z-50 p-4"
          onClick={onClose}
        >
          {/* Thematic Frame & Grand Entrance Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-gray-950/60 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/50 w-full h-full max-w-7xl flex flex-col overflow-hidden border border-white/10 ring-1 ring-inset ring-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Upgraded Header */}
            <div className="p-4 bg-black/30 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate" title={source.title}>{source.title}</h3>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline truncate block">
                    {source.url}
                  </a>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content Area with Loading State */}
            <div className="flex-1 relative bg-gray-900/50">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-gray-300"
                  >
                    {/* Consistent Loading Spinner */}
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 border-t-purple-400 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-2 border-cyan-500/50 border-t-cyan-300 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                    </div>
                    <p className="mt-4 text-lg">Loading article content...</p>
                    <p className="text-sm mt-1 text-gray-500">Note: Some websites may block embedded viewing.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <iframe
                src={source.url}
                title={source.title}
                className={`w-full h-full border-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SourceModal;