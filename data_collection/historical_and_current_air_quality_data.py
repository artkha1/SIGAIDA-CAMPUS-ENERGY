import openmeteo_requests
import sqlite3
from datetime import datetime, timedelta

import pandas as pd
import requests_cache
from retry_requests import retry

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
factors = ["pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide", "sulphur_dioxide", "ozone",
           "carbon_dioxide", "ammonia", "aerosol_optical_depth", "methane", "dust", 
           "uv_index", "uv_index_clear_sky", "alder_pollen", "birch_pollen", "grass_pollen",
            "mugwort_pollen", "olive_pollen", "ragweed_pollen", "us_aqi", "us_aqi_pm2_5", 
            "us_aqi_pm10", "us_aqi_nitrogen_dioxide", "us_aqi_ozone", "us_aqi_sulphur_dioxide", "us_aqi_carbon_monoxide"]

factors_current = ["us_aqi", "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide", "sulphur_dioxide", "ozone", "alder_pollen", 
                   "grass_pollen", "birch_pollen", "mugwort_pollen", "olive_pollen", "ragweed_pollen", "aerosol_optical_depth", 
                   "dust", "uv_index", "uv_index_clear_sky", "ammonia"]

url = "https://air-quality-api.open-meteo.com/v1/air-quality"

# Calculate date range: from 2022-08-03 to today
end_date = datetime.now().strftime("%Y-%m-%d")
#start_date = "2022-08-03"
start_date = "2025-12-05"

params = {
	"latitude": 40.1164,
	"longitude": -88.2434,
	"hourly": factors,
    "current": factors_current,
	"start_date": start_date,
	"end_date": end_date,
    "timezone": "America/Chicago",
}
responses = openmeteo.weather_api(url, params=params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]


# Process hourly data. The order of variables needs to be the same as requested.
hourly = response.Hourly()
current = response.Current()


hourly_data = {"date": pd.date_range(
	start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
	end =  pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = hourly.Interval()),
	inclusive = "left"
)}

for i, factor in enumerate(factors):
    hourly_data[factor] = hourly.Variables(i).ValuesAsNumpy()

df = pd.DataFrame(hourly_data)
df["date"] = df["date"].dt.tz_convert("America/Chicago")

current_data = {}
for j, factor in enumerate(factors_current):
    current_data[factor] = [current.Variables(j).ValuesAsNumpy()]

df_current = pd.DataFrame(current_data)

# Store in SQLite
conn = sqlite3.connect("campus_data.db")

table_name = "historical_air_quality_data"
table_name_current = "current_air_quality_data"

# Create/replace the table
#df.to_sql(table_name, conn, if_exists="replace", index=False)
df.to_sql(table_name, conn, if_exists="append", index=False)
df_current.to_sql(table_name_current, conn, if_exists="replace", index=False)

conn.close()