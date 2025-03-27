'use client';

import { useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { DiagramSettings, DiagramType, DiagramTypes } from '../types/diagram';
import { Stage, Layer, Line, Text, Circle, Rect, Arrow } from 'react-konva';
import Konva from 'konva';
import CanvasControls from './CanvasControls';

type ElasticityType = 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';

interface DiagramCanvasProps {
  settings: DiagramSettings;
  type: DiagramType;
  showS2: boolean;
  showS3: boolean;
  showPriceCeiling: boolean;
  showPriceFloor: boolean;
  onToggleS2: () => void;
  onToggleS3: () => void;
  onTogglePriceCeiling: () => void;
  onTogglePriceFloor: () => void;
  onUpdateSettings: (settings: DiagramSettings) => void;
  mounted: boolean;
}

interface DiagramCanvasRef {
  getStage: () => Konva.Stage | null;
}

const DiagramCanvas = forwardRef<DiagramCanvasRef, DiagramCanvasProps>(({ 
  settings,
  type,
  showS2,
  showS3,
  showPriceCeiling,
  showPriceFloor,
  onToggleS2,
  onToggleS3,
  onTogglePriceCeiling,
  onTogglePriceFloor,
  onUpdateSettings,
  mounted
}, ref) => {
  const [showP2, setShowP2] = useState(false);
  const [showP3, setShowP3] = useState(false);
  const [showShading, setShowShading] = useState(false);
  const [showSubsidyShading, setShowSubsidyShading] = useState(false);
  const [showWelfareLoss, setShowWelfareLoss] = useState(false);
  const [priceCeilingHeight, setPriceCeilingHeight] = useState(40);
  const [priceFloorHeight, setPriceFloorHeight] = useState(-40);
  const [welfareLossColor, setWelfareLossColor] = useState('#666666');
  const [welfareLossFillOpacity, setWelfareLossFillOpacity] = useState(0.3);
  const [welfareLossStrokeOpacity, setWelfareLossStrokeOpacity] = useState(0.5);
  const [shadingColor, setShadingColor] = useState('#90EE90');
  const [subsidyShadingColor, setSubsidyShadingColor] = useState('#90EE90');
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeOpacity, setStrokeOpacity] = useState(0.5);
  const [subsidyFillOpacity, setSubsidyFillOpacity] = useState(0.3);
  const [subsidyStrokeOpacity, setSubsidyStrokeOpacity] = useState(0.5);
  const [s2Distance, setS2Distance] = useState(40);
  const [s3Distance, setS3Distance] = useState(40);
  const [canvasWidth, setCanvasWidth] = useState(650);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [canvasSize, setCanvasSize] = useState(1);
  const [supplyLabel, setSupplyLabel] = useState("S");
  const [demandLabel, setDemandLabel] = useState("D");
  const [showPositiveConsumptionExternality, setShowPositiveConsumptionExternality] = useState(false);
  const [mpbDistance, setMpbDistance] = useState(70);
  const [showNegativeConsumptionExternality, setShowNegativeConsumptionExternality] = useState(false);
  const [negMpbDistance, setNegMpbDistance] = useState(70);
  const [showPositiveProductionExternality, setShowPositiveProductionExternality] = useState(false);
  const [mpcDistance, setMpcDistance] = useState(150);
  const [showNegativeProductionExternality, setShowNegativeProductionExternality] = useState(false);
  const [negMpcDistance, setNegMpcDistance] = useState(150);
  const [showTax, setShowTax] = useState(false);
  const [taxDistance, setTaxDistance] = useState(150);
  const [showSubsidy, setShowSubsidy] = useState(false);
  const [subsidyDistance, setSubsidyDistance] = useState(70);
  const [showNegativeAdvertising, setShowNegativeAdvertising] = useState(false);
  const [negativeAdvertisingDistance, setNegativeAdvertisingDistance] = useState(70);
  const [showPositiveAdvertising, setShowPositiveAdvertising] = useState(false);
  const [positiveAdvertisingDistance, setPositiveAdvertisingDistance] = useState(70);
  const [opportunityCostType, setOpportunityCostType] = useState<'constant' | 'increasing'>('constant');
  const ppcXPosition = 150;
  const ppcYPosition = 350;
  const [ppcShift, setPpcShift] = useState<'none' | 'outward' | 'inward'>('none');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showLRAS, setShowLRAS] = useState(true);
  const [showSRAS, setShowSRAS] = useState(true);
  const [showAD, setShowAD] = useState(true);
  const [showAD2, setShowAD2] = useState(false);
  const [showAD3, setShowAD3] = useState(false);
  const [showSRAS2, setShowSRAS2] = useState(false);
  const [showSRAS3, setShowSRAS3] = useState(false);
  const [adShift, setAdShift] = useState(0);
  const [srasShift, setSrasShift] = useState(0);
  const [lrasShift, setLrasShift] = useState(0);

  interface ColorOption {
    color: string;
    name: string;
  }

  const standardColors: ColorOption[] = [
    { color: '#0066cc', name: 'Standard Blue' },
    { color: '#cc0000', name: 'Standard Red' },
    { color: '#006600', name: 'Standard Green' },
    { color: '#660066', name: 'Standard Purple' },
    { color: '#cc6600', name: 'Standard Orange' },
    { color: '#000000', name: 'Black' },
  ];

  const stageRef = useRef<Konva.Stage>(null);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current
  }));

  const calculateLinePoints = (isSupply: boolean) => {
    const initialX = 160;
    const availableWidth = canvasWidth - 170;
    const centerX = initialX + (availableWidth / 2);
    
    // Calculate the center point of the diagram
    const centerY = (canvasHeight - 120) / 2 + 80;
    
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
        endY = canvasHeight - 70; // End at bottom
      } else if (angle > 89) { // Handle angles between 89° and 90°
        // Use a linear interpolation for angles near vertical
        const progress = (angle - 89) / 1;
        const verticalStartY = 50;
        const verticalEndY = canvasHeight - 70;
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
        endY = canvasHeight - 70; // End at bottom
      } else {
        // Use the same center point and vertical offset calculation as supply
        startY = centerY + verticalOffset;
        endY = centerY - verticalOffset;
      }
    }

    // Ensure lines stay within bounds
    const minY = 50;
    const maxY = canvasHeight - 70;
    
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
      // Adjust the label position to be higher up
      const labelX = 160 + (canvasHeight - 125) - 20;
      
      // Calculate the new end point to match the label position
      const slope = (clampedEndY - clampedStartY) / (endX - startX);
      const newEndX = labelX;
      
      // Stop the line higher up from the X-axis by adjusting maxY
      const adjustedMaxY = maxY - 20; // Stop 100 pixels above the X-axis
      
      // Calculate new end Y position
      let newEndY = clampedStartY + slope * (newEndX - startX);
      
      // Ensure the line doesn't go below the adjusted maxY
      newEndY = Math.min(newEndY, adjustedMaxY);
      
      // Only extend the line if S3 is not shown
      if (!showS3) {
        return [startX, startY, newEndX, newEndY];
      }
    }

    return [startX, clampedStartY, endX, clampedEndY];
  };

  const calculateEquilibriumPoint = (supplyPoints: number[], demandPoints: number[]) => {
    // Calculate the center point of the diagram
    const centerX = 160 + (canvasWidth - 170) / 2;
    const centerY = (canvasHeight - 120) / 2 + 50;

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

  const renderSupplyDemand = (isDownload = false) => {
    // Only render supply-demand diagram if type matches
    if (type !== DiagramTypes.SUPPLY_DEMAND) {
      return null;
    }

    // Clip the lines at the boundaries
    const clipLine = (points: number[]) => {
      const [x1, y1, x2, y2] = points;
      const minY = 80;  // Top boundary
      const maxY = canvasHeight - 70;  // Bottom boundary (x-axis)
      const minX = 160;  // Left boundary
      const maxX = canvasWidth - 90;  // Right boundary

      // Calculate slope
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;

      // For demand line (which has x1 > x2), return original points without clipping
      if (x1 > x2) {
        return points;
      }

      // Clip at boundaries for other lines
      if (y1 < minY) {
        clippedX1 = x1 + (minY - y1) / slope;
        clippedY1 = minY;
      }
      if (y2 < minY) {
        clippedX2 = x2 + (minY - y2) / slope;
        clippedY2 = minY;
      }

      if (y1 > maxY) {
        clippedX1 = x1 + (maxY - y1) / slope;
        clippedY1 = maxY;
      }
      if (y2 > maxY) {
        clippedX2 = x2 + (maxY - y2) / slope;
        clippedY2 = maxY;
      }

      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }

      // For S3 line, handle special extension but ensure it doesn't go below x-axis
      if (showS3) {
        if (x1 < minX) {
          const extension = (minX - x1) * 1.5;
          clippedX2 = Math.min(maxX, x2 + extension);
          clippedY2 = y2 + slope * extension;
        } else if (x2 > maxX) {
          const extension = (x2 - maxX) * 1.5;
          clippedX1 = Math.max(minX, x1 - extension);
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
          width={canvasWidth + 200}
          height={canvasHeight}
          fill="white"
        />

        {/* Watermarks - only show in preview */}
        {!isDownload && [0.25, 0.5, 0.75].map((position) => (
          <Text
            key={position}
            text="Copyright Diploma Collective"
            x={canvasWidth * position}
            y={canvasHeight / 2}
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
          x={(canvasWidth + 200) / 2 - 300}
          y={20}
          fontSize={settings.fontSize * 1.2}
          fill="#000000"
          width={600}
          align="center"
          wrap="none"
        />

        {/* X and Y axes */}
        <Line
          points={[160, canvasHeight - 70, 160 + (canvasHeight - 125), canvasHeight - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness * 0.75}
        />
        <Line
          points={[160, 80, 160, canvasHeight - 70]}
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
                160 + (canvasHeight - 125) * 0.9,
                equilibrium.y + priceCeilingHeight
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="Pc"
              x={160 + (canvasHeight - 125) * 0.9 + 10}
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
                    points={[supplyIntersectX, ceilingY, supplyIntersectX, canvasHeight - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qs"
                    x={supplyIntersectX - 8}
                    y={canvasHeight - 55}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                  
                  {/* Demand intersection vertical line */}
                  <Line
                    points={[demandIntersectX, ceilingY, demandIntersectX, canvasHeight - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qd"
                    x={demandIntersectX - 8}
                    y={canvasHeight - 55}
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
                160 + (canvasHeight - 125) * 0.9,
                equilibrium.y + priceFloorHeight
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="Pf"
              x={160 + (canvasHeight - 125) * 0.9 + 10}
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
                    points={[supplyIntersectX, floorY, supplyIntersectX, canvasHeight - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qs"
                    x={supplyIntersectX - 8}
                    y={canvasHeight - 55}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                  
                  {/* Demand intersection vertical line */}
                  <Line
                    points={[demandIntersectX, floorY, demandIntersectX, canvasHeight - 70]}
                    stroke="#666666"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                  <Text
                    text="Qd"
                    x={demandIntersectX - 8}
                    y={canvasHeight - 55}
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
          points={[equilibrium.x, equilibrium.y, equilibrium.x, canvasHeight - 70]}
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
          y={canvasHeight - 55}
          fontSize={settings.fontSize}
          fill="#000000"
        />

        {/* S₂ equilibrium point and dotted lines */}
        {showS2 && shiftedUpEquilibrium && (
          <>
            <Line
              points={[shiftedUpEquilibrium.x, shiftedUpEquilibrium.y, shiftedUpEquilibrium.x, canvasHeight - 70]}
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
              y={canvasHeight - 55}
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
              points={[shiftedDownEquilibrium.x, shiftedDownEquilibrium.y, shiftedDownEquilibrium.x, canvasHeight - 70]}
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
              y={canvasHeight - 55}
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
          width={90}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />
        <Text
          text={settings.xAxisLabel}
          x={canvasWidth - 100}
          y={canvasHeight - 55}
          fontSize={settings.fontSize}
          fill="#000000"
          width={200}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />
        <Text
          text={!showS2 && !showS3 ? supplyLabel : "S"}
          x={supplyPoints[2] + 20}
          y={Math.min(supplyPoints[1], supplyPoints[3]) - 20}
          fontSize={settings.fontSize}
          fill={settings.primaryColor}
        />
        {showS2 && clippedShiftedUpPoints && (
          <Text
            text="S + Tax"
            x={clippedShiftedUpPoints[2] + 20}
            y={Math.min(clippedShiftedUpPoints[1], clippedShiftedUpPoints[3]) - 20}
            fontSize={settings.fontSize}
            fill={settings.primaryColor}
          />
        )}
        {showS3 && clippedShiftedDownPoints && (
          <Text
            text="S + Sub"
            x={clippedShiftedDownPoints[2] + 20}
            y={Math.min(clippedShiftedDownPoints[1], clippedShiftedDownPoints[3]) - 20}
            fontSize={settings.fontSize}
            fill={settings.primaryColor}
          />
        )}
        <Text
          text={demandLabel}
          x={demandPoints[2] - 10}
          y={Math.min(demandPoints[3] - 50, canvasHeight - 20)}
          fontSize={settings.fontSize}
          fill={settings.secondaryColor}
        />

        {/* Supply line */}
        <Line
          points={supplyPoints}
          stroke={settings.primaryColor}
          strokeWidth={2}
          lineCap="round"
          lineJoin="round"
        />
        <Text
          text={supplyLabel}
          x={supplyPoints[2] + 20}
          y={Math.min(supplyPoints[1], supplyPoints[3]) - 20}
          fontSize={settings.fontSize}
          fill={settings.primaryColor}
        />

        {/* Shifted up supply line (S + Tax) */}
        {showTax && clippedShiftedUpPoints && (
          <>
            <Line
              points={clippedShiftedUpPoints}
              stroke={settings.primaryColor}
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />
            <Text
              text="S + Tax"
              x={clippedShiftedUpPoints[2] + 20}
              y={Math.min(clippedShiftedUpPoints[1], clippedShiftedUpPoints[3]) - 20}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
          </>
        )}
      </Layer>
    );
  };

  const renderExternalities = (isDownload = false) => {
    const mscPoints = calculateLinePoints(true);
    const msbPoints = calculateLinePoints(false);

    // Calculate shifted MPB points for positive consumption externality
    const shiftedMpbPoints = showPositiveConsumptionExternality ? (() => {
      const unclippedPoints = [
        msbPoints[0] - mpbDistance * 0.5,
        msbPoints[1] + mpbDistance,
        msbPoints[2] - mpbDistance * 0.5,
        msbPoints[3] + mpbDistance
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      if ((y1 > maxY && y2 > maxY) || (y1 < minY && y2 < minY)) {
        return null;
      }
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Clip at x-axis (bottom)
      if (y2 > maxY) {
        const dx = (maxY - y1) / slope;
        clippedX2 = x1 + dx;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        const dx = (maxY - y2) / slope;
        clippedX1 = x2 - dx;
        clippedY1 = maxY;
      }

      // Clip at y-axis top
      if (y2 < minY) {
        const dx = (minY - y1) / slope;
        clippedX2 = x1 + dx;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      // Clip at y-axis (left)
      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      // Clip at MSB endpoint (right)
      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    // Calculate shifted MPB points for negative consumption externality
    const negativeShiftedMpbPoints = showNegativeConsumptionExternality ? (() => {
      const unclippedPoints = [
        msbPoints[0] + negMpbDistance * 0.5,
        msbPoints[1] - negMpbDistance,
        msbPoints[2] + negMpbDistance * 0.5,
        msbPoints[3] - negMpbDistance
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Clip at x-axis (bottom)
      if (y2 > maxY) {
        clippedX2 = x1 + (maxY - y1) / slope;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        clippedX1 = x2 - (y2 - maxY) / slope;
        clippedY1 = maxY;
      }

      // Clip at y-axis top
      if (y2 < minY) {
        clippedX2 = x1 + (minY - y1) / slope;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      // Clip at y-axis (left)
      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      // Clip at MSB endpoint (right)
      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    // Calculate shifted MPC points for positive production externality with clipping
    const shiftedMpcPoints = showPositiveProductionExternality ? (() => {
      const unclippedPoints = [
        mscPoints[0] - mpcDistance * 0.5,
        mscPoints[1],
        mscPoints[2] - mpcDistance * 0.5,
        mscPoints[3]
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      if ((y1 > maxY && y2 > maxY) || (y1 < minY && y2 < minY)) {
        return null;
      }
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Clip at x-axis (bottom)
      if (y2 > maxY) {
        const dx = (maxY - y1) / slope;
        clippedX2 = x1 + dx;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        const dx = (maxY - y2) / slope;
        clippedX1 = x2 - dx;
        clippedY1 = maxY;
      }

      // Clip at y-axis top
      if (y2 < minY) {
        const dx = (minY - y1) / slope;
        clippedX2 = x1 + dx;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        const dx = (minY - y2) / slope;
        clippedX1 = x2 - dx;
        clippedY1 = minY;
      }

      // Clip at y-axis (left)
      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      // Clip at MSB endpoint (right)
      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    // Calculate shifted MPC points for negative production externality with clipping
    const shiftedNegMpcPoints = showNegativeProductionExternality ? (() => {
      const unclippedPoints = [
        mscPoints[0] + negMpcDistance * 0.5,
        mscPoints[1],
        mscPoints[2] + negMpcDistance * 0.5,
        mscPoints[3]
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      if ((y1 > maxY && y2 > maxY) || (y1 < minY && y2 < minY)) {
        return null;
      }
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Clip at x-axis (bottom)
      if (y2 > maxY) {
        const dx = (maxY - y1) / slope;
        clippedX2 = x1 + dx;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        clippedX1 = x2 - (y2 - maxY) / slope;
        clippedY1 = maxY;
      }

      // Clip at y-axis top
      if (y2 < minY) {
        clippedX2 = x1 + (minY - y1) / slope;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      // Clip at y-axis (left)
      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      // Clip at MSB endpoint (right)
      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    // Calculate market equilibrium points
    const positiveConsumptionEquilibrium = showPositiveConsumptionExternality && shiftedMpbPoints ? 
      calculateEquilibriumPoint(mscPoints, shiftedMpbPoints) : null;

    const negativeConsumptionEquilibrium = showNegativeConsumptionExternality && negativeShiftedMpbPoints ? 
      calculateEquilibriumPoint(mscPoints, negativeShiftedMpbPoints) : null;

    const positiveProductionEquilibrium = showPositiveProductionExternality && shiftedMpcPoints ? 
      calculateEquilibriumPoint(shiftedMpcPoints, msbPoints) : null;

    const negativeProductionEquilibrium = showNegativeProductionExternality && shiftedNegMpcPoints ? 
      calculateEquilibriumPoint(shiftedNegMpcPoints, msbPoints) : null;

    // Calculate tax line points
    const shiftedTaxPoints = showTax ? (() => {
      const unclippedPoints = [
        mscPoints[0] - taxDistance * 0.5,
        mscPoints[1],
        mscPoints[2] - taxDistance * 0.5,
        mscPoints[3]
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Apply clipping logic
      if (y2 > maxY) {
        clippedX2 = x1 + (maxY - y1) / slope;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        clippedX1 = x2 - (y2 - maxY) / slope;
        clippedY1 = maxY;
      }

      if (y2 < minY) {
        clippedX2 = x1 + (minY - y1) / slope;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    // Calculate tax equilibrium point
    const taxEquilibrium = showTax && shiftedTaxPoints ? (() => {
      // Use the appropriate MPB line based on which externality is active
      let mpbPoints;
      if (showPositiveConsumptionExternality && shiftedMpbPoints) {
        mpbPoints = shiftedMpbPoints;
      } else if (showNegativeConsumptionExternality && negativeShiftedMpbPoints) {
        mpbPoints = negativeShiftedMpbPoints;
      } else {
        mpbPoints = msbPoints; // Default to MSB/MPB line if no externality
      }
      return calculateEquilibriumPoint(shiftedTaxPoints, mpbPoints);
    })() : null;

    // Check for x-axis label collisions
    const shouldShowQ1Label = (() => {
      if (!taxEquilibrium) return false;

      // Get positions of other x-axis labels
      const otherLabelPositions = [];
      
      // Add Qfm position if externality equilibrium exists
      if (showPositiveConsumptionExternality && positiveConsumptionEquilibrium) {
        otherLabelPositions.push(positiveConsumptionEquilibrium.x);
      }
      if (showNegativeConsumptionExternality && negativeConsumptionEquilibrium) {
        otherLabelPositions.push(negativeConsumptionEquilibrium.x);
      }

      // Check if Q₁ label would be too close to any other label
      const labelWidth = 24; // Approximate width of label
      return !otherLabelPositions.some(x => 
        Math.abs(x - taxEquilibrium.x) < labelWidth
      );
    })();

    // Calculate subsidy line points
    const shiftedSubsidyPoints = showSubsidy ? (() => {
      const unclippedPoints = [
        mscPoints[0],
        mscPoints[1] + subsidyDistance,  // Changed from - to +
        mscPoints[2],
        mscPoints[3] + subsidyDistance   // Changed from - to +
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Apply clipping logic
      if (y2 > maxY) {
        clippedX2 = x1 + (maxY - y1) / slope;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        clippedX1 = x2 - (y2 - maxY) / slope;
        clippedY1 = maxY;
      }

      if (y2 < minY) {
        clippedX2 = x1 + (minY - y1) / slope;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    // Calculate negative advertising line points
    const shiftedNegativeAdvertisingPoints = showNegativeAdvertising ? (() => {
      const unclippedPoints = [
        msbPoints[0],
        msbPoints[1] + negativeAdvertisingDistance,
        msbPoints[2],
        msbPoints[3] + negativeAdvertisingDistance
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Apply clipping logic
      if (y2 > maxY) {
        clippedX2 = x1 + (maxY - y1) / slope;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        clippedX1 = x2 - (y2 - maxY) / slope;
        clippedY1 = maxY;
      }

      if (y2 < minY) {
        clippedX2 = x1 + (minY - y1) / slope;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    // Calculate positive advertising line points
    const shiftedPositiveAdvertisingPoints = showPositiveAdvertising ? (() => {
      const unclippedPoints = [
        msbPoints[0],
        msbPoints[1] - positiveAdvertisingDistance,
        msbPoints[2],
        msbPoints[3] - positiveAdvertisingDistance
      ];

      // Clip at boundaries
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = msbPoints[2]; // MSB endpoint
      const [x1, y1, x2, y2] = unclippedPoints;
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Apply clipping logic
      if (y2 > maxY) {
        clippedX2 = x1 + (maxY - y1) / slope;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        clippedX1 = x2 - (y2 - maxY) / slope;
        clippedY1 = maxY;
      }

      if (y2 < minY) {
        clippedX2 = x1 + (minY - y1) / slope;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    })() : null;

    return (
      <Layer>
        {/* White Background */}
        <Rect
          x={0}
          y={0}
          width={canvasWidth + 200}
          height={canvasHeight}
          fill="white"
        />

        {/* Watermarks - only show in preview */}
        {!isDownload && [0.25, 0.5, 0.75].map((position) => (
          <Text
            key={position}
            text="Copyright Diploma Collective"
            x={canvasWidth * position}
            y={canvasHeight / 2}
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
          x={(canvasWidth + 200) / 2 - 300}
          y={20}
          fontSize={settings.fontSize * 1.2}
          fill="#000000"
          width={600}
          align="center"
          wrap="none"
        />

        {/* X and Y axes */}
        <Line
          points={[160, canvasHeight - 70, 160 + (canvasHeight - 125), canvasHeight - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness * 0.75}
        />
        <Line
          points={[160, 80, 160, canvasHeight - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness * 0.75}
        />

        {/* Positive MPB curve */}
        {showPositiveConsumptionExternality && shiftedMpbPoints && (
          <>
            <Line
              points={shiftedMpbPoints}
              stroke={settings.secondaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPB"
              x={Math.min(shiftedMpbPoints[2], canvasWidth - 90) + 10}
              y={Math.max(shiftedMpbPoints[3], 80) - 20}
              fontSize={settings.fontSize}
              fill={settings.secondaryColor}
            />
            {positiveConsumptionEquilibrium && (
              <>
                <Line
                  points={[positiveConsumptionEquilibrium.x, positiveConsumptionEquilibrium.y, positiveConsumptionEquilibrium.x, canvasHeight - 70]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Line
                  points={[160, positiveConsumptionEquilibrium.y, positiveConsumptionEquilibrium.x, positiveConsumptionEquilibrium.y]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Circle
                  x={positiveConsumptionEquilibrium.x}
                  y={positiveConsumptionEquilibrium.y}
                  radius={6}
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth={1}
                />
                <Text
                  text="Pfm"
                  x={125}
                  y={positiveConsumptionEquilibrium.y - 8}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
                <Text
                  text="Qfm"
                  x={positiveConsumptionEquilibrium.x - 12}
                  y={canvasHeight - 55}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
              </>
            )}
          </>
        )}

        {/* Negative MPB curve */}
        {showNegativeConsumptionExternality && negativeShiftedMpbPoints && (
          <>
            <Line
              points={negativeShiftedMpbPoints}
              stroke={settings.secondaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPB"
              x={negativeShiftedMpbPoints[2] + 10}
              y={negativeShiftedMpbPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.secondaryColor}
            />
            {negativeConsumptionEquilibrium && (
              <>
                <Line
                  points={[negativeConsumptionEquilibrium.x, negativeConsumptionEquilibrium.y, negativeConsumptionEquilibrium.x, canvasHeight - 70]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Line
                  points={[160, negativeConsumptionEquilibrium.y, negativeConsumptionEquilibrium.x, negativeConsumptionEquilibrium.y]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Circle
                  x={negativeConsumptionEquilibrium.x}
                  y={negativeConsumptionEquilibrium.y}
                  radius={6}
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth={1}
                />
                <Text
                  text="Pfm"
                  x={125}
                  y={negativeConsumptionEquilibrium.y - 8}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
                <Text
                  text="Qfm"
                  x={negativeConsumptionEquilibrium.x - 12}
                  y={canvasHeight - 55}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
              </>
            )}
          </>
        )}

        {/* Positive MPC curve */}
        {showPositiveProductionExternality && shiftedMpcPoints && (
          <>
            <Line
              points={shiftedMpcPoints}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPC"
              x={Math.min(shiftedMpcPoints[2], canvasWidth - 90) + 10}
              y={Math.max(shiftedMpcPoints[3], 80) - 20}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
            {positiveProductionEquilibrium && (
              <>
                <Line
                  points={[positiveProductionEquilibrium.x, positiveProductionEquilibrium.y, positiveProductionEquilibrium.x, canvasHeight - 70]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Line
                  points={[160, positiveProductionEquilibrium.y, positiveProductionEquilibrium.x, positiveProductionEquilibrium.y]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Circle
                  x={positiveProductionEquilibrium.x}
                  y={positiveProductionEquilibrium.y}
                  radius={6}
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth={1}
                />
                <Text
                  text="Pfm"
                  x={125}
                  y={positiveProductionEquilibrium.y - 8}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
                <Text
                  text="Qfm"
                  x={positiveProductionEquilibrium.x - 12}
                  y={canvasHeight - 55}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
              </>
            )}
          </>
        )}

        {/* Negative MPC curve */}
        {showNegativeProductionExternality && shiftedNegMpcPoints && (
          <>
            <Line
              points={shiftedNegMpcPoints}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPC"
              x={shiftedNegMpcPoints[2] + 10}
              y={shiftedNegMpcPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
            {negativeProductionEquilibrium && (
              <>
                <Line
                  points={[negativeProductionEquilibrium.x, negativeProductionEquilibrium.y, negativeProductionEquilibrium.x, canvasHeight - 70]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Line
                  points={[160, negativeProductionEquilibrium.y, negativeProductionEquilibrium.x, negativeProductionEquilibrium.y]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Circle
                  x={negativeProductionEquilibrium.x}
                  y={negativeProductionEquilibrium.y}
                  radius={6}
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth={1}
                />
                <Text
                  text="Pfm"
                  x={125}
                  y={negativeProductionEquilibrium.y - 8}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
                <Text
                  text="Qfm"
                  x={negativeProductionEquilibrium.x - 12}
                  y={canvasHeight - 55}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
              </>
            )}
          </>
        )}

        {/* MSC curve */}
        <Line
          points={mscPoints}
          stroke={settings.primaryColor}
          strokeWidth={settings.lineThickness}
        />
        <Text
          text={showPositiveProductionExternality || showNegativeProductionExternality ? "MSC" : "MSC/MPC"}
          x={Math.min(mscPoints[2], canvasWidth - 90) + 10}
          y={Math.max(mscPoints[3], 80) - 20}
          fontSize={settings.fontSize}
          fill={settings.primaryColor}
        />

        {/* MSB curve */}
        <Line
          points={msbPoints}
          stroke={settings.secondaryColor}
          strokeWidth={settings.lineThickness}
        />
        <Text
          text={showPositiveConsumptionExternality || showNegativeConsumptionExternality ? "MSB" : "MSB/MPB"}
          x={msbPoints[2] + 10}
          y={msbPoints[3] - 20}
          fontSize={settings.fontSize}
          fill={settings.secondaryColor}
        />

        {/* Social optimum equilibrium point and lines */}
        {(() => {
          const equilibrium = calculateEquilibriumPoint(mscPoints, msbPoints);
          return (
            <>
              <Line
                points={[equilibrium.x, equilibrium.y, equilibrium.x, canvasHeight - 70]}
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
                text="Pso"
                x={125}
                y={equilibrium.y - 8}
                fontSize={settings.fontSize}
                fill="#000000"
              />
              <Text
                text="Qso"
                x={equilibrium.x - 12}
                y={canvasHeight - 55}
                fontSize={settings.fontSize}
                fill="#000000"
              />
            </>
          );
        })()}

        {/* Labels */}
        <Text
          text={settings.yAxisLabel}
          x={60}
          y={65}
          fontSize={settings.fontSize}
          fill="#000000"
          width={90}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />
        <Text
          text={settings.xAxisLabel}
          x={canvasWidth - 100}
          y={canvasHeight - 55}
          fontSize={settings.fontSize}
          fill="#000000"
          width={200}
          align="center"
          wrap="word"
          wordBreak="keep-all"
        />

        {/* Tax line and intersection */}
        {showTax && shiftedTaxPoints && (
          <>
            <Line
              points={shiftedTaxPoints}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPC₁"
              x={shiftedTaxPoints[2] + 10}
              y={shiftedTaxPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
            {taxEquilibrium && (
              <>
                <Line
                  points={[taxEquilibrium.x, taxEquilibrium.y, taxEquilibrium.x, canvasHeight - 70]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Line
                  points={[160, taxEquilibrium.y, taxEquilibrium.x, taxEquilibrium.y]}
                  stroke="#666666"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                <Circle
                  x={taxEquilibrium.x}
                  y={taxEquilibrium.y}
                  radius={6}
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth={1}
                />
                <Text
                  text="P₁"
                  x={125}
                  y={taxEquilibrium.y - 8}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
                {shouldShowQ1Label && (
                  <Text
                    text="Q₁"
                    x={taxEquilibrium.x - 12}
                    y={canvasHeight - 55}
                    fontSize={settings.fontSize}
                    fill="#000000"
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Subsidy line */}
        {showSubsidy && shiftedSubsidyPoints && (
          <>
            <Line
              points={shiftedSubsidyPoints}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPC₁"
              x={shiftedSubsidyPoints[2] + 10}
              y={shiftedSubsidyPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
            
            {/* Add intersection circle and dashed lines */}
            {(() => {
              const [x1, y1, x2, y2] = shiftedSubsidyPoints;
              const slope = (y2 - y1) / (x2 - x1);
              const yIntercept = y1 - slope * x1;
              
              // Use shifted MPB points if positive consumption externality is active
              const mpbPointsToUse = showPositiveConsumptionExternality ? shiftedMpbPoints : msbPoints;
              if (mpbPointsToUse) {
                const mpbSlope = (mpbPointsToUse[3] - mpbPointsToUse[1]) / (mpbPointsToUse[2] - mpbPointsToUse[0]);
                const mpbYIntercept = mpbPointsToUse[1] - mpbSlope * mpbPointsToUse[0];

                // Find intersection point
                const x = (mpbYIntercept - yIntercept) / (slope - mpbSlope);
                const y = slope * x + yIntercept;

                // Draw dashed line and circle at intersection
                if (!isNaN(x) && !isNaN(y)) {
                  return (
                    <>
                      <Line
                        points={[x, y, x, canvasHeight - 70]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Line
                        points={[x, y, 160, y]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Circle
                        x={x}
                        y={y}
                        radius={7}
                        fill="#000000"
                        stroke="white"
                        strokeWidth={1}
                      />
                      <Text
                        text="Q₁"
                        x={x - 10}
                        y={canvasHeight - 70 + 15}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                      <Text
                        text="P₁"
                        x={160 - 30}
                        y={y - 5}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                    </>
                  );
                }
              }

              // Use shifted MPC points if negative production externality is active
              const mpcPointsToUseNegativeFirst = showNegativeProductionExternality ? shiftedNegMpcPoints : mscPoints;
              if (mpcPointsToUseNegativeFirst) {
                const mpcSlope = (mpcPointsToUseNegativeFirst[3] - mpcPointsToUseNegativeFirst[1]) / (mpcPointsToUseNegativeFirst[2] - mpcPointsToUseNegativeFirst[0]);
                const mpcYIntercept = mpcPointsToUseNegativeFirst[1] - mpcSlope * mpcPointsToUseNegativeFirst[0];

                // Find intersection point
                const x = (mpcYIntercept - yIntercept) / (slope - mpcSlope);
                const y = slope * x + yIntercept;

                // Draw dashed line and circle at intersection
                if (!isNaN(x) && !isNaN(y)) {
                  return (
                    <>
                      <Line
                        points={[x, y, x, canvasHeight - 70]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Line
                        points={[x, y, 160, y]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Circle
                        x={x}
                        y={y}
                        radius={7}
                        fill="#000000"
                        stroke="white"
                        strokeWidth={1}
                      />
                      <Text
                        text="Q₁"
                        x={x - 10}
                        y={canvasHeight - 70 + 15}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                      <Text
                        text="P₁"
                        x={160 - 30}
                        y={y - 5}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                    </>
                  );
                }
              }

              // Calculate intersection with MPC line for negative production externality
              const mpcPointsToUseNegativeSecond = showNegativeProductionExternality ? shiftedNegMpcPoints : mscPoints;
              if (mpcPointsToUseNegativeSecond) {
                const mpcSlope = (mpcPointsToUseNegativeSecond[3] - mpcPointsToUseNegativeSecond[1]) / (mpcPointsToUseNegativeSecond[2] - mpcPointsToUseNegativeSecond[0]);
                const mpcYIntercept = mpcPointsToUseNegativeSecond[1] - mpcSlope * mpcPointsToUseNegativeSecond[0];

                // Find intersection point
                const x = (mpcYIntercept - yIntercept) / (slope - mpcSlope);
                const y = slope * x + yIntercept;

                // Draw dashed line and circle at intersection
                if (!isNaN(x) && !isNaN(y)) {
                  return (
                    <>
                      <Line
                        points={[x, y, x, canvasHeight - 70]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Line
                        points={[x, y, 160, y]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Circle
                        x={x}
                        y={y}
                        radius={7}
                        fill="#000000"
                        stroke="white"
                        strokeWidth={1}
                      />
                      <Text
                        text="Q₁"
                        x={x - 10}
                        y={canvasHeight - 70 + 15}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                      <Text
                        text="P₁"
                        x={160 - 30}
                        y={y - 5}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                    </>
                  );
                }
              }

              // Calculate intersection with MPC line for positive production externality
              const mpcPointsToUsePositive = showPositiveProductionExternality ? shiftedMpcPoints : mscPoints;
              if (mpcPointsToUsePositive) {
                const mpcSlope = (mpcPointsToUsePositive[3] - mpcPointsToUsePositive[1]) / (mpcPointsToUsePositive[2] - mpcPointsToUsePositive[0]);
                const mpcYIntercept = mpcPointsToUsePositive[1] - mpcSlope * mpcPointsToUsePositive[0];

                // Find intersection point
                const x = (mpcYIntercept - yIntercept) / (slope - mpcSlope);
                const y = slope * x + yIntercept;

                // Draw dashed line and circle at intersection
                if (!isNaN(x) && !isNaN(y)) {
                  return (
                    <>
                      <Line
                        points={[x, y, x, canvasHeight - 70]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Line
                        points={[x, y, 160, y]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Circle
                        x={x}
                        y={y}
                        radius={7}
                        fill="#000000"
                        stroke="white"
                        strokeWidth={1}
                      />
                      <Text
                        text="Q₁"
                        x={x - 10}
                        y={canvasHeight - 70 + 15}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                      <Text
                        text="P₁"
                        x={160 - 30}
                        y={y - 5}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                    </>
                  );
                }
              }
            })()}
          </>
        )}

        {/* Negative Advertising line */}
        {showNegativeAdvertising && shiftedNegativeAdvertisingPoints && (
          <>
            <Line
              points={shiftedNegativeAdvertisingPoints}
              stroke={settings.secondaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPB₁"
              x={shiftedNegativeAdvertisingPoints[2] + 10}
              y={shiftedNegativeAdvertisingPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.secondaryColor}
            />
            
            {/* Add intersection circle and dashed lines */}
            {(() => {
              const [x1, y1, x2, y2] = shiftedNegativeAdvertisingPoints;
              const slope = (y2 - y1) / (x2 - x1);
              const yIntercept = y1 - slope * x1;
              
              // Use shifted MPC points if negative production externality is active
              const mpcPointsToUseNegative = showNegativeProductionExternality ? shiftedNegMpcPoints : mscPoints;
              if (mpcPointsToUseNegative) {
                const mpcSlope = (mpcPointsToUseNegative[3] - mpcPointsToUseNegative[1]) / (mpcPointsToUseNegative[2] - mpcPointsToUseNegative[0]);
                const mpcYIntercept = mpcPointsToUseNegative[1] - mpcSlope * mpcPointsToUseNegative[0];

                // Find intersection point
                const x = (mpcYIntercept - yIntercept) / (slope - mpcSlope);
                const y = slope * x + yIntercept;

                // Draw dashed line and circle at intersection
                if (!isNaN(x) && !isNaN(y)) {
                  return (
                    <>
                      <Line
                        points={[x, y, x, canvasHeight - 70]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Line
                        points={[x, y, 160, y]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Circle
                        x={x}
                        y={y}
                        radius={7}
                        fill="#000000"
                        stroke="white"
                        strokeWidth={1}
                      />
                      <Text
                        text="Q₁"
                        x={x - 10}
                        y={canvasHeight - 70 + 15}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                      <Text
                        text="P₁"
                        x={160 - 30}
                        y={y - 5}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                    </>
                  );
                }
              }
            })()}
          </>
        )}

        {/* Positive Advertising line */}
        {showPositiveAdvertising && shiftedPositiveAdvertisingPoints && (
          <>
            <Line
              points={shiftedPositiveAdvertisingPoints}
              stroke={settings.secondaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="MPB₁"
              x={shiftedPositiveAdvertisingPoints[2] + 10}
              y={shiftedPositiveAdvertisingPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.secondaryColor}
            />
            
            {/* Add intersection circle and dashed lines */}
            {(() => {
              const [x1, y1, x2, y2] = shiftedPositiveAdvertisingPoints;
              const slope = (y2 - y1) / (x2 - x1);
              const yIntercept = y1 - slope * x1;
              
              // Use shifted MPC points if positive production externality is active
              const mpcPointsToUsePositive = showPositiveProductionExternality ? shiftedMpcPoints : mscPoints;
              if (mpcPointsToUsePositive) {
                const mpcSlope = (mpcPointsToUsePositive[3] - mpcPointsToUsePositive[1]) / (mpcPointsToUsePositive[2] - mpcPointsToUsePositive[0]);
                const mpcYIntercept = mpcPointsToUsePositive[1] - mpcSlope * mpcPointsToUsePositive[0];

                // Find intersection point
                const x = (mpcYIntercept - yIntercept) / (slope - mpcSlope);
                const y = slope * x + yIntercept;

                // Draw dashed line and circle at intersection
                if (!isNaN(x) && !isNaN(y)) {
                  return (
                    <>
                      <Line
                        points={[x, y, x, canvasHeight - 70]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Line
                        points={[x, y, 160, y]}
                        stroke="#7F7F7F"
                        strokeWidth={1}
                        dash={[5, 5]}
                      />
                      <Circle
                        x={x}
                        y={y}
                        radius={7}
                        fill="#000000"
                        stroke="white"
                        strokeWidth={1}
                      />
                      <Text
                        text="Q₁"
                        x={x - 10}
                        y={canvasHeight - 70 + 15}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                      <Text
                        text="P₁"
                        x={160 - 30}
                        y={y - 5}
                        fontSize={settings.fontSize}
                        fill="#000000"
                      />
                    </>
                  );
                }
              }
            })()}
          </>
        )}
      </Layer>
    );
  };

  const renderPPC = () => {
    // Calculate shift offset based on direction
    const shiftOffset = ppcShift === 'none' ? 1 : 
                       ppcShift === 'inward' ? 0.8 : 1.2;
    
    // Helper function to clip y-coordinate at x-axis
    const clipYCoordinate = (y: number) => {
      return Math.min(y, canvasHeight - 70);
    };
    
    return (
      <Layer>
        {/* Background */}
        <Rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          fill="white"
        />
        
        {/* Watermarks - only show in preview */}
        {[0.25, 0.5, 0.75].map((position) => (
          <Text
            key={position}
            text="Copyright Diploma Collective"
            x={canvasWidth * position}
            y={canvasHeight / 2}
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
          x={80}
          y={20}
          width={canvasWidth}
          fontSize={settings.fontSize * 1.2}
          fill="#000000"
          align="center"
        />

        {/* Axes */}
        <Line
          points={[160, 80, 160, canvasHeight - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness}
        />
        <Line
          points={[160, canvasHeight - 70, canvasWidth - 10, canvasHeight - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness}
        />

        {/* Original PPC Line */}
        {opportunityCostType === 'constant' ? (
          <>
            <Line
              points={[160, canvasHeight - ppcYPosition, canvasWidth - ppcXPosition, canvasHeight - 70]}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
            />
            {/* Label for constant PPC */}
            <Text
              text="PPC₁"
              x={canvasWidth - ppcXPosition - 150}
              y={canvasHeight - ppcYPosition * 0.62}
              fontSize={settings.fontSize}
              fill="#000000"
              rotation={40} // Approximate angle for the constant curve
            />
          </>
        ) : (
          <>
            <Line
              points={[
                160, canvasHeight - ppcYPosition,
                160 + (canvasWidth - ppcXPosition - 160) * 0.7, canvasHeight - ppcYPosition * 0.7,
                canvasWidth - ppcXPosition, canvasHeight - 70
              ]}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
              tension={0.6}
            />
            {/* Label for increasing PPC */}
            <Text
              text="PPC₁"
              x={160 + (canvasWidth - ppcXPosition - 160) * 0.7}
              y={canvasHeight - ppcYPosition * 0.75}
              fontSize={settings.fontSize}
              fill="#000000"
              align="center"
            />
          </>
        )}

        {/* Shifted PPC Line */}
        {ppcShift !== 'none' && (
          <>
            {opportunityCostType === 'constant' ? (
              <>
                <Line
                  points={[
                    160,
                    clipYCoordinate(canvasHeight - (ppcYPosition * shiftOffset)),
                    canvasWidth - (ppcXPosition + ((1 - shiftOffset) * (canvasWidth - ppcXPosition - 160))),
                    clipYCoordinate(canvasHeight - (70 * shiftOffset))
                  ]}
                  stroke={settings.primaryColor}
                  strokeWidth={settings.lineThickness}
                />
                {/* Label for shifted constant PPC */}
                <Text
                  text="PPC₂"
                  x={canvasWidth - ppcXPosition - (ppcShift === 'inward' ? 175 : 100)}
                  y={canvasHeight - ppcYPosition * (ppcShift === 'inward' ? 0.5 : 0.71)}
                  fontSize={settings.fontSize}
                  fill="#000000"
                  rotation={40}
                />
              </>
            ) : (
              <>
                <Line
                  points={[
                    160,
                    clipYCoordinate(canvasHeight - (ppcYPosition * shiftOffset)),
                    160 + (canvasWidth - ppcXPosition - 160) * 0.7 * shiftOffset,
                    clipYCoordinate(canvasHeight - (ppcYPosition * 0.7 * shiftOffset)),
                    canvasWidth - (ppcXPosition + ((1 - shiftOffset) * (canvasWidth - ppcXPosition - 160))),
                    clipYCoordinate(canvasHeight - (70 * shiftOffset))
                  ]}
                  stroke={settings.primaryColor}
                  strokeWidth={settings.lineThickness}
                  tension={0.6}
                />
                {/* Label for shifted increasing PPC */}
                <Text
                  text="PPC₂"
                  x={160 + (canvasWidth - ppcXPosition - 160) * (ppcShift === 'inward' ? 0.58 : 0.95)}
                  y={canvasHeight - ppcYPosition * (ppcShift === 'inward' ? 0.6 : 0.8)}
                  fontSize={settings.fontSize}
                  fill="#000000"
                  align="center"
                />
              </>
            )}

            {/* Arrow pointing from original to shifted curve */}
            {opportunityCostType === 'constant' ? (
              <Arrow
                points={[
                  // Start from original constant curve
                  canvasWidth - ppcXPosition - (ppcShift === 'inward' ? 100 : 80),
                  canvasHeight - ppcYPosition * 0.4,
                  // End at shifted constant curve
                  canvasWidth - (ppcXPosition + ((1 - shiftOffset) * (canvasWidth - ppcXPosition - 0))) + (ppcShift === 'inward' ? -40 : -120),
                  canvasHeight - ppcYPosition * 0.4
                ]}
                stroke="#000000"
                strokeWidth={3}
                fill="#000000"
                pointerLength={5}
                pointerWidth={5}
              />
            ) : (
              <Arrow
                points={[
                  // Start from original increasing curve
                  160 + (canvasWidth - ppcXPosition - 160) * 0.89,
                  canvasHeight - ppcYPosition * 0.5,
                  // End at shifted increasing curve
                  160 + (canvasWidth - ppcXPosition - 160) * (ppcShift === 'inward' ? 0.7 : 1),
                  canvasHeight - ppcYPosition * 0.5
                ]}
                stroke="#000000"
                strokeWidth={3}
                fill="#000000"
                pointerLength={5}
                pointerWidth={5}
              />
            )}
          </>
        )}

        {/* Axis Labels */}
        <Text
          text={settings.yAxisLabel || 'Good A'}
          x={60}
          y={65}
          fontSize={settings.fontSize}
          fill="#000000"
          width={90}
          align="center"
          wrap="word"
        />
        <Text
          text={settings.xAxisLabel || 'Good B'}
          x={canvasWidth - 100}
          y={canvasHeight - 55}
          fontSize={settings.fontSize}
          fill="#000000"
          width={200}
          align="center"
          wrap="word"
        />

        {/* Origin Label */}
        <Text
          text="0"
          x={150}
          y={canvasHeight - 60}
          fontSize={settings.fontSize}
          fill="#000000"
        />
      </Layer>
    );
  };

  const renderNeoClassicalADAS = (isDownload = false) => {
    const clipLine = (points: number[]) => {
      const [x1, y1, x2, y2] = points;
      const maxY = canvasHeight - 70; // x-axis boundary
      const minY = 80; // y-axis top boundary
      const minX = 160; // y-axis left boundary
      const maxX = canvasWidth - 40; // right boundary
      
      const slope = (y2 - y1) / (x2 - x1);
      let clippedX1 = x1;
      let clippedY1 = y1;
      let clippedX2 = x2;
      let clippedY2 = y2;
      
      // Apply clipping logic
      if (y2 > maxY) {
        clippedX2 = x1 + (maxY - y1) / slope;
        clippedY2 = maxY;
      }
      
      if (y1 > maxY) {
        clippedX1 = x2 - (y2 - maxY) / slope;
        clippedY1 = maxY;
      }

      if (y2 < minY) {
        clippedX2 = x1 + (minY - y1) / slope;
        clippedY2 = minY;
      }
      
      if (y1 < minY) {
        clippedX1 = x2 - (y2 - minY) / slope;
        clippedY1 = minY;
      }

      if (clippedX1 < minX) {
        clippedX1 = minX;
        clippedY1 = y1 + slope * (minX - x1);
      }
      if (clippedX2 < minX) {
        clippedX2 = minX;
        clippedY2 = y2 + slope * (minX - x2);
      }

      if (clippedX1 > maxX) {
        clippedX1 = maxX;
        clippedY1 = y1 + slope * (maxX - x1);
      }
      if (clippedX2 > maxX) {
        clippedX2 = maxX;
        clippedY2 = y2 + slope * (maxX - x2);
      }
      
      return [clippedX1, clippedY1, clippedX2, clippedY2];
    };

    // Calculate intersection point of AD and SRAS
    const calculateIntersection = () => {
      // AD line points
      const adX1 = 250;
      const adY1 = 150 + adShift;
      const adX2 = 550;
      const adY2 = 450 + adShift;
      
      // SRAS line points
      const srasX1 = 250;
      const srasY1 = 450 + srasShift;
      const srasX2 = 550;
      const srasY2 = 150 + srasShift;

      // Calculate slopes
      const adSlope = (adY2 - adY1) / (adX2 - adX1);
      const srasSlope = (srasY2 - srasY1) / (srasX2 - srasX1);

      // Calculate y-intercepts
      const adIntercept = adY1 - adSlope * adX1;
      const srasIntercept = srasY1 - srasSlope * srasX1;

      // Calculate intersection point
      const x = (srasIntercept - adIntercept) / (adSlope - srasSlope);
      const y = adSlope * x + adIntercept;

      return { x, y };
    };

    // Calculate points for LRAS (vertical line)
    const lrasPoints = [
      400 + lrasShift, 80,  // Top point
      400 + lrasShift, canvasHeight - 70  // Bottom point
    ];

    // Calculate points for SRAS (upward sloping)
    const srasPoints = [
      250, 450 + srasShift,  // Left point
      550, 150 + srasShift   // Right point
    ];

    // Calculate points for AD (downward sloping)
    const adPoints = [
      250, 150 + adShift,  // Left point
      550, 450 + adShift   // Right point
    ];

    // Calculate intersection point
    const intersection = calculateIntersection();

    // Calculate shifted points for AD2 and AD3
    const ad2Points = showAD2 ? [
      250, 150 + adShift + 100,  // Left point
      550, 450 + adShift + 100   // Right point
    ] : null;

    const ad3Points = showAD3 ? [
      250, 150 + adShift - 100,  // Left point
      550, 450 + adShift - 100   // Right point
    ] : null;

    // Calculate shifted points for SRAS2 and SRAS3
    const sras2Points = showSRAS2 ? [
      250, 450 + srasShift + 100,  // Left point
      550, 150 + srasShift + 100   // Right point
    ] : null;

    const sras3Points = showSRAS3 ? [
      250, 450 + srasShift - 100,  // Left point
      550, 150 + srasShift - 100   // Right point
    ] : null;

    // Calculate intersection points for shifted curves
    const calculateShiftedIntersection = (points1: number[], points2: number[]) => {
      const [x1, y1, x2, y2] = points1;
      const [x3, y3, x4, y4] = points2;
      
      const slope1 = (y2 - y1) / (x2 - x1);
      const slope2 = (y4 - y3) / (x4 - x3);
      
      const intercept1 = y1 - slope1 * x1;
      const intercept2 = y3 - slope2 * x3;
      
      const x = (intercept2 - intercept1) / (slope1 - slope2);
      const y = slope1 * x + intercept1;
      
      return { x, y };
    };

    // Calculate intersection points for each shifted curve
    const ad2Intersection = showAD2 && ad2Points ? calculateShiftedIntersection(ad2Points, srasPoints) : null;
    const ad3Intersection = showAD3 && ad3Points ? calculateShiftedIntersection(ad3Points, srasPoints) : null;
    const sras2Intersection = showSRAS2 && sras2Points ? calculateShiftedIntersection(sras2Points, adPoints) : null;
    const sras3Intersection = showSRAS3 && sras3Points ? calculateShiftedIntersection(sras3Points, adPoints) : null;

    return (
      <Layer>
        {/* White Background */}
        <Rect
          x={0}
          y={0}
          width={canvasWidth + 200}
          height={canvasHeight}
          fill="white"
        />

        {/* Watermarks - only show in preview */}
        {!isDownload && [0.25, 0.5, 0.75].map((position) => (
          <Text
            key={position}
            text="Copyright Diploma Collective"
            x={canvasWidth * position}
            y={canvasHeight / 2}
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
          text="Neo-Classical AD/AS Model"
          x={canvasWidth / 2}
          y={30}
          fontSize={settings.fontSize + 4}
          fill="#000000"
          align="center"
          width={300}
          offsetX={150}
        />

        {/* Draw axes */}
        <Line
          points={[160, 80, 160, canvasHeight - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness}
        />
        <Line
          points={[160, canvasHeight - 70, canvasWidth - 40, canvasHeight - 70]}
          stroke="#000000"
          strokeWidth={settings.lineThickness}
        />

        {/* Draw LRAS */}
        {showLRAS && (
          <>
            <Line
              points={clipLine(lrasPoints)}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              strokeDash={[5, 5]}
            />
            <Text
              text="LRAS"
              x={lrasPoints[0] + 10}
              y={lrasPoints[1] - 20}
              fontSize={settings.fontSize}
              fill="#000000"
            />
          </>
        )}

        {/* Draw SRAS */}
        {showSRAS && (
          <>
            <Line
              points={clipLine(srasPoints)}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="SRAS"
              x={srasPoints[2] + 10}
              y={srasPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
          </>
        )}

        {/* Draw AD */}
        {showAD && (
          <>
            <Line
              points={clipLine(adPoints)}
              stroke={settings.secondaryColor}
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="AD"
              x={adPoints[2] + 10}
              y={adPoints[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.secondaryColor}
            />
          </>
        )}

        {/* Draw AD2 with intersection */}
        {showAD2 && ad2Points && ad2Intersection && (
          <>
            <Line
              points={clipLine(ad2Points)}
              stroke={settings.secondaryColor}
              strokeWidth={settings.lineThickness}
              strokeDash={[5, 5]}
            />
            <Text
              text="AD₂"
              x={ad2Points[2] - 20}
              y={ad2Points[3] - 50}
              fontSize={settings.fontSize}
              fill={settings.secondaryColor}
            />
            <Line
              points={[
                ad2Intersection.x,
                ad2Intersection.y,
                160,
                ad2Intersection.y
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Line
              points={[
                ad2Intersection.x,
                ad2Intersection.y,
                ad2Intersection.x,
                canvasHeight - 70
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Circle
              x={ad2Intersection.x}
              y={ad2Intersection.y}
              radius={4}
              fill="#000000"
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="APL₂"
              x={120}
              y={ad2Intersection.y - 10}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            {Math.abs(ad2Intersection.x - (400 + lrasShift)) > 20 && (
              <Text
                text="Y₂"
                x={ad2Intersection.x - 5}
                y={canvasHeight - 60}
                fontSize={settings.fontSize}
                fill="#000000"
              />
            )}
          </>
        )}

        {/* Draw AD3 with intersection */}
        {showAD3 && ad3Points && ad3Intersection && (
          <>
            <Line
              points={clipLine(ad3Points)}
              stroke={settings.secondaryColor}
              strokeWidth={settings.lineThickness}
              strokeDash={[5, 5]}
            />
            <Text
              text="AD₃"
              x={ad3Points[2] + 10}
              y={ad3Points[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.secondaryColor}
            />
            <Line
              points={[
                ad3Intersection.x,
                ad3Intersection.y,
                160,
                ad3Intersection.y
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Line
              points={[
                ad3Intersection.x,
                ad3Intersection.y,
                ad3Intersection.x,
                canvasHeight - 70
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Circle
              x={ad3Intersection.x}
              y={ad3Intersection.y}
              radius={4}
              fill="#000000"
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="APL₃"
              x={120}
              y={ad3Intersection.y - 10}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            {Math.abs(ad3Intersection.x - (400 + lrasShift)) > 20 && (
              <Text
                text="Y₃"
                x={ad3Intersection.x - 5}
                y={canvasHeight - 60}
                fontSize={settings.fontSize}
                fill="#000000"
              />
            )}
          </>
        )}

        {/* Draw SRAS2 with intersection */}
        {showSRAS2 && sras2Points && sras2Intersection && (
          <>
            <Line
              points={clipLine(sras2Points)}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
              strokeDash={[5, 5]}
            />
            <Text
              text="SRAS₂"
              x={sras2Points[2] + 10}
              y={sras2Points[3] - 20}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
            <Line
              points={[
                sras2Intersection.x,
                sras2Intersection.y,
                160,
                sras2Intersection.y
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Line
              points={[
                sras2Intersection.x,
                sras2Intersection.y,
                sras2Intersection.x,
                canvasHeight - 70
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Circle
              x={sras2Intersection.x}
              y={sras2Intersection.y}
              radius={4}
              fill="#000000"
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="APL₂"
              x={120}
              y={sras2Intersection.y - 10}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            {Math.abs(sras2Intersection.x - (400 + lrasShift)) > 20 && (
              <Text
                text="Y₂"
                x={sras2Intersection.x - 5}
                y={canvasHeight - 60}
                fontSize={settings.fontSize}
                fill="#000000"
              />
            )}
          </>
        )}

        {/* Draw SRAS3 with intersection */}
        {showSRAS3 && sras3Points && sras3Intersection && (
          <>
            <Line
              points={clipLine(sras3Points)}
              stroke={settings.primaryColor}
              strokeWidth={settings.lineThickness}
              strokeDash={[5, 5]}
            />
            <Text
              text="SRAS₃"
              x={sras3Points[2] -20}
              y={sras3Points[3] - 0}
              fontSize={settings.fontSize}
              fill={settings.primaryColor}
            />
            <Line
              points={[
                sras3Intersection.x,
                sras3Intersection.y,
                160,
                sras3Intersection.y
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Line
              points={[
                sras3Intersection.x,
                sras3Intersection.y,
                sras3Intersection.x,
                canvasHeight - 70
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Circle
              x={sras3Intersection.x}
              y={sras3Intersection.y}
              radius={4}
              fill="#000000"
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="APL₃"
              x={120}
              y={sras3Intersection.y - 10}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            {Math.abs(sras3Intersection.x - (400 + lrasShift)) > 20 && (
              <Text
                text="Y₃"
                x={sras3Intersection.x - 5}
                y={canvasHeight - 60}
                fontSize={settings.fontSize}
                fill="#000000"
              />
            )}
          </>
        )}

        {/* Draw Equilibrium Point and Line */}
        {showLRAS && showSRAS && showAD && (
          <>
            <Line
              points={[
                intersection.x,
                intersection.y,
                160,
                intersection.y
              ]}
              stroke="#000000"
              strokeWidth={settings.lineThickness}
              dash={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            <Circle
              x={intersection.x}
              y={intersection.y}
              radius={4}
              fill="#000000"
              stroke="#000000"
              strokeWidth={settings.lineThickness}
            />
            <Text
              text="APL"
              x={120}
              y={intersection.y - 10}
              fontSize={settings.fontSize}
              fill="#000000"
            />
            {/* Only show dashed line and Y label if not too close to LRAS line */}
            {Math.abs(intersection.x - (400 + lrasShift)) > 20 && (
              <>
                <Line
                  points={[
                    intersection.x,
                    intersection.y,
                    intersection.x,
                    canvasHeight - 70
                  ]}
                  stroke="#000000"
                  strokeWidth={settings.lineThickness}
                  dash={[5, 5]}
                  lineCap="round"
                  lineJoin="round"
                />
                <Text
                  text="Y"
                  x={intersection.x - 5}
                  y={canvasHeight - 60}
                  fontSize={settings.fontSize}
                  fill="#000000"
                />
              </>
            )}
            <Text
              text="Yfe"
              x={390 + lrasShift}
              y={540}
              fontSize={settings.fontSize}
              fill="#000000"
            />
          </>
        )}

        {/* Draw axis labels */}
        <Text
          text={settings.yAxisLabel}
          x={40}
          y={80}
          fontSize={settings.fontSize}
          fill="#000000"
          width={90}
          align="center"
          wrap="word"
        />
        <Text
          text={settings.xAxisLabel}
          x={canvasWidth - 140}
          y={canvasHeight - 50}
          fontSize={settings.fontSize}
          width={100}
          align="center"
          wrap="word"
          fill="#000000"
        />
      </Layer>
    );
  };

  const renderDiagram = () => {
    switch (type) {
      case DiagramTypes.SUPPLY_DEMAND:
        return renderSupplyDemand();
      case DiagramTypes.EXTERNALITIES:
        return renderExternalities();
      case DiagramTypes.PPC:
        return renderPPC();
      case DiagramTypes.NEO_CLASSICAL_AD_AS:
        return renderNeoClassicalADAS();
      default:
        return null;
    }
  };

  function isValidReferrer(referrer: string): boolean {
    // The main allowed referrer
    const allowedReferrer = "https://diplomacollective.com/home/for-students/econgraph-pro/";
    
    // Also allow if user navigates within the app after coming from allowed referrer
    const isFromAllowedDomain = referrer.startsWith("https://diplomacollective.com/");
    
    // For development and testing
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return referrer === allowedReferrer || isFromAllowedDomain || isDevelopment;
  }

  const handleDownload = async (format: 'png' | 'jpg') => {
    console.log("Starting download process...");
    
    if (typeof window === 'undefined') {
      console.log("Running on server side - cannot process download");
      return;
    }

    const referrer = document.referrer;
    console.log("Current referrer:", referrer);
    
    const isValid = isValidReferrer(referrer);
    console.log("Referrer validation result:", { isValid, referrer });

    if (!isValid) {
      console.log("Invalid referrer, showing payment dialog");
      setShowPaymentDialog(true);
      return;
    }

    try {
      const stage = stageRef.current;
      if (!stage) {
        console.error("Stage not found");
        return;
      }

      // Create a temporary container for the download stage
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Create a new stage for the download without watermarks
      const downloadStage = new Konva.Stage({
        container: container,
        width: stage.width(),
        height: stage.height()
      });

      // Add a layer with the diagram without watermarks
      const downloadLayer = new Konva.Layer();
      downloadStage.add(downloadLayer);

      // Add white background
      const background = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: 'white'
      });
      downloadLayer.add(background);

      // Clone the current stage's content without watermarks
      const layers = stage.find('Layer') as Konva.Layer[];
      layers.forEach(layer => {
        const shapes = layer.getChildren() as Konva.Shape[];
        shapes.forEach(shape => {
          if (shape.name() !== 'watermark') {
            const clone = shape.clone();
            downloadLayer.add(clone);
          }
        });
      });

      // Create a temporary link element
      const link = document.createElement('a');
      link.download = `${settings.title || type}-diagram.${format}`;
      
      // Get the stage data URL
      const dataUrl = downloadStage.toDataURL({
        pixelRatio: 2,
        mimeType: format === 'jpg' ? 'image/jpeg' : 'image/png',
        quality: 1
      });
      
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      downloadStage.destroy();
      document.body.removeChild(container);
      
      console.log(`Download completed in ${format} format`);
    } catch (error) {
      console.error("Download failed:", error);
      setShowPaymentDialog(true);
    }
  };

  const handleEconGraphProSubscription = () => {
    window.location.href = 'https://diplomacollective.com/register/econ-student-econgraph-pro/';
  };

  const handleStudentSubscription = () => {
    window.location.href = 'https://diplomacollective.com/register/econ-student-monthly/';
  };

  if (!mounted) {
    return (
      <div style={{ 
        width: (canvasWidth + 200) * canvasSize, 
        minHeight: (canvasHeight + 300) * canvasSize,
        paddingLeft: '100px',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left side - Canvas */}
      <div style={{ 
        width: (canvasWidth + 200) * canvasSize, 
        minHeight: (canvasHeight + 300) * canvasSize,
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Stage 
          ref={stageRef} 
          width={(canvasWidth + 200) * canvasSize} 
          height={canvasHeight * canvasSize}
          scale={{ x: canvasSize, y: canvasSize }}
        >
          {renderDiagram()}
        </Stage>
        {mounted && (
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            maxWidth: (canvasWidth + 200) * canvasSize
          }}>
            {/* Externalities Section - Only show for externalities diagram */}
            {type === DiagramTypes.EXTERNALITIES && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    Add an Externality
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {/* First row - Consumption externalities */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      alignItems: 'flex-start',
                      width: '100%'
                    }}>
                      {/* Positive Externality */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '5px', 
                        flex: '1'
                      }}>
                        <button
                          onClick={() => {
                            setShowPositiveConsumptionExternality(!showPositiveConsumptionExternality);
                            if (!showPositiveConsumptionExternality) {
                              setShowNegativeConsumptionExternality(false);
                            }
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: showPositiveConsumptionExternality ? '#4895ef' : '#ffffff',
                            color: showPositiveConsumptionExternality ? '#ffffff' : '#1f2937',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            fontWeight: 500,
                            width: '100%',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            whiteSpace: 'normal',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}
                        >
                          Positive Externality of Consumption
                        </button>
                        {showPositiveConsumptionExternality && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            <label style={{
                              color: '#1f2937',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}>
                              Gap:
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="150"
                              value={mpbDistance}
                              onChange={(e) => setMpbDistance(parseInt(e.target.value))}
                              style={{ 
                                width: '60px',
                                accentColor: '#4895ef'
                              }}
                            />
                            <span style={{
                              color: '#6b7280',
                              minWidth: '20px'
                            }}>
                              {mpbDistance}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Negative Externality */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '5px', 
                        flex: '1'
                      }}>
                        <button
                          onClick={() => {
                            setShowNegativeConsumptionExternality(!showNegativeConsumptionExternality);
                            if (!showNegativeConsumptionExternality) {
                              setShowPositiveConsumptionExternality(false);
                            }
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: showNegativeConsumptionExternality ? '#4895ef' : '#ffffff',
                            color: showNegativeConsumptionExternality ? '#ffffff' : '#1f2937',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            fontWeight: 500,
                            width: '100%',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            whiteSpace: 'normal',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}
                        >
                          Negative Externality of Consumption
                        </button>
                        {showNegativeConsumptionExternality && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            <label style={{
                              color: '#1f2937',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}>
                              Gap:
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="150"
                              value={negMpbDistance}
                              onChange={(e) => setNegMpbDistance(parseInt(e.target.value))}
                              style={{ 
                                width: '60px',
                                accentColor: '#4895ef'
                              }}
                            />
                            <span style={{
                              color: '#6b7280',
                              minWidth: '20px'
                            }}>
                              {negMpbDistance}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Second row - Production externalities */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      alignItems: 'flex-start',
                      width: '100%'
                    }}>
                      {/* Positive Production Externality */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '5px', 
                        flex: '1'
                      }}>
                        <button
                          onClick={() => {
                            setShowPositiveProductionExternality(!showPositiveProductionExternality);
                            if (!showPositiveProductionExternality) {
                              setShowPositiveConsumptionExternality(false);
                              setShowNegativeConsumptionExternality(false);
                              setShowNegativeProductionExternality(false);
                            }
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: showPositiveProductionExternality ? '#4895ef' : '#ffffff',
                            color: showPositiveProductionExternality ? '#ffffff' : '#1f2937',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            fontWeight: 500,
                            width: '100%',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            whiteSpace: 'normal',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}
                        >
                          Positive Externality of Production
                        </button>
                        {showPositiveProductionExternality && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            <label style={{
                              color: '#1f2937',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}>
                              Gap:
                            </label>
                            <input
                              type="range"
                              min="120"
                              max="200"
                              value={mpcDistance}
                              onChange={(e) => setMpcDistance(parseInt(e.target.value))}
                              style={{ 
                                width: '60px',
                                accentColor: '#4895ef'
                              }}
                            />
                            <span style={{
                              color: '#6b7280',
                              minWidth: '20px'
                            }}>
                              {mpcDistance}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Negative Production Externality */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '5px', 
                        flex: '1'
                      }}>
                        <button
                          onClick={() => {
                            setShowNegativeProductionExternality(!showNegativeProductionExternality);
                            if (!showNegativeProductionExternality) {
                              setShowPositiveProductionExternality(false);
                              setShowPositiveConsumptionExternality(false);
                              setShowNegativeConsumptionExternality(false);
                            }
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: showNegativeProductionExternality ? '#4895ef' : '#ffffff',
                            color: showNegativeProductionExternality ? '#ffffff' : '#1f2937',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            fontWeight: 500,
                            width: '100%',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            whiteSpace: 'normal',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}
                        >
                          Negative Externality of Production
                        </button>
                        {showNegativeProductionExternality && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            <label style={{
                              color: '#1f2937',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}>
                              Gap:
                            </label>
                            <input
                              type="range"
                              min="120"
                              max="300"
                              value={negMpcDistance}
                              onChange={(e) => setNegMpcDistance(parseInt(e.target.value))}
                              style={{ 
                                width: '60px',
                                accentColor: '#4895ef'
                              }}
                            />
                            <span style={{
                              color: '#6b7280',
                              minWidth: '20px'
                            }}>
                              {negMpcDistance}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Interventions Section */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  marginTop: '20px'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    Add an Intervention
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {/* First row of intervention buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      alignItems: 'flex-start',
                      width: '100%'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '5px', 
                        flex: '1'
                      }}>
                        <button
                          onClick={() => {
                            setShowTax(!showTax);
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: showTax ? '#4895ef' : '#ffffff',
                            color: showTax ? '#ffffff' : '#1f2937',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            fontWeight: 500,
                            width: '100%',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            whiteSpace: 'normal',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}
                        >
                          Add a Tax/Regulation/Legislation
                        </button>
                        {showTax && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            <label style={{
                              color: '#1f2937',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}>
                              Gap:
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="500"
                              value={taxDistance}
                              onChange={(e) => setTaxDistance(parseInt(e.target.value))}
                              style={{ 
                                width: '60px',
                                accentColor: '#4895ef'
                              }}
                            />
                            <span style={{
                              color: '#6b7280',
                              minWidth: '20px'
                            }}>
                              {taxDistance}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Add a Subsidy button */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        flex: '1'
                      }}>
                        <button
                          onClick={() => {
                            setShowSubsidy(!showSubsidy);
                            setShowTax(false);
                            setShowPositiveConsumptionExternality(false);
                            setShowNegativeConsumptionExternality(false);
                            setShowPositiveProductionExternality(false);
                            setShowNegativeProductionExternality(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: showSubsidy ? '#4895ef' : '#ffffff',
                            color: showSubsidy ? '#ffffff' : '#1f2937',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            fontWeight: 500,
                            width: '100%',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            whiteSpace: 'normal',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}
                        >
                          Add a Subsidy
                        </button>
                        {showSubsidy && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            <label style={{
                              color: '#1f2937',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}>
                              Gap:
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="140"
                              value={subsidyDistance}
                              onChange={(e) => setSubsidyDistance(parseInt(e.target.value))}
                              style={{ 
                                width: '60px',
                                accentColor: '#4895ef'
                              }}
                            />
                            <span style={{
                              color: '#6b7280',
                              minWidth: '20px'
                            }}>
                              {subsidyDistance}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Second row of intervention buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      alignItems: 'flex-start',
                      width: '100%'
                    }}>
              
                      <button
                        onClick={() => {
                          setShowNegativeAdvertising(!showNegativeAdvertising);
                          setShowTax(false);
                          setShowSubsidy(false);
                          setShowPositiveConsumptionExternality(false);
                          setShowNegativeConsumptionExternality(false);
                          setShowPositiveProductionExternality(false);
                          setShowNegativeProductionExternality(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: showNegativeAdvertising ? '#4895ef' : '#ffffff',
                          color: showNegativeAdvertising ? '#ffffff' : '#1f2937',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          fontWeight: 500,
                          flex: '1',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          whiteSpace: 'normal',
                          minHeight: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center'
                        }}
                      >
                        Show Negative Advertising/Education
                      </button>
                      <button
                        onClick={() => {
                          setShowPositiveAdvertising(!showPositiveAdvertising);
                          setShowTax(false);
                          setShowSubsidy(false);
                          setShowNegativeAdvertising(false);
                          setShowPositiveConsumptionExternality(false);
                          setShowNegativeConsumptionExternality(false);
                          setShowPositiveProductionExternality(false);
                          setShowNegativeProductionExternality(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: showPositiveAdvertising ? '#4895ef' : '#ffffff',
                          color: showPositiveAdvertising ? '#ffffff' : '#1f2937',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          fontWeight: 500,
                          flex: '1',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          whiteSpace: 'normal',
                          minHeight: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center'
                        }}
                      >
                        Show Positive Advertising/Education
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Interventions Section - Only show for supply and demand diagram */}
            {type === DiagramTypes.SUPPLY_DEMAND && (
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
                    backgroundColor: showS2 ? '#4895ef' : '#ffffff',
                    color: showS2 ? '#ffffff' : '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Add a Tax
                </button>
                <button
                  onClick={onToggleS3}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showS3 ? '#4895ef' : '#ffffff',
                    color: showS3 ? '#ffffff' : '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Add a Subsidy
                </button>
                <button
                  onClick={onTogglePriceCeiling}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showPriceCeiling ? '#4895ef' : '#ffffff',
                    color: showPriceCeiling ? '#ffffff' : '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Add a Price Ceiling
                </button>
                <button
                  onClick={onTogglePriceFloor}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: showPriceFloor ? '#4895ef' : '#ffffff',
                    color: showPriceFloor ? '#ffffff' : '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                    flex: '0 0 auto',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Add a Price Floor
                </button>
              </div>
            </div>
            )}

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
                    backgroundColor: showP2 ? '#4CAF50' : '#ffffff',
                    color: showP2 ? 'white' : '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  Show Tax Distance/Govt. Rev
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
                              {standardColors.map((color) => (
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
                              {standardColors.map((color) => (
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
                    backgroundColor: showP3 ? '#4CAF50' : '#ffffff',
                    color: showP3 ? 'white' : '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
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
                          {standardColors.map((color) => (
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
            {showNegativeAdvertising && (
              <div style={{ 
                display: 'flex', 
                gap: '5px', 
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                width: '100%'
              }}>
                <label style={{
                  color: '#1f2937',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}>
                  Gap:
                </label>
                <input
                  type="range"
                  min="0"
                  max="140"
                  value={negativeAdvertisingDistance}
                  onChange={(e) => setNegativeAdvertisingDistance(parseInt(e.target.value))}
                  style={{ 
                    width: '60px',
                    accentColor: '#4895ef'
                  }}
                />
                <span style={{
                  color: '#6b7280',
                  minWidth: '20px'
                }}>
                  {negativeAdvertisingDistance}
                </span>
              </div>
            )}
            {showPositiveAdvertising && (
              <div style={{ 
                display: 'flex', 
                gap: '5px', 
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <label style={{
                  color: '#1f2937',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}>
                  Gap:
                </label>
                <input
                  type="range"
                  min="0"
                  max="140"
                  value={positiveAdvertisingDistance}
                  onChange={(e) => setPositiveAdvertisingDistance(parseInt(e.target.value))}
                  style={{ 
                    width: '60px',
                    accentColor: '#4895ef'
                  }}
                />
                <span style={{
                  color: '#6b7280',
                  minWidth: '20px'
                }}>
                  {positiveAdvertisingDistance}
                </span>
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
              {/* Canvas Controls - Hidden */}
              <div className="hidden">
                <CanvasControls
                  width={canvasWidth}
                  height={canvasHeight}
                  size={canvasSize}
                  onUpdateWidth={setCanvasWidth}
                  onUpdateHeight={setCanvasHeight}
                  onUpdateSize={setCanvasSize}
                />
              </div>

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
                    <label className="block text-sm text-black mb-1">Line Colors</label>
                    <div className="flex gap-2 flex-wrap">
                      {standardColors.map((color) => (
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
                  {type !== DiagramTypes.PPC && (
                    <div>
                      <label className="block text-sm text-black mb-1">Line Colors</label>
                      <div className="flex gap-2 flex-wrap">
                        {standardColors.map((color) => (
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
                  )}
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
                  {type === DiagramTypes.PPC && (
                    <>
                      <div>
                        <label className="block text-sm text-black mb-1">Type of Opportunity Cost</label>
                        <select
                          value={opportunityCostType}
                          onChange={(e) => setOpportunityCostType(e.target.value as 'constant' | 'increasing')}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                        >
                          <option value="constant">Constant</option>
                          <option value="increasing">Increasing</option>
                        </select>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-black mb-2">Potential Output Shift</label>
                        <div className="space-y-2">
                          <button
                            onClick={() => setPpcShift(ppcShift === 'outward' ? 'none' : 'outward')}
                            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
                              ppcShift === 'outward'
                                ? 'bg-blue-500 text-white border-blue-600'
                                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Increase in Potential Output (Shift PPC Outward)
                          </button>
                          <button
                            onClick={() => setPpcShift(ppcShift === 'inward' ? 'none' : 'inward')}
                            className={`w-full px-3 py-2 text-sm border rounded-md transition-colors ${
                              ppcShift === 'inward'
                                ? 'bg-blue-500 text-white border-blue-600'
                                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Decrease in Potential Output (Shift PPC Inward)
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Line Labels */}
              {type === DiagramTypes.SUPPLY_DEMAND && (
                <>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-black">Line Labels</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-black mb-1">Supply Label</label>
                        <input
                          type="text"
                          value={supplyLabel}
                          onChange={(e) => setSupplyLabel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Supply Label"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Demand Label</label>
                        <input
                          type="text"
                          value={demandLabel}
                          onChange={(e) => setDemandLabel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Demand Label"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
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
              {(type === DiagramTypes.SUPPLY_DEMAND || type === DiagramTypes.EXTERNALITIES) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-black">Elasticity</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-black mb-1">Supply Elasticity</label>
                      <select
                        value={settings.supplyElasticity}
                        onChange={(e) => onUpdateSettings({ ...settings, supplyElasticity: e.target.value as ElasticityType })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      >
                        <option value="unitary">Unitary Elastic</option>
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
                        onChange={(e) => onUpdateSettings({ ...settings, demandElasticity: e.target.value as ElasticityType })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      >
                        <option value="unitary">Unitary Elastic</option>
                        <option value="relatively-elastic">Relatively Elastic</option>
                        <option value="relatively-inelastic">Relatively Inelastic</option>
                        <option value="perfectly-elastic">Perfectly Elastic</option>
                        <option value="perfectly-inelastic">Perfectly Inelastic</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Neo-Classical AD/AS Controls */}
              {type === DiagramTypes.NEO_CLASSICAL_AD_AS && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-black">Curve Controls</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showLRAS}
                        onChange={(e) => setShowLRAS(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-black">Show LRAS</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showSRAS}
                        onChange={(e) => setShowSRAS(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-black">Show SRAS</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showAD}
                        onChange={(e) => setShowAD(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-black">Show AD</label>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-black">Shift Controls</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showAD2}
                        onChange={(e) => {
                          setShowAD2(e.target.checked);
                          setShowAD3(false);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                
                      <label className="text-sm text-black">Decrease AD (AD₂)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showAD3}
                        onChange={(e) => {
                          setShowAD3(e.target.checked);
                          setShowAD2(false);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-black">Increase AD (AD₃)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showSRAS2}
                        onChange={(e) => {
                          setShowSRAS2(e.target.checked);
                          setShowSRAS3(false);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-black">Increase SRAS (SRAS₂)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showSRAS3}
                        onChange={(e) => {
                          setShowSRAS3(e.target.checked);
                          setShowSRAS2(false);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-black">Decrease SRAS (SRAS₃)</label>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-black">Position Controls</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-black mb-1">AD Position</label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adShift}
                        onChange={(e) => setAdShift(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">SRAS Position</label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={srasShift}
                        onChange={(e) => setSrasShift(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">LRAS Position</label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={lrasShift}
                        onChange={(e) => setLrasShift(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setAdShift(0);
                        setSrasShift(0);
                        setLrasShift(0);
                      }}
                      className="w-full px-3 py-2 text-sm border rounded-md transition-colors bg-white text-black border-gray-300 hover:bg-gray-50"
                    >
                      Reset To Default
                    </button>
                  </div>
                </div>
              )}

              {/* Download Diagram Button */}
              <div className="mt-4">
                <button
                  onClick={() => handleDownload('png')}
                  className="w-full px-4 py-2 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#40b36e',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Diagram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Choose Your Subscription
            </h2>
            <p style={{
              marginBottom: '1.5rem',
              color: '#4b5563'
            }}>
              To download diagrams without watermarks, please choose a subscription:
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* EconGraph Pro Button */}
              <div>
                <button
                  onClick={handleEconGraphProSubscription}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#40b36e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    width: '100%',
                    marginBottom: '0.5rem'
                  }}
                >
                  EconGraph Pro Subscription
                </button>
                <ul style={{
                  listStyle: 'disc',
                  paddingLeft: '1.5rem',
                  color: '#4b5563',
                  fontSize: '0.875rem'
                }}>
                  <li>Download diagrams without watermarks</li>
                  <li>Access to all diagram types</li>
                  <li>Customize colors and styles</li>
                  <li>Export in high resolution</li>
                </ul>
              </div>

              {/* Student Membership Button */}
              <div>
                <button
                  onClick={handleStudentSubscription}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#40b36e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    width: '100%',
                    marginBottom: '0.5rem'
                  }}
                >
                  Student Membership
                </button>
                <ul style={{
                  listStyle: 'disc',
                  paddingLeft: '1.5rem',
                  color: '#4b5563',
                  fontSize: '0.875rem'
                }}>
                  <li>All EconGraph Pro features</li>
                  <li>Step-By-Step Econ IA Guide</li>
                  <li>Power Review Pack Access</li>
                </ul>
              </div>

              {/* Already a member section */}
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1rem',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#4b5563',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Already a member?
                </p>
                <a
                  href="https://diplomacollective.com/home/for-students/econgraph-pro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#40b36e',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}
                >
                  Login here
                </a>
              </div>

              <button
                onClick={() => setShowPaymentDialog(false)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas; 