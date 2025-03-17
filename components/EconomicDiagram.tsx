'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiagramSettings, defaultSettings } from '../types/diagram';
import type { Stage } from 'konva/lib/Stage';
import Image from 'next/image';

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

export default function EconomicDiagram({ type, title }: EconomicDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<DiagramCanvasRef>(null);
  const [isClient, setIsClient] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [settings, setSettings] = useState<DiagramSettings>({
    ...defaultSettings,
    title: title || defaultLabels[type].title,
    xAxisLabel: defaultLabels[type].xAxis,
    yAxisLabel: defaultLabels[type].yAxis
  });
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
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

  // Update labels when type or title changes
  useEffect(() => {
    if (!isClient) return;

    setSettings(prev => ({
      ...prev,
      title: title || defaultLabels[type].title,
      xAxisLabel: defaultLabels[type].xAxis,
      yAxisLabel: defaultLabels[type].yAxis
    }));
  }, [type, title, isClient]);

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

  const handleEconGraphProSubscription = () => {
    window.location.href = 'https://diplomacollective.com/register/econ-student-econgraph-pro/';
  };

  const handleStudentSubscription = () => {
    window.location.href = 'https://diplomacollective.com/register/econ-student-monthly/';
  };

  const downloadDiagram = async (format: 'png' | 'jpg') => {
    const stage = canvasRef.current?.getStage();
    if (!stage) return;

    try {
      // Get the user ID from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id');

      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Check if this is a paid download
      const membershipResponse = await fetch(`/api/check-membership?userId=${userId}`);
      const { hasAccess } = await membershipResponse.json();

      // Check download limit
      const response = await fetch(`/api/track-downloads?userId=${userId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Download limit reached
          alert('You have reached your daily download limit (15 downloads per day). Please try again tomorrow.');
          return;
        }
        throw new Error('Failed to track download');
      }

      // Remove watermark by hiding it temporarily
      const watermarks = stage.find('.watermark, [name="watermark"]');
      watermarks.forEach(watermark => {
        watermark.visible(false);
      });

      // Update remaining downloads count
      setRemainingDownloads(data.remaining);

      // Get the data URL for the image
      const dataURL = stage.toDataURL({ pixelRatio: 2 });

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.download = `diagram.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show watermarks again
      watermarks.forEach(watermark => {
        watermark.visible(!hasAccess);
      });

      // Close the format dialog
      setShowFormatDialog(false);
    } catch (error) {
      console.error('Error downloading diagram:', error);
    }
  };

  const handleSettingsChange = (newSettings: DiagramSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="w-full space-y-4" ref={containerRef}>
      {!isClient ? <LoadingPlaceholder /> : (
        <>
          <DiagramCanvas
            ref={canvasRef}
            width={stageSize.width}
            height={stageSize.height}
            settings={settings}
            type={type}
          />
          <DiagramControls
            settings={settings}
            onUpdate={handleSettingsChange}
          />
          <div className="flex justify-end">
            <button
              onClick={() => setShowFormatDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#32a567] hover:bg-[#2a8d57] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32a567]"
            >
              <DownloadIcon />
              Download Diagram
            </button>
          </div>
          {remainingDownloads !== null && (
            <div className="text-sm text-gray-600 mt-2 text-center">
              {remainingDownloads} downloads remaining today
            </div>
          )}
        </>
      )}

      {showFormatDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Choose Format</h3>
              <button
                onClick={() => setShowFormatDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleDownload('png')}
                disabled={isCheckingMembership}
                className="w-full bg-[#32a567] text-white py-2 px-4 rounded-md hover:bg-[#2a8d57] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Download as PNG
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                disabled={isCheckingMembership}
                className="w-full bg-[#32a567] text-white py-2 px-4 rounded-md hover:bg-[#2a8d57] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Download as JPG
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
              <h3 className="text-xl font-semibold text-gray-900">Choose Your Plan</h3>
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

            <div className="space-y-6">
              {/* EconGraph Pro Subscription */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">EconGraph Pro</h4>
                <ul className="text-gray-600 mb-4 list-disc pl-5 space-y-1">
                  <li>Full access to EconGraph Pro diagrams</li>
                  <li>15 downloads per day</li>
                  <li>High-quality watermark-free downloads</li>
                </ul>
                <button
                  onClick={handleEconGraphProSubscription}
                  className="w-full bg-[#32a567] text-white py-2 px-4 rounded-md hover:bg-[#2a8d57] transition-colors duration-200"
                >
                  Join for $7.99/month
                </button>
                <div className="mt-4 flex items-center justify-center space-x-6">
                  <Image
                    src="/Powered by Stripe - blurple-300x68-b3bf095.png"
                    alt="Powered by Stripe"
                    width={100}
                    height={32}
                    className="h-8 w-auto"
                    priority
                  />
                  <Image
                    src="https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-100px.png"
                    alt="PayPal Logo"
                    width={100}
                    height={24}
                    className="h-6 w-auto"
                    priority
                  />
                </div>
              </div>

              {/* Student Membership */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Student Membership</h4>
                <ul className="text-gray-600 mb-4 list-disc pl-5 space-y-1">
                  <li>EconGraph Pro Membership</li>
                  <li>Access to our Step-By-Step IA Guide</li>
                  <li>IB Econ Power Review Pack included</li>
                </ul>
                <button
                  onClick={handleStudentSubscription}
                  className="w-full bg-[#32a567] text-white py-2 px-4 rounded-md hover:bg-[#2a8d57] transition-colors duration-200"
                >
                  Join for $12.99/month
                </button>
                <div className="mt-4 flex items-center justify-center space-x-6">
                  <Image
                    src="/Powered by Stripe - blurple-300x68-b3bf095.png"
                    alt="Powered by Stripe"
                    width={100}
                    height={32}
                    className="h-8 w-auto"
                    priority
                  />
                  <Image
                    src="https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-100px.png"
                    alt="PayPal Logo"
                    width={100}
                    height={24}
                    className="h-6 w-auto"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 text-center border-t mt-4">
              <a
                href="https://diplomacollective.com/home/for-students/econgraph-pro/"
                className="inline-flex items-center text-base font-medium text-[#4895ef] hover:text-[#ffc145] transition-colors duration-200"
              >
                Already a member? Sign in here to download now
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 