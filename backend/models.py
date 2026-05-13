"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# Air Quality Models

class AirQualityData(BaseModel):
    """Air quality data point"""
    time: Optional[str] = None
    pm2_5: Optional[float] = Field(None, description="PM2.5 concentration (μg/m³)")
    pm10: Optional[float] = Field(None, description="PM10 concentration (μg/m³)")
    carbon_monoxide: Optional[float] = Field(None, description="CO concentration (μg/m³)")
    nitrogen_dioxide: Optional[float] = Field(None, description="NO2 concentration (μg/m³)")
    sulphur_dioxide: Optional[float] = Field(None, description="SO2 concentration (μg/m³)")
    ozone: Optional[float] = Field(None, description="O3 concentration (μg/m³)")
    us_aqi: Optional[float] = Field(None, description="US Air Quality Index")
    us_aqi_pm2_5: Optional[float] = None
    us_aqi_pm10: Optional[float] = None
    us_aqi_carbon_monoxide: Optional[float] = None
    us_aqi_nitrogen_dioxide: Optional[float] = None
    us_aqi_sulphur_dioxide: Optional[float] = None
    us_aqi_ozone: Optional[float] = None


class CurrentAirQualityResponse(BaseModel):
    """Current air quality snapshot"""
    data: AirQualityData
    timestamp: str


class HistoricalAirQualityResponse(BaseModel):
    """Historical air quality data"""
    data: List[AirQualityData]
    count: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class OpenAQData(BaseModel):
    """OpenAQ sensor data"""
    datetime: str
    value: float
    parameter: Optional[str] = "pm25"
    unit: Optional[str] = "µg/m³"


class OpenAQResponse(BaseModel):
    """OpenAQ sensor response"""
    data: List[OpenAQData]
    count: int
    sensor_id: str = "8706090"


# Weather Models

class WeatherData(BaseModel):
    """Weather data point"""
    time: str
    temperature_2m_max: Optional[float] = Field(None, description="Max temperature (°F)")
    temperature_2m_min: Optional[float] = Field(None, description="Min temperature (°F)")
    apparent_temperature_max: Optional[float] = None
    apparent_temperature_min: Optional[float] = None
    precipitation_sum: Optional[float] = Field(None, description="Precipitation (inches)")
    rain_sum: Optional[float] = None
    snowfall_sum: Optional[float] = None
    wind_speed_10m_max: Optional[float] = Field(None, description="Max wind speed (mph)")
    wind_gusts_10m_max: Optional[float] = None
    wind_direction_10m_dominant: Optional[float] = None
    shortwave_radiation_sum: Optional[float] = None
    et0_fao_evapotranspiration: Optional[float] = None


class WeatherForecastData(BaseModel):
    """Weather forecast data point"""
    time: str
    temperature_2m: Optional[float] = None
    relative_humidity_2m: Optional[float] = None
    apparent_temperature: Optional[float] = None
    precipitation: Optional[float] = None
    rain: Optional[float] = None
    snowfall: Optional[float] = None
    weather_code: Optional[int] = None
    cloud_cover: Optional[int] = None
    wind_speed_10m: Optional[float] = None
    wind_direction_10m: Optional[float] = None


class HistoricalWeatherResponse(BaseModel):
    """Historical weather data response"""
    data: List[WeatherData]
    count: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class WeatherForecastResponse(BaseModel):
    """Weather forecast response"""
    data: List[WeatherForecastData]
    count: int


# NDVI Models

class NDVIGridCell(BaseModel):
    """NDVI data for a single grid cell"""
    lat: float
    lon: float
    ndvi: float
    year: int
    month: int


class NDVITimeSeriesPoint(BaseModel):
    """NDVI time series data point"""
    year: int
    month: int
    ndvi: float
    date: Optional[str] = None


class LatestNDVIResponse(BaseModel):
    """Latest NDVI snapshot"""
    data: List[NDVIGridCell]
    count: int
    year: int
    month: int


class NDVITimeSeriesResponse(BaseModel):
    """NDVI time series for a location"""
    data: List[NDVITimeSeriesPoint]
    count: int
    location: Dict[str, float]


class NDVIStatistics(BaseModel):
    """NDVI statistics"""
    mean_ndvi: float
    min_ndvi: float
    max_ndvi: float
    total_cells: int


class NDVIStatsResponse(BaseModel):
    """NDVI statistics response"""
    statistics: NDVIStatistics
    greenest_areas: List[NDVIGridCell]


class NDVIMonthlyAverage(BaseModel):
    """Monthly average NDVI"""
    year: int
    month: int
    avg_ndvi: float
    cell_count: int
    date: Optional[str] = None


class NDVIMonthlyAverageResponse(BaseModel):
    """Monthly average NDVI response"""
    data: List[NDVIMonthlyAverage]
    count: int


# Transit Models

class TransitStop(BaseModel):
    """Transit stop information"""
    stop_id: str
    stop_name: str
    stop_lat: float
    stop_lon: float


class TransitRoute(BaseModel):
    """Transit route information"""
    route_id: str
    route_short_name: Optional[str] = None
    route_long_name: Optional[str] = None


class TransitStopsResponse(BaseModel):
    """Transit stops response"""
    data: List[TransitStop]
    count: int


class TransitRoutesResponse(BaseModel):
    """Transit routes response"""
    data: List[TransitRoute]
    count: int


# Dashboard Models

class DashboardSummary(BaseModel):
    """Dashboard summary data"""
    current_air_quality: Optional[Dict[str, Any]] = None
    latest_weather: Optional[Dict[str, Any]] = None
    ndvi_statistics: Optional[Dict[str, Any]] = None
    recent_trends: Optional[Dict[str, Any]] = None
    greenest_areas: Optional[List[Dict[str, Any]]] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    database_connected: bool
    version: str = "1.0.0"
