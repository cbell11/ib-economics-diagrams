'use client';
import React from 'react';
import { DiagramType, DiagramTypes } from '../types/diagram';

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
    type: DiagramTypes.SUPPLY_DEMAND,
    title: 'Supply and Demand',
    description: 'Create supply and demand diagrams with various elasticities, interventions, and welfare analysis.',
    comingSoon: false
  },
  {
    type: DiagramTypes.EXTERNALITIES,
    title: 'Externalities',
    description: 'Illustrate positive and negative externalities with social and private cost/benefit curves.',
    comingSoon: false
  },
  {
    type: DiagramTypes.PPC,
    title: 'Production Possibilities Curve (PPC)',
    description: 'Create production possibilities curves to show opportunity costs and economic growth.',
    comingSoon: false
  },
  {
    type: DiagramTypes.NEO_CLASSICAL_AD_AS,
    title: 'Neo-Classical AD/AS',
    description: 'Illustrate aggregate demand and supply with various economic scenarios.',
    comingSoon: true
  },
  {
    type: DiagramTypes.KEYNESIAN_AD_AS,
    title: 'Keynesian AD/AS',
    description: 'Coming soon: Create Keynesian aggregate demand and supply diagrams with horizontal AS curve in the short run.',
    comingSoon: true
  },
  {
    type: DiagramTypes.INTERNATIONAL_TRADE,
    title: 'International Trade',
    description: 'Create diagrams showing trade patterns, tariffs, and quotas.',
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
              onClick={() => onSelect(option.type, option.title)}
              className={`relative group p-6 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                option.comingSoon 
                  ? 'cursor-not-allowed opacity-75' 
                  : 'hover:scale-105 cursor-pointer hover:shadow-xl'
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
              {!option.comingSoon && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg 
                    className="w-6 h-6 text-[#4895ef]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 8l4 4m0 0l-4 4m4-4H3" 
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 