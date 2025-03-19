'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiagramSettings, defaultSettings } from '../types/diagram';

const DiagramCanvas = dynamic(() => import('./DiagramCanvas'), {
  ssr: false
});

export default function EconomicDiagram() {
  const [settings, setSettings] = useState<DiagramSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);
  const [showS2, setShowS2] = useState(false);
  const [showS3, setShowS3] = useState(false);
  const [showPriceCeiling, setShowPriceCeiling] = useState(false);
  const [showPriceFloor, setShowPriceFloor] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full">
        <DiagramCanvas
          settings={settings}
          onUpdateSettings={setSettings}
          mounted={mounted}
          type="supply-demand"
          showS2={showS2}
          showS3={showS3}
          showPriceCeiling={showPriceCeiling}
          showPriceFloor={showPriceFloor}
          onToggleS2={() => setShowS2(!showS2)}
          onToggleS3={() => setShowS3(!showS3)}
          onTogglePriceCeiling={() => setShowPriceCeiling(!showPriceCeiling)}
          onTogglePriceFloor={() => setShowPriceFloor(!showPriceFloor)}
        />
      </div>
    </div>
  );
} 