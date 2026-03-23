import { useState, useEffect } from 'react';
import { TelemetryPoint } from '@/../../shared/types';

export function useTelemetry(vehicleId: string, maxDataPoints: number = 20) {
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);

  useEffect(() => {
    // Initialize with some historical data
    const initialData: TelemetryPoint[] = Array.from({ length: 5 }, (_, i) => ({
      vehicleId,
      timestamp: new Date(Date.now() - (5 - i) * 10000),
      speed: 50 + Math.random() * 30,
      latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
      longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
      fuel: 80 + Math.random() * 10,
      temperature: 90 + Math.random() * 10
    }));

    setTelemetryData(initialData);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTelemetryData((prevData) => {
        const lastPoint = prevData[prevData.length - 1];
        
        const newPoint: TelemetryPoint = {
          vehicleId,
          timestamp: new Date(),
          speed: Math.max(0, Math.min(120, lastPoint.speed + (Math.random() - 0.5) * 15)),
          latitude: lastPoint.latitude + (Math.random() - 0.5) * 0.001,
          longitude: lastPoint.longitude + (Math.random() - 0.5) * 0.001,
          fuel: Math.max(0, lastPoint.fuel - Math.random() * 0.5),
          temperature: Math.max(80, Math.min(120, lastPoint.temperature + (Math.random() - 0.5) * 3))
        };

        const newData = [...prevData, newPoint];
        
        // Keep only the last maxDataPoints
        if (newData.length > maxDataPoints) {
          newData.shift();
        }

        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [vehicleId, maxDataPoints]);

  return telemetryData;
}
