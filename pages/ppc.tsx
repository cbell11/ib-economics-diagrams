import { useState, useEffect } from 'react';
import Head from 'next/head';
import DiagramCanvas from '../components/DiagramCanvas';
import { DiagramTypes } from '../types/diagram';
import type { DiagramSettings } from '../types/diagram';

export default function PPCPage() {
  const [settings, setSettings] = useState<DiagramSettings>({
    title: 'Production Possibilities Curve',
    xAxisLabel: 'Good B',
    yAxisLabel: 'Good A',
    fontSize: 16,
    lineThickness: 2,
    primaryColor: '#0066cc',
    secondaryColor: '#cc0000'
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpdateSettings = (newSettings: Partial<DiagramSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>PPC Diagram - IB Economics Diagrams</title>
        <meta name="description" content="Create and customize Production Possibilities Curve diagrams for IB Economics" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Production Possibilities Curve</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <DiagramCanvas
                type={DiagramTypes.PPC}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                mounted={mounted}
                showS2={false}
                showS3={false}
                showPriceCeiling={false}
                showPriceFloor={false}
                onToggleS2={() => {}}
                onToggleS3={() => {}}
                onTogglePriceCeiling={() => {}}
                onTogglePriceFloor={() => {}}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Diagram Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => handleUpdateSettings({ title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">X-Axis Label</label>
                  <input
                    type="text"
                    value={settings.xAxisLabel}
                    onChange={(e) => handleUpdateSettings({ xAxisLabel: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Y-Axis Label</label>
                  <input
                    type="text"
                    value={settings.yAxisLabel}
                    onChange={(e) => handleUpdateSettings({ yAxisLabel: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Line Color</label>
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleUpdateSettings({ primaryColor: e.target.value })}
                    className="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Line Thickness</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={settings.lineThickness}
                    onChange={(e) => handleUpdateSettings({ lineThickness: Number(e.target.value) })}
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Font Size</label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) => handleUpdateSettings({ fontSize: Number(e.target.value) })}
                    className="mt-1 block w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 