'use client';

import { useEffect, useRef, useState } from 'react';
import { getLatestNDVI, getNDVIStats, getNDVIMonthlyAverage, getNDVITimeSeries } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NDVIChart } from '@/components/charts/NDVIChart';
import { NDVIMap } from '@/components/maps/NDVIMap';
import { NDVIGridCell, NDVIMonthlyAverage, NDVIStatistics } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { Leaf, TrendingUp, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function VegetationPage() {
  const [latestNDVI, setLatestNDVI] = useState<NDVIGridCell[]>([]);
  const [stats, setStats] = useState<NDVIStatistics | null>(null);
  const [greenestAreas, setGreenestAreas] = useState<NDVIGridCell[]>([]);
  const [monthlyAverage, setMonthlyAverage] = useState<NDVIMonthlyAverage[]>([]);
  const [selectedCell, setSelectedCell] = useState<NDVIGridCell | null>(null);
  const [cellTimeSeries, setCellTimeSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestDate, setLatestDate] = useState<string>('');
  const timeSeriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [latest, statsData, monthly] = await Promise.all([
          getLatestNDVI(),
          getNDVIStats(),
          getNDVIMonthlyAverage(),
        ]);

        setLatestNDVI(latest.data);
        setLatestDate(`${latest.year}-${latest.month.toString().padStart(2, '0')}`);
        setStats(statsData.statistics);
        setGreenestAreas(statsData.greenest_areas);
        setMonthlyAverage(monthly.data);
      } catch (err) {
        console.error('Error fetching NDVI data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCellClick = async (cell: NDVIGridCell) => {
    setSelectedCell(cell);
    try {
      const timeSeries = await getNDVITimeSeries(cell.lat, cell.lon);
      setCellTimeSeries(timeSeries.data);
      setTimeout(() => {
        timeSeriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Error fetching time series:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center">
          <Leaf className="mr-3 h-10 w-10 text-green-600" />
          Vegetation Monitoring (NDVI)
        </h1>
        <p className="text-gray-600 mt-2">
          Normalized Difference Vegetation Index from satellite imagery
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average NDVI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats ? formatNumber(stats.mean_ndvi, 3) : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Campus-wide average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NDVI Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {stats ? `${formatNumber(stats.min_ndvi, 2)} - ${formatNumber(stats.max_ndvi, 2)}` : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Min to Max</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grid Cells</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total_cells || 0}</div>
            <p className="text-xs text-gray-500 mt-1">100m × 100m cells</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{latestDate}</div>
            <p className="text-xs text-gray-500 mt-1">Sentinel-2 imagery</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Interactive NDVI Map
          </CardTitle>
          <CardDescription>
            Click on any grid cell to view its NDVI history over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <NDVIMap data={latestNDVI} onCellClick={handleCellClick} />
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Time Series */}
      {selectedCell && cellTimeSeries.length > 0 && (
        <Card className="mb-6" ref={timeSeriesRef}>
          <CardHeader>
            <CardTitle>
              NDVI Time Series for Selected Location
            </CardTitle>
            <CardDescription>
              Location: {selectedCell.lat.toFixed(4)}, {selectedCell.lon.toFixed(4)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Plot
                data={[
                  {
                    x: cellTimeSeries.map((d) => d.date),
                    y: cellTimeSeries.map((d) => d.ndvi),
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: '#10b981', size: 6 },
                    line: { color: '#10b981', width: 2 },
                  },
                ]}
                layout={{
                  autosize: true,
                  xaxis: { title: 'Date' },
                  yaxis: { title: 'NDVI', range: [0, 1] },
                  hovermode: 'closest',
                  showlegend: false,
                  margin: { l: 50, r: 30, t: 20, b: 50 },
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campus Average NDVI Over Time */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Campus-Wide Average NDVI Trend
          </CardTitle>
          <CardDescription>Monthly average NDVI across all grid cells</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyAverage.length > 0 ? (
            <NDVIChart data={monthlyAverage} />
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Greenest Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Greenest Campus Locations</CardTitle>
          <CardDescription>Highest NDVI values from latest data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {greenestAreas.map((area, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleCellClick(area)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-gray-400">#{idx + 1}</div>
                  <div>
                    <p className="text-sm font-medium">
                      {area.lat.toFixed(4)}°N, {area.lon.toFixed(4)}°W
                    </p>
                    <p className="text-xs text-gray-500">Click to view history</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {formatNumber(area.ndvi, 3)}
                  </p>
                  <p className="text-xs text-gray-500">NDVI</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
