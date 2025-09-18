import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSearch(prompt.trim());
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      {/* Interactive Aurora background */}
      <div
        className="absolute -inset-2.5 -z-10 rounded-full bg-gradient-to-r 
          from-cyan-500 via-purple-500 to-orange-500 opacity-20 blur-2xl 
          transition-all duration-1000 ease-in-out 
          group-hover:opacity-40 group-hover:blur-3xl 
          group-focus-within:opacity-50 group-focus-within:blur-3xl"
      ></div>

      {/* Animated Focus Frame */}
      <div
        className="absolute -inset-0.5 -z-10 rounded-full bg-gradient-to-r 
          from-cyan-400 to-purple-500 opacity-0 
          transition-opacity duration-500 ease-in-out 
          group-focus-within:opacity-100"
      ></div>

      <form onSubmit={handleSearch} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Show me deforestation in the Amazon rainforest between 2010 and today..."
            className="w-full p-4 pl-6 pr-20 text-lg text-white bg-black/80 backdrop-blur-xl 
              border border-transparent rounded-full caret-cyan-400
              placeholder:text-gray-500/80
              focus:outline-none focus:border-white/20
              transition-all duration-500 shadow-lg shadow-black/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2.5 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-400/80 to-violet-500/80 rounded-full shadow-md outline-none hover:from-cyan-400 hover:to-violet-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-400/30 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-cyan-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none transition-all duration-300 ease-in-out"
            disabled={isLoading}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Loading Spinner
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                </motion.div>
              ) : (
                // Search Icon
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;