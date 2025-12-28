/**
 * Admin Monitoring Dashboard
 * Real-time tracking of Carfax scraping operations, costs, and system health
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, DollarSign, Zap, CheckCircle, XCircle } from 'lucide-react';

interface MetricsData {
  timestamp: Date;
  successRate: number;
  totalCost: number;
  vinsProcessed: number;
  avgProcessingTime: number;
}

interface SystemHealth {
  apifyStatus: 'connected' | 'disconnected' | 'error';
  databaseStatus: 'connected' | 'disconnected' | 'error';
  n8nStatus: 'connected' | 'disconnected' | 'error';
  lastHealthCheck: Date;
}

export function AdminMonitoring() {
  const [metrics, setMetrics] = useState<MetricsData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    apifyStatus: 'disconnected',
    databaseStatus: 'disconnected',
    n8nStatus: 'disconnected',
    lastHealthCheck: new Date(),
  });
  const [loading, setLoading] = useState(true);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // TODO: Replace with actual tRPC call to fetch metrics
        const mockData: MetricsData[] = [
          {
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            successRate: 98.5,
            totalCost: 2.45,
            vinsProcessed: 49,
            avgProcessingTime: 45,
          },
          {
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            successRate: 99.2,
            totalCost: 2.95,
            vinsProcessed: 59,
            avgProcessingTime: 42,
          },
          {
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            successRate: 97.8,
            totalCost: 2.15,
            vinsProcessed: 43,
            avgProcessingTime: 48,
          },
          {
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            successRate: 99.5,
            totalCost: 3.25,
            vinsProcessed: 65,
            avgProcessingTime: 40,
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            successRate: 98.9,
            totalCost: 2.85,
            vinsProcessed: 57,
            avgProcessingTime: 44,
          },
          {
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            successRate: 99.1,
            totalCost: 3.05,
            vinsProcessed: 61,
            avgProcessingTime: 41,
          },
        ];

        setMetrics(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  // Check system health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // TODO: Replace with actual tRPC calls to check system health
        setSystemHealth({
          apifyStatus: 'connected',
          databaseStatus: 'connected',
          n8nStatus: 'connected',
          lastHealthCheck: new Date(),
        });
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'connected' | 'disconnected' | 'error') => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getStatusIcon = (status: 'connected' | 'disconnected' | 'error') => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5" />;
      case 'disconnected':
        return <AlertCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
    }
  };

  // Calculate summary metrics
  const totalVinsProcessed = metrics.reduce((sum, m) => sum + m.vinsProcessed, 0);
  const totalCost = metrics.reduce((sum, m) => sum + m.totalCost, 0);
  const avgSuccessRate =
    metrics.length > 0
      ? (metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length).toFixed(1)
      : '0';
  const avgProcessingTime =
    metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.avgProcessingTime, 0) / metrics.length)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time tracking of Carfax scraping operations</p>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Apify Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${getStatusColor(systemHealth.apifyStatus)}`}>
                {getStatusIcon(systemHealth.apifyStatus)}
                <span className="capitalize">{systemHealth.apifyStatus}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${getStatusColor(systemHealth.databaseStatus)}`}>
                {getStatusIcon(systemHealth.databaseStatus)}
                <span className="capitalize">{systemHealth.databaseStatus}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">n8n Workflow Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${getStatusColor(systemHealth.n8nStatus)}`}>
                {getStatusIcon(systemHealth.n8nStatus)}
                <span className="capitalize">{systemHealth.n8nStatus}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total VINs Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{totalVinsProcessed}</div>
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{avgSuccessRate}%</div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{avgProcessingTime}s</div>
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Success Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Success Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis domain={[95, 100]} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleString()}
                    formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value}%`}
                  />
                  <Line type="monotone" dataKey="successRate" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleString()}
                    formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`}
                  />
                  <Bar dataKey="totalCost" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* VINs Processed */}
          <Card>
            <CardHeader>
              <CardTitle>VINs Processed per Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
                  <Bar dataKey="vinsProcessed" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Processing Time */}
          <Card>
            <CardHeader>
              <CardTitle>Average Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleString()}
                    formatter={(value) => `${typeof value === 'number' ? value : value}s`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avgProcessingTime" stroke="#8b5cf6" strokeWidth={2} name="Avg Time (seconds)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Last updated: {systemHealth.lastHealthCheck.toLocaleTimeString()}</p>
          <p>Auto-refreshing every 60 seconds</p>
        </div>
      </div>
    </div>
  );
}
