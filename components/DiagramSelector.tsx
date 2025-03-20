'use client';
import React from 'react';
import { DiagramType } from '../types/diagram';

interface DiagramSelectorProps {
  onSelect: (type: DiagramType, title: string) => void;
}

interface DiagramOption {
  type: DiagramType;
  title: string;
  description: string;
  comingSoon: boolean;
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

export default function DiagramSelector({ onSelect }: DiagramSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EconGraph Pro</h1>
          <p className="text-xl text-gray-600">Select a diagram type</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {diagramOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => !option.comingSoon && onSelect(option.type, option.title)}
              className={`relative group p-6 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                option.comingSoon 
                  ? 'cursor-not-allowed opacity-75' 
                  : 'hover:scale-105 cursor-pointer'
              }`}
              disabled={option.comingSoon}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{option.title}</h3>
              <p className="text-gray-600 text-sm">{option.description}</p>
              {option.comingSoon && (
                <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 