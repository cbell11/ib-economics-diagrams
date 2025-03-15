export interface DiagramSettings {
  lineThickness: number;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  xAxisLabel: string;
  yAxisLabel: string;
  title?: string;
  supplyElasticity: 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';
  demandElasticity: 'unitary' | 'relatively-elastic' | 'relatively-inelastic' | 'perfectly-elastic' | 'perfectly-inelastic';
  supplyPosition: number;
  demandPosition: number;
  lineLength: number;
  supplyLineLength: number;
  demandLineLength: number;
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
  demandElasticity: 'unitary',
  supplyPosition: 70,
  demandPosition: 70,
  lineLength: 90,
  supplyLineLength: 80,
  demandLineLength: 80
};

export { defaultSettings }; 