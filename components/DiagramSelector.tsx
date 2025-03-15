'use client';

import { useState } from 'react';

interface DiagramSelectorProps {
  onSelect: (type: 'supply-demand' | 'ppf' | 'cost-curves', title: string) => void;
}

const diagramTypes = [
  {
    id: 'supply-demand',
    label: 'Supply & Demand',
    description: 'Create a supply and demand diagram to analyze market equilibrium, price changes, and elasticity.'
  },
  {
    id: 'ppf',
    label: 'Production Possibility Frontier',
    description: 'Illustrate the production trade-offs between two goods and analyze opportunity costs.'
  },
  {
    id: 'cost-curves',
    label: 'Cost Curves',
    description: 'Visualize different types of costs and their relationships in production.'
  },
] as const;

export default function DiagramSelector({ onSelect }: DiagramSelectorProps) {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Create New Economic Diagram</h1>
      
      {/* Prompt input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your economic scenario (optional)
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Supply and demand for coffee in Brazil"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Diagram type selection */}
      <div className="grid md:grid-cols-3 gap-6">
        {diagramTypes.map((diagram) => (
          <button
            key={diagram.id}
            onClick={() => onSelect(diagram.id, prompt)}
            className="flex flex-col p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{diagram.label}</h3>
            <p className="text-sm text-gray-600 flex-1">{diagram.description}</p>
            <div className="mt-4 text-blue-600 text-sm font-medium">
              Click to create →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 