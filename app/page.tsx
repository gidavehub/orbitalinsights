// FILE: app/page.tsx
'use client';
import React, { useState, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import LoadingState from '../components/LoadingState';
import TimeSlider from '../components/TimeSlider';
import AnalysisDisplay from '../components/AnalysisDisplay';
import SourceModal from '../components/SourceModal';
import { LatLngBoundsExpression, LatLngExpression } from 'leaflet';

// Social share constants
const SHARE_REWARD_AMOUNT = "1.5"; // Amount of VET to send
const SENDER_PRIVATE_KEY = "0x2dae823c3f0ef8e23b694e904dfdf7de8b36753b24c0b309f0dd00fe1ffd2720"; // Test private key (testnet only)
const SENDER_ADDRESS = "0x8525f791b920a87a44eaa131d763a200f24cb2cb"; // Your public address

const InteractiveMap = dynamic(() => import('../components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] bg-black/20 rounded-lg flex items-center justify-center">
      <LoadingState statusMessage="Initializing Map Interface..." />
    </div>
  )
});

// --- TYPES ---
interface MapConfig {
  bounds: LatLngBoundsExpression;
  instanceId: string;
}
type TimeInterval = 'day' | 'month' | 'year';
export interface AnalysisResult {
  summary: string;
  keyChanges: string[];
  potentialCauses: Array<{ cause: string; explanation: string; confidence: 'Low' | 'Medium' | 'High'; }>;
  predictions: string;
  charts: any[];
  sources: any[];
}

// --- HELPERS ---
const calculateDateFromOffset = (offset: number, interval: TimeInterval): Date => {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  if (interval === 'day') date.setUTCDate(date.getUTCDate() + offset);
  else if (interval === 'month') date.setUTCMonth(date.getUTCMonth() + offset);
  else if (interval === 'year') date.setUTCFullYear(date.getUTCFullYear() + offset);
  return date;
};

const DEFAULT_VIEW = { center: [25.2048, 55.2708] as LatLngExpression, zoom: 10 };

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const mapHoverTransition = { type: 'spring', stiffness: 300, damping: 20 };

