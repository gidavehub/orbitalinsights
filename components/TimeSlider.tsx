// FILE: components/TimeSlider.tsx
import React from 'react';
import { motion } from 'framer-motion';

type TimeInterval = 'day' | 'month' | 'year';
const INTERVALS: { label: string, value: TimeInterval }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

interface TimeSliderProps {
  offset: number; 
  onOffsetChange: (offset: number) => void; 
  interval: TimeInterval;
  onIntervalChange: (interval: TimeInterval) => void;
  currentDate: Date;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ 
  offset, 
  onOffsetChange,
  interval,
  onIntervalChange,
  currentDate 
}) => {

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOffsetChange(parseInt(e.target.value, 10));
  };

  const getSliderRange = () => {
    switch(interval) {
      case 'day': return { min: -365 * 5, max: 0 };
      case 'month': return { min: -12 * 10, max: 0 };
      case 'year': return { min: -20, max: 0 };
      default: return { min: -100, max: 0 };
    }
  };
  
  const { min, max } = getSliderRange();

  return (
    <div className="w-full p-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col sm:flex-row items-center gap-6 shadow-lg">
      {/* Pill-style Segmented Control */}
      <div className="relative flex-shrink-0 flex items-center gap-2 p-1 bg-black/40 rounded-full">
        {INTERVALS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onIntervalChange(value)}
            className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              interval === value ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
            {interval === value && (
              <motion.div
                layoutId="activeInterval"
                className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full shadow-md"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="w-full flex-grow flex items-center gap-4">
         <input
          type="range"
          min={min}
          max={max}
          value={offset}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer time-slider"
        />
        {/* Holographic Date Display */}
        <div className="flex-shrink-0 w-32 text-center bg-gray-950/70 p-2 rounded-md ring-1 ring-inset ring-white/20">
           <span className="text-lg font-mono text-cyan-300" style={{ textShadow: '0 0 5px rgba(34, 211, 238, 0.4)' }}>
             {currentDate.toLocaleDateString('en-CA')}
           </span>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;