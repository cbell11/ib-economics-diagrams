import { ElasticityType } from './elasticity';

export const DiagramTypes = {
  SUPPLY_DEMAND: 'supply-demand',
  NEO_CLASSICAL_AD_AS: 'neo-classical-ad-as',
  KEYNESIAN_AD_AS: 'keynesian-ad-as',
  EXTERNALITIES: 'externalities',
  INTERNATIONAL_TRADE: 'international-trade',
  PPC: 'ppc',
} as const;

export type DiagramType = typeof DiagramTypes[keyof typeof DiagramTypes];

export interface DiagramSettings {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  fontSize: number;
  lineThickness: number;
  primaryColor: string;
  secondaryColor: string;
  supplyElasticity: ElasticityType;
  demandElasticity: ElasticityType;
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