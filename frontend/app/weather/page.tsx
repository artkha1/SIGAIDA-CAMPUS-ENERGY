'use client';

import { useEffect, useState } from 'react';
import { getCurrentWeather, getHistoricalWeather, getWeatherForecast } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherChart } from '@/components/charts/WeatherChart';
import { WeatherData, WeatherForecastData } from '@/lib/types';
import { formatTemperature, formatNumber, getDateRange } from '@/lib/utils';
import { Cloud, Droplet, Wind, Sun, CloudRain } from 'lucide-react';

export default function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [historicalWeather, setHistoricalWeather] = useState<WeatherData[]>([]);
  const [forecast, setForecast] = useState<WeatherForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { start, end } = getDateRange(dateRange);

        const [current, historical, forecastData] = await Promise.all([
          getCurrentWeather(),
          getHistoricalWeather(start, end, dateRange),
          getWeatherForecast(),
        ]);

        setCurrentWeather(current.data);
        setHistoricalWeather(historical.data);
        setForecast(forecastData.data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

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
          <Cloud className="mr-3 h-10 w-10" />
          Weather Monitoring
        </h1>
        <p className="text-gray-600 mt-2">
          Current conditions, forecasts, and historical weather data
        </p>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Sun className="mr-2 h-4 w-4" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatTemperature(currentWeather.temperature_2m_max || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Low: {formatTemperature(currentWeather.temperature_2m_min || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CloudRain className="mr-2 h-4 w-4" />
                Precipitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(currentWeather.precipitation_sum || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">inches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wind className="mr-2 h-4 w-4" />
                Wind Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(currentWeather.wind_speed_10m_max || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">mph</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Droplet className="mr-2 h-4 w-4" />
                Evapotranspiration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatNumber(currentWeather.et0_fao_evapotranspiration || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">mm</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setDateRange(days)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === days
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {days} Days
          </button>
        ))}
      </div>

      {/* Historical Weather Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Historical Weather</CardTitle>
          <CardDescription>Temperature and precipitation trends</CardDescription>
        </CardHeader>
        <CardContent>
          {historicalWeather.length > 0 ? (
            <WeatherChart data={historicalWeather} type="historical" />
          ) : (
            <p className="text-sm text-gray-500">No historical data available</p>
          )}
        </CardContent>
      </Card>

      {/* 16-Day Forecast Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>16-Day Weather Forecast</CardTitle>
          <CardDescription>Hourly forecast data</CardDescription>
        </CardHeader>
        <CardContent>
          {forecast.length > 0 ? (
            <WeatherChart data={forecast} type="forecast" />
          ) : (
            <p className="text-sm text-gray-500">No forecast data available</p>
          )}
        </CardContent>
      </Card>

      {/* Forecast Cards */}
      {forecast.length > 0 && (() => {
        // Group hourly rows into days, compute daily high/low
        const days: { date: string; high: number; low: number; precip: number }[] = [];
        const seen = new Set<string>();
        for (const item of forecast) {
          const day = item.time.slice(0, 10);
          if (!seen.has(day)) {
            seen.add(day);
            const hours = forecast.filter(h => h.time.startsWith(day));
            days.push({
              date: day,
              high: Math.max(...hours.map(h => h.temperature_2m ?? -999)),
              low: Math.min(...hours.map(h => h.temperature_2m ?? 999)),
              precip: hours.reduce((sum, h) => sum + (h.precipitation ?? 0), 0),
            });
          }
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Forecast Highlights</CardTitle>
              <CardDescription>Daily high / low for the next 5 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {days.slice(0, 5).map((day, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">
                      {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="text-2xl font-bold my-1">
                      {formatTemperature(day.high)}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {formatTemperature(day.low)}
                    </div>
                    {day.precip > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Rain: {formatNumber(day.precip)} in
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
