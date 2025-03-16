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

  if (!selectedDiagram) {
    return <DiagramSelector onSelect={handleDiagramSelect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Logo Section */}
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <img 
            src="/diploma-collective-logo.png" 
            alt="Diploma Collective Logo" 
            className="h-16 w-auto"
          />
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="group inline-flex items-center px-5 py-2.5 text-[#4895ef] hover:text-[#ffc145] transition-colors duration-200"
          >
            <svg 
              className="w-5 h-5 mr-3 transform group-hover:-translate-x-1 transition-transform duration-200" 
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
            <span className="text-lg font-medium">Back to Diagram Selection</span>
          </button>
        </div>
        
        <div className="bg-[#4895ef] text-white rounded-3xl shadow-lg">
          <div className="border-b border-white/20 px-8 py-6">
            <h1 className="text-3xl font-bold">
              {selectedDiagram.title}
            </h1>
          </div>
          
          <div className="p-8">
            <div className="bg-white rounded-2xl p-6 shadow-inner">
              <EconomicDiagram
                type={selectedDiagram.type}
                title={selectedDiagram.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
