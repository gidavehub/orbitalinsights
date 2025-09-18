// FILE: components/AnalysisDisplay.tsx
import React from 'react';
import { AnalysisResult } from '../app/page'; // Import the type
import ChartComponent from './ChartComponent';

type Source = AnalysisResult['sources'][0];

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onSourceClick: (source: Source) => void;
}

// --- SVG ICON COMPONENTS ---
const SectionHeader: React.FC<{ title: string, icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="text-cyan-400">{icon}</div>
    <h3 className="text-2xl font-semibold text-white">{title}</h3>
    <div className="flex-grow h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent ml-4"></div>
  </div>
);

// --- MAIN COMPONENT ---
const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onSourceClick }) => {
  return (
    <div className="p-6 md:p-8 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-inset ring-purple-500/20">
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-sky-300 via-indigo-400 to-purple-400 mb-10 drop-shadow-[0_0_15px_rgba(124,58,237,0.4)]">
        Analysis Report
      </h2>

      {/* Summary Section */}
      <div className="mb-12">
        <SectionHeader title="Executive Summary" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <p className="text-gray-300 text-lg whitespace-pre-wrap leading-relaxed">{result.summary}</p>
      </div>

      {/* Key Changes & Causes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
          <SectionHeader title="Key Visual Changes" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <ul className="space-y-3 text-gray-300">
            {result.keyChanges.map((change, index) => (
              <li key={index} className="flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-white/5 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeader title="Potential Causes" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} />
          <div className="space-y-4">
            {result.potentialCauses.map((item, index) => {
              const confidenceColor = item.confidence === 'High' ? 'lime' : item.confidence === 'Medium' ? 'amber' : 'rose';
              return (
                <div key={index} className={`p-4 rounded-lg border border-transparent transition-all duration-300 hover:border-${confidenceColor}-500/50 hover:bg-${confidenceColor}-900/20`}>
                  <span className={`font-bold text-lg text-${confidenceColor}-400`}>
                    {item.cause} (Confidence: {item.confidence})
                  </span>
                  <p className="text-gray-400 text-sm mt-1">{item.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Predictions */}
      <div className="mb-12">
        <SectionHeader title="Future Outlook & Predictions" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <p className="text-gray-300 text-lg whitespace-pre-wrap leading-relaxed">{result.predictions}</p>
      </div>

      {/* Charts & Data Visualization */}
      {result.charts && result.charts.length > 0 && (
        <div className="mb-12">
          <SectionHeader title="Quantitative Data Visualization" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.charts.map((chart, index) => <ChartComponent key={index} chartData={chart} />)}
          </div>
        </div>
      )}

      {/* Sources */}
      <div>
        <SectionHeader title="Sources & Further Reading" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>} />
        <div className="space-y-4">
          {result.sources.map((source, index) => (
            <div key={index} className="group p-4 bg-white/5 rounded-lg hover:bg-white/10 ring-1 ring-transparent hover:ring-cyan-400 transition-all duration-300 cursor-pointer flex justify-between items-center"
                 onClick={() => onSourceClick(source)}
            >
              <div>
                <span className="text-sky-400 font-semibold group-hover:underline">
                  {source.title}
                </span>
                <p className="text-gray-400 text-sm mt-1 italic">"{source.snippet}"</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-4 text-gray-500 group-hover:text-sky-300 transition-colors opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;