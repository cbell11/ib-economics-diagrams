'use client';

import { useState } from 'react';

interface DiagramPromptProps {
  onDiagramTypeSelect: (type: 'supply-demand' | 'ppf' | 'cost-curves', context: string) => void;
}

export default function DiagramPrompt({ onDiagramTypeSelect }: DiagramPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting prompt:', prompt);
      
      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze prompt');
      }

      if (!data.diagramType) {
        throw new Error('No diagram type received from server');
      }

      onDiagramTypeSelect(data.diagramType, prompt);
    } catch (err: unknown) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Describe Your Economic Scenario</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Describe the economic scenario you want to analyze
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError(null); // Clear error when user starts typing
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Example: I want to analyze how a decrease in supply affects the equilibrium price and quantity in the market for coffee"
            required
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading || !prompt.trim() 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {isLoading ? 'Analyzing...' : 'Create Diagram'}
        </button>
      </form>
    </div>
  );
} 