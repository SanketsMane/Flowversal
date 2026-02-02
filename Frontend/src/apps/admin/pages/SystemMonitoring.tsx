/**
 * System Monitoring Page
 * Real-time system health, performance metrics, and monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import {
  Activity,
  Server,
  Database,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Network,
  Users,
  Workflow,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SystemMetrics {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastUpdated: string;
  services: ServiceStatus[];
  performance: PerformanceMetrics;
  resources: ResourceUsage;
  apiMetrics: ApiMetrics;
  errorLog: ErrorLog[];
}

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: string;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  activeConnections: number;
  history: Array<{
    timestamp: string;
    responseTime: number;
    requests: number;
    errors: number;
  }>;
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  bandwidth: number;
}

interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  endpoints: Array<{
    path: string;
    requests: number;
    avgTime: number;
    errorRate: number;
  }>;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  count: number;
}

export const SystemMonitoring: React.FC = () => {
  const { theme } = useThemeStore();
  const [metrics, setMetrics] = useState<SystemMetrics>(getSystemMetrics());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(getSystemMetrics());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setMetrics(getSystemMetrics());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'warning':
      case 'degraded':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'critical':
      case 'down':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'down':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        theme === 'dark' ? 'bg-[#0E0E1F] text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">System Monitoring</h1>
            <p
              className={
                theme === 'dark'
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }
            >
              Real-time system health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(metrics.status)}>
              {getStatusIcon(metrics.status)}
              <span className="ml-2">{metrics.status.toUpperCase()}</span>
            </Badge>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className={
                theme === 'dark'
                  ? 'border-white/20'
                  : 'border-gray-300'
              }
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              className={
                autoRefresh
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : theme === 'dark'
                  ? 'border-white/20'
                  : 'border-gray-300'
              }
            >
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
        <div
          className={`flex items-center gap-4 text-sm ${
            theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
        >
          <span>Uptime: {formatUptime(metrics.uptime)}</span>
          <span>•</span>
          <span>
            Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
          </span>
          <span>•</span>
          <span>Refresh interval: {refreshInterval}s</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Avg Response Time"
            value={`${metrics.performance.avgResponseTime}ms`}
            icon={<Clock className="w-5 h-5" />}
            trend={metrics.performance.avgResponseTime < 200 ? 'up' : 'down'}
            trendValue="12%"
            color="blue"
          />
          <MetricCard
            title="Requests/Min"
            value={metrics.performance.requestsPerMinute.toString()}
            icon={<Activity className="w-5 h-5" />}
            trend="up"
            trendValue="23%"
            color="green"
          />
          <MetricCard
            title="Error Rate"
            value={`${metrics.performance.errorRate.toFixed(2)}%`}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={metrics.performance.errorRate < 1 ? 'up' : 'down'}
            trendValue="5%"
            color={metrics.performance.errorRate < 1 ? 'green' : 'red'}
          />
          <MetricCard
            title="Active Connections"
            value={metrics.performance.activeConnections.toString()}
            icon={<Network className="w-5 h-5" />}
            trend="up"
            trendValue="8%"
            color="violet"
          />
        </div>

        {/* Services Status */}
        <Card
          className={`p-6 ${
            theme === 'dark'
              ? 'bg-[#1A1A2E] border-white/10'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Services Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.services.map((service) => (
              <div
                key={service.name}
                className={`rounded-lg p-4 border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{service.name}</h3>
                  <Badge className={getStatusColor(service.status)}>
                    {getStatusIcon(service.status)}
                    <span className="ml-1">{service.status}</span>
                  </Badge>
                </div>
                <div
                  className={`space-y-2 text-sm ${
                    theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span
                      className={
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-gray-900'
                      }
                    >
                      {service.responseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span
                      className={
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-gray-900'
                      }
                    >
                      {service.uptime.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Check:</span>
                    <span
                      className={
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-gray-900'
                      }
                    >
                      {service.lastCheck}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Chart */}
        <Card
          className={`p-6 ${
            theme === 'dark'
              ? 'bg-[#1A1A2E] border-white/10'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance History
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.performance.history}>
              <defs>
                <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C6FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C6FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9D50BB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9D50BB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
              <XAxis dataKey="timestamp" stroke="#CFCFE8" fontSize={12} />
              <YAxis stroke="#CFCFE8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1A1A2E' : '#FFFFFF',
                  border: `1px solid ${
                    theme === 'dark'
                      ? '#2A2A3E'
                      : '#E5E7EB'
                  }`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#FFFFFF' : '#111827',
                }}
              />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="#00C6FF"
                fillOpacity={1}
                fill="url(#colorResponseTime)"
                name="Response Time (ms)"
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#9D50BB"
                fillOpacity={1}
                fill="url(#colorRequests)"
                name="Requests"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            className={`p-6 ${
              theme === 'dark'
                ? 'bg-[#1A1A2E] border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Resource Usage
            </h2>
            <div className="space-y-4">
              <ResourceBar
                label="CPU Usage"
                value={metrics.resources.cpu}
                icon={<Cpu className="w-4 h-4" />}
              />
              <ResourceBar
                label="Memory"
                value={metrics.resources.memory}
                icon={<HardDrive className="w-4 h-4" />}
              />
              <ResourceBar
                label="Storage"
                value={metrics.resources.storage}
                icon={<Database className="w-4 h-4" />}
              />
              <ResourceBar
                label="Bandwidth"
                value={metrics.resources.bandwidth}
                icon={<Network className="w-4 h-4" />}
              />
            </div>
          </Card>

          <Card
            className={`p-6 ${
              theme === 'dark'
                ? 'bg-[#1A1A2E] border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Endpoints
            </h2>
            <div className="space-y-3">
              {metrics.apiMetrics.endpoints.slice(0, 5).map((endpoint) => (
                <div
                  key={endpoint.path}
                  className={`rounded-lg p-3 border ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <code
                      className={`text-sm ${
                        theme === 'dark'
                          ? 'text-cyan-400'
                          : 'text-cyan-600'
                      }`}
                    >
                      {endpoint.path}
                    </code>
                    <Badge
                      className={
                        endpoint.errorRate < 1
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {endpoint.errorRate.toFixed(1)}% errors
                    </Badge>
                  </div>
                  <div
                    className={`flex justify-between text-xs ${
                      theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                  >
                    <span>{endpoint.requests} requests</span>
                    <span>{endpoint.avgTime}ms avg</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Error Log */}
        <Card
          className={`p-6 ${
            theme === 'dark'
              ? 'bg-[#1A1A2E] border-white/10'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Errors & Warnings
          </h2>
          <div className="space-y-2">
            {metrics.errorLog.length > 0 ? (
              metrics.errorLog.map((error) => (
                <div
                  key={error.id}
                  className={`p-4 rounded-lg border ${
                    error.level === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : error.level === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          error.level === 'error'
                            ? 'bg-red-500/20 text-red-400'
                            : error.level === 'warning'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }
                      >
                        {error.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-400">{error.source}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {error.timestamp} • {error.count}x
                    </div>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-700'
                    }`}
                  >
                    {error.message}
                  </p>
                </div>
              ))
            ) : (
              <div
                className={`text-center py-8 ${
                  theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                No recent errors or warnings
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  trendValue: string;
  color: 'blue' | 'green' | 'red' | 'violet';
}> = ({ title, value, icon, trend, trendValue, color }) => {
  const { theme } = useThemeStore();
  const colorMap = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-orange-500',
    violet: 'from-violet-500 to-purple-500',
  };

  return (
    <Card
      className={`p-4 ${
        theme === 'dark'
          ? 'bg-[#1A1A2E] border-white/10'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-sm ${
            theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
        >
          {title}
        </span>
        <div
          className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[color]}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl mb-2">{value}</div>
      <div className="flex items-center gap-1 text-xs">
        {trend === 'up' ? (
          <TrendingUp className="w-3 h-3 text-green-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-400" />
        )}
        <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
          {trendValue}
        </span>
        <span className="text-gray-500">vs last period</span>
      </div>
    </Card>
  );
};

const ResourceBar: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  const { theme } = useThemeStore();
  const getColor = (val: number) => {
    if (val >= 90) return 'bg-red-500';
    if (val >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div
          className={`flex items-center gap-2 text-sm ${
            theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}
        >
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-sm font-semibold">{value}%</span>
      </div>
      <div className="relative">
        <Progress value={value} className="h-2" />
        <div
          className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getColor(
            value
          )}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// Mock data generator (replace with real API calls)
function getSystemMetrics(): SystemMetrics {
  const now = new Date();
  
  return {
    status: 'healthy',
    uptime: 2592000, // 30 days in seconds
    lastUpdated: now.toISOString(),
    services: [
      {
        name: 'API Server',
        status: 'up',
        responseTime: 45,
        uptime: 99.98,
        lastCheck: '2 min ago',
      },
      {
        name: 'Database',
        status: 'up',
        responseTime: 12,
        uptime: 99.99,
        lastCheck: '1 min ago',
      },
      {
        name: 'Auth Service',
        status: 'up',
        responseTime: 67,
        uptime: 99.95,
        lastCheck: '3 min ago',
      },
      {
        name: 'File Storage',
        status: 'up',
        responseTime: 89,
        uptime: 99.92,
        lastCheck: '2 min ago',
      },
      {
        name: 'Email Service',
        status: 'up',
        responseTime: 234,
        uptime: 99.87,
        lastCheck: '5 min ago',
      },
      {
        name: 'Webhook Handler',
        status: 'up',
        responseTime: 156,
        uptime: 99.94,
        lastCheck: '1 min ago',
      },
    ],
    performance: {
      avgResponseTime: 145,
      requestsPerMinute: 342,
      errorRate: 0.42,
      activeConnections: 87,
      history: Array.from({ length: 20 }, (_, i) => ({
        timestamp: `${20 - i}m`,
        responseTime: 100 + Math.random() * 100,
        requests: 300 + Math.random() * 100,
        errors: Math.random() * 5,
      })),
    },
    resources: {
      cpu: 34,
      memory: 56,
      storage: 42,
      bandwidth: 28,
    },
    apiMetrics: {
      totalRequests: 45678,
      successfulRequests: 45234,
      failedRequests: 444,
      avgLatency: 145,
      endpoints: [
        { path: '/api/workflows/execute', requests: 12453, avgTime: 234, errorRate: 0.3 },
        { path: '/api/auth/login', requests: 8765, avgTime: 89, errorRate: 0.1 },
        { path: '/api/users/profile', requests: 6543, avgTime: 45, errorRate: 0.2 },
        { path: '/api/subscription/current', requests: 4321, avgTime: 67, errorRate: 0.5 },
        { path: '/api/workflows/list', requests: 3456, avgTime: 156, errorRate: 0.4 },
      ],
    },
    errorLog: [
      {
        id: '1',
        timestamp: '2 min ago',
        level: 'warning',
        message: 'High memory usage detected on worker node',
        source: 'Resource Monitor',
        count: 3,
      },
      {
        id: '2',
        timestamp: '15 min ago',
        level: 'error',
        message: 'Failed to send email notification: SMTP timeout',
        source: 'Email Service',
        count: 1,
      },
      {
        id: '3',
        timestamp: '1 hour ago',
        level: 'info',
        message: 'Database backup completed successfully',
        source: 'Backup Service',
        count: 1,
      },
    ],
  };
}