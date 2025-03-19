'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { EconomicDiagramProps } from '../components/EconomicDiagram';

const EconomicDiagram = dynamic(() => import('../components/EconomicDiagram'), {
  ssr: false
});

type DiagramOption = {
  type: EconomicDiagramProps['type'];
  title: string;
};

export default function Home() {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramOption>({
    type: 'supply-demand',
    title: 'Figure 1: Supply and Demand'
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-inner">
          <EconomicDiagram
            type={selectedDiagram.type}
            title={selectedDiagram.title}
          />
        </div>
      </div>
    </main>
  );
}
