'use client';

import { useEffect, useState } from 'react';
import { DiagramSettings } from '../types/diagram';
import { Stage, Layer, Line, Text, Circle } from 'react-konva';

// Loading component that uses Konva components
const LoadingComponent = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div>Loading...</div>
  </div>
);

interface DiagramCanvasProps {
  type: 'supply-demand' | 'ppf' | 'cost-curves';
  settings: DiagramSettings;
  width: number;
  height: number;
}

export default function DiagramCanvas({ type, settings, width, height }: DiagramCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [showS2, setShowS2] = useState(false);
  const [showS3, setShowS3] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [showP3, setShowP3] = useState(false);
  const [s2Distance, setS2Distance] = useState(40);
  const [s3Distance, setS3Distance] = useState(40);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateLinePoints = (isSupply: boolean) => {
    const initialX = 160;
    const availableWidth = width - 170;
    const centerX = initialX + (availableWidth / 2);
    
    // Calculate the center point of the diagram
    const centerY = (height - 120) / 2 + 80;
    
    // Get elasticity settings
    const elasticity = isSupply ? settings.supplyElasticity : settings.demandElasticity;
    
    // Map elasticity to angle and line length
    let angle, lineLength;
    if (isSupply) {
      switch (elasticity) {
        case 'unitary':
          angle = 45;
          lineLength = 80;
          break;
        case 'relatively-elastic':
          angle = 20;
          lineLength = 100;
          break;
        case 'relatively-inelastic':
          angle = 65;
          lineLength = 40;
          break;
        case 'perfectly-elastic':
          angle = 0;
          lineLength = 100;
          break;
        case 'perfectly-inelastic':
          angle = 90;
          lineLength = 5;
          break;
        default:
          angle = 45;
          lineLength = 80;
      }
    } else {
      switch (elasticity) {
        case 'unitary':
          angle = -45;
          lineLength = 80;
          break;
        case 'relatively-elastic':
          angle = -20;
          lineLength = 100;
          break;
        case 'relatively-inelastic':
          angle = -75;
          lineLength = 95;
          break;
        case 'perfectly-elastic':
          angle = 0;
          lineLength = 100;
          break;
        case 'perfectly-inelastic':
          angle = -90;
          lineLength = 5;
          break;
        default:
          angle = -45;
          lineLength = 80;
      }
    }
    
    // Calculate angle in radians
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate how close the angle is to vertical (90° or -90°)
    const angleFromVertical = Math.abs(Math.abs(angle) - 90);
    
    // Calculate base line width
    const baseLineWidth = availableWidth * 0.8;
    
    // Apply line length adjustment
    const adjustedLineWidth = baseLineWidth * (lineLength / 100);
    const halfLineWidth = adjustedLineWidth / 2;
    
    // Calculate vertical offset based on angle and adjusted line width
    const verticalOffset = Math.tan(angleRad) * halfLineWidth;
    
    // Calculate start and end points
    const startX = centerX - halfLineWidth;
    const endX = centerX + halfLineWidth;
    
    let startY, endY;
    
    // For supply line (0° to 91°)
    if (isSupply) {
      if (angle >= 90) { // If vertical or beyond (90° or 91°)
        startY = 50; // Start at top
        endY = height - 70; // End at bottom
      } else if (angle > 89) { // Handle angles between 89° and 90°
        // Use a linear interpolation for angles near vertical
        const progress = (angle - 89) / 1;
        const verticalStartY = 50;
        const verticalEndY = height - 70;
        const normalStartY = centerY + Math.tan((89 * Math.PI) / 180) * halfLineWidth;
        const normalEndY = centerY - Math.tan((89 * Math.PI) / 180) * halfLineWidth;
        
        startY = normalStartY + (verticalStartY - normalStartY) * progress;
        endY = normalEndY + (verticalEndY - normalEndY) * progress;
      } else if (angle > 85) { // Handle angles between 85° and 89°
        // Use a linear interpolation for angles near vertical
        const progress = (angle - 85) / 4;
        const verticalStartY = centerY + Math.tan((89 * Math.PI) / 180) * halfLineWidth;
        const verticalEndY = centerY - Math.tan((89 * Math.PI) / 180) * halfLineWidth;
        const normalStartY = centerY + Math.tan((85 * Math.PI) / 180) * halfLineWidth;
        const normalEndY = centerY - Math.tan((85 * Math.PI) / 180) * halfLineWidth;
        
        startY = normalStartY + (verticalStartY - normalStartY) * progress;
        endY = normalEndY + (verticalEndY - normalEndY) * progress;
      } else {
        startY = centerY + verticalOffset;
        endY = centerY - verticalOffset;
      }
    } 
    // For demand line (-90° to 0°)
    else {
      if (angleFromVertical < 1) { // If almost vertical (-90°)
        startY = 50; // Start at top
        endY = height - 70; // End at bottom
      } else {
        startY = centerY + verticalOffset;
        endY = centerY - verticalOffset;
      }
    }

    // Ensure lines stay within bounds
    const minY = 50;
    const maxY = height - 70;
    
    // Clamp both start and end Y positions
    const clampedStartY = Math.max(minY, Math.min(maxY, startY));
    const clampedEndY = Math.max(minY, Math.min(maxY, endY));

    // If line would go out of bounds, adjust the line width to fit
    if (clampedStartY === minY || clampedEndY === maxY) {
      // Calculate the maximum allowed vertical offset based on the angle
      const maxVerticalOffset = Math.min(
        Math.abs(centerY - minY),
        Math.abs(maxY - centerY)
      );
      
      const newLineWidth = maxVerticalOffset / Math.abs(Math.tan(angleRad));
      const newHalfLineWidth = newLineWidth / 2;
      
      return [
        centerX - newHalfLineWidth,
        clampedStartY,
        centerX + newHalfLineWidth,
        clampedEndY
      ];
    }

    return [startX, clampedStartY, endX, clampedEndY];
  };

  const calculateEquilibriumPoint = (supplyPoints: number[], demandPoints: number[]) => {
    // Calculate the center point of the diagram
    const centerX = 160 + (width - 170) / 2;
    const centerY = (height - 120) / 2 + 50;

    // Check for perfectly inelastic lines
    const isSupplyVertical = Math.abs(supplyPoints[2] - supplyPoints[0]) < 0.1;
    const isDemandVertical = Math.abs(demandPoints[2] - demandPoints[0]) < 0.1;

    if (isSupplyVertical && isDemandVertical) {
      // If both lines are vertical, use the center point
      return { x: centerX, y: centerY };
    } else if (isSupplyVertical) {
      // If only supply is vertical, use supply's x-coordinate
      const demandSlope = (demandPoints[3] - demandPoints[1]) / (demandPoints[2] - demandPoints[0]);
      const demandYIntercept = demandPoints[1] - demandSlope * demandPoints[0];
      return {
        x: supplyPoints[0],
        y: demandSlope * supplyPoints[0] + demandYIntercept
      };
    } else if (isDemandVertical) {
      // If only demand is vertical, use demand's x-coordinate
      const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
      const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
      return {
        x: demandPoints[0],
        y: supplySlope * demandPoints[0] + supplyYIntercept
      };
    }

    // Normal case: calculate slopes and intersection
    const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
    const demandSlope = (demandPoints[3] - demandPoints[1]) / (demandPoints[2] - demandPoints[0]);

    // Calculate the y-intercepts
    const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
    const demandYIntercept = demandPoints[1] - demandSlope * demandPoints[0];

    // Calculate intersection point
    const x = (demandYIntercept - supplyYIntercept) / (supplySlope - demandSlope);
    const y = supplySlope * x + supplyYIntercept;

    return { x, y };
  };

  const renderSupplyDemand = () => {
    // Clip the lines at the boundaries
    const clipLine = (points: number[]) => {
      const [x1, y1, x2, y2] = points;
      const minY = 80;  // Top boundary
      const maxY = height - 70;  // Bottom boundary
      const minX = 160;  // Left boundary
      const maxX = width - 90;  // Right boundary

      // If the entire line is outside boundaries, return null
      if ((y1 < minY && y2 < minY) || 
          (y1 > maxY && y2 > maxY) ||
          (x1 < minX && x2 < minX) ||
          (x1 > maxX && x2 > maxX)) {
        return null;
      }

      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;

      // Calculate slope
      const slope = (y2 - y1) / (x2 - x1);

      // Clip at top boundary
      if (y1 < minY) {
        clippedX1 = x1 + (minY - y1) / slope;
        clippedY1 = minY;
      }
      if (y2 < minY) {
        clippedX2 = x2 + (minY - y2) / slope;
        clippedY2 = minY;
      }

      // Clip at bottom boundary
      if (y1 > maxY) {
        clippedX1 = x1 + (maxY - y1) / slope;
        clippedY1 = maxY;
      }
      if (y2 > maxY) {
        clippedX2 = x2 + (maxY - y2) / slope;
        clippedY2 = maxY;
      }

      // Clip at left boundary
      if (x1 < minX) {
        clippedY1 = y1 + slope * (minX - x1);
        clippedX1 = minX;
      }
      if (x2 < minX) {
        clippedY2 = y2 + slope * (minX - x2);
        clippedX2 = minX;
      }

      // Clip at right boundary
      if (x1 > maxX) {
        clippedY1 = y1 + slope * (maxX - x1);
        clippedX1 = maxX;
      }
      if (x2 > maxX) {
        clippedY2 = y2 + slope * (maxX - x2);
        clippedX2 = maxX;
      }

      return [clippedX1, clippedY1, clippedX2, clippedY2];
    };

    const supplyPoints = calculateLinePoints(true);
    const demandPoints = calculateLinePoints(false);
    const clippedDemandPoints = clipLine(demandPoints);
    const equilibrium = calculateEquilibriumPoint(supplyPoints, clippedDemandPoints || demandPoints);

    // Calculate points for shifted supply lines
    const shiftedUpSupplyPoints = [
      supplyPoints[0],
      supplyPoints[1] - s2Distance,
      supplyPoints[2],
      supplyPoints[3] - s2Distance
    ];
    const shiftedDownSupplyPoints = [
      supplyPoints[0],
      supplyPoints[1] + s3Distance,
      supplyPoints[2],
      supplyPoints[3] + s3Distance
    ];

    // Clip the lines at the boundaries
    const clippedShiftedUpPoints = showS2 ? clipLine(shiftedUpSupplyPoints) : null;
    const clippedShiftedDownPoints = showS3 ? clipLine(shiftedDownSupplyPoints) : null;
    const shiftedUpEquilibrium = showS2 && clippedShiftedUpPoints ? calculateEquilibriumPoint(clippedShiftedUpPoints, clippedDemandPoints || demandPoints) : null;
    const shiftedDownEquilibrium = showS3 && clippedShiftedDownPoints ? calculateEquilibriumPoint(clippedShiftedDownPoints, clippedDemandPoints || demandPoints) : null;

    return (
      <Layer>
        {/* Title */}
        <Text
          text={settings.title || ""}
          x={(width + 200) / 2 - 300}
          y={20}
          fontSize={settings.fontSize * 1.2}
          fill="#000000"
          width={600}
          align="center"
          wrap="none"
        />

        {/* X and Y axes */}
        <Line
          points={[160, height - 70, width - 90, height - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness * 0.75}
        />
        <Line
          points={[160, 80, 160, height - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness * 0.75}
        />

        {/* Original Supply curve */}
        <Line
          points={supplyPoints}
          stroke={settings.primaryColor}
          strokeWidth={settings.lineThickness}
        />

        {/* Shifted Up Supply curve (S₂) */}
        {showS2 && clippedShiftedUpPoints && (
          <Line
            points={clippedShiftedUpPoints}
            stroke={settings.primaryColor}
            strokeWidth={settings.lineThickness}
          />
        )}

        {/* Shifted Down Supply curve (S₃) */}
        {showS3 && clippedShiftedDownPoints && (
          <Line
            points={clippedShiftedDownPoints}
            stroke={settings.primaryColor}
            strokeWidth={settings.lineThickness}
          />
        )}

        {/* Demand curve */}
        {clippedDemandPoints && (
          <Line
            points={clippedDemandPoints}
            stroke={settings.secondaryColor}
            strokeWidth={settings.lineThickness}
          />
        )}

        {/* Original equilibrium point and dotted lines */}
        <Line
          points={[equilibrium.x, equilibrium.y, equilibrium.x, height - 70]}
          stroke="#666666"
          strokeWidth={1}
          dash={[4, 4]}
        />
        <Line
          points={[160, equilibrium.y, equilibrium.x, equilibrium.y]}
          stroke="#666666"
          strokeWidth={1}
          dash={[4, 4]}
        />
        <Circle
          x={equilibrium.x}
          y={equilibrium.y}
          radius={6}
          fill="#000000"
          stroke="#000000"
          strokeWidth={1}
        />
        <Text
          text="Pₑ"
          x={125}
          y={equilibrium.y - 8}
          fontSize={settings.fontSize}
          fill="#000000"
        />
        <Text
          text="Qₑ"
          x={equilibrium.x - 8}
          y={height - 55}
          fontSize={settings.fontSize}
          fill="#000000"
        />

        {/* S₂ equilibrium point and dotted lines */}
        {showS2 && shiftedUpEquilibrium && (
          <>
            <Line
              points={[shiftedUpEquilibrium.x, shiftedUpEquilibrium.y, shiftedUpEquilibrium.x, height - 70]}
              stroke="#666666"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Line
              points={[160, shiftedUpEquilibrium.y, shiftedUpEquilibrium.x, shiftedUpEquilibrium.y]}
              stroke="#666666"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Circle
              x={shiftedUpEquilibrium.x}
              y={shiftedUpEquilibrium.y}
              radius={6}
              fill="#000000"
              stroke="#000000"
              strokeWidth={1}
            />
            <Text
              text="P₁"
              x={125}
              y={shiftedUpEquilibrium.y - 8}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            <Text
              text="Q₁"
              x={shiftedUpEquilibrium.x - 8}
              y={height - 55}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            {/* Calculate intersection point of Q₁'s vertical line with S₁ */}
            {(() => {
              const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
              const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
              const intersectionY = supplySlope * shiftedUpEquilibrium.x + supplyYIntercept;
              
              return showP2 ? (
                <>
                  <Line
                    points={[160, intersectionY, shiftedUpEquilibrium.x, intersectionY]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Circle
                    x={shiftedUpEquilibrium.x}
                    y={intersectionY}
                    radius={6}
                    fill="#000000"
                    stroke="#000000"
                    strokeWidth={1}
                  />
                  <Text
                    text="P₂"
                    x={125}
                    y={intersectionY - 8}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                </>
              ) : null;
            })()}
          </>
        )}

        {/* S₃ equilibrium point and dotted lines */}
        {showS3 && shiftedDownEquilibrium && (
          <>
            <Line
              points={[shiftedDownEquilibrium.x, shiftedDownEquilibrium.y, shiftedDownEquilibrium.x, height - 70]}
              stroke="#666666"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Line
              points={[160, shiftedDownEquilibrium.y, shiftedDownEquilibrium.x, shiftedDownEquilibrium.y]}
              stroke="#666666"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Circle
              x={shiftedDownEquilibrium.x}
              y={shiftedDownEquilibrium.y}
              radius={6}
              fill="#000000"
              stroke="#000000"
              strokeWidth={1}
            />
            <Text
              text="P₂"
              x={125}
              y={shiftedDownEquilibrium.y - 8}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            <Text
              text="Q₂"
              x={shiftedDownEquilibrium.x - 8}
              y={height - 55}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            {/* Calculate intersection point of Q₂'s vertical line with S₁ */}
            {(() => {
              const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
              const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
              const intersectionY = supplySlope * shiftedDownEquilibrium.x + supplyYIntercept;
              
              return showP3 ? (
                <>
                  <Line
                    points={[160, intersectionY, shiftedDownEquilibrium.x, intersectionY]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Circle
                    x={shiftedDownEquilibrium.x}
                    y={intersectionY}
                    radius={6}
                    fill="#000000"
                    stroke="#000000"
                    strokeWidth={1}
                  />
                  <Text
                    text="P₃"
                    x={125}
                    y={intersectionY - 8}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                </>
              ) : null;
            })()}
          </>
        )}

        {/* Labels */}
        <Text
          text={settings.yAxisLabel}
          x={20}
          y={65}
          fontSize={settings.fontSize}
          fill="#000000"
          width={120}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />
        <Text
          text={settings.xAxisLabel}
          x={width - 200}
          y={height - 55}
          fontSize={settings.fontSize}
          fill="#000000"
          width={180}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />
        <Text
          text="S₁"
          x={supplyPoints[2] + 20}
          y={Math.min(supplyPoints[1], supplyPoints[3]) - 20}
          fontSize={settings.fontSize}
          fill={settings.primaryColor}
        />
        {showS2 && clippedShiftedUpPoints && (
          <Text
            text="S₂"
            x={clippedShiftedUpPoints[2] + 20}
            y={Math.min(clippedShiftedUpPoints[1], clippedShiftedUpPoints[3]) - 20}
            fontSize={settings.fontSize}
            fill={settings.primaryColor}
          />
        )}
        {showS3 && clippedShiftedDownPoints && (
          <Text
            text="S₃"
            x={clippedShiftedDownPoints[2] + 20}
            y={Math.min(clippedShiftedDownPoints[1], clippedShiftedDownPoints[3]) - 20}
            fontSize={settings.fontSize}
            fill={settings.primaryColor}
          />
        )}
        <Text
          text="D"
          x={demandPoints[2] + 20}
          y={demandPoints[3] - 20}
          fontSize={settings.fontSize}
          fill={settings.secondaryColor}
        />
      </Layer>
    );
  };

  const renderPPF = () => (
    <Layer>
      {/* X and Y axes */}
      <Line
        points={[50, height - 50, width - 50, height - 50]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />
      <Line
        points={[50, 50, 50, height - 50]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />

      {/* Axis arrows */}
      <Line
        points={[
          width - 50, height - 50,
          width - 60, height - 55,
          width - 50, height - 50,
          width - 60, height - 45
        ]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />
      <Line
        points={[
          50, 50,
          45, 60,
          50, 50,
          55, 60
        ]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />

      {/* PPF curve */}
      <Line
        points={[
          50, height - 50,
          width * 0.2, height * 0.3,
          width * 0.5, height * 0.15,
          width - 50, 50
        ]}
        stroke={settings.primaryColor}
        strokeWidth={settings.lineThickness}
      />

      {/* Labels */}
      <Text
        text="Good A"
        x={15}
        y={height / 2}
        rotation={-90}
        fontSize={settings.fontSize}
        fill="#000000"
      />
      <Text
        text="Good B"
        x={width / 2 - 30}
        y={height - 35}
        fontSize={settings.fontSize}
        fill="#000000"
      />
      <Text
        text="PPF"
        x={width - 80}
        y={60}
        fontSize={settings.fontSize}
        fill={settings.primaryColor}
      />
    </Layer>
  );

  const renderCostCurves = () => (
    <Layer>
      {/* X and Y axes */}
      <Line
        points={[50, height - 50, width - 50, height - 50]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />
      <Line
        points={[50, 50, 50, height - 50]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />

      {/* Axis arrows */}
      <Line
        points={[
          width - 50, height - 50,
          width - 60, height - 55,
          width - 50, height - 50,
          width - 60, height - 45
        ]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />
      <Line
        points={[
          50, 50,
          45, 60,
          50, 50,
          55, 60
        ]}
        stroke="#000000"
        strokeWidth={settings.lineThickness * 0.75}
      />

      {/* Average Total Cost curve */}
      <Line
        points={[
          50, height - 100,
          width * 0.25, height - 150,
          width * 0.5, height - 200,
          width * 0.75, height - 150,
          width - 50, height - 100
        ]}
        stroke={settings.primaryColor}
        strokeWidth={settings.lineThickness}
      />

      {/* Marginal Cost curve */}
      <Line
        points={[
          50, height - 150,
          width * 0.25, height - 200,
          width * 0.5, height - 100,
          width * 0.75, height - 50,
          width - 50, 50
        ]}
        stroke={settings.secondaryColor}
        strokeWidth={settings.lineThickness}
      />

      {/* Labels */}
      <Text
        text="Cost"
        x={15}
        y={height / 2}
        rotation={-90}
        fontSize={settings.fontSize}
        fill="#000000"
      />
      <Text
        text="Quantity"
        x={width / 2 - 30}
        y={height - 35}
        fontSize={settings.fontSize}
        fill="#000000"
      />
      <Text
        text="ATC"
        x={width - 80}
        y={height - 160}
        fontSize={settings.fontSize}
        fill={settings.primaryColor}
      />
      <Text
        text="MC"
        x={width - 80}
        y={60}
        fontSize={settings.fontSize}
        fill={settings.secondaryColor}
      />
    </Layer>
  );

  if (!mounted) {
    return (
      <div style={{ 
        width, 
        height, 
        backgroundColor: '#f0f0f0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #ccc',
          borderTop: '4px solid #666',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ width: width + 200, height, paddingLeft: '100px' }}>
      <Stage width={width + 200} height={height}>
        {type === 'supply-demand' && renderSupplyDemand()}
        {type === 'ppf' && renderPPF()}
        {type === 'cost-curves' && renderCostCurves()}
      </Stage>
      {type === 'supply-demand' && (
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            Interventions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                onClick={() => setShowS2(!showS2)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: showS2 ? '#2563eb' : '#e5e7eb',
                  color: showS2 ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  width: '80px'
                }}
              >
                Tax
              </button>
              <button
                onClick={() => setShowS3(!showS3)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: showS3 ? '#2563eb' : '#e5e7eb',
                  color: showS3 ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  width: '80px'
                }}
              >
                Subsidy
              </button>
            </div>
            {(showS2 || showS3) && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                backgroundColor: '#f3f4f6',
                padding: '10px',
                borderRadius: '4px',
                marginTop: '4px'
              }}>
                {showS2 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ 
                      fontSize: '14px', 
                      color: '#374151',
                      width: '120px'
                    }}>
                      Tax Shift:
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={s2Distance}
                      onChange={(e) => setS2Distance(Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#374151',
                      width: '40px'
                    }}>
                      {s2Distance}
                    </span>
                  </div>
                )}
                {showS3 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ 
                        fontSize: '14px', 
                        color: '#374151',
                        width: '120px'
                      }}>
                        Subsidy Shift:
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="150"
                        value={s3Distance}
                        onChange={(e) => setS3Distance(Number(e.target.value))}
                        style={{ flex: 1 }}
                      />
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#374151',
                        width: '40px'
                      }}>
                        {s3Distance}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <button
                        onClick={() => setShowP3(!showP3)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: showP3 ? '#2563eb' : '#e5e7eb',
                          color: showP3 ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        Show Subsidy Distance
                      </button>
                    </div>
                  </>
                )}
                {showS2 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <button
                      onClick={() => setShowP2(!showP2)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: showP2 ? '#2563eb' : '#e5e7eb',
                        color: showP2 ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      Show Tax Distance
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 