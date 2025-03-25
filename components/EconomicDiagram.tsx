'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiagramSettings, DiagramType, DiagramTypes } from '../types/diagram';

const DiagramCanvas = dynamic(() => import('./DiagramCanvas'), {
  ssr: false
});

export interface EconomicDiagramProps {
  type: DiagramType;
  title: string;
}

export const EconomicDiagram = ({ type, title }: EconomicDiagramProps) => {
  const [settings, setSettings] = useState<DiagramSettings>({
    title: title,
    xAxisLabel: type === DiagramTypes.PPC ? 'Good B' : 'Quantity',
    yAxisLabel: type === DiagramTypes.PPC ? 'Good A' : 'Price',
    fontSize: 16,
    lineThickness: 2,
    primaryColor: '#0066cc',
    secondaryColor: '#cc0000'
  });
  const [showS2, setShowS2] = useState(false);
  const [showS3, setShowS3] = useState(false);
  const [showPriceCeiling, setShowPriceCeiling] = useState(false);
  const [showPriceFloor, setShowPriceFloor] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show "Coming Soon" for unimplemented diagrams
  if (type !== DiagramTypes.SUPPLY_DEMAND && 
      type !== DiagramTypes.EXTERNALITIES && 
      type !== DiagramTypes.PPC) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-xl text-gray-600">Coming Soon</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <DiagramCanvas
          settings={settings}
          type={type}
          showS2={showS2}
          showS3={showS3}
          showPriceCeiling={showPriceCeiling}
          showPriceFloor={showPriceFloor}
          onToggleS2={() => setShowS2(!showS2)}
          onToggleS3={() => setShowS3(!showS3)}
          onTogglePriceCeiling={() => setShowPriceCeiling(!showPriceCeiling)}
          onTogglePriceFloor={() => setShowPriceFloor(!showPriceFloor)}
          onUpdateSettings={setSettings}
          mounted={mounted}
        />
      </div>
    </div>
  );
};

export default EconomicDiagram; 