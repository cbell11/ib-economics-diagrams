'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiagramSettings, defaultSettings } from '../types/diagram';
import type { Stage } from 'konva/lib/Stage';
import { loadStripe } from '@stripe/stripe-js';

const defaultLabels = {
  'supply-demand': {
    title: 'Figure 1: Supply and Demand',
    xAxis: 'Quantity',
    yAxis: 'Price ($)',
  },
  'ppf': {
    title: 'Figure 1: Production Possibility Frontier',
    xAxis: 'Good X',
    yAxis: 'Good Y',
  },
  'cost-curves': {
    title: 'Figure 1: Cost Curves',
    xAxis: 'Quantity',
    yAxis: 'Cost ($)',
  },
} as const;

// Load components dynamically with no SSR
const DiagramCanvas = dynamic(() => import('./DiagramCanvas'), { ssr: false });
const DiagramControls = dynamic(() => import('./DiagramControls'), { ssr: false });

interface EconomicDiagramProps {
  type: 'supply-demand' | 'ppf' | 'cost-curves';
  title: string;
}

interface DiagramCanvasRef {
  getStage: () => Stage | null;
}

// Loading placeholder component that's identical between server and client
const LoadingPlaceholder = () => (
  <div className="w-full h-[400px] flex items-center justify-center bg-gray-50">
    <div className="text-gray-500">Loading diagram...</div>
  </div>
);

// Download icon component
const DownloadIcon = () => (
  <svg 
    className="w-5 h-5 mr-2" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function EconomicDiagram({ type, title }: EconomicDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<DiagramCanvasRef>(null);
  const [isClient, setIsClient] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [settings, setSettings] = useState<DiagramSettings>({
    ...defaultSettings,
    title: defaultLabels[type].title,
    xAxisLabel: defaultLabels[type].xAxis,
    yAxisLabel: defaultLabels[type].yAxis
  });
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | null>(null);
  const [remainingDownloads, setRemainingDownloads] = useState<number | null>(null);

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!isClient) return;

    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setStageSize({
          width: Math.min(width, 800),
          height: Math.min(width * 0.67, 600)
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isClient]);

  // Update labels when type changes
  useEffect(() => {
    if (!isClient) return;

    setSettings(prev => ({
      ...prev,
      title: defaultLabels[type].title,
      xAxisLabel: defaultLabels[type].xAxis,
      yAxisLabel: defaultLabels[type].yAxis
    }));
  }, [type, isClient]);

  // Add this effect to check remaining downloads when component mounts
  useEffect(() => {
    const checkRemainingDownloads = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id');

      if (!userId) return;

      try {
        const response = await fetch(`/api/track-downloads?userId=${userId}`);
        const data = await response.json();
        setRemainingDownloads(data.remaining);
      } catch (error) {
        console.error('Error checking remaining downloads:', error);
      }
    };

    checkRemainingDownloads();
  }, []);

  const handleDownload = async (format: 'png' | 'jpg') => {
    setSelectedFormat(format);
    setIsCheckingMembership(true);

    try {
      // Get the user ID from the URL or session
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id');

      if (!userId) {
        console.log('No user ID found in URL');
        setShowFormatDialog(false);
        setShowPaymentDialog(true);
        return;
      }

      console.log('Checking membership for user ID:', userId);
      const response = await fetch(`/api/check-membership?userId=${userId}`);
      const data = await response.json();

      console.log('Membership check response:', data);

      if (response.ok && data.hasAccess) {
        console.log('User has access, proceeding with download');
        downloadDiagram(format);
      } else {
        console.log('User does not have access or error occurred:', data.error || 'Unknown error');
        setShowFormatDialog(false);
        setShowPaymentDialog(true);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      setShowFormatDialog(false);
      setShowPaymentDialog(true);
    } finally {
      setIsCheckingMembership(false);
    }
  };

  const handleOneTimePayment = async () => {
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: selectedFormat }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Error redirecting to checkout:', error);
        }
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
    }
  };

  const handleSubscription = () => {
    window.location.href = 'https://diplomacollective.com/home/for-students/ib-economics/';
  };

  const downloadDiagram = async (format: 'png' | 'jpg') => {
    const stage = stageRef.current?.getStage();
    if (!stage) return;

    try {
      // Get the user ID from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id');

      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Check download limit
      const response = await fetch(`/api/track-downloads?userId=${userId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Download limit reached
          alert('You have reached your monthly download limit. Please contact support for additional downloads.');
          return;
        }
        throw new Error('Failed to track download');
      }

      // Remove watermark by hiding it temporarily
      const watermarkNode = stage.findOne('.watermark');
      if (watermarkNode) {
        watermarkNode.visible(false);
      }

      // Create the download with watermark removed
      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        mimeType: `image/${format}`,
        quality: 1
      });

      // Restore watermark visibility
      if (watermarkNode) {
        watermarkNode.visible(true);
      }
      
      const link = document.createElement('a');
      const fileName = `${settings.title || 'Economic Diagram'} - EconGraph Pro by Diploma Collective.${format}`;
      link.download = fileName.replace(/[/\\?%*:|"<>]/g, '-');
      link.href = dataURL;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowFormatDialog(false);

      // Show remaining downloads
      if (data.remaining > 0) {
        alert(`Download successful! You have ${data.remaining} downloads remaining this month.`);
      }
    } catch (error) {
      console.error('Error downloading diagram:', error);
      alert('Failed to download diagram. Please try again.');
    }
  };

  // Base layout that's identical between server and client
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-gray-900">{title}</h2>
      <div className="flex gap-6">
        <div ref={containerRef} className="flex-1 bg-white p-6 rounded-lg shadow">
          {!isClient ? (
            <LoadingPlaceholder />
          ) : (
            <DiagramCanvas
              ref={stageRef}
              settings={settings}
              width={stageSize.width}
              height={stageSize.height}
            />
          )}
        </div>
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-4">
            {isClient && (
              <DiagramControls
                settings={settings}
                onUpdate={setSettings}
              />
            )}
            <div className="mt-4">
              <button
                onClick={() => setShowFormatDialog(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
                disabled={!isClient}
              >
                <DownloadIcon />
                Download Diagram
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Format Selection Dialog */}
      {showFormatDialog && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Choose File Format</h3>
              <button
                onClick={() => setShowFormatDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {remainingDownloads !== null && (
              <p className="text-sm text-gray-600 mb-4">
                You have {remainingDownloads} downloads remaining this month.
                {remainingDownloads === 0 && (
                  <span className="block mt-2 text-red-600">
                    You have reached your monthly download limit. Please contact support for additional downloads.
                  </span>
                )}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleDownload('png')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                disabled={isCheckingMembership}
              >
                {isCheckingMembership ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                    Checking...
                  </div>
                ) : (
                  'PNG'
                )}
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                disabled={isCheckingMembership}
              >
                {isCheckingMembership ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                    Checking...
                  </div>
                ) : (
                  'JPG'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Choose Your Plan</h3>
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="text-lg font-semibold mb-2">One-Time Download</h4>
                <p className="text-gray-600 mb-4">Download this diagram in {selectedFormat?.toUpperCase()} format.</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">$4.99</p>
                <button
                  onClick={handleOneTimePayment}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Purchase Now
                </button>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="text-lg font-semibold mb-2">Student Membership</h4>
                <p className="text-gray-600 mb-4">Get unlimited access to all diagrams and resources.</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">$12.99/month</p>
                <button
                  onClick={handleSubscription}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Subscribe Now
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Access all IB Economics resources at Diploma Collective
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 