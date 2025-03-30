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
    xAxisLabel: type === DiagramTypes.PPC ? 'Good B' : 
               type === DiagramTypes.NEO_CLASSICAL_AD_AS ? 'Real GDP' :
               type === DiagramTypes.MONEY_MARKET ? 'Quantity of Money' : 'Quantity',
    yAxisLabel: type === DiagramTypes.PPC ? 'Good A' : 
               type === DiagramTypes.NEO_CLASSICAL_AD_AS ? 'Average Price Level ($)' :
               type === DiagramTypes.MONEY_MARKET ? 'Interest Rate (%)' : 'Price',
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

  useEffect(() => {
    console.log('EconomicDiagram - Received type:', type);
    console.log('EconomicDiagram - Available diagrams:', availableDiagrams);
    console.log('EconomicDiagram - Is type available:', availableDiagrams.includes(type));
  }, [type]);

  // Define available diagrams
  const availableDiagrams: DiagramType[] = [
    DiagramTypes.SUPPLY_DEMAND,
    DiagramTypes.EXTERNALITIES,
    DiagramTypes.PPC,
    DiagramTypes.NEO_CLASSICAL_AD_AS,
    DiagramTypes.MONEY_MARKET
  ];

  // Show "Coming Soon" for unimplemented diagrams
  if (!availableDiagrams.includes(type)) {
    console.log('EconomicDiagram - Diagram not available:', type);
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