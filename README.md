# SIGAIDA Campus Energy

🌱 **Environmental Data Monitoring and Visualization Platform for UIUC Campus**

A comprehensive full-stack application for collecting, analyzing, and visualizing environmental data including air quality, weather, vegetation (NDVI), and transit information for the University of Illinois at Urbana-Champaign campus.

![Project Banner](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)

## 🎯 Quick Start

**Mac/Linux:** `./start.sh` | **Windows:** Double-click `start.bat`

📖 **[Complete Quick Start & Deployment Guide →](QUICK_START_GUIDE.md)**

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Data Sources](#-data-sources)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🌬️ Air Quality Monitoring
- Real-time AQI (Air Quality Index) tracking
- PM2.5, PM10, CO, NO₂, SO₂, O₃ measurements
- Historical trends and comparisons
- OpenAQ sensor integration
- Interactive pollutant charts

### ☁️ Weather Monitoring
- Current weather conditions
- 16-day hourly forecasts
- Historical weather data (1940-2025)
- Temperature, precipitation, wind analysis
- Multi-source data (Open-Meteo, NWS)

### 🌿 Vegetation Analysis (NDVI)
- Satellite-based vegetation health monitoring
- Interactive campus map with 100m grid cells
- Time series analysis for any location
- Monthly NDVI trends (2016-2025)
- Greenest areas identification

### 🚌 Transit System
- MTD bus stops visualization
- Route information
- Interactive campus transit map
- Real-time stop locations

### 🧠 Machine Learning Predictions
- Anomaly detection for recent air quality records
- Hourly forecasting of air quality metrics using a recurrent neural network (LSTM)

### 📊 Dashboard
- Comprehensive overview of all metrics
- Live data feeds
- Key statistics and trends
- Quick access to all monitoring pages

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│  Next.js 14     │◄────►│  FastAPI         │◄────►│  SQLite DB      │
│  Frontend       │      │  Backend         │      │  (17 MB)        │
│                 │      │                  │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                        │
        │                        │
        ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│  Plotly.js      │      │  External APIs   │
│  Leaflet Maps   │      │  - OpenAQ        │
│  Chart.js       │      │  - Open-Meteo    │
└─────────────────┘      │  - Google EE     │
                         │  - NWS           │
                         │ Trained ML models│
                         │  - Pytorch       │
                         └──────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Plotly.js & Chart.js
- Leaflet Maps
- Axios

**Backend:**
- FastAPI (Python)
- SQLite
- Pydantic
- Pandas
- Pytorch

**Data Collection:**
- OpenAQ API
- Open-Meteo API
- Google Earth Engine
- MTD GTFS Feed

---

## 📦 Prerequisites

- **Python** 3.8 or higher
- **Node.js** 18 or higher
- **npm** or **yarn**
- **Git**

---

## 🚀 Quick Start

### ⚡ One-Click Startup (Recommended)

The easiest way to run the application:

**For Mac/Linux:**
```bash
./start.sh
```

**For Windows:**
```bash
./start.bat
```

This will:
- Start both backend and frontend servers
- Automatically open the app in your browser
- Handle port conflicts automatically

To stop the servers:
```bash
./stop.sh    # Mac/Linux
./stop.bat     # Windows
```

---

### 📝 Manual Setup

If you prefer to run servers manually:

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SIGAIDA-CAMPUS-ENERGY.git
cd SIGAIDA-CAMPUS-ENERGY
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp ../.env.example .env
# Edit .env and add your API keys

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The backend API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/api/docs

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install Node dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

### 4. Access the Application

Open your browser and navigate to:
- **Dashboard**: http://localhost:3000
- **Air Quality**: http://localhost:3000/air-quality
- **Weather**: http://localhost:3000/weather
- **Vegetation**: http://localhost:3000/vegetation
- **Transit**: http://localhost:3000/transit

---

## 📁 Project Structure

```
SIGAIDA-CAMPUS-ENERGY/
├── backend/                    # FastAPI backend
│   ├── main.py              # FastAPI application and routes
│   ├── database.py          # Database connection and queries
│   ├── models.py            # Pydantic models for validation
│   ├── requirements.txt     # Python dependencies
│   ├── model1_pm25.pth      # RNN model for PM2.5 prediction
│   ├── ml/                  # Machine learning module
│   │   ├── __init__.py
│   │   ├── lstm_pm25.py     # Air quality prediction model
│   │   └── predict.py       # ML prediction functions
│   ├── Dockerfile            # Backend Docker config
│   └── README.md             # Backend docs
│
├── frontend/                      # Next.js frontend
│   ├── app/                         # Next.js pages
│   │   ├── page.tsx                 # Dashboard
│   │   ├── air-quality/             # Air quality page
│   │   ├── weather/                 # Weather page
│   │   ├── vegetation/              # NDVI page
│   │   ├── ml-predictions/page.tsx  # ML predictions page
│   │   └── transit/                 # Transit page
│   ├── components/                  # React components
│   │   ├── ui/                      # Reusable UI
│   │   ├── charts/                  # Chart components
│   │   ├── maps/                    # Map components
│   │   └── layout/                  # Layout components
│   ├── lib/                         # Utilities
│   │   ├── api.ts                   # API client
│   │   ├── types.ts                 # TypeScript types
│   │   └── utils.ts                 # Helper functions
│   ├── package.json                 # Node dependencies
│   ├── Dockerfile                  # Frontend Docker config
│   └── README.md                   # Frontend docs
│
├── data_collection/          # Data collection scripts
│   ├── campus_data.db       # SQLite database (17 MB)
│   ├── air_quality_openaq.py
│   ├── historical_and_current_air_quality_data.py
│   ├── historical_weather_data.py
│   ├── weather_forecast.py
│   ├── weather_gov.py
│   ├── vegetation_data.py
│   ├── push_ndvi_data.py
│   └── transit.py
│
├── notebooks/           # Jupyter notebooks
│   ├── aqi_real_time.ipynb
│   ├── ndvi_testing.ipynb
│   ├── pm25_testing_script.ipynb
│   ├── testing_stuff.ipynb
│   ├── subteam2.ipynb
│   └── subteam3.ipynb
│
├── docker-compose.yml       # Docker orchestration
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## 🌐 Data Sources

| **Data Type** | **Source** | **Coverage** | **Resolution** |
|---------------|------------|--------------|----------------|
| Air Quality | Open-Meteo | 2022-present | Hourly |
| Air Quality | OpenAQ (Sensor #8706090) | 2024-present | Real-time |
| Weather | Open-Meteo Archive | 1940-present | Daily |
| Weather | Open-Meteo Forecast | Next 16 days | Hourly |
| Weather | NWS API | Current | Hourly |
| Vegetation | Google Earth Engine (Sentinel-2) | 2016-2025 | Monthly, 100m grid |
| Transit | MTD GTFS | Current | Static |

### API Keys Required

- **OpenAQ**: Get your API key at https://openaq.org
- **Google Earth Engine**: Follow authentication at https://developers.google.com/earth-engine/guides/python_install

---

## 📖 API Documentation

The FastAPI backend provides auto-generated interactive documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints

#### Air Quality
- `GET /api/air-quality/current` - Latest AQI snapshot
- `GET /api/air-quality/historical` - Historical data with date filters
- `GET /api/air-quality/openaq` - OpenAQ sensor readings

#### Weather
- `GET /api/weather/current` - Current conditions
- `GET /api/weather/forecast` - 16-day forecast
- `GET /api/weather/historical` - Historical weather

#### Vegetation (NDVI)
- `GET /api/ndvi/latest` - Latest NDVI grid
- `GET /api/ndvi/timeseries` - Time series for location
- `GET /api/ndvi/stats` - Statistics and greenest areas

#### Transit
- `GET /api/transit/stops` - All bus stops
- `GET /api/transit/routes` - All routes

#### Dashboard
- `GET /api/dashboard/summary` - Aggregated overview

---

## 💻 Development

### Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Running Data Collection Scripts

```bash
cd data_collection
python air_quality_openaq.py
python historical_weather_data.py
python vegetation_data.py
python transit.py
```

---

## 🚢 Deployment

### Production Build

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Environment Variables

**Backend** (`.env`):
```bash
OPENAQ_KEY=your_api_key
DATABASE_PATH=data_collection/campus_data.db
```

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Docker Deployment

```bash
docker-compose -f docker-compose.yml up -d
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Future Enhancements

- [ ] Add real-time WebSocket data streaming
- [ ] Implement user authentication and profiles
- [ ] Add data export functionality (CSV, JSON)
- [ ] Create mobile app version
- [ ] Add email/SMS alerts for poor air quality
- [ ] Implement caching with Redis
- [ ] Add comprehensive testing suite
- [ ] Create admin panel for data management
- [ ] Add multilingual support

---

## 🙏 Acknowledgments

- **SIGAIDA** - Initiative sponsor
- **Project Contributors**: Artem Khaiet, Shubh Jain, Ria Sinha, Dev Shah, Sanjana Kambhampati
- **UIUC** - University of Illinois at Urbana-Champaign
- **OpenAQ** - Air quality data provider
- **Open-Meteo** - Weather data API
- **Google Earth Engine** - Satellite imagery platform
- **MTD** - Mass Transit District

---

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the project maintainers.

---

## 📄 License

This project is part of the SIGAIDA Campus Energy initiative at UIUC.

---