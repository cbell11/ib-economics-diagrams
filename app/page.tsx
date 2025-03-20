'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { DiagramType } from '../types/diagram';

const EconomicDiagram = dynamic(() => import('../components/EconomicDiagram'), {
  ssr: false
});

const DiagramSelector = dynamic(() => import('../components/DiagramSelector'), {
  ssr: false
});

// Separate client component for token handling
function TokenHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    
    // Check for token in URL parameters
    const token = searchParams.get('token');
    if (token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  return null;
}

interface DiagramOption {
  type: DiagramType;
  title: string;
}

export default function Home() {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramOption | null>(null);

  const handleDiagramSelect = (type: DiagramOption['type'], title: string) => {
    setSelectedDiagram({ type, title });
  };

  const handleBack = () => {
    setSelectedDiagram(null);
  };

  return (
    <>
      <Suspense fallback={null}>
        <TokenHandler />
      </Suspense>
      {!selectedDiagram ? (
        <DiagramSelector onSelect={handleDiagramSelect} />
      ) : (
        <main className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
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
            <div className="bg-white rounded-2xl p-6 shadow-inner">
              <EconomicDiagram
                type={selectedDiagram.type}
                title={selectedDiagram.title}
              />
            </div>
          </div>
        </main>
      )}
    </>
  );
}
