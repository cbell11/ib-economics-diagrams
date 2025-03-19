'use client';

import { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { DiagramSettings } from '../types/diagram';
import { Stage, Layer, Line, Text, Circle, Rect } from 'react-konva';
import Konva from 'konva';

interface DiagramCanvasProps {
  width?: number;
  height?: number;
  settings: DiagramSettings;
  type: 'supply-demand' | 'ppf' | 'cost-curves';
  showS2: boolean;
  showS3: boolean;
  showPriceCeiling: boolean;
  showPriceFloor: boolean;
  onToggleS2: () => void;
  onToggleS3: () => void;
  onTogglePriceCeiling: () => void;
  onTogglePriceFloor: () => void;
  onUpdateSettings: (settings: DiagramSettings) => void;
}

interface DiagramCanvasRef {
  getStage: () => Konva.Stage | null;
}

const DiagramCanvas = forwardRef<DiagramCanvasRef, DiagramCanvasProps>(({ 
  settings, 
  width = 600,
  height = 400,
  type,
  showS2,
  showS3,
  showPriceCeiling,
  showPriceFloor,
  onToggleS2,
  onToggleS3,
  onTogglePriceCeiling,
  onTogglePriceFloor,
  onUpdateSettings
}, ref) => {
  const [mounted, setMounted] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [showP3, setShowP3] = useState(false);
  const [showShading, setShowShading] = useState(false);
  const [showSubsidyShading, setShowSubsidyShading] = useState(false);
  const [showWelfareLoss, setShowWelfareLoss] = useState(false);
  const [priceCeilingHeight, setPriceCeilingHeight] = useState(40);
  const [priceFloorHeight, setPriceFloorHeight] = useState(-40);
  const [welfareLossColor, setWelfareLossColor] = useState('#666666'); // Dark gray default
  const [welfareLossFillOpacity, setWelfareLossFillOpacity] = useState(0.3);
  const [welfareLossStrokeOpacity, setWelfareLossStrokeOpacity] = useState(0.5);
  const [shadingColor, setShadingColor] = useState('#90EE90'); // Light green default
  const [subsidyShadingColor, setSubsidyShadingColor] = useState('#90EE90'); // Light green default
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeOpacity, setStrokeOpacity] = useState(0.5);
  const [subsidyFillOpacity, setSubsidyFillOpacity] = useState(0.3);
  const [subsidyStrokeOpacity, setSubsidyStrokeOpacity] = useState(0.5);
  const [s2Distance, setS2Distance] = useState(40);
  const [s3Distance, setS3Distance] = useState(40);

  const pastelColors = [
    { color: '#666666', name: 'Gray' },
    { color: '#90EE90', name: 'Light Green' },
    { color: '#FFB6C1', name: 'Light Pink' },
    { color: '#87CEEB', name: 'Sky Blue' },
    { color: '#DDA0DD', name: 'Plum' },
    { color: '#F0E68C', name: 'Khaki' },
    { color: '#98FB98', name: 'Pale Green' },
    { color: '#B0C4DE', name: 'Light Steel Blue' },
    { color: '#FFA07A', name: 'Light Salmon' }
  ];

  const stageRef = useRef<Konva.Stage>(null);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current
  }));

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
          lineLength = 100;
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
          lineLength = 80;
          break;
        case 'relatively-inelastic':
          angle = -65;
          lineLength = 90;
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
        // Use the same center point and vertical offset calculation as supply
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

    // For demand line, extend the line to match the label position
    if (!isSupply) {
      const labelOffset = 20; // Distance from the line end to the label
      const labelX = endX + labelOffset;
      const labelY = endY - labelOffset;
      
      // Calculate the new end point to match the label position
      const slope = (endY - startY) / (endX - startX);
      const newEndX = labelX;
      const newEndY = startY + slope * (newEndX - startX);
      
      // Only extend the line if S3 is not shown
      if (!showS3) {
        return [startX, startY, newEndX, newEndY];
      }
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
    // Only render supply-demand diagram if type matches
    if (type !== 'supply-demand') {
      return (
        <Layer>
          <Text
            text="This diagram type is not yet implemented"
            x={width / 2}
            y={height / 2}
            fontSize={16}
            fill="#666"
            align="center"
            width={width}
          />
        </Layer>
      );
    }

    // Clip the lines at the boundaries
    const clipLine = (points: number[]) => {
      const [x1, y1, x2, y2] = points;
      const minY = 80;  // Top boundary
      const maxY = height - 70;  // Bottom boundary (x-axis)
      const minX = 160;  // Left boundary
      const maxX = width - 90;  // Right boundary

      // If the entire line is outside boundaries, return null
      if ((y1 < minY && y2 < minY) || 
          (y1 > maxY && y2 > maxY)) {
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

      // Clip at bottom boundary (x-axis)
      if (y1 > maxY) {
        clippedX1 = x1 + (maxY - y1) / slope;
        clippedY1 = maxY;
      }
      if (y2 > maxY) {
        clippedX2 = x2 + (maxY - y2) / slope;
        clippedY2 = maxY;
      }

      // For S3 line, extend the other end when one end is clipped
      if (showS3) {
        if (x1 < minX) {
          // If left end is clipped, extend right end
          const extension = (minX - x1) * 1.5; // Extend by 1.5x the clipped amount
          clippedX2 = x2 + extension;
          clippedY2 = y2 + slope * extension;
        } else if (x2 > maxX) {
          // If right end is clipped, extend left end
          const extension = (x2 - maxX) * 1.5; // Extend by 1.5x the clipped amount
          clippedX1 = x1 - extension;
          clippedY1 = y1 - slope * extension;
        }

        // Ensure S3 line never goes below x-axis
        if (clippedY1 > maxY) {
          clippedY1 = maxY;
          clippedX1 = x1 + (maxY - y1) / slope;
        }
        if (clippedY2 > maxY) {
          clippedY2 = maxY;
          clippedX2 = x2 + (maxY - y2) / slope;
        }
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
      supplyPoints[0] + s3Distance * 0.5, // Shift right by half the distance
      supplyPoints[1] + s3Distance,
      supplyPoints[2] + s3Distance * 0.5, // Shift right by half the distance
      supplyPoints[3] + s3Distance
    ];

    // Clip the lines at the boundaries
    const clippedShiftedUpPoints = showS2 ? clipLine(shiftedUpSupplyPoints) : null;
    const clippedShiftedDownPoints = showS3 ? clipLine(shiftedDownSupplyPoints) : null;
    const shiftedUpEquilibrium = showS2 && clippedShiftedUpPoints ? calculateEquilibriumPoint(clippedShiftedUpPoints, clippedDemandPoints || demandPoints) : null;
    const shiftedDownEquilibrium = showS3 && clippedShiftedDownPoints ? calculateEquilibriumPoint(clippedShiftedDownPoints, clippedDemandPoints || demandPoints) : null;

    return (
      <Layer>
        {/* White Background */}
        <Rect
          x={0}
          y={0}
          width={width + 200}
          height={height}
          fill="white"
        />

        {/* Watermarks */}
        {[0.25, 0.5, 0.75].map((position) => (
          <Text
            key={position}
            text="Copyright Diploma Collective"
            x={width * position}
            y={height / 2}
            fontSize={16}
            fill="#4195FF"
            opacity={0.2}
            rotation={-45}
            width={300}
            align="center"
            verticalAlign="middle"
            offsetX={150}
            offsetY={0}
            name="watermark"
          />
        ))}
        
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
          points={[160, height - 70, 160 + (height - 125), height - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness * 0.75}
        />
        <Line
          points={[160, 80, 160, height - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness * 0.75}
        />

        {/* Shaded region for subsidy cost - placed first to be behind everything */}
        {showS3 && showP3 && showSubsidyShading && shiftedDownEquilibrium && (() => {
          const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
          const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
          const intersectionY = supplySlope * shiftedDownEquilibrium.x + supplyYIntercept;
          
          return (
            <Line
              points={[
                160, shiftedDownEquilibrium.y,
                shiftedDownEquilibrium.x, shiftedDownEquilibrium.y,
                shiftedDownEquilibrium.x, intersectionY,
                160, intersectionY
              ]}
              closed={true}
              fill={subsidyShadingColor + Math.round(subsidyFillOpacity * 255).toString(16).padStart(2, '0')}
              stroke={subsidyShadingColor + Math.round(subsidyStrokeOpacity * 255).toString(16).padStart(2, '0')}
              strokeWidth={1}
            />
          );
        })()}

        {/* Shaded region for tax revenue */}
        {showS2 && showP2 && showShading && shiftedUpEquilibrium && (() => {
          const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
          const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
          const intersectionY = supplySlope * shiftedUpEquilibrium.x + supplyYIntercept;
          
          return (
            <Line
              points={[
                160, shiftedUpEquilibrium.y,
                shiftedUpEquilibrium.x, shiftedUpEquilibrium.y,
                shiftedUpEquilibrium.x, intersectionY,
                160, intersectionY
              ]}
              closed={true}
              fill={shadingColor + Math.round(fillOpacity * 255).toString(16).padStart(2, '0')}
              stroke={shadingColor + Math.round(strokeOpacity * 255).toString(16).padStart(2, '0')}
              strokeWidth={1}
            />
          );
        })()}

        {/* Welfare loss triangle */}
        {showS2 && showP2 && showWelfareLoss && shiftedUpEquilibrium && (() => {
          const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
          const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
          const intersectionY = supplySlope * shiftedUpEquilibrium.x + supplyYIntercept;
          
          return (
            <Line
              points={[
                equilibrium.x, equilibrium.y,
                shiftedUpEquilibrium.x, shiftedUpEquilibrium.y,
                shiftedUpEquilibrium.x, intersectionY
              ]}
              closed={true}
              fill={welfareLossColor + Math.round(welfareLossFillOpacity * 255).toString(16).padStart(2, '0')}
              stroke={welfareLossColor + Math.round(welfareLossStrokeOpacity * 255).toString(16).padStart(2, '0')}
              strokeWidth={1}
            />
          );
        })()}

        {/* Price Ceiling Line */}
        {showPriceCeiling && (
          <>
            <Line
              points={[
                160,
                equilibrium.y + priceCeilingHeight,
                160 + (height - 125) * 0.9,
                equilibrium.y + priceCeilingHeight
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="Pc"
              x={160 + (height - 125) * 0.9 + 10}
              y={equilibrium.y + priceCeilingHeight - 8}
              fontSize={settings.fontSize}
              fill="#000000"
            />

            {/* Calculate intersections with S and D */}
            {(() => {
              const ceilingY = equilibrium.y + priceCeilingHeight;
              
              // Calculate supply intersection
              const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
              const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
              const supplyIntersectX = (ceilingY - supplyYIntercept) / supplySlope;
              
              // Calculate demand intersection
              const demandSlope = (demandPoints[3] - demandPoints[1]) / (demandPoints[2] - demandPoints[0]);
              const demandYIntercept = demandPoints[1] - demandSlope * demandPoints[0];
              const demandIntersectX = (ceilingY - demandYIntercept) / demandSlope;
              
              return (
                <>
                  {/* Supply intersection vertical line */}
                  <Line
                    points={[supplyIntersectX, ceilingY, supplyIntersectX, height - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qs"
                    x={supplyIntersectX - 8}
                    y={height - 55}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                  
                  {/* Demand intersection vertical line */}
                  <Line
                    points={[demandIntersectX, ceilingY, demandIntersectX, height - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qd"
                    x={demandIntersectX - 8}
                    y={height - 55}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                </>
              );
            })()}
          </>
        )}

        {/* Price Floor Line */}
        {showPriceFloor && (
          <>
            <Line
              points={[
                160,
                equilibrium.y + priceFloorHeight,
                160 + (height - 125) * 0.9,
                equilibrium.y + priceFloorHeight
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="Pf"
              x={160 + (height - 125) * 0.9 + 10}
              y={equilibrium.y + priceFloorHeight - 8}
              fontSize={settings.fontSize}
              fill="#000000"
            />

            {/* Calculate intersections with S and D */}
            {(() => {
              const floorY = equilibrium.y + priceFloorHeight;
              
              // Calculate supply intersection
              const supplySlope = (supplyPoints[3] - supplyPoints[1]) / (supplyPoints[2] - supplyPoints[0]);
              const supplyYIntercept = supplyPoints[1] - supplySlope * supplyPoints[0];
              const supplyIntersectX = (floorY - supplyYIntercept) / supplySlope;
              
              // Calculate demand intersection
              const demandSlope = (demandPoints[3] - demandPoints[1]) / (demandPoints[2] - demandPoints[0]);
              const demandYIntercept = demandPoints[1] - demandSlope * demandPoints[0];
              const demandIntersectX = (floorY - demandYIntercept) / demandSlope;
              
              return (
                <>
                  {/* Supply intersection vertical line */}
                  <Line
                    points={[supplyIntersectX, floorY, supplyIntersectX, height - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qs"
                    x={supplyIntersectX - 8}
                    y={height - 55}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                  
                  {/* Demand intersection vertical line */}
                  <Line
                    points={[demandIntersectX, floorY, demandIntersectX, height - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qd"
                    x={demandIntersectX - 8}
                    y={height - 55}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                </>
              );
            })()}
          </>
        )}

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
          x={60}
          y={65}
          fontSize={settings.fontSize}
          fill="#000000"
          width={110}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />
        <Text
          text={settings.xAxisLabel}
          x={width - 100}
          y={height - 55}
          fontSize={settings.fontSize}
          fill="#000000"
          width={100}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />
        <Text
          text={!showS2 && !showS3 ? "S" : "S₁"}
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

  if (!mounted) {
    return (
      <div style={{ 
        width: width + 200, 
        minHeight: height + 300,
        paddingLeft: '100px',
        paddingBottom: '40px'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left side - Canvas */}
      <div style={{ 
        width: width + 200, 
        minHeight: height + 300,
        paddingBottom: '40px'
      }}>
        <Stage ref={stageRef} width={width + 200} height={height}>
          {renderSupplyDemand()}
        </Stage>
        {mounted && (
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            maxWidth: width + 200
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '4px'
              }}>
                Interventions
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'center',
                flexWrap: 'nowrap',
                width: '100%',
                justifyContent: 'flex-start'
              }}>
                <button
                  onClick={onToggleS2}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showS2 ? '#4895ef' : '#f5f5f5',
                    color: showS2 ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto'
                  }}
                >
                  Tax
                </button>
                <button
                  onClick={onToggleS3}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showS3 ? '#4895ef' : '#f5f5f5',
                    color: showS3 ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto'
                  }}
                >
                  Subsidy
                </button>
                <button
                  onClick={onTogglePriceCeiling}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showPriceCeiling ? '#32a567' : '#f5f5f5',
                    color: showPriceCeiling ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto'
                  }}
                >
                  Price Ceiling
                </button>
                <button
                  onClick={onTogglePriceFloor}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showPriceFloor ? '#32a567' : '#f5f5f5',
                    color: showPriceFloor ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto'
                  }}
                >
                  Price Floor
                </button>
              </div>
            </div>
            {showPriceCeiling && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginLeft: '20px' }}>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={priceCeilingHeight}
                  onChange={(e) => setPriceCeilingHeight(parseInt(e.target.value))}
                  style={{ width: '150px' }}
                />
              </div>
            )}
            {showPriceFloor && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginLeft: '20px' }}>
                <input
                  type="range"
                  min="-150"
                  max="0"
                  value={priceFloorHeight}
                  onChange={(e) => setPriceFloorHeight(parseInt(e.target.value))}
                  style={{ width: '150px' }}
                />
              </div>
            )}
            {showS2 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginLeft: '20px' }}>
                <button
                  onClick={() => setShowP2(!showP2)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showP2 ? '#4CAF50' : '#f0f0f0',
                    color: showP2 ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Show Tax Distance
                </button>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={s2Distance}
                  onChange={(e) => setS2Distance(parseInt(e.target.value))}
                  style={{ width: '150px' }}
                />
                {showP2 && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '4px 12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={showShading}
                            onChange={(e) => setShowShading(e.target.checked)}
                            id="showTaxRevenue"
                            style={{
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer',
                              accentColor: '#4895ef'
                            }}
                          />
                          <label
                            htmlFor="showTaxRevenue"
                            style={{
                              cursor: 'pointer',
                              userSelect: 'none',
                              fontSize: '14px',
                              color: '#1f2937'
                            }}
                          >
                            Show Tax/Government Revenue
                          </label>
                        </div>
                        {showShading && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: '#ffffff',
                            borderRadius: '4px',
                            marginLeft: '24px'
                          }}>
                            <div style={{
                              display: 'flex',
                              gap: '4px',
                              flexWrap: 'wrap',
                              maxWidth: '225px'
                            }}>
                              {pastelColors.map((color) => (
                                <button
                                  key={color.color}
                                  onClick={() => setShadingColor(color.color)}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: color.color,
                                    border: color.color === shadingColor ? '2px solid #000' : '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    padding: '0'
                                  }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <label style={{ color: '#1f2937' }}>Fill:</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={fillOpacity * 100}
                                  onChange={(e) => setFillOpacity(parseInt(e.target.value) / 100)}
                                  style={{ width: '80px', accentColor: '#4895ef' }}
                                />
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <label style={{ color: '#1f2937' }}>Border:</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={strokeOpacity * 100}
                                  onChange={(e) => setStrokeOpacity(parseInt(e.target.value) / 100)}
                                  style={{ width: '80px', accentColor: '#4895ef' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={showWelfareLoss}
                            onChange={(e) => setShowWelfareLoss(e.target.checked)}
                            id="showWelfareLoss"
                            style={{
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer',
                              accentColor: '#4895ef'
                            }}
                          />
                          <label
                            htmlFor="showWelfareLoss"
                            style={{
                              cursor: 'pointer',
                              userSelect: 'none',
                              fontSize: '14px',
                              color: '#1f2937'
                            }}
                          >
                            Show Welfare Loss
                          </label>
                        </div>
                        {showWelfareLoss && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: '#ffffff',
                            borderRadius: '4px',
                            marginLeft: '24px'
                          }}>
                            <div style={{
                              display: 'flex',
                              gap: '4px',
                              flexWrap: 'wrap',
                              maxWidth: '225px'
                            }}>
                              {pastelColors.map((color) => (
                                <button
                                  key={color.color}
                                  onClick={() => setWelfareLossColor(color.color)}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: color.color,
                                    border: color.color === welfareLossColor ? '2px solid #000' : '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    padding: '0'
                                  }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <label style={{ color: '#1f2937' }}>Fill:</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={welfareLossFillOpacity * 100}
                                  onChange={(e) => setWelfareLossFillOpacity(parseInt(e.target.value) / 100)}
                                  style={{ width: '80px', accentColor: '#4895ef' }}
                                />
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px'
                              }}>
                                <label style={{ color: '#1f2937' }}>Border:</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={welfareLossStrokeOpacity * 100}
                                  onChange={(e) => setWelfareLossStrokeOpacity(parseInt(e.target.value) / 100)}
                                  style={{ width: '80px', accentColor: '#4895ef' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {showS3 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginLeft: '20px' }}>
                <button
                  onClick={() => setShowP3(!showP3)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showP3 ? '#4CAF50' : '#f0f0f0',
                    color: showP3 ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Show Subsidy Distance
                </button>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={s3Distance}
                  onChange={(e) => setS3Distance(parseInt(e.target.value))}
                  style={{ width: '150px' }}
                />
                {showP3 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '4px 12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}>
                    <input
                      type="checkbox"
                      checked={showSubsidyShading}
                      onChange={(e) => setShowSubsidyShading(e.target.checked)}
                      id="showSubsidyCost"
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#4895ef'
                      }}
                    />
                    <label
                      htmlFor="showSubsidyCost"
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontSize: '14px',
                        color: '#1f2937'
                      }}
                    >
                      Show Subsidy Cost
                    </label>
                    {showSubsidyShading && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: '8px',
                        padding: '4px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '4px',
                          flexWrap: 'wrap',
                          maxWidth: '200px'
                        }}>
                          {pastelColors.map((color) => (
                            <button
                              key={color.color}
                              onClick={() => setSubsidyShadingColor(color.color)}
                              style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: color.color,
                                border: color.color === subsidyShadingColor ? '2px solid #000' : '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '0'
                              }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px'
                          }}>
                            <label style={{ color: '#1f2937' }}>Fill:</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={subsidyFillOpacity * 100}
                              onChange={(e) => setSubsidyFillOpacity(parseInt(e.target.value) / 100)}
                              style={{ width: '80px', accentColor: '#4895ef' }}
                            />
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px'
                          }}>
                            <label style={{ color: '#1f2937' }}>Border:</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={subsidyStrokeOpacity * 100}
                              onChange={(e) => setSubsidyStrokeOpacity(parseInt(e.target.value) / 100)}
                              style={{ width: '80px', accentColor: '#4895ef' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side - UI Controls */}
      {mounted && (
        <div className="w-[600px] p-4 bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => onUpdateSettings({ ...settings, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter title"
                />
              </div>

              {/* Line Colors */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-black">Line Colors</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-black mb-1">Supply Line Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {pastelColors.map((color) => (
                        <button
                          key={color.color}
                          onClick={() => onUpdateSettings({ ...settings, primaryColor: color.color })}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: color.color,
                            border: color.color === settings.primaryColor ? '2px solid #000' : '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '0'
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-black mb-1">Demand Line Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {pastelColors.map((color) => (
                        <button
                          key={color.color}
                          onClick={() => onUpdateSettings({ ...settings, secondaryColor: color.color })}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: color.color,
                            border: color.color === settings.secondaryColor ? '2px solid #000' : '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '0'
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Axis Labels */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-black">Axis Labels</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={settings.xAxisLabel}
                    onChange={(e) => onUpdateSettings({ ...settings, xAxisLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="X-axis label"
                  />
                  <input
                    type="text"
                    value={settings.yAxisLabel}
                    onChange={(e) => onUpdateSettings({ ...settings, yAxisLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Y-axis label"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Style Controls */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-black">Style</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-black mb-1">Font Size</label>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-black mb-1">Line Thickness</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={settings.lineThickness}
                      onChange={(e) => onUpdateSettings({ ...settings, lineThickness: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Elasticity Controls */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-black">Elasticity</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-black mb-1">Supply Elasticity</label>
                    <select
                      value={settings.supplyElasticity}
                      onChange={(e) => onUpdateSettings({ ...settings, supplyElasticity: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="unitary">Unitary</option>
                      <option value="relatively-elastic">Relatively Elastic</option>
                      <option value="relatively-inelastic">Relatively Inelastic</option>
                      <option value="perfectly-elastic">Perfectly Elastic</option>
                      <option value="perfectly-inelastic">Perfectly Inelastic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-black mb-1">Demand Elasticity</label>
                    <select
                      value={settings.demandElasticity}
                      onChange={(e) => onUpdateSettings({ ...settings, demandElasticity: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas; 