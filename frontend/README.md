# SIGAIDA Campus Energy - Frontend

Next.js 14 application for environmental data visualization.

## Features

- **Dashboard**: Overview of all environmental metrics
- **Air Quality**: Real-time and historical air quality monitoring
- **Weather**: Current conditions, forecasts, and historical trends
- **Vegetation**: Interactive NDVI maps from satellite imagery
- **Transit**: Campus bus stops and routes visualization

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                         # Next.js app directory (routes)
│   ├── page.tsx                 # Dashboard
│   ├── air-quality/page.tsx     # Air quality page
│   ├── weather/page.tsx         # Weather page
│   ├── vegetation/page.tsx      # NDVI/Vegetation page
│   ├── transit/page.tsx         # Transit page
│   ├── ml-predictions/page.tsx  # ML predictions page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── charts/                # Chart components (Plotly)
│   ├── maps/                  # Map components (Leaflet)
│   ├── layout/                # Layout components (Navbar)
│   └── dashboard/             # Dashboard-specific components
├── lib/
│   ├── api.ts                 # API client functions
│   ├── types.ts               # TypeScript type definitions
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## Technologies Used

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Plotly.js, Chart.js
- **Maps**: Leaflet, React-Leaflet
- **HTTP Client**: Axios
- **UI Components**: shadcn/ui inspired components

## API Integration

The frontend communicates with the FastAPI backend through the API client in `lib/api.ts`. All API calls are typed using TypeScript interfaces defined in `lib/types.ts`.

### Example API Usage

```typescript
import { getCurrentAirQuality } from '@/lib/api';

const data = await getCurrentAirQuality();
console.log(data.data.us_aqi); // Access current AQI
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:8000)

## Development

### Adding a New Page

1. Create a new directory in `app/` (e.g., `app/new-page/`)
2. Add `page.tsx` in the new directory
3. Update navigation in `components/layout/Navbar.tsx`

### Adding a New Chart Component

1. Create component in `components/charts/`
2. Use Plotly or Chart.js for visualization
3. Import and use in your page component

## Troubleshooting

**Module not found errors:**
- Run `npm install` to ensure all dependencies are installed

**API connection errors:**
- Verify backend is running on the correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is properly configured in backend

**Map not displaying:**
- Check browser console for Leaflet errors
- Ensure Leaflet CSS is loaded

## Performance Optimization

- Charts use dynamic imports with `next/dynamic` for better performance
- Images should be optimized with Next.js Image component
- API responses are not cached by default (can add React Query for caching)

## Future Enhancements

- [ ] Add real-time WebSocket connections
- [ ] Implement data caching with React Query
- [ ] Add export functionality for charts
- [ ] Implement user authentication
- [ ] Add mobile-responsive improvements
- [ ] Implement dark mode toggle
- [ ] Add accessibility improvements (ARIA labels, keyboard navigation)

## License

Part of the SIGAIDA Campus Energy project.
