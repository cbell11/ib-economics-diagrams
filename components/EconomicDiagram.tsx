'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiagramSettings, defaultSettings } from '../types/diagram';

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
  onSave: (data: any) => Promise<void>;
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

export default function EconomicDiagram({ type, title, onSave }: EconomicDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [settings, setSettings] = useState<DiagramSettings>({
    ...defaultSettings,
    title: defaultLabels[type].title,
    xAxisLabel: defaultLabels[type].xAxis,
    yAxisLabel: defaultLabels[type].yAxis
  });

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

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!stageRef.current) return;

    // Get the stage node
    const stage = stageRef.current.getStage();
    
    // Convert stage to dataURL with white background
    const dataURL = stage.toDataURL({
      pixelRatio: 2, // Higher quality
      mimeType: `image/${format}`,
      backgroundColor: '#ffffff',
      width: stage.width(),
      height: stage.height()
    });
    
    // Create a link element
    const link = document.createElement('a');
    const fileName = `${settings.title || 'Economic Diagram'} - EconGraph Pro by Diploma Collective.${format}`;
    link.download = fileName.replace(/[/\\?%*:|"<>]/g, '-'); // Remove invalid filename characters
    link.href = dataURL;
    
    // Append to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowFormatDialog(false);
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
                type={type}
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
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleDownload('png')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
              >
                PNG
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
              >
                JPG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 