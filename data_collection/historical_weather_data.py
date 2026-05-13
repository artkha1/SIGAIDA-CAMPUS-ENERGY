import openmeteo_requests
import sqlite3
from datetime import datetime

import pandas as pd
import requests_cache
from retry_requests import retry


# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = -1)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

# Required weather variables are listed here and retrieved from OpenMeteo
url = "https://archive-api.open-meteo.com/v1/archive"
factors = ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", "apparent_temperature_min",
"precipitation_sum", "rain_sum", "snowfall_sum", "precipitation_hours", "sunrise", "sunset", "sunshine_duration", "daylight_duration",
"wind_speed_10m_max", "wind_gusts_10m_max", "wind_direction_10m_dominant", "shortwave_radiation_sum", "et0_fao_evapotranspiration"]

# Calculate date range: from 1940-01-01 to today
end_date = datetime.now().strftime("%Y-%m-%d")
#start_date = "1940-01-01"
start_date = "2025-12-05"

params = {
	"latitude": 40.1164,
	"longitude": -88.2434,
	"start_date": start_date,
	"end_date": end_date,
	"daily": factors,
    "temperature_unit": "fahrenheit",
    "wind_speed_unit": "mph",
    "precipitation_unit": "inch",
    "timezone": "America/Chicago",
}
responses = openmeteo.weather_api(url, params=params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]


daily = response.Daily()

daily_data = {
    "date": pd.date_range(
        start=pd.to_datetime(daily.Time(), unit="s", utc=True),
        end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=daily.Interval()),
        inclusive="left"
    )
}

for i, factor in enumerate(factors):
    daily_data[factor] = daily.Variables(i).ValuesAsNumpy()

df = pd.DataFrame(daily_data)
df["date"] = df["date"].dt.tz_convert("America/Chicago")

# Store in SQLite
conn = sqlite3.connect("campus_data.db")

table_name = "historical_weather_data"

# Create/replace the table
#df.to_sql(table_name, conn, if_exists="replace", index=False)
df.to_sql(table_name, conn, if_exists="append", index=False)
conn.close()
