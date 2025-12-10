'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { DiagramType } from '../types/diagram';

const EconomicDiagram = dynamic(() => import('../components/EconomicDiagram'), {
  ssr: false,
  loading: () => <div>Loading diagram...</div>
});

const DiagramSelector = dynamic(() => import('../components/DiagramSelector'), {
  ssr: false,
  loading: () => <div>Loading selector...</div>
});

// Separate client component for user_id handling
function TokenHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    
    // Check for user_id in URL parameters (from Diploma Collective membership)
    const userId = searchParams.get('user_id');
    if (userId && userId !== '[econgraph_link]') {
      // Store user_id in localStorage
      localStorage.setItem('auth_user_id', userId);
      console.log('User ID stored:', userId);
      // Remove user_id from URL for cleaner display
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
  const [mounted, setMounted] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramOption | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDiagramSelect = (type: DiagramOption['type'], title: string) => {
    setSelectedDiagram({ type, title });
  };

  const handleBack = () => {
    setSelectedDiagram(null);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
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
    </div>
  );
}
