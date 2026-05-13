#!/bin/bash
# Setup script for automated data updates using cron

SCRIPT_PATH="/Users/shubh/Desktop/sigaida rep/SIGAIDA-CAMPUS-ENERGY/data_collection/update_data.sh"

echo "SIGAIDA Campus Energy - Automated Data Update Setup"
echo "===================================================="
echo ""
echo "This will set up a cron job to automatically update your data."
echo ""
echo "Choose update frequency:"
echo "1) Every hour"
echo "2) Every 6 hours"
echo "3) Daily at 2 AM"
echo "4) Daily at 8 AM"
echo "5) Twice daily (8 AM and 8 PM)"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        CRON_SCHEDULE="0 * * * *"
        DESCRIPTION="every hour"
        ;;
    2)
        CRON_SCHEDULE="0 */6 * * *"
        DESCRIPTION="every 6 hours"
        ;;
    3)
        CRON_SCHEDULE="0 2 * * *"
        DESCRIPTION="daily at 2 AM"
        ;;
    4)
        CRON_SCHEDULE="0 8 * * *"
        DESCRIPTION="daily at 8 AM"
        ;;
    5)
        CRON_SCHEDULE="0 8,20 * * *"
        DESCRIPTION="twice daily at 8 AM and 8 PM"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "Selected: Update $DESCRIPTION"
echo ""
echo "The following cron job will be added:"
echo "$CRON_SCHEDULE \"$SCRIPT_PATH\""
echo ""
read -p "Do you want to proceed? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Setup cancelled."
    exit 0
fi

# Add cron job
(crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH"; echo "$CRON_SCHEDULE \"$SCRIPT_PATH\"") | crontab -

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Cron job added successfully!"
    echo ""
    echo "Your data will now update $DESCRIPTION automatically."
    echo ""
    echo "To view your cron jobs, run: crontab -l"
    echo "To remove this cron job, run: crontab -e"
    echo ""
    echo "Logs will be written to: /SIGAIDA-CAMPUS-ENERGY/data_collection/update_data.log"
else
    echo ""
    echo "✗ Failed to add cron job. You may need to grant cron permissions in System Preferences."
fi
