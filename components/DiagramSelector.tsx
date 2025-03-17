'use client';
import React from 'react';

interface DiagramSelectorProps {
  onSelect: (type: 'supply-demand', title: string) => void;
}

interface DiagramType {
  id: string;
  label: string;
  description: string;
  comingSoon?: boolean;
  icon: React.ReactNode;
}

const diagramTypes: DiagramType[] = [
  {
    id: 'supply-demand',
    label: 'Supply & Demand',
    description: 'Create a supply and demand diagram to analyze market equilibrium, price changes, and elasticity.',
    icon: (
      <svg className="w-8 h-8 text-[#4895ef]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l6 6l4-4l8 8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16l6-6l4 4l8-8" />
        <circle cx="21" cy="3" r="1" className="fill-[#4895ef]" />
        <circle cx="3" cy="21" r="1" className="fill-[#4895ef]" />
      </svg>
    )
  },
  {
    id: 'neo-classical-ad-as',
    label: 'Neo-Classical AD/AS',
    description: 'Coming Soon - Create aggregate demand and supply diagrams with a vertical long-run aggregate supply curve.',
    comingSoon: true,
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l6 6l4-4l8 8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16l6-6l4 4l8-8" />
        <circle cx="21" cy="3" r="1" className="fill-gray-400" />
        <circle cx="3" cy="21" r="1" className="fill-gray-400" />
      </svg>
    )
  },
  {
    id: 'keynesian-ad-as',
    label: 'Keynesian AD/AS',
    description: 'Coming Soon - Create aggregate demand and supply diagrams with a horizontal short-run aggregate supply curve.',
    comingSoon: true,
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16l6-6l4 4l8-8" />
        <circle cx="21" cy="3" r="1" className="fill-gray-400" />
        <circle cx="3" cy="21" r="1" className="fill-gray-400" />
      </svg>
    )
  },
  {
    id: 'externalities',
    label: 'Externalities',
    description: 'Coming Soon - Illustrate positive and negative externalities with social and private cost/benefit curves.',
    comingSoon: true,
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    id: 'lorenz-curve',
    label: 'Lorenz Curve',
    description: 'Coming Soon - Create Lorenz curves to analyze income inequality and calculate the Gini coefficient.',
    comingSoon: true,
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v16h16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 20c4-8 8-12 16-16" />
      </svg>
    )
  },
  {
    id: 'international-trade',
    label: 'International Trade Diagram',
    description: 'Coming Soon - Visualize comparative advantage, terms of trade, and gains from trade between countries.',
    comingSoon: true,
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15v4m0 0h4m-4 0l5-5m4 0l5 5m0 0v-4m0 4h-4" />
      </svg>
    )
  }
] as const;

export default function DiagramSelector({ onSelect }: DiagramSelectorProps) {
  return (
    <div className="min-h-screen">
      <div className="w-[70%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:space-x-12 mt-10">
          {/* Content Section - Left Side */}
          <div className="lg:w-1/2 lg:pr-8">
            <div className="mb-12">
              <h1 className="text-5xl font-black text-[#4895ef] mb-6 tracking-tight">
                EconGraph Pro
              </h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">🚀 Meet EconGraph Pro</h2>
              <p className="text-gray-600 mb-6">
                Create professional economics diagrams in seconds. Whether you&apos;re studying for IB Economics or teaching it, our tool makes it easy to create perfect diagrams. No more &quot;good enough&quot; hand-drawn graphs - now you&apos;ll have publication-quality diagrams at your fingertips. It&apos;s what we wished we&apos;d had when we were studying IB Economics!
              </p>
              <p className="text-base text-gray-600 mb-12 leading-relaxed">
                That&apos;s exactly why we built EconGraph Pro. Our AI tool creates clean, accurate diagrams that align perfectly with IB Economics syllabus guidelines—so you spend less time tweaking and more time studying (or relaxing).
              </p>
            </div>

            {/* Features Box */}
            <div className="bg-[#4895ef] text-white rounded-3xl p-8 mb-12 shadow-lg">
              <h3 className="text-xl font-bold mb-6">Why Choose EconGraph Pro over ChatGPT?</h3>
              <ul className="space-y-4 text-base">
                <li className="flex items-center">
                  <span className="text-[#ffc145] mr-2">✅</span>
                  Built specifically for IB Economics diagrams
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffc145] mr-2">✅</span>
                  Knows exactly what IB examiners expect
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffc145] mr-2">✅</span>
                  Quickly editable, visually appealing, and accurate diagrams
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffc145] mr-2">✅</span>
                  Zero guesswork or generic responses
                </li>
                <li className="flex items-center">
                  <span className="text-[#ffc145] mr-2">✅</span>
                  Designed to boost your marks with clear, examiner-ready visuals
                </li>
              </ul>
              <p className="mt-6 text-base">
                No more generic diagrams, awkward AI explanations, or confusing instructions—just simple, IB-ready visuals at your fingertips.
              </p>
            </div>
          </div>

          {/* Diagram Selection Section - Right Side */}
          <div className="lg:w-1/2 lg:pl-8">
            <div className="sticky top-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📌 Try it today and see how easy IB Economics diagrams can be!
                </h2>
              </div>
              
              <div className="grid gap-6">
                {diagramTypes.map((diagram) => (
                  <button
                    key={diagram.id}
                    onClick={() => !diagram.comingSoon && onSelect(diagram.id as 'supply-demand', 'Supply and Demand Diagram')}
                    disabled={diagram.comingSoon}
                    className={`group relative flex flex-col p-8 ${
                      diagram.comingSoon 
                        ? 'bg-gray-50 cursor-not-allowed opacity-75' 
                        : 'bg-white/80 backdrop-blur-sm hover:shadow-xl hover:ring-[#4895ef]/50'
                    } rounded-3xl shadow-lg ring-1 ring-blue-200/50 transition-all duration-300 text-left`}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`p-4 rounded-2xl ${
                        diagram.comingSoon 
                          ? 'bg-gray-100' 
                          : 'bg-gradient-to-br from-blue-50 to-cyan-50'
                      }`}>
                        {diagram.icon}
                      </div>
                      <div className="ml-6">
                        <h3 className={`text-xl font-bold ${
                          diagram.comingSoon ? 'text-gray-500' : 'text-gray-900'
                        } tracking-tight`}>
                          {diagram.label}
                        </h3>
                        {diagram.comingSoon && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-base leading-relaxed mb-8 ${
                      diagram.comingSoon ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {diagram.description}
                    </p>
                    <div className={`flex items-center ${
                      diagram.comingSoon 
                        ? 'text-gray-400' 
                        : 'text-[#4895ef] group-hover:text-[#ffc145]'
                    } font-semibold transition-colors duration-300`}>
                      {diagram.comingSoon ? 'Coming Soon' : 'Create diagram'}
                      <svg className={`w-5 h-5 ml-2 ${
                        !diagram.comingSoon && 'transform group-hover:translate-x-1'
                      } transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 