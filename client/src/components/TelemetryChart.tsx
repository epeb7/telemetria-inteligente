import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TelemetryPoint } from '@/../../shared/types';

interface TelemetryChartProps {
  data: TelemetryPoint[];
  metric: 'speed' | 'fuel' | 'temperature';
  title: string;
}

function getMetricColor(metric: string): string {
  switch (metric) {
    case 'speed':
      return '#0ea5e9';
    case 'fuel':
      return '#10b981';
    case 'temperature':
      return '#f59e0b';
    default:
      return '#6366f1';
  }
}

function getMetricLabel(metric: string): string {
  switch (metric) {
    case 'speed':
      return 'Velocidade (km/h)';
    case 'fuel':
      return 'Combustível (%)';
    case 'temperature':
      return 'Temperatura (°C)';
    default:
      return 'Métrica';
  }
}

export function TelemetryChart({ data, metric, title }: TelemetryChartProps) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: point[metric as keyof TelemetryPoint] as number
  }));

  return (
    <div className="w-full h-64 bg-card rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
            formatter={(value) => [value, getMetricLabel(metric)]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={getMetricColor(metric)}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
