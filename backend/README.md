# SIGAIDA Campus Energy - Backend API

FastAPI-based REST API for environmental data monitoring at UIUC campus.

## Features

- **Air Quality Data**: Current and historical air quality metrics (PM2.5, PM10, CO, NO2, SO2, O3, AQI)
- **Weather Data**: Historical weather (1940-2025) and 16-day forecasts
- **Vegetation Data**: NDVI (Normalized Difference Vegetation Index) from satellite imagery
- **Transit Data**: Bus stops and routes information
- **ML Integration**: Simple machine learning models for anomaly detection and air quality forecasting

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

### Development Mode (with auto-reload)

```bash
uvicorn main:app --reload --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## API Endpoints

### Health Check
- `GET /api/health` - Check API and database status

### Air Quality
- `GET /api/air-quality/current` - Latest air quality snapshot
- `GET /api/air-quality/historical?start_date=&end_date=&limit=` - Historical air quality data
- `GET /api/air-quality/openaq?hours=` - OpenAQ sensor PM2.5 data

### Weather
- `GET /api/weather/current` - Current weather conditions
- `GET /api/weather/historical?start_date=&end_date=&limit=` - Historical weather data
- `GET /api/weather/forecast` - 16-day weather forecast

### Vegetation (NDVI)
- `GET /api/ndvi/latest` - Latest NDVI grid data
- `GET /api/ndvi/timeseries?lat=&lon=` - NDVI time series for specific location
- `GET /api/ndvi/stats` - NDVI statistics and greenest areas
- `GET /api/ndvi/monthly-average` - Campus-wide average NDVI over time

### Transit
- `GET /api/transit/stops` - All bus stops
- `GET /api/transit/routes` - All bus routes

### Dashboard
- `GET /api/dashboard/summary` - Aggregated data for dashboard

## Database

The API connects to the SQLite database located at:
```
../data_collection/campus_data.db
```

Make sure the database file exists and contains data before starting the server.

## Project Structure

```
backend/
├── main.py              # FastAPI application and routes
├── database.py          # Database connection and queries
├── models.py            # Pydantic models for validation
├── requirements.txt     # Python dependencies
├── ml/                  # Machine learning module (placeholder)
│   ├── __init__.py
    ├── lstm_pm25.py     # Air quality prediction model
│   └── predict.py       # ML prediction functions
└── README.md           # This file
```

## CORS Configuration

The API currently allows all origins for development. For production, update the CORS settings in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

Error responses include a `detail` field with error description.

## Machine Learning Integration

The `ml/` module contains placeholder functions for future ML model integration. To implement actual models:

1. Train your models using the historical data
2. Save trained models (e.g., `.pkl`, `.h5`, `.pt` files)
3. Update `ml/predict.py` to load and use your models
4. Add new API endpoints in `main.py` to expose predictions

## Development

### Testing the API

1. Start the server
2. Visit http://localhost:8000/api/docs for interactive API documentation
3. Test endpoints directly from the Swagger UI

### Adding New Endpoints

1. Add database query functions in `database.py`
2. Define Pydantic models in `models.py`
3. Create route handlers in `main.py`

## Troubleshooting

**Database not found error:**
- Ensure `campus_data.db` exists in the `data_collection/` directory
- Check the path in `database.py`

**Import errors:**
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Verify Python version: `python --version`

**CORS errors:**
- Update `allow_origins` in the CORS middleware configuration

## Future Enhancements

- [ ] Implement caching (Redis) for frequently accessed data
- [ ] Add authentication and API keys
- [ ] Implement rate limiting
- [ ] Add WebSocket support for real-time data streams
- [ ] Train and deploy ML models for predictions
- [ ] Add data validation and sanitization
- [ ] Implement database connection pooling
- [ ] Add comprehensive logging
- [ ] Create unit and integration tests

## License

Part of the SIGAIDA Campus Energy project.
