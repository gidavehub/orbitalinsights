// FILE: components/AnalysisDisplay.tsx
import React from 'react';
import { AnalysisResult } from '../app/page'; // Import the type
import ChartComponent from './ChartComponent';

type Source = AnalysisResult['sources'][0];

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onSourceClick: (source: Source) => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onSourceClick }) => {
  return (
    <div className="p-6 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-2xl animate-fade-in">
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-400 mb-6">
        Analysis Report
      </h2>

      {/* Summary Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white border-b-2 border-gray-600 pb-2 mb-4">Executive Summary</h3>
        <p className="text-gray-300 text-lg whitespace-pre-wrap">{result.summary}</p>
      </div>

      {/* Key Changes & Causes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-white border-b-2 border-gray-600 pb-2 mb-4">Key Visual Changes</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {result.keyChanges.map((change, index) => <li key={index}>{change}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white border-b-2 border-gray-600 pb-2 mb-4">Potential Causes</h3>
          {result.potentialCauses.map((item, index) => (
            <div key={index} className="mb-3">
              <span className={`font-bold text-lg ${item.confidence === 'High' ? 'text-green-400' : item.confidence === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                {item.cause} (Confidence: {item.confidence})
              </span>
              <p className="text-gray-400 text-sm">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Predictions */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white border-b-2 border-gray-600 pb-2 mb-4">Future Outlook & Predictions</h3>
        <p className="text-gray-300 text-lg whitespace-pre-wrap">{result.predictions}</p>
      </div>

      {/* Charts & Data Visualization */}
      {result.charts && result.charts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white border-b-2 border-gray-600 pb-2 mb-4">Quantitative Data Visualization</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {result.charts.map((chart, index) => <ChartComponent key={index} chartData={chart} />)}
          </div>
        </div>
      )}

      {/* Sources */}
      <div>
        <h3 className="text-2xl font-semibold text-white border-b-2 border-gray-600 pb-2 mb-4">Sources & Further Reading</h3>
        <div className="space-y-4">
          {result.sources.map((source, index) => (
            <div key={index} className="p-3 bg-gray-900 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
                 onClick={() => onSourceClick(source)}
            >
              <span className="text-blue-400 font-semibold hover:underline">
                {source.title}
              </span>
              <p className="text-gray-400 text-sm mt-1 italic">"{source.snippet}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;