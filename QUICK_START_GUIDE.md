# 🚀 Quick Start Guide - SIGAIDA Campus Energy

A comprehensive guide to get the SIGAIDA Campus Energy application up and running.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Local Development)](#quick-start-local-development)
3. [Manual Setup](#manual-setup)
4. [Deployment Options](#deployment-options)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Optional (for API access)

- **OpenAQ API Key** - [Get one here](https://openaq.org)
- **Google Earth Engine** - [Setup instructions](https://developers.google.com/earth-engine/guides/python_install)

### Verify Installation

```bash
python --version   # Should be 3.8 or higher
node --version     # Should be 18 or higher
npm --version      # Should be 6 or higher
git --version      # Any recent version
```

---

## Quick Start (Local Development)

### ⚡ One-Command Startup (Recommended)

The easiest way to run the application:

#### For Mac/Linux:
```bash
./start.sh
```

#### For Windows:
```bash
./start.bat
```

**That's it!** The script will:
- ✅ Install all dependencies automatically
- ✅ Start both backend and frontend servers
- ✅ Open the app in your browser
- ✅ Handle port conflicts automatically

**Access the app at:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

### 🛑 Stopping the Application

#### For Mac/Linux:
```bash
./stop.sh
```

#### For Windows:
```bash
./stop.bat
```

Or press `Ctrl+C` and manually kill processes if needed.

---

## Manual Setup

If you prefer to run components separately or need more control:

### Step 1: Clone the Repository

```bash
git clone https://github.com/infoshubhjain/SIGAIDA-CAMPUS-ENERGY.git
cd SIGAIDA-CAMPUS-ENERGY
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Create environment file
cp ../.env.example .env
# Edit .env and add your API keys if you have them

# Start the backend server
uvicorn main:app --reload --port 8000
```

The backend will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/api/docs

### Step 3: Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

### Step 4: Verify Everything Works

Visit http://localhost:3000 and you should see:
- ✅ Dashboard with environmental data
- ✅ Air Quality page
- ✅ Weather page
- ✅ Vegetation (NDVI) page
- ✅ Transit page
- ✅ ML Predictions page

---

## Deployment Options

### Option 1: Deploy to Vercel (Recommended for Frontend)

Vercel is perfect for Next.js applications and offers a generous free tier.

#### Steps:

1. **Sign up for Vercel**
   - Go to https://vercel.com
   - Sign up with your GitHub account

2. **Import Your Repository**
   - Click "New Project"
   - Select your `SIGAIDA-CAMPUS-ENERGY` repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Add Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` with your backend URL
   - Example: `https://your-backend.onrender.com`

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your frontend will be live!

**Pros:**
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ CDN-backed (fast globally)
- ✅ Zero configuration for Next.js

**Note:** You'll still need to deploy the backend separately (see Option 2).

---

### Option 2: Deploy Backend to Render

Render offers a free tier perfect for Python backends.

#### Steps:

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create a Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `SIGAIDA-CAMPUS-ENERGY`

3. **Configure the Service**
   ```
   Name:              sigaida-backend
   Region:            Oregon (or closest to you)
   Branch:            main
   Root Directory:    backend
   Runtime:           Python 3
   Build Command:     pip install -r requirements.txt
   Start Command:     uvicorn main:app --host 0.0.0.0 --port $PORT
   Instance Type:     Free
   ```

4. **Add Environment Variables** (Optional)
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     - `DATABASE_PATH=../data_collection/campus_data.db`
     - `OPENAQ_KEY=your_key_here` (if you have one)

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes
   - Your backend will be live!

6. **Get Your Backend URL**
   - Copy the URL (e.g., `https://sigaida-backend.onrender.com`)
   - Use this in your frontend's `NEXT_PUBLIC_API_URL`

**Pros:**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Easy Python support

**Cons:**
- ⚠️ Free tier spins down after 15 min inactivity (30-60s cold start)
- ⚠️ Ephemeral filesystem (database resets on redeploy)

---

### Option 3: Deploy Full Stack to Railway

Railway can host both frontend and backend together.

#### Steps:

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `SIGAIDA-CAMPUS-ENERGY`

3. **Configure Services**

   Railway will auto-detect both services. Configure them:

   **Backend Service:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables if needed

   **Frontend Service:**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add `NEXT_PUBLIC_API_URL` pointing to backend service

4. **Deploy**
   - Railway will deploy both services
   - You'll get URLs for both

**Pros:**
- ✅ $5/month free credit
- ✅ No cold starts
- ✅ Persistent filesystem
- ✅ Hosts both frontend and backend

**Cons:**
- ⚠️ Free credit runs out after ~$5 of usage

---

### Option 4: Deploy with Docker

If you have Docker installed, you can deploy using Docker Compose.

#### Steps:

1. **Ensure Docker is Installed**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Build and Start**
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

4. **Stop**
   ```bash
   docker-compose down
   ```

**Pros:**
- ✅ Consistent environment
- ✅ Easy to deploy anywhere
- ✅ Includes all dependencies

**Use Cases:**
- Local development
- Self-hosted deployment
- Cloud VM deployment (AWS, GCP, Azure)

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Port 3000 or 8000 is already in use`

**Solution:**
```bash
# For Mac/Linux - Kill processes on ports
lsof -ti:3000 | xargs kill
lsof -ti:8000 | xargs kill

# For Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in the start command:
```bash
# Backend
uvicorn main:app --reload --port 8001

# Frontend
npm run dev -- -p 3001
```

#### 2. Dependencies Not Installing

**Error:** `npm install` or `pip install` fails

**Solution:**
```bash
# For npm - clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# For pip - upgrade pip and retry
python -m pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. Database Not Found

**Error:** `Database not found at campus_data.db`

**Solution:**
Ensure you're running from the project root directory:
```bash
cd SIGAIDA-CAMPUS-ENERGY
./start.sh  # or python backend/main.py
```

The backend expects the database at `data_collection/campus_data.db`.

#### 4. CORS Errors in Browser

**Error:** `Access to fetch at ... from origin ... has been blocked by CORS`

**Solution:**
The backend has CORS enabled for development. If you see this error:

1. Check that backend is running on http://localhost:8000
2. Verify `NEXT_PUBLIC_API_URL` in frontend matches backend URL
3. Check backend logs for CORS configuration

#### 5. Module Not Found Errors

**Error:** `ModuleNotFoundError` or `Cannot find module`

**Solution:**
```bash
# For Python
pip install -r backend/requirements.txt

# For Node.js
cd frontend && npm install
```

#### 6. Build Fails on Deployment

**Common causes:**
- Missing environment variables
- TypeScript errors
- Dependency version conflicts

**Solution:**
1. Check deployment logs carefully
2. Test build locally first:
   ```bash
   cd frontend
   npm run build
   ```
3. Fix any errors shown
4. Ensure all environment variables are set in deployment platform

---

## Environment Variables

### Backend (.env)

```bash
# Optional - Only needed if using external APIs
OPENAQ_KEY=your_openaq_api_key_here
DATABASE_PATH=data_collection/campus_data.db
GEE_PROJECT=sigaida-vegetation
```

### Frontend (.env.local)

```bash
# Required for production deployment
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production, use your deployed backend URL:
# NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## Development Tips

### Viewing Logs

When using the one-command startup:

```bash
# View backend logs
tail -f backend.log

# View frontend logs
tail -f frontend.log
```

### API Documentation

The backend provides interactive API documentation:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Hot Reload

Both servers support hot reload:
- **Backend**: Auto-reloads on Python file changes
- **Frontend**: Auto-reloads on TypeScript/React file changes

---

## Next Steps

After getting the app running:

1. **Explore the Data**
   - Check out the Dashboard for an overview
   - Dive into specific pages for detailed metrics

2. **Customize**
   - Modify components in `frontend/components/`
   - Add new API endpoints in `backend/main.py`
   - Update database queries in `backend/database.py`

3. **Deploy**
   - Follow one of the deployment options above
   - Share your live URL!

4. **Update Data**
   - Run data collection scripts in `data_collection/`
   - See individual script files for usage

---

## Support

If you encounter issues:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review the logs (`backend.log`, `frontend.log`)
3. Check the API docs at http://localhost:8000/api/docs
4. Open an issue on GitHub

---

## Quick Reference

### Useful Commands

```bash
# Start everything
./start.sh              # Mac/Linux
start.bat               # Windows

# Stop everything
./stop.sh               # Mac/Linux
stop.bat                # Windows

# Backend only
cd backend && uvicorn main:app --reload

# Frontend only
cd frontend && npm run dev

# View logs
tail -f backend.log
tail -f frontend.log

# Build for production
cd frontend && npm run build
cd frontend && npm start
```

### URLs

| Service | Local URL | Description |
|---------|-----------|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/api/docs | Interactive API documentation |
| ReDoc | http://localhost:8000/api/redoc | Alternative API docs |

---

**Happy Coding! 🌱**

*For detailed documentation, see [README.md](README.md)*
