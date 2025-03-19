import React from 'react';

interface CanvasControlsProps {
  width: number;
  height: number;
  size: number;
  onUpdateWidth: (width: number) => void;
  onUpdateHeight: (height: number) => void;
  onUpdateSize: (size: number) => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  width,
  height,
  size,
  onUpdateWidth,
  onUpdateHeight,
  onUpdateSize,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-black">Canvas Controls</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-black mb-1">Canvas Width</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="400"
              max="1200"
              step="50"
              value={width}
              onChange={(e) => onUpdateWidth(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-black min-w-[60px] text-right">
              {width}px
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-black mb-1">Canvas Height</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="400"
              max="800"
              step="50"
              value={height}
              onChange={(e) => onUpdateHeight(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-black min-w-[60px] text-right">
              {height}px
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-black mb-1">Scale</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={size}
              onChange={(e) => onUpdateSize(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-black min-w-[60px] text-right">
              {Math.round(size * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasControls; 