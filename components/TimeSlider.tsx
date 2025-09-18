import React from 'react';

type TimeInterval = 'day' | 'month' | 'year';

interface TimeSliderProps {
  // The current offset from today (e.g., -10 means 10 intervals ago)
  offset: number; 
  // Function to update the offset when the slider moves
  onOffsetChange: (offset: number) => void; 
  // The current selected interval ('day', 'month', 'year')
  interval: TimeInterval;
  // Function to update the interval when a radio button is clicked
  onIntervalChange: (interval: TimeInterval) => void;
  // The calculated date, passed down for display purposes
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
      case 'day': return { min: -365 * 5, max: 0 }; // 5 years of days
      case 'month': return { min: -12 * 10, max: 0 }; // 10 years of months
      case 'year': return { min: -20, max: 0 }; // 20 years
      default: return { min: -100, max: 0 };
    }
  };
  
  const { min, max } = getSliderRange();

  return (
    <div className="w-full max-w-4xl p-4 bg-gray-800 border-2 border-gray-700 rounded-lg flex flex-col sm:flex-row items-center gap-4">
      {/* Interval Controls */}
      <div className="flex-shrink-0 flex items-center gap-4">
        <span className="font-semibold text-gray-300">Interval:</span>
        {(['Day', 'Month', 'Year'] as const).map((label) => {
          const value = label.toLowerCase() as TimeInterval;
          return (
            <label key={value} className="flex items-center space-x-2 cursor-pointer text-white">
              <input
                type="radio"
                name="interval"
                value={value}
                checked={interval === value}
                onChange={() => onIntervalChange(value)}
                className="form-radio h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>

      {/* Slider */}
      <div className="w-full flex-grow flex items-center gap-4">
         <input
          type="range"
          min={min}
          max={max}
          value={offset}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        {/* Date Display */}
        <div className="flex-shrink-0 w-32 text-center bg-gray-900 p-2 rounded-md">
           <span className="text-lg font-mono text-white">
             {currentDate.toLocaleDateString('en-CA')}
           </span>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;