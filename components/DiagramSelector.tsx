'use client';
import React from 'react';

interface DiagramOption {
  type: 'supply-demand' | 'neo-classical-ad-as' | 'externalities' | 'international-trade';
  title: string;
  description: string;
  comingSoon?: boolean;
}

interface DiagramSelectorProps {
  onSelect: (type: DiagramOption['type'], title: string) => void;
}

const diagramOptions: DiagramOption[] = [
  {
    type: 'supply-demand',
    title: 'Supply and Demand',
    description: 'Create supply and demand diagrams with various elasticities, interventions, and welfare analysis.',
    comingSoon: false
  },
  {
    type: 'neo-classical-ad-as',
    title: 'Neo-Classical AD-AS',
    description: 'Create aggregate demand and supply diagrams with a vertical long-run aggregate supply curve.',
    comingSoon: true
  },
  {
    type: 'externalities',
    title: 'Externalities',
    description: 'Illustrate positive and negative externalities with social and private cost/benefit curves.',
    comingSoon: true
  },
  {
    type: 'international-trade',
    title: 'International Trade',
    description: 'Visualize comparative advantage, terms of trade, and gains from trade between countries.',
    comingSoon: true
  }
];

const DiagramSelector: React.FC<DiagramSelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            EconGraph Pro
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Select a diagram type to get started
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {diagramOptions.map((option) => (
            <div
              key={option.type}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-transform 
                ${option.comingSoon 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:scale-105 cursor-pointer'}`}
              onClick={() => !option.comingSoon && onSelect(option.type, option.title)}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {option.title}
                  </h3>
                  {option.comingSoon && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className={`text-gray-600 ${option.comingSoon ? 'opacity-75' : ''}`}>
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiagramSelector; 