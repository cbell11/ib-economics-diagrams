'use client';

import dynamic from 'next/dynamic';
import type { EconomicDiagramProps } from '../components/EconomicDiagram';

const EconomicDiagram = dynamic(() => import('../components/EconomicDiagram'), {
  ssr: false
});

const defaultDiagram = {
  type: 'supply-demand' as const,
  title: 'Figure 1: Supply and Demand'
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-inner">
          <EconomicDiagram
            type={defaultDiagram.type}
            title={defaultDiagram.title}
          />
        </div>
      </div>
    </main>
  );
}
