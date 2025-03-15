'use client';

import { DiagramSettings } from '../types/diagram';

interface DiagramControlsProps {
  onUpdate: (updates: DiagramSettings) => void;
  settings: DiagramSettings;
}

export default function DiagramControls({ onUpdate, settings }: DiagramControlsProps) {
  const handleChange = (field: keyof DiagramSettings, value: number | string) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Title</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diagram Title
          </label>
          <input
            type="text"
            value={settings.title || ""}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter diagram title"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Elasticity</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supply Elasticity
            </label>
            <select
              value={settings.supplyElasticity}
              onChange={(e) => handleChange('supplyElasticity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unitary">Unitary</option>
              <option value="relatively-elastic">Relatively Elastic</option>
              <option value="relatively-inelastic">Relatively Inelastic</option>
              <option value="perfectly-elastic">Perfectly Elastic</option>
              <option value="perfectly-inelastic">Perfectly Inelastic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demand Elasticity
            </label>
            <select
              value={settings.demandElasticity}
              onChange={(e) => handleChange('demandElasticity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unitary">Unitary</option>
              <option value="relatively-elastic">Relatively Elastic</option>
              <option value="relatively-inelastic">Relatively Inelastic</option>
              <option value="perfectly-elastic">Perfectly Elastic</option>
              <option value="perfectly-inelastic">Perfectly Inelastic</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Axis Labels</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y-Axis Label
            </label>
            <input
              type="text"
              value={settings.yAxisLabel}
              onChange={(e) => handleChange('yAxisLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Y-axis label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X-Axis Label
            </label>
            <input
              type="text"
              value={settings.xAxisLabel}
              onChange={(e) => handleChange('xAxisLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter X-axis label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
              <span className="ml-2 text-xs text-gray-500">{settings.fontSize}px</span>
            </label>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Line Weight</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line Thickness
            <span className="ml-2 text-xs text-gray-500">{settings.lineThickness}px</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.lineThickness}
            onChange={(e) => handleChange('lineThickness', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
} 