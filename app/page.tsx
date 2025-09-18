// FILE: app/page.tsx

'use client';
import React, { useState, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import SearchBar from '../components/SearchBar';
import LoadingState from '../components/LoadingState';
import TimeSlider from '../components/TimeSlider';
import AnalysisDisplay from '../components/AnalysisDisplay';
import SourceModal from '../components/SourceModal'; // Import the new modal
import { LatLngBoundsExpression, LatLngExpression } from 'leaflet';

const InteractiveMap = dynamic(() => import('../components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[60vh] bg-gray-800 rounded-lg flex items-center justify-center"><LoadingState /></div>
});

// --- TYPE DEFINITIONS ---
interface MapConfig {
  bounds: LatLngBoundsExpression;
  instanceId: string;
}
type TimeInterval = 'day' | 'month' | 'year';

// Expanded types for better data handling
type ChartType = 'bar' | 'pie' | 'line';
interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any; // Allow for multi-bar/line charts
}
interface Chart {
  type: ChartType;
  title: string;
  data: ChartDataPoint[];
}
interface Source {
  title: string;
  url: string;
  snippet: string;
}
export interface AnalysisResult {
  summary: string;
  keyChanges: string[];
  potentialCauses: Array<{ cause: string; explanation: string; confidence: 'Low' | 'Medium' | 'High'; }>;
  predictions: string;
  charts: Chart[];
  sources: Source[];
}

// --- HELPER FUNCTIONS ---
const calculateDateFromOffset = (offset: number, interval: TimeInterval): Date => {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0); 
  if (interval === 'day') date.setUTCDate(date.getUTCDate() + offset);
  else if (interval === 'month') date.setUTCMonth(date.getUTCMonth() + offset);
  else if (interval === 'year') date.setUTCFullYear(date.getUTCFullYear() + offset);
  return date;
};

const DEFAULT_VIEW = { center: [25.2048, 55.2708] as LatLngExpression, zoom: 10 };

// --- MAIN PAGE COMPONENT ---
const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('year');
  const [timeOffset, setTimeOffset] = useState<number>(-5); // Default to a 5-year difference
  const [view, setView] = useState(DEFAULT_VIEW);
  const [mapKey, setMapKey] = useState(0); // <-- FIX 1: Add state for map key

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // State for the source modal
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  const historicalDate = useMemo(() => calculateDateFromOffset(timeOffset, timeInterval), [timeOffset, timeInterval]);
  const [currentDate] = useState(new Date());

  const handleSearch = async (searchPrompt: string) => {
    setIsLoading(true);
    setIsAnalyzing(true);
    setMapConfig(null);
    setError(null);
    setAnalysisResult(null);
    setAnalysisError(null);

    // --- Part 1: Fetch Map Configuration ---
    try {
      const mapResponse = await fetch('/api/map-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: searchPrompt }),
      });
      const mapData = await mapResponse.json();
      if (!mapResponse.ok) {
        throw new Error(mapData.error || `API Error: ${mapResponse.statusText}`);
      }
      setMapConfig(mapData);
      setMapKey(prev => prev + 1); // <-- FIX 2: Increment key to force remount
      setIsLoading(false);

      // --- Part 2: AUTOMATICALLY Trigger Analysis ---
      try {
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              prompt: searchPrompt,
              bounds: mapData.bounds,
              instanceId: mapData.instanceId,
              historicalDate: historicalDate.toISOString(),
              currentDate: currentDate.toISOString()
          }),
        });
        const analysisData = await analysisResponse.json();
        if (!analysisResponse.ok) {
          throw new Error(analysisData.error || `Analysis API Error`);
        }
        setAnalysisResult(analysisData);
      } catch (analysisErr: any) {
        setAnalysisError(analysisErr.message || "An unknown error occurred during analysis.");
      } finally {
        setIsAnalyzing(false);
      }

    } catch (mapErr: any) {
      setError(mapErr.message || "An unknown error occurred.");
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };
  
  const handleViewChange = (center: LatLngExpression, zoom: number) => { setView({ center, zoom }); };
  const handleSourceClick = (source: Source) => { setSelectedSource(source); };
  const handleCloseModal = () => { setSelectedSource(null); };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <Head><title>Orbital Insights</title></Head>
      <header className="text-center mb-8">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Orbital Insights
        </h1>
        <p className="mt-2 text-lg text-gray-400">Your direct link to interactive satellite intelligence.</p>
      </header>
      
      <main className="w-full flex flex-col items-center gap-4">
        <SearchBar onSearch={handleSearch} isLoading={isLoading || isAnalyzing} />

        <div className="mt-4 w-full flex justify-center">
          {(isLoading || isAnalyzing) && <LoadingState />}
          {error && <p className="text-red-500 text-center">Initial Search Error: {error}</p>}
        </div>

        {mapConfig && (
          <div className="w-full max-w-[90rem] grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex-grow h-[60vh] lg:h-[65vh]">
                <InteractiveMap 
                  key={`map-left-${mapKey}`} // <-- FIX 3: Apply the key
                  bounds={mapConfig.bounds} instanceId={mapConfig.instanceId}
                  date={historicalDate} center={view.center} zoom={view.zoom}
                  onViewChange={handleViewChange}
                />
              </div>
              <TimeSlider 
                offset={timeOffset} onOffsetChange={setTimeOffset}
                interval={timeInterval} onIntervalChange={setTimeInterval}
                currentDate={historicalDate}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex-grow h-[60vh] lg:h-[65vh]">
                <InteractiveMap 
                  key={`map-right-${mapKey}`} // <-- FIX 4: Apply the key here too
                  bounds={mapConfig.bounds} instanceId={mapConfig.instanceId}
                  date={currentDate} center={view.center} zoom={view.zoom}
                  onViewChange={handleViewChange}
                />
              </div>
              <div className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-center">
                <span className="text-lg font-mono text-white">
                  Latest Available Image ({currentDate.toLocaleDateString('en-CA')})
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-[90rem] mt-6">
          {analysisError && <p className="text-red-500 text-center text-xl">Analysis Error: {analysisError}</p>}
          {analysisResult && <AnalysisDisplay result={analysisResult} onSourceClick={handleSourceClick} />}
        </div>
      </main>

      {/* Render the modal outside the main flow */}
      <SourceModal source={selectedSource} onClose={handleCloseModal} />

      <footer className="mt-auto pt-8 text-center text-gray-500">
        <p>Powered by Next.js, Sentinel Hub, and Gemini 1.5 Pro</p>
      </footer>
    </div>
  );
};

export default Home;