'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiagramSettings, defaultSettings } from '../types/diagram';
import type { Stage } from 'konva/lib/Stage';
import Image from 'next/image';
import DiagramCanvas from './DiagramCanvas';
import DiagramControls from './DiagramControls';

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
const DiagramCanvasComponent = dynamic(() => import('./DiagramCanvas'), { ssr: false });
const DiagramControlsComponent = dynamic(() => import('./DiagramControls'), { ssr: false });

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
  const [settings, setSettings] = useState<DiagramSettings>(defaultSettings);
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [remainingDownloads, setRemainingDownloads] = useState<number | null>(null);
  const [showS2, setShowS2] = useState(false);
  const [showS3, setShowS3] = useState(false);
  const [showPriceCeiling, setShowPriceCeiling] = useState(false);
  const [showPriceFloor, setShowPriceFloor] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
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

  const handleUpdateSettings = (newSettings: Partial<DiagramSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">IB Economics Diagrams</h1>
        {mounted && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Supply and Demand Diagram</h2>
                <button
                  onClick={() => setSettings(defaultSettings)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reset to Default
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Diagram Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={settings.title}
                          onChange={(e) => handleUpdateSettings({ title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter diagram title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis Label</label>
                        <input
                          type="text"
                          value={settings.xAxisLabel}
                          onChange={(e) => handleUpdateSettings({ xAxisLabel: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter x-axis label"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis Label</label>
                        <input
                          type="text"
                          value={settings.yAxisLabel}
                          onChange={(e) => handleUpdateSettings({ yAxisLabel: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter y-axis label"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 