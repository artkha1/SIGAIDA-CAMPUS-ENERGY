'use client';

import { useEffect, useState } from 'react';
import { getCurrentAirQuality, getHistoricalAirQuality, getOpenAQData } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AirQualityChart } from '@/components/charts/AirQualityChart';
import { PollutantComparison } from '@/components/charts/PollutantComparison';
import { PollutantBarChart } from '@/components/charts/PollutantBarChart';
import { AirQualityData, OpenAQData } from '@/lib/types';
import { getAQICategory, getDateRange, formatNumber } from '@/lib/utils';
import { Wind, AlertTriangle, Activity } from 'lucide-react';

export default function AirQualityPage() {
  const [currentAQ, setCurrentAQ] = useState<AirQualityData | null>(null);
  const [historicalAQ, setHistoricalAQ] = useState<AirQualityData[]>([]);
  const [openaqData, setOpenaqData] = useState<OpenAQData[]>([]);
  const [loading, setLoading] = useState(true);
  // AFTER
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [current, historical, openaq] = await Promise.all([
          getCurrentAirQuality(),
          getHistoricalAirQuality(undefined, undefined, 168),
          getOpenAQData(168),
        ]);
        setCurrentAQ(current.data);
        setHistoricalAQ(historical.data);
        setOpenaqData(openaq.data);
      } catch (err) {
        console.error('Error fetching air quality data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const aqiInfo = currentAQ?.us_aqi ? getAQICategory(currentAQ.us_aqi) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center">
          <Wind className="mr-3 h-10 w-10" />
          Air Quality Monitoring
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time and historical air quality data for UIUC campus
        </p>
      </div>

      {/* Current AQI Card */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Current AQI</CardTitle>
            <CardDescription>US Air Quality Index</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {currentAQ?.us_aqi ? currentAQ.us_aqi.toFixed(2) : 'N/A'}
              </div>
              {aqiInfo && (
                <div>
                  <p className={`text-xl font-semibold ${aqiInfo.color}`}>
                    {aqiInfo.category}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{aqiInfo.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Current Pollutant Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentAQ ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">PM2.5</p>
                  <p className="text-2xl font-bold">{formatNumber(currentAQ.pm2_5 || 0)}</p>
                  <p className="text-xs text-gray-500">μg/m³</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">PM10</p>
                  <p className="text-2xl font-bold">{formatNumber(currentAQ.pm10 || 0)}</p>
                  <p className="text-xs text-gray-500">μg/m³</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">CO</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(currentAQ.carbon_monoxide || 0)}
                  </p>
                  <p className="text-xs text-gray-500">μg/m³</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">NO₂</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(currentAQ.nitrogen_dioxide || 0)}
                  </p>
                  <p className="text-xs text-gray-500">μg/m³</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">SO₂</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(currentAQ.sulphur_dioxide || 0)}
                  </p>
                  <p className="text-xs text-gray-500">μg/m³</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">O₃</p>
                  <p className="text-2xl font-bold">{formatNumber(currentAQ.ozone || 0)}</p>
                  <p className="text-xs text-gray-500">μg/m³</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No current data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Latest Pollutant Bar Chart */}
        {currentAQ && (
          <Card>
            <CardHeader>
              <CardTitle>Current Pollutant Snapshot</CardTitle>
              <CardDescription>
                Bar chart of latest pollutant measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PollutantBarChart data={currentAQ} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>PM2.5 Trend</CardTitle>
            <CardDescription>Fine particulate matter over time</CardDescription>
          </CardHeader>
          <CardContent>
            {historicalAQ.length > 0 ? (
              <AirQualityChart data={historicalAQ} pollutant="pm2_5" />
            ) : (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Pollutants Comparison</CardTitle>
            <CardDescription>
              Select pollutants to compare their trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historicalAQ.length > 0 ? (
              <PollutantComparison data={historicalAQ} />
            ) : (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AQI Trend</CardTitle>
            <CardDescription>US Air Quality Index over time</CardDescription>
          </CardHeader>
          <CardContent>
            {historicalAQ.length > 0 ? (
              <AirQualityChart data={historicalAQ} pollutant="us_aqi" />
            ) : (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OpenAQ Sensor Data Info */}
      {openaqData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>OpenAQ Sensor Data</CardTitle>
            <CardDescription>
              Real-time PM2.5 measurements from sensor #8706090 in Urbana-Champaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Latest reading: {formatNumber(openaqData[0]?.value || 0)} μg/m³ at{' '}
              {new Date(openaqData[0]?.datetime).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
