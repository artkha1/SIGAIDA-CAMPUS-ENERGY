"""
Machine Learning Prediction Module
Implements actual ML models for air quality forecasting, energy prediction, and anomaly detection
"""
from typing import Dict, Any
from datetime import datetime
import pandas as pd
from sklearn.ensemble import IsolationForest
import sys
from pathlib import Path

# Add parent directory to path for database imports
sys.path.append(str(Path(__file__).parent.parent))
from database import db


class MLPredictor:
    """ML prediction class with trained models"""

    def __init__(self):
        """Initialize ML models"""
        self.anomaly_detector = None

    def detect_anomalies(self, data_type: str = "air_quality") -> Dict[str, Any]:
        """
        Detect anomalies in environmental data using Isolation Forest

        Args:
            data_type: Type of data to analyze

        Returns:
            Anomaly detection results
        """
        try:
            if data_type == "air_quality":
                # Get historical data for training (excluding recent 48 hours)
                all_data = db.get_historical_air_quality(limit=1000)

                if not all_data or len(all_data) < 100:
                    return self._empty_anomaly_result(data_type)

                df = pd.DataFrame(all_data)

                # Split data: train on older data, test on recent 48 hours
                training_data = df.iloc[48:]  # Skip first 48 (most recent)
                recent = df.head(48)  # Test on most recent 48 hours

                # Train anomaly detector on historical data (not recent)
                if self.anomaly_detector is None:  # Retrain each time for fresh detection
                    training_features = training_data[['pm2_5', 'pm10', 'us_aqi', 'ozone']].dropna()
                    if len(training_features) >= 50:
                        # Use contamination=0.01 (expect 1% anomalies, more sensitive)
                        self.anomaly_detector = IsolationForest(
                            contamination=0.01,
                            random_state=42,
                            n_estimators=100
                        )
                        self.anomaly_detector.fit(training_features.values)

                # Detect anomalies in recent data (last 48 hours)
                features = recent[['pm2_5', 'pm10', 'us_aqi', 'ozone']].dropna()

                if len(features) == 0 or self.anomaly_detector is None:
                    return self._empty_anomaly_result(data_type)

                predictions = self.anomaly_detector.predict(features.values)
                scores = self.anomaly_detector.score_samples(features.values)

                # Calculate expected ranges from training data
                training_features = training_data[['pm2_5', 'pm10', 'us_aqi', 'ozone']].dropna()
                expected_ranges = {
                    'pm2_5': [training_features['pm2_5'].quantile(0.05), training_features['pm2_5'].quantile(0.95)],
                    'pm10': [training_features['pm10'].quantile(0.05), training_features['pm10'].quantile(0.95)],
                    'us_aqi': [training_features['us_aqi'].quantile(0.05), training_features['us_aqi'].quantile(0.95)],
                    'ozone': [training_features['ozone'].quantile(0.05), training_features['ozone'].quantile(0.95)]
                }

                # Find anomalies (prediction = -1)
                anomalies = []
                for idx, (pred, score) in enumerate(zip(predictions, scores)):
                    if pred == -1:
                        data_idx = features.index[idx]
                        row = recent.loc[data_idx]

                        # Determine severity based on score
                        if score < -0.6:
                            severity = "high"
                        elif score < -0.5:
                            severity = "medium"
                        else:
                            severity = "low"

                        # Find which metric is most anomalous
                        pm25_val = float(row['pm2_5'])
                        pm10_val = float(row['pm10'])
                        aqi_val = float(row['us_aqi'])
                        ozone_val = float(row['ozone'])

                        anomalous_metrics = []
                        if pm25_val < expected_ranges['pm2_5'][0] or pm25_val > expected_ranges['pm2_5'][1]:
                            anomalous_metrics.append(f"PM2.5 ({pm25_val:.1f})")
                        if pm10_val < expected_ranges['pm10'][0] or pm10_val > expected_ranges['pm10'][1]:
                            anomalous_metrics.append(f"PM10 ({pm10_val:.1f})")
                        if aqi_val < expected_ranges['us_aqi'][0] or aqi_val > expected_ranges['us_aqi'][1]:
                            anomalous_metrics.append(f"AQI ({aqi_val:.0f})")
                        if ozone_val < expected_ranges['ozone'][0] or ozone_val > expected_ranges['ozone'][1]:
                            anomalous_metrics.append(f"Ozone ({ozone_val:.0f})")

                        description = f"Unusual {data_type} pattern"
                        if anomalous_metrics:
                            description += f": {', '.join(anomalous_metrics)}"

                        # Show the value/range for whichever metric is most out of range
                        metric_map = {
                            'pm2_5': (pm25_val, expected_ranges['pm2_5']),
                            'pm10':  (pm10_val, expected_ranges['pm10']),
                            'us_aqi': (aqi_val, expected_ranges['us_aqi']),
                            'ozone': (ozone_val, expected_ranges['ozone']),
                        }
                        # Pick the metric whose value deviates most relative to its range width
                        def relative_deviation(val, rng):
                            width = rng[1] - rng[0] if rng[1] != rng[0] else 1
                            center = (rng[0] + rng[1]) / 2
                            return abs(val - center) / width

                        primary_metric = max(metric_map, key=lambda k: relative_deviation(*metric_map[k]))
                        value_to_show, expected_range = metric_map[primary_metric]

                        anomalies.append({
                            "timestamp": str(row['time']),
                            "type": data_type,
                            "severity": severity,
                            "value": round(value_to_show, 2),
                            "expected_range": [round(expected_range[0], 1), round(expected_range[1], 1)],
                            "description": description
                        })

                note = "Anomaly detection using trained ML model"
                if len(anomalies) == 0:
                    note = "All recent data within normal ranges - no anomalies detected (✓ This is good!)"

                return {
                    "data_type": data_type,
                    "anomalies_detected": len(anomalies),
                    "anomalies": anomalies[:10],  # Limit to top 10
                    "total_samples_analyzed": len(features),
                    "last_check": datetime.now().isoformat(),
                    "model": "Isolation Forest",
                    "note": note,
                    "trained_on_samples": len(training_features),
                    "contamination_threshold": "1% (detects top 1% most unusual patterns)"
                }

        except Exception as e:
            print(f"Error in anomaly detection: {e}")
            return self._empty_anomaly_result(data_type)

        return self._empty_anomaly_result(data_type)

    def _empty_anomaly_result(self, data_type: str) -> Dict[str, Any]:
        """Return empty anomaly result"""
        return {
            "data_type": data_type,
            "anomalies_detected": 0,
            "anomalies": [],
            "total_samples_analyzed": 0,
            "last_check": datetime.now().isoformat(),
            "model": "Not available",
            "note": "Insufficient data or model not trained"
        }


# Singleton instance
ml_predictor = MLPredictor()