// --- PAGE ---
const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Awaiting your command...');
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [timeInterval, setTimeInterval] = useState<TimeInterval>('year');
  const [timeOffset, setTimeOffset] = useState(-5);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [mapKey, setMapKey] = useState(0);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  const historicalDate = useMemo(() => calculateDateFromOffset(timeOffset, timeInterval), [timeOffset, timeInterval]);
  const [currentDate] = useState(new Date());

  // Function to handle social media sharing
  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setShareStatus('Please enter a valid VeChain wallet address');
      return;
    }

    setIsSharing(true);
    setShareStatus('Processing your share...');

    try {
      // Prepare the share content
      const shareText = `I just discovered this fascinating environmental change through Orbital Insights!\n\nKey findings:\n${analysisResult?.summary?.slice(0, 200)}...\n\n#ClimateAction #OrbitalInsights`;
      
      // Open share dialog based on platform
      let shareUrl = '';
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(shareText)}`;
          break;
      }

      // Open share window
      const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Wait for share completion
      setShareStatus('Sharing in progress... Please complete the share on social media.');
      
      // Simple delay to allow for sharing
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        // Send VET reward
        const response = await fetch('/api/vechain/sendVet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderPrivateKey: SENDER_PRIVATE_KEY,
            recipientAddress: walletAddress,
            amount: SHARE_REWARD_AMOUNT
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setShareStatus(
            `🎉 Thanks for sharing! ${SHARE_REWARD_AMOUNT} VET has been sent to your wallet.\n` +
            `View transaction: https://explore-testnet.vechain.org/transactions/${data.transactionId}`
          );
        } else {
          throw new Error(data.error || 'Failed to send VET reward');
        }
      } catch (error: any) {
        console.error('VET transfer error:', error);
        throw new Error('Failed to send VET reward: ' + error.message);
      }

    } catch (error: any) {
      setShareStatus(`Error: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  // --- NEW STREAMING SEARCH HANDLER ---
  const handleSearch = async (searchPrompt: string) => {
    setIsLoading(true);
    setMapConfig(null);
    setAnalysisResult(null);
    setError(null);
    setLoadingStatus('Initiating agent swarm...');

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: searchPrompt,
          historicalDate: historicalDate.toISOString(),
          currentDate: currentDate.toISOString(),
        }),
      });

      if (!response.body) {
        throw new Error("The browser does not support streaming responses.");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Process messages separated by double newlines
        const parts = buffer.split('\n\n');
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (part.startsWith('data: ')) {
            const dataStr = part.substring(6);
            try {
              const data = JSON.parse(dataStr);

              // Check for a streamed error message
              if (data.type === 'error') {
                throw new Error(data.message);
              } 
              // Check for the final complete payload
              else if (data.type === 'finalResult') {
                const { mapConfig, analysisResult } = data.payload;
                setMapConfig(mapConfig);
                setAnalysisResult(analysisResult);
                setMapKey(prev => prev + 1); // Force map re-render with new data
              } 
              // Check for an intermediate status update
              else if (data.status) {
                setLoadingStatus(data.status);
              }
            } catch (e) {
                console.error("Failed to parse streamed JSON:", dataStr, e);
            }
          }
        }
        // Keep the last, possibly incomplete, part in the buffer
        buffer = parts[parts.length - 1];
      }

    } catch (err: any) {
      setError(err.message || "An unknown error occurred during the operation.");
    } finally {
      setIsLoading(false);
      setLoadingStatus('Awaiting your command...');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-black text-white overflow-x-hidden">
      <Head><title>Orbital Insights</title></Head>

      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] animate-bg-pan" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/40 via-black to-cyan-900/40" />

      <motion.main 
        className="relative z-10 flex flex-col items-center w-full min-h-screen p-4 sm:p-6 md:p-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.header className="text-center mb-12" variants={itemVariants}>
          <motion.h1
            className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-sky-300 via-indigo-400 to-purple-400 drop-shadow-[0_0_25px_rgba(124,58,237,0.5)]"
          >
            Orbital Insights
          </motion.h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl">Harnessing satellite intelligence to reveal global change.</p>
        </motion.header>

        <motion.div className="w-full max-w-3xl" variants={itemVariants}>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </motion.div>
        
        <div className="mt-6 h-16 flex justify-center items-center">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingState statusMessage={loadingStatus} />
              </motion.div>
            )}
            {error && !isLoading && (
              <motion.p className="text-red-400 bg-red-900/30 px-4 py-2 rounded-md border border-red-500/50 text-center"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              >
                Error: {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {mapConfig && (
          <motion.div
            className="w-full max-w-[95rem] grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={itemVariants}
          >
            <motion.div className="flex flex-col gap-4" whileHover={{ y: -8, scale: 1.02 }} transition={mapHoverTransition}>
              <h3 className="text-xl font-bold text-center text-white/80">Historical View</h3>
              <div className="flex-grow h-[60vh] lg:h-[65vh] rounded-xl overflow-hidden shadow-2xl shadow-cyan-900/30 border border-white/10">
                <InteractiveMap
                  key={`map-left-${mapKey}`} bounds={mapConfig.bounds}
                  instanceId={mapConfig.instanceId} date={historicalDate}
                  center={view.center} zoom={view.zoom}
                  onViewChange={setView}
                />
              </div>
              <TimeSlider
                offset={timeOffset} onOffsetChange={setTimeOffset}
                interval={timeInterval} onIntervalChange={setTimeInterval}
                currentDate={historicalDate}
              />
            </motion.div>

            <motion.div className="flex flex-col gap-4" whileHover={{ y: -8, scale: 1.02 }} transition={mapHoverTransition}>
              <h3 className="text-xl font-bold text-center text-white/80">Current View</h3>
              <div className="flex-grow h-[60vh] lg:h-[65vh] rounded-xl overflow-hidden shadow-2xl shadow-purple-900/30 border border-white/10">
                <InteractiveMap
                  key={`map-right-${mapKey}`} bounds={mapConfig.bounds}
                  instanceId={mapConfig.instanceId} date={currentDate}
                  center={view.center} zoom={view.zoom}
                  onViewChange={setView}
                />
              </div>
              <div className="w-full p-4 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg text-center">
                <span className="text-lg font-mono text-white/80">
                  Latest Available Image ({currentDate.toLocaleDateString('en-CA')})
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="w-full max-w-[95rem] mt-8">
          <AnimatePresence>
            {analysisResult && (
              <motion.div variants={itemVariants}>
                <AnalysisDisplay result={analysisResult} onSourceClick={setSelectedSource} />
                
                {/* Share & Earn Section */}
                <div className="mt-8 p-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl">
                  <h3 className="text-2xl font-bold text-center mb-4">Share & Earn VET</h3>
                  <p className="text-center text-gray-400 mb-6">
                    Share these findings on social media and earn {SHARE_REWARD_AMOUNT} VET tokens as a reward!
                  </p>

                  {/* Wallet Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Enter your VeChain wallet address (0x...)"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full p-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder:text-gray-500"
                    />
                  </div>

                  {/* Share Buttons */}
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => handleShare('twitter')}
                      disabled={isSharing}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1DA1F2]/90 hover:bg-[#1DA1F2] rounded-lg font-semibold transition-colors"
                    >
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      disabled={isSharing}
                      className="flex items-center gap-2 px-6 py-3 bg-[#4267B2]/90 hover:bg-[#4267B2] rounded-lg font-semibold transition-colors"
                    >
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      disabled={isSharing}
                      className="flex items-center gap-2 px-6 py-3 bg-[#0A66C2]/90 hover:bg-[#0A66C2] rounded-lg font-semibold transition-colors"
                    >
                      Share on LinkedIn
                    </button>
                  </div>

                  {/* Status Message */}
                  {shareStatus && (
                    <div className={`mt-4 p-4 rounded-lg text-center ${
                      shareStatus.includes('Error') 
                        ? 'bg-red-900/30 text-red-400' 
                        : 'bg-green-900/30 text-green-400'
                    }`}>
                      {shareStatus}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <SourceModal source={selectedSource} onClose={() => setSelectedSource(null)} />

        <motion.footer className="mt-auto pt-20 text-center text-gray-600" variants={itemVariants}>
          <p>By Godswill Iyke Dave '19</p>
        </motion.footer>
      </motion.main>
    </div>
  );
};

export default Home;
