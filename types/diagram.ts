export type ElasticityType = 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';

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
  supplyElasticity: 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';
  demandElasticity: 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';
}

export const defaultSettings: DiagramSettings = {
  title: '',
  xAxisLabel: '',
  yAxisLabel: '',
  s1Label: '',
  s2Label: '',
  s3Label: '',
  dLabel: '',
  priceCeilingHeight: 0,
  priceFloorHeight: 0,
  s2Distance: 0,
  s3Distance: 0,
  fontSize: 14,
  lineThickness: 2,
  primaryColor: '#4895ef',
  secondaryColor: '#32a567',
  supplyElasticity: 'unitary',
  demandElasticity: 'unitary'
}; 