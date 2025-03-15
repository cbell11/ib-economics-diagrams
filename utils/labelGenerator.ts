import { DiagramSettings } from '../types/diagram';

const defaultLabels = {
  'supply-demand': {
    title: 'Figure 1: Supply and Demand',
    xAxis: 'Quantity',
    yAxis: 'Price ($)',
  },
  'ppf': {
    title: 'Figure 1: Production Possibility Frontier',
    xAxis: 'Good X',
    yAxis: 'Good Y',
  },
  'cost-curves': {
    title: 'Figure 1: Cost Curves',
    xAxis: 'Quantity',
    yAxis: 'Cost ($)',
  },
};

export async function generateLabels(context: string, type: 'supply-demand' | 'ppf' | 'cost-curves'): Promise<Partial<DiagramSettings>> {
  try {
    console.log('LabelGenerator - Starting generation with:', { context, type });

    const response = await fetch('/api/generate-labels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context, type }),
    });

    console.log('LabelGenerator - API response status:', response.status);

    if (!response.ok) {
      console.error('LabelGenerator - API request failed:', response.status);
      throw new Error('Failed to generate labels');
    }

    const generatedLabels = await response.json();
    console.log('LabelGenerator - Received labels:', generatedLabels);
    
    // Validate the received labels
    if (!generatedLabels.title || !generatedLabels.xAxisLabel || !generatedLabels.yAxisLabel) {
      console.warn('LabelGenerator - Incomplete labels received, using defaults');
      return {
        title: defaultLabels[type].title,
        xAxisLabel: defaultLabels[type].xAxis,
        yAxisLabel: defaultLabels[type].yAxis,
      };
    }

    return {
      title: generatedLabels.title,
      xAxisLabel: generatedLabels.xAxisLabel,
      yAxisLabel: generatedLabels.yAxisLabel,
    };
  } catch (error) {
    console.error('LabelGenerator - Error:', error);
    return {
      title: defaultLabels[type].title,
      xAxisLabel: defaultLabels[type].xAxis,
      yAxisLabel: defaultLabels[type].yAxis,
    };
  }
} 