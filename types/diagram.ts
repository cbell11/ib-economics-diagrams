export type ElasticityType = 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';

export interface DiagramSettings {
  title?: string;
  xAxisLabel: string;
  yAxisLabel: string;
  primaryColor: string;
  secondaryColor: string;
  lineThickness: number;
  fontSize: number;
  supplyElasticity: ElasticityType;
  demandElasticity: ElasticityType;
}

const defaultSettings: DiagramSettings = {
  lineThickness: 2,
  fontSize: 16,
  primaryColor: '#2563eb',
  secondaryColor: '#dc2626',
  xAxisLabel: 'Quantity',
  yAxisLabel: 'Price',
  title: 'Figure 1: Supply and Demand',
  supplyElasticity: 'unitary',
  demandElasticity: 'unitary'
};

export { defaultSettings }; 