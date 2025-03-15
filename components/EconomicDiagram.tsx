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

export default function EconomicDiagram({ type, title, onSave }: EconomicDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
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
              type={type}
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
                onClick={() => onSave({ type, settings, data: 'TODO: Add diagram data' })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                disabled={!isClient}
              >
                Save Diagram
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 