export type ElasticityType = 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';

export type DiagramType = 'supply-demand' | 'ppf' | 'cost-curves';

export interface DiagramSettings {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  s1Label: string;
  s2Label: string;
  s3Label: string;
  dLabel: string;
  priceCeilingHeight: number;
  priceFloorHeight: number;
  s2Distance: number;
  s3Distance: number;
  fontSize: number;
  lineThickness: number;
  primaryColor: string;
  secondaryColor: string;
  supplyElasticity: ElasticityType;
  demandElasticity: ElasticityType;
  lineLabels: {
    supply: string;
    demand: string;
    supply2?: string;
    supply3?: string;
  };
  size: number;
}

export const defaultSettings: DiagramSettings = {
  title: 'Figure 1: Supply and Demand',
  xAxisLabel: 'Quantity',
  yAxisLabel: 'Price',
  s1Label: '',
  s2Label: '',
  s3Label: '',
  dLabel: '',
  priceCeilingHeight: 0,
  priceFloorHeight: 0,
  s2Distance: 0,
  s3Distance: 0,
  fontSize: 16,
  lineThickness: 2,
  primaryColor: '#0066cc',
  secondaryColor: '#cc0000',
  supplyElasticity: 'unitary',
  demandElasticity: 'unitary',
  lineLabels: {
    supply: 'S',
    demand: 'D',
    supply2: 'S₂',
    supply3: 'S₃'
  },
  size: 1
}; 