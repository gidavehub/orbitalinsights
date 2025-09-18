// FILE: components/LoadingState.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// The useCyclingPhrases hook is no longer needed, as we'll receive the status message via props.

interface LoadingStateProps {
  statusMessage: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ statusMessage }) => {
  return (
    <div className="text-center text-gray-300 flex flex-col items-center gap-8">
      {/* The "Neural Network" Visual (Kept exactly as you provided) */}
      <div className="relative w-28 h-28">

        {/* --- PARTICLES BEHIND THE ORB (z-10) --- */}
        <div 
          className="absolute inset-[-10px] z-10" 
          style={{ animation: 'orbit 15s linear -2s infinite' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-[-5px] w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_theme(colors.purple.400)]"></div>
        </div>
        <div 
          className="absolute inset-[-2px] z-10" 
          style={{ animation: 'orbit 9s linear -1s infinite' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-[-1px] w-1.5 h-1.5 rounded-full bg-lime-300 shadow-[0_0_6px_theme(colors.lime.300)]"></div>
        </div>
        
        {/* --- CENTRAL ORB (z-20) --- */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cyan-500/50 shadow-[0_0_25px_theme(colors.cyan.400)] blur-md z-20"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        ></motion.div>

        {/* --- PARTICLES IN FRONT OF THE ORB (z-30) --- */}
        <div 
          className="absolute inset-0 z-30" 
          style={{ animation: 'orbit 4s linear infinite reverse' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_4px_white]"></div>
        </div>
        <div 
          className="absolute inset-[5px] z-30" 
          style={{ animation: 'orbit 5s linear infinite' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-[-2px] w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_theme(colors.cyan.300)]"></div>
        </div>
        <div 
          className="absolute inset-[-20px] z-30" 
          style={{ animation: 'orbit 12s linear -3s infinite reverse' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-[-10px] w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_theme(colors.amber.300)]"></div>
        </div>
        <div 
          className="absolute inset-[-8px] z-30" 
          style={{ animation: 'orbit 7s linear -0.5s infinite reverse' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-[-4px] w-1 h-1 rounded-full bg-purple-300 shadow-[0_0_6px_theme(colors.purple.300)]"></div>
        </div>
      </div>
      
      <div>
        <p className="text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Agent is thinking...</p>
        
        {/* Dynamic Text now displays the REAL status from the backend */}
        <div className="h-6 mt-1 text-gray-500 w-96 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusMessage} // Use the incoming message as the key for transitions
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {statusMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;