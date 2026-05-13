'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertCircle, Wind } from 'lucide-react';
import axios from 'axios';

interface PM25Prediction {
    predicted_pm25: number | null;
    model_rmse: number;
    model_r2: number;
    predicted_at: string;
    note: string;
    error?: string;
}

interface Anomaly {
    timestamp: string;
    type: string;
    severity: string;
    description: string;
    value: number;
    expected_range: number[];
}

interface ModelInfo {
    models: {
        pm25_lstm: {
            type: string;
            epochs_trained: number;
            training_loss: number;
            testing_loss: number;
            rmse: number;
            r_squared: number;
            input_features: string[];
            sequence_length: number;
        };
        anomaly_detector: {
            type: string;
            contamination: number;
            trains_on: string;
            tests_on: string;
        };
    };
}

export default function MLPredictionsPage() {
    const [prediction, setPrediction] = useState<PM25Prediction | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const [forecastRes, anomaliesRes, modelInfoRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/ml/air-quality-forecast`),
                    axios.get(`${apiUrl}/api/ml/anomalies?data_type=air_quality`),
                    axios.get(`${apiUrl}/api/ml/model-info`),
                ]);

                setPrediction(forecastRes.data);
                setAnomalies(anomaliesRes.data.anomalies);
                setModelInfo(modelInfoRes.data);
            } catch (err) {
                console.error('Error fetching ML data:', err);
                setError('Could not load ML data. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    const lstm = modelInfo?.models.pm25_lstm;
    const isoForest = modelInfo?.models.anomaly_detector;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                    <Brain className="mr-3 h-10 w-10 text-purple-600" />
                    ML Predictions & Analytics
                </h1>
                <p className="text-gray-600 mt-2">
                    Next-hour air quality forecasting and anomaly detection
                </p>
            </div>

            {/* PM2.5 Prediction + Model Metrics side by side */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">

                {/* Next-hour prediction */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Wind className="mr-2 h-5 w-5 text-blue-600" />
                            Next-Hour PM2.5 Forecast
                        </CardTitle>
                        <CardDescription>
                            Predicted from the last 24 hours of sensor readings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {prediction?.predicted_pm25 != null ? (
                            <div className="space-y-4">
                                <div className="text-center py-4">
                                    <p className="text-6xl font-bold text-blue-600">
                                        {prediction.predicted_pm25.toFixed(1)}
                                    </p>
                                    <p className="text-gray-500 mt-1">μg/m³</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">RMSE</p>
                                        <p className="text-lg font-semibold text-gray-800">{prediction.model_rmse.toFixed(4)}</p>
                                        <p className="text-xs text-gray-400">μg/m³ error</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">R²</p>
                                        <p className="text-lg font-semibold text-gray-800">{prediction.model_r2.toFixed(4)}</p>
                                        <p className="text-xs text-gray-400">variance explained</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 text-center">
                                    Predicted at {new Date(prediction.predicted_at).toLocaleTimeString()}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                {prediction?.error || 'Prediction unavailable — not enough recent sensor data.'}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* LSTM model details */}
                <Card>
                    <CardHeader>
                        <CardTitle>LSTM Model Details</CardTitle>
                        <CardDescription>
                            Trained on UIUC campus air quality sensor data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lstm && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Architecture</p>
                                        <p className="text-sm font-medium mt-1">{lstm.type}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Sequence Length</p>
                                        <p className="text-sm font-medium mt-1">{lstm.sequence_length} hours</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Training Loss</p>
                                        <p className="text-sm font-medium mt-1">{lstm.training_loss}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Testing Loss</p>
                                        <p className="text-sm font-medium mt-1">{lstm.testing_loss}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Input Features</p>
                                    <div className="flex flex-wrap gap-1">
                                        {lstm.input_features.map((f) => (
                                            <span key={f} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                {f.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Anomaly Detection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                        Anomaly Detection
                    </CardTitle>
                    <CardDescription>
                        {isoForest
                            ? `${isoForest.type} — trained on historical data, evaluated on most recent 48 hours`
                            : 'Unusual patterns in air quality readings'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {anomalies.length > 0 ? (
                        <div className="space-y-3">
                            {anomalies.map((anomaly, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border-l-4 ${
                                        anomaly.severity === 'high'
                                            ? 'bg-red-50 border-red-500'
                                            : anomaly.severity === 'medium'
                                            ? 'bg-orange-50 border-orange-500'
                                            : 'bg-yellow-50 border-yellow-500'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-sm">{anomaly.description}</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Value: {anomaly.value.toFixed(2)} &nbsp;|&nbsp; Expected: {anomaly.expected_range[0]} – {anomaly.expected_range[1]}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            anomaly.severity === 'high'
                                                ? 'bg-red-200 text-red-800'
                                                : anomaly.severity === 'medium'
                                                ? 'bg-orange-200 text-orange-800'
                                                : 'bg-yellow-200 text-yellow-800'
                                        }`}>
                                            {anomaly.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">{anomaly.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                <span className="text-2xl">✓</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">No anomalies detected</p>
                            <p className="text-xs text-gray-500 mt-1">
                                All readings in the last 48 hours are within normal historical ranges
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}