import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="text-center text-gray-300 animate-pulse">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
      <p className="text-xl">Agent is thinking...</p>
      <p className="text-md mt-2">Analyzing data, this may take a moment.</p>
    </div>
  );
};

export default LoadingState;