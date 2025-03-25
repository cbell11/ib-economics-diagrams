import { ElasticityType } from './elasticity';

export enum DiagramTypes {
  SUPPLY_DEMAND = 'SUPPLY_DEMAND',
  NEO_CLASSICAL_AD_AS = 'NEO_CLASSICAL_AD_AS',
  KEYNESIAN_AD_AS = 'KEYNESIAN_AD_AS',
  EXTERNALITIES = 'EXTERNALITIES',
  INTERNATIONAL_TRADE = 'INTERNATIONAL_TRADE',
  PPC = 'PPC'
}

export type DiagramType = typeof DiagramTypes[keyof typeof DiagramTypes];

export interface DiagramSettings {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  fontSize: number;
  lineThickness: number;
  primaryColor: string;
  secondaryColor: string;
  supplyElasticity?: ElasticityType;
  demandElasticity?: ElasticityType;
}

export const defaultSettings: DiagramSettings = {
  title: 'Figure 1: Supply and Demand',
  xAxisLabel: 'Quantity',
  yAxisLabel: 'Price',
  fontSize: 16,
  lineThickness: 2,
  primaryColor: '#0066cc',
  secondaryColor: '#cc0000',
  supplyElasticity: 'unitary',
  demandElasticity: 'unitary'
}; 