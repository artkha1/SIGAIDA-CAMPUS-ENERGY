"""
Database connection and query management for SIGAIDA Campus Energy
"""
import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional


class DatabaseManager:
    """Manages SQLite database connections and queries"""

    def __init__(self):
        # Path to the database file
        self.db_path = Path(__file__).parent.parent / "data_collection" / "campus_data.db"
        if not self.db_path.exists():
            raise FileNotFoundError(f"Database not found at {self.db_path}")
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create indexes on frequently sorted/filtered columns if they don't exist."""
        conn = sqlite3.connect(str(self.db_path))
        try:
            cursor = conn.cursor()
            cursor.executescript("""
                CREATE INDEX IF NOT EXISTS idx_aq_date
                    ON historical_air_quality_data(date DESC);
                CREATE INDEX IF NOT EXISTS idx_weather_date
                    ON historical_weather_data(date DESC);
                CREATE INDEX IF NOT EXISTS idx_ndvi_year_month
                    ON vegetation_data(year DESC, month DESC);
                CREATE INDEX IF NOT EXISTS idx_openaq_datetime
                    ON historical_aq_openaq(datetime_utc DESC);
            """)
            conn.commit()
        finally:
            conn.close()

    def get_connection(self):
        """Create a new database connection"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # Access columns by name
        return conn

    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results as list of dicts"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            columns = [description[0] for description in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results
        finally:
            conn.close()

    # Pandas not required for basic functionality
    # def execute_query_df(self, query: str, params: tuple = ()) -> pd.DataFrame:
    #     """Execute a query and return results as pandas DataFrame"""
    #     conn = self.get_connection()
    #     try:
    #         df = pd.read_sql_query(query, conn, params=params)
    #         return df
    #     finally:
    #         conn.close()

    # Air Quality Queries

    def get_current_air_quality(self) -> Dict[str, Any]:
        """Get the most recent air quality data from historical records"""
        query = """
        SELECT *, date as time FROM historical_air_quality_data
        ORDER BY date DESC
        LIMIT 1
        """
        results = self.execute_query(query)
        return results[0] if results else {}

    def get_historical_air_quality(self, start_date: Optional[str] = None,
                                   end_date: Optional[str] = None,
                                   limit: int = 1000) -> List[Dict[str, Any]]:
        """Get historical air quality data within date range"""
        query = "SELECT *, date as time FROM historical_air_quality_data WHERE 1=1"
        params = []

        if start_date:
            query += " AND date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND date <= ?"
            params.append(end_date)

        query += " ORDER BY date DESC LIMIT ?"
        params.append(limit)

        return self.execute_query(query, tuple(params))

    def get_openaq_data(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent OpenAQ sensor data (PM2.5)"""
        query = """
        SELECT value, parameter_name, datetime_utc as datetime FROM historical_aq_openaq
        ORDER BY datetime_utc DESC
        LIMIT ?
        """
        return self.execute_query(query, (hours,))

    # Weather Queries

    def get_weather_forecast(self) -> List[Dict[str, Any]]:
        """Get 16-day weather forecast"""
        query = """
        SELECT * FROM weather_forecast
        ORDER BY time ASC
        """
        return self.execute_query(query)

    def get_historical_weather(self, start_date: Optional[str] = None,
                              end_date: Optional[str] = None,
                              limit: int = 365) -> List[Dict[str, Any]]:
        """Get historical daily weather data"""
        query = "SELECT *, date as time FROM historical_weather_data WHERE 1=1"
        params = []

        if start_date:
            query += " AND date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND date <= ?"
            params.append(end_date)

        query += " ORDER BY date DESC LIMIT ?"
        params.append(limit)

        return self.execute_query(query, tuple(params))

    def get_weather_gov_forecast(self) -> List[Dict[str, Any]]:
        """Get NWS weather.gov forecast"""
        query = """
        SELECT * FROM weather_gov
        ORDER BY startTime ASC
        LIMIT 48
        """
        return self.execute_query(query)

    # NDVI/Vegetation Queries

    def get_latest_ndvi(self) -> List[Dict[str, Any]]:
        """Get the most recent NDVI data for all grid cells"""
        query = """
        SELECT lat, lon, ndvi, year, month
        FROM vegetation_data
        WHERE (year, month) = (
            SELECT year, month FROM vegetation_data
            ORDER BY year DESC, month DESC
            LIMIT 1
        )
        """
        return self.execute_query(query)

    def get_ndvi_timeseries(self, lat: float, lon: float, tolerance: float = 0.001) -> List[Dict[str, Any]]:
        """Get NDVI time series for a specific location"""
        query = """
        SELECT year, month, ndvi, lat, lon
        FROM vegetation_data
        WHERE lat BETWEEN ? AND ?
        AND lon BETWEEN ? AND ?
        ORDER BY year, month
        """
        params = (lat - tolerance, lat + tolerance, lon - tolerance, lon + tolerance)
        return self.execute_query(query, params)

    def get_ndvi_stats(self) -> Dict[str, Any]:
        """Get NDVI statistics (mean, min, max, greenest areas)"""
        # Latest snapshot stats
        stats_query = """
        SELECT
            AVG(ndvi) as mean_ndvi,
            MIN(ndvi) as min_ndvi,
            MAX(ndvi) as max_ndvi,
            COUNT(*) as total_cells
        FROM vegetation_data
        WHERE (year, month) = (
            SELECT year, month FROM vegetation_data
            ORDER BY year DESC, month DESC
            LIMIT 1
        )
        """
        stats = self.execute_query(stats_query)[0]

        # Greenest areas
        greenest_query = """
        SELECT lat, lon, ndvi, year, month
        FROM vegetation_data
        WHERE (year, month) = (
            SELECT year, month FROM vegetation_data
            ORDER BY year DESC, month DESC
            LIMIT 1
        )
        ORDER BY ndvi DESC
        LIMIT 10
        """
        greenest = self.execute_query(greenest_query)

        return {
            "statistics": stats,
            "greenest_areas": greenest
        }

    def get_ndvi_monthly_average(self) -> List[Dict[str, Any]]:
        """Get campus-wide average NDVI over time"""
        query = """
        SELECT year, month, AVG(ndvi) as avg_ndvi, COUNT(*) as cell_count
        FROM vegetation_data
        GROUP BY year, month
        ORDER BY year, month
        """
        return self.execute_query(query)

    # Transit Queries

    def get_transit_stops(self) -> List[Dict[str, Any]]:
        """Get all transit stops"""
        query = "SELECT * FROM transit_stops"
        return self.execute_query(query)

    def get_transit_routes(self) -> List[Dict[str, Any]]:
        """Get all transit routes"""
        query = "SELECT * FROM transit_routes"
        return self.execute_query(query)

    # Dashboard Summary

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Get aggregated data for dashboard overview"""
        # Current air quality
        current_aq = self.get_current_air_quality()

        # Latest weather
        latest_weather_query = """
        SELECT * FROM historical_weather_data
        ORDER BY date DESC
        LIMIT 1
        """
        latest_weather = self.execute_query(latest_weather_query)

        # NDVI stats
        try:
            ndvi_stats = self.get_ndvi_stats()
        except Exception:
            ndvi_stats = {"statistics": {}, "greenest_areas": []}

        # Recent trends (average of most recent 168 records ~7 days of hourly data)
        recent_aq_query = """
        SELECT
            AVG(pm2_5) as avg_pm25,
            AVG(pm10) as avg_pm10,
            AVG(us_aqi) as avg_aqi
        FROM (
            SELECT pm2_5, pm10, us_aqi
            FROM historical_air_quality_data
            ORDER BY date DESC
            LIMIT 168
        )
        """
        recent_trends = self.execute_query(recent_aq_query)

        return {
            "current_air_quality": current_aq,
            "latest_weather": latest_weather[0] if latest_weather else {},
            "ndvi_statistics": ndvi_stats["statistics"],
            "recent_trends": recent_trends[0] if recent_trends else {},
            "greenest_areas": ndvi_stats["greenest_areas"][:5]  # Top 5
        }


# Singleton instance
db = DatabaseManager()
