'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DiagramSettings, defaultSettings } from '../types/diagram';

const DiagramCanvas = dynamic(() => import('./DiagramCanvas'), {
  ssr: false
});

export interface EconomicDiagramProps {
  type: 'supply-demand' | 'ppf' | 'cost-curves';
  title: string;
}

const EconomicDiagram = ({ type, title }: EconomicDiagramProps) => {
  const [settings, setSettings] = useState<DiagramSettings>({
    ...defaultSettings,
    title: title
  });
  const [showS2, setShowS2] = useState(false);
  const [showS3, setShowS3] = useState(false);
  const [showPriceCeiling, setShowPriceCeiling] = useState(false);
  const [showPriceFloor, setShowPriceFloor] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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