'use client';

import dynamic from 'next/dynamic';
import { AirQualityData } from '@/lib/types';
import { getPollutantLabel } from '@/lib/utils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface InteractivePollutantChartProps {
  data: AirQualityData[];
}

const pollutants = [
  { key: 'pm10', label: 'PM10' },
  { key: 'pm2_5', label: 'PM2.5' },
  { key: 'carbon_monoxide', label: 'Carbon Monoxide' },
  { key: 'nitrogen_dioxide', label: 'Nitrogen Dioxide' },
  { key: 'sulphur_dioxide', label: 'Sulphur Dioxide' },
  { key: 'ozone', label: 'Ozone' },
] as const;

const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function InteractivePollutantChart({ data }: InteractivePollutantChartProps) {
  const times = data.map((d) => d.time).reverse();

  // Create traces for all pollutants
  const traces = pollutants.map((pollutant, idx) => {
    const values = data
      .map((d) => d[pollutant.key as keyof AirQualityData] as number || 0)
      .reverse();

    return {
      x: times,
      y: values,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: pollutant.label,
      line: { color: colors[idx], width: 2 },
      visible: true, // All visible by default
    };
  });

  // Create dropdown buttons for each pollutant
  const buttons = pollutants.map((pollutant, idx) => {
    const visible = pollutants.map((_, i) => i === idx);
    return {
      label: pollutant.label,
      method: 'update' as const,
      args: [
        { visible },
        { title: `${pollutant.label} Levels Over Time` },
      ],
    };
  });

  // Add "Show All" button
  buttons.push({
    label: 'Show All',
    method: 'update' as const,
    args: [
      { visible: pollutants.map(() => true) },
      { title: 'All Pollutant Levels Over Time' },
    ],
  });

  return (
    <div className="w-full h-[500px]">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          title: {
            text: 'Interactive Pollutant Levels Over Time',
            font: { size: 18, weight: 'bold' as any },
          },
          xaxis: {
            title: 'Date',
            showgrid: true,
            gridcolor: '#e5e7eb',
          },
          yaxis: {
            title: 'Pollutant Level (μg/m³)',
            showgrid: true,
            gridcolor: '#e5e7eb',
          },
          hovermode: 'x unified',
          showlegend: true,
          legend: {
            x: 0,
            y: 1.1,
            orientation: 'h' as const,
            xanchor: 'left',
            yanchor: 'bottom',
          },
          updatemenus: [
            {
              type: 'dropdown' as const,
              direction: 'down' as const,
              buttons: buttons,
              x: 0.8,
              xanchor: 'left',
              y: 1.18,
              yanchor: 'top',
              bgcolor: '#ffffff',
              bordercolor: '#d1d5db',
              borderwidth: 1,
            },
          ],
          margin: { l: 60, r: 30, t: 120, b: 50 },
          plot_bgcolor: '#ffffff',
          paper_bgcolor: '#ffffff',
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
