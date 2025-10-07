import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { PredictionData, ResourcePrediction } from '../utils/predictiveAnalytics';

interface PredictiveChartsProps {
  resourceType: 'oxygen' | 'beds' | 'staff' | 'emergency';
  prediction: ResourcePrediction;
  historicalData?: any[];
}

const PredictiveCharts: React.FC<PredictiveChartsProps> = ({
  resourceType,
  prediction,
  historicalData = []
}) => {
  // Format prediction data for charts
  const formatPredictionData = (predictions: PredictionData[]) => {
    return predictions.map((pred, index) => ({
      time: new Date(pred.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      value: Math.round(pred.value * 100) / 100,
      confidence: Math.round(pred.confidence * 100),
      hour: index,
      upper: Math.round((pred.value + (1 - pred.confidence) * pred.value * 0.2) * 100) / 100,
      lower: Math.round((pred.value - (1 - pred.confidence) * pred.value * 0.2) * 100) / 100
    }));
  };

  // Generate historical trend data
  const generateHistoricalTrend = () => {
    const data = [];
    const now = Date.now();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000);
      const hour = new Date(timestamp).getHours();
      
      let baseValue = prediction.currentValue;
      if (resourceType === 'oxygen') {
        baseValue = 75 + Math.sin((hour / 12) * Math.PI) * 10 + (Math.random() - 0.5) * 8;
      } else if (resourceType === 'beds') {
        baseValue = 25 + Math.sin(((hour + 6) / 24) * Math.PI * 2) * 15 + (Math.random() - 0.5) * 6;
      } else if (resourceType === 'staff') {
        baseValue = 60 + Math.sin((hour / 8) * Math.PI) * 20 + (Math.random() - 0.5) * 10;
      } else if (resourceType === 'emergency') {
        baseValue = 3 + Math.sin((hour / 12) * Math.PI) * 2 + (Math.random() - 0.5) * 1.5;
      }
      
      data.push({
        time: new Date(timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        historical: Math.max(0, baseValue),
        hour: 24 - i
      });
    }
    
    return data;
  };

  const chartData = formatPredictionData(prediction.predictions.slice(0, 24));
  const historicalTrend = generateHistoricalTrend();
  
  // Combine historical and prediction data
  const combinedData = historicalTrend.map((hist, index) => ({
    ...hist,
    predicted: index < chartData.length ? chartData[index]?.value : null,
    confidence: index < chartData.length ? chartData[index]?.confidence : null,
    upper: index < chartData.length ? chartData[index]?.upper : null,
    lower: index < chartData.length ? chartData[index]?.lower : null
  }));

  // Color schemes for different resources
  const getColorScheme = (resource: string) => {
    switch (resource) {
      case 'oxygen':
        return {
          primary: '#3B82F6',
          secondary: '#93C5FD',
          accent: '#1D4ED8',
          background: '#EFF6FF'
        };
      case 'beds':
        return {
          primary: '#10B981',
          secondary: '#6EE7B7',
          accent: '#047857',
          background: '#ECFDF5'
        };
      case 'staff':
        return {
          primary: '#8B5CF6',
          secondary: '#C4B5FD',
          accent: '#7C3AED',
          background: '#F5F3FF'
        };
      case 'emergency':
        return {
          primary: '#EF4444',
          secondary: '#FCA5A5',
          accent: '#DC2626',
          background: '#FEF2F2'
        };
      default:
        return {
          primary: '#6B7280',
          secondary: '#D1D5DB',
          accent: '#4B5563',
          background: '#F9FAFB'
        };
    }
  };

  const colors = getColorScheme(resourceType);

  // Risk level distribution for pie chart
  const getRiskDistribution = () => {
    const predictions = chartData.map(d => d.value);
    let low = 0, medium = 0, high = 0, critical = 0;
    
    predictions.forEach(value => {
      if (resourceType === 'oxygen') {
        if (value >= 85) low++;
        else if (value >= 75) medium++;
        else if (value >= 65) high++;
        else critical++;
      } else if (resourceType === 'beds') {
        if (value >= 25) low++;
        else if (value >= 15) medium++;
        else if (value >= 8) high++;
        else critical++;
      } else if (resourceType === 'staff') {
        if (value <= 60) low++;
        else if (value <= 75) medium++;
        else if (value <= 85) high++;
        else critical++;
      } else if (resourceType === 'emergency') {
        if (value <= 3) low++;
        else if (value <= 5) medium++;
        else if (value <= 7) high++;
        else critical++;
      }
    });

    return [
      { name: 'Low Risk', value: low, color: '#10B981' },
      { name: 'Medium Risk', value: medium, color: '#F59E0B' },
      { name: 'High Risk', value: high, color: '#EF4444' },
      { name: 'Critical Risk', value: critical, color: '#DC2626' }
    ].filter(item => item.value > 0);
  };

  const riskDistribution = getRiskDistribution();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}${
                resourceType === 'oxygen' || resourceType === 'staff' ? '%' : 
                resourceType === 'beds' ? ' beds' : ' cases'
              }`}
            </p>
          ))}
          {payload[0]?.payload?.confidence && (
            <p className="text-xs text-gray-500">
              Confidence: {payload[0].payload.confidence}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getYAxisDomain = () => {
    if (resourceType === 'emergency') return [0, 15];
    if (resourceType === 'beds') return [0, 50];
    return [0, 100];
  };

  const getUnit = () => {
    switch (resourceType) {
      case 'oxygen': return '%';
      case 'staff': return '%';
      case 'beds': return ' beds';
      case 'emergency': return ' cases';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Prediction Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Prediction Timeline
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                domain={getYAxisDomain()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Historical data line */}
              <Line
                type="monotone"
                dataKey="historical"
                stroke="#9CA3AF"
                strokeWidth={2}
                dot={false}
                name={`Historical ${resourceType}`}
                strokeDasharray="5 5"
              />
              
              {/* Confidence band */}
              <Area
                type="monotone"
                dataKey="upper"
                stackId="confidence"
                stroke="none"
                fill={colors.secondary}
                fillOpacity={0.3}
                name="Confidence Band"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stackId="confidence"
                stroke="none"
                fill="#FFFFFF"
                fillOpacity={1}
                name=""
              />
              
              {/* Prediction line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={colors.primary}
                strokeWidth={3}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                name={`Predicted ${resourceType}`}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            24-Hour Risk Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Levels Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Prediction Confidence Levels
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7280"
                  fontSize={12}
                  interval={2}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Confidence']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar 
                  dataKey="confidence" 
                  fill={colors.primary}
                  radius={[2, 2, 0, 0]}
                  name="Confidence %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Trend Analysis
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280"
                fontSize={12}
                interval={1}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                domain={getYAxisDomain()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stackId="1"
                stroke={colors.primary}
                fill={colors.secondary}
                fillOpacity={0.6}
                name={`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}${getUnit()}`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
              {Math.round(prediction.currentValue)}
            </p>
            <p className="text-sm text-gray-600">Current Value</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)}
            </p>
            <p className="text-sm text-gray-600">24h Average</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {Math.round(Math.max(...chartData.map(d => d.value)))}
            </p>
            <p className="text-sm text-gray-600">Peak Value</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {Math.round(chartData.reduce((sum, d) => sum + d.confidence, 0) / chartData.length)}%
            </p>
            <p className="text-sm text-gray-600">Avg Confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveCharts;