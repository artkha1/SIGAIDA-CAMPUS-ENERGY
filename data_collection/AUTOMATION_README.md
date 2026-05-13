# Automated Data Collection Setup

This directory contains scripts to automatically update the campus data database with the latest air quality and weather information.

## Quick Start

### Option 1: Interactive Setup (Recommended)
Run the interactive setup script to configure a cron job:

```bash
cd data_collection
./setup_cron.sh
```

This will guide you through setting up automatic updates at your preferred frequency.

### Option 2: Manual Setup

1. **Test the update script:**
   ```bash
   cd data_collection
   ./update_data.sh
   ```

2. **Set up cron job manually:**
   ```bash
   crontab -e
   ```

3. **Add one of these lines** (choose based on your needs):
   ```bash
   # Every hour
   0 * * * * "{full_path}/SIGAIDA-CAMPUS-ENERGY/data_collection/update_data.sh"

   # Every 6 hours
   0 */6 * * * "{full_path}/SIGAIDA-CAMPUS-ENERGY/data_collection/update_data.sh"

   # Daily at 2 AM
   0 2 * * * "{full_path}/SIGAIDA-CAMPUS-ENERGY/data_collection/update_data.sh"

   # Twice daily (8 AM and 8 PM)
   0 8,20 * * * "{full_path}/SIGAIDA-CAMPUS-ENERGY/data_collection/update_data.sh"
   ```

## Files

- **`update_data.sh`** - Main automation script that updates both air quality and weather data
- **`setup_cron.sh`** - Interactive script to help set up cron job
- **`update_data.log`** - Log file tracking all automated updates

## Monitoring

Check the logs to see if updates are running successfully:

```bash
tail -f data_collection/update_data.log
```

Or view the last update:

```bash
tail -20 data_collection/update_data.log
```

## Troubleshooting

### macOS Permissions
If cron jobs aren't running, you may need to grant Terminal or cron permission:
1. Go to System Preferences → Security & Privacy → Privacy
2. Select "Full Disk Access"
3. Add Terminal or `/usr/sbin/cron`

### Check if cron job is installed
```bash
crontab -l
```

### Remove cron job
```bash
crontab -e
# Delete the line with update_data.sh and save
```

### Manual data update
You can always update data manually:
```bash
cd data_collection
python3 historical_and_current_air_quality_data.py
python3 historical_weather_data.py
```

## Recommended Schedule

- **For development/testing:** Every hour
- **For production:** Daily at 2 AM or twice daily (morning and evening)

The data sources (Open-Meteo API) update regularly, so more frequent updates will give you more current data.
