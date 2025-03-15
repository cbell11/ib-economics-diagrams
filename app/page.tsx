'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DiagramSelector from '../components/DiagramSelector';

const EconomicDiagram = dynamic(() => import('../components/EconomicDiagram'), {
  ssr: false
});

export default function DiagramPage() {
  const [selectedDiagram, setSelectedDiagram] = useState<{
    type: 'supply-demand';
    title: string;
  } | null>(null);

  const handleDiagramSelect = (type: 'supply-demand', title: string) => {
    setSelectedDiagram({ type, title });
  };

  const handleBack = () => {
    setSelectedDiagram(null);
  };

  const handleSave = async (data: any) => {
    // TODO: Implement save functionality
    console.log('Saving diagram:', data);
  };

  if (!selectedDiagram) {
    return <DiagramSelector onSelect={handleDiagramSelect} />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Diagram Selection
        </button>
      </div>
      <EconomicDiagram
        type={selectedDiagram.type}
        title={selectedDiagram.title}
        onSave={handleSave}
      />
    </div>
  );
}
