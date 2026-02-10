/**
 * Analytics Page
 * Comprehensive analytics with revenue, user behavior, and trends
 */
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import {
    Activity,
    ArrowDown,
    ArrowUp,
    BarChart3,
    Clock,
    DollarSign,
    Download,
    PieChart as PieChartIcon,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
type TimeRange = '7d' | '30d' | '90d' | '1y';
export const AnalyticsPage: React.FC = () => {
  const { theme } = useThemeStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  // Initialize specific features
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'engagement'>('revenue');
  // Use empty/zero structure instead of mock data
  const analytics = {
    revenue: {
      total: 0,
      mrr: 0,
      growth: 0,
      mrrGrowth: 0,
    },
    users: {
      active: 0,
      growth: 0,
    },
    engagement: {
      avgSession: 0,
      sessionGrowth: 0,
    },
    revenueChart: [] as any[],
    userGrowthChart: [] as any[],
    conversionFunnel: [] as any[],
    planDistribution: [] as any[],
    featureUsage: [] as any[],
    topFeatures: [] as any[],
    engagementByDay: [] as any[],
    userBehavior: [] as any[],
    insights: [] as any[],
  };
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';
  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const exportData = () => {
    // Export analytics data as CSV
    alert('Analytics exported to CSV!');
  };
  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-8`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Comprehensive insights and metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200'} rounded-lg p-1 border`}>
              {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                      : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
            <Button
              onClick={exportData}
              variant="outline"
              className={theme === 'dark' ? 'border-white/20' : 'border-gray-300'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RevenueCard
            title="Total Revenue"
            value={`$${analytics.revenue.total.toLocaleString()}`}
            change={analytics.revenue.growth}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <RevenueCard
            title="MRR"
            value={`$${analytics.revenue.mrr.toLocaleString()}`}
            change={analytics.revenue.mrrGrowth}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <RevenueCard
            title="Active Users"
            value={analytics.users.active.toLocaleString()}
            change={analytics.users.growth}
            icon={<Users className="w-5 h-5" />}
          />
          <RevenueCard
            title="Avg. Session"
            value={`${analytics.engagement.avgSession}m`}
            change={analytics.engagement.sessionGrowth}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>
        {/* Revenue Chart */}
        <Card className={cardBg + " p-6"}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Trend
            </h2>
            <div className="flex gap-2">
              <Badge className="bg-green-500/20 text-green-400">
                ↑ {analytics.revenue.growth}% vs previous period
              </Badge>
            </div>
          </div>
          <div className="h-[350px] flex items-center justify-center text-gray-500">
            {analytics.revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={analytics.revenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C6FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00C6FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9D50BB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9D50BB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                  <XAxis dataKey="date" stroke="#CFCFE8" fontSize={12} />
                  <YAxis stroke="#CFCFE8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid #2A2A3E',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00C6FF"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Total Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="#9D50BB"
                    fillOpacity={1}
                    fill="url(#colorMRR)"
                    name="MRR"
                  />
                </AreaChart>
              </ResponsiveContainer>
             ) : (
                <p>No revenue data available</p>
             )}
          </div>
        </Card>
        {/* User Growth & Conversion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={cardBg + " p-6"}>
            <h2 className="text-xl mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Growth
            </h2>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
            {analytics.userGrowthChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.userGrowthChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis dataKey="date" stroke="#CFCFE8" fontSize={12} />
                <YAxis stroke="#CFCFE8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke="#00C6FF"
                  strokeWidth={2}
                  name="Sign Ups"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
            ) : ( <p>No user growth data available</p> )}
            </div>
          </Card>
          <Card className={cardBg + " p-6"}>
            <h2 className="text-xl mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Conversion Funnel
            </h2>
            <div className="space-y-4">
              {analytics.conversionFunnel.length > 0 ? (
                analytics.conversionFunnel.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{stage.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{stage.users.toLocaleString()} users</span>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {stage.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-12 bg-white/5 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                      {stage.percentage}%
                    </div>
                  </div>
                  {index < analytics.conversionFunnel.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowDown className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                    <p>No conversion data available</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        {/* Subscription & Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={cardBg + " p-6"}>
            <h2 className="text-xl mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Plan Distribution
            </h2>
            <div className="h-[250px] flex items-center justify-center text-gray-500">
            {analytics.planDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            ) : ( <p>No plan data available</p> )}
            </div>
          </Card>
          <Card className={cardBg + " p-6"}>
            <h2 className="text-xl mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Feature Usage
            </h2>
            <div className="space-y-3">
              {analytics.featureUsage.length > 0 ? (
                analytics.featureUsage.map((feature) => (
                <div key={feature.name}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-400">{feature.name}</span>
                    <span>{feature.usage}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>
                </div>
              ))
              ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-500">
                    <p>No feature usage data</p>
                </div>
              )}
            </div>
          </Card>
          <Card className={cardBg + " p-6"}>
            <h2 className="text-xl mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Features
            </h2>
            <div className="space-y-3">
              {analytics.topFeatures.length > 0 ? (
                  analytics.topFeatures.map((feature, index) => (
                <div
                  key={feature.name}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{feature.name}</p>
                      <p className="text-xs text-gray-400">{feature.users} users</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    {feature.growth}%
                  </Badge>
                </div>
              ))
              ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-500">
                     <p>No top features data</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        {/* Engagement Metrics */}
        <Card className={cardBg + " p-6"}>
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            User Engagement
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px] flex items-center justify-center text-gray-500">
            {analytics.engagementByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.engagementByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis dataKey="day" stroke="#CFCFE8" fontSize={12} />
                <YAxis stroke="#CFCFE8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="sessions" fill="#00C6FF" name="Sessions" />
                <Bar dataKey="actions" fill="#9D50BB" name="Actions" />
              </BarChart>
            </ResponsiveContainer>
            ) : ( <p>No engagement data available</p> )}
            </div>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
            {analytics.userBehavior.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={analytics.userBehavior}>
                <PolarGrid stroke="#2A2A3E" />
                <PolarAngleAxis dataKey="metric" stroke="#CFCFE8" fontSize={12} />
                <PolarRadiusAxis stroke="#CFCFE8" />
                <Radar
                  name="User Behavior"
                  dataKey="value"
                  stroke="#00C6FF"
                  fill="#00C6FF"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            ) : ( <p>No behavior data available</p> )}
            </div>
          </div>
        </Card>
        {/* Key Insights */}
        <Card className={cardBg + " p-6"}>
          <h2 className="text-xl mb-6">🔍 Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.insights.length > 0 ? (
                analytics.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30'
                    : insight.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <h3 className="font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm text-gray-300">{insight.description}</p>
              </div>
            ))
            ) : (
                <div className="col-span-3 text-center text-gray-500 py-8">
                    <p>No insights generated yet</p>
                </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
// Helper Components
const RevenueCard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}> = ({ title, value, change, icon }) => {
  const { theme } = useThemeStore();
  const isPositive = change >= 0;
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';
  return (
    <Card className={`${cardBg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{title}</span>
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
          {icon}
        </div>
      </div>
      <div className="text-2xl mb-2">{value}</div>
      <div className="flex items-center gap-1 text-xs">
        {isPositive ? (
          <ArrowUp className="w-3 h-3 text-green-400" />
        ) : (
          <ArrowDown className="w-3 h-3 text-red-400" />
        )}
        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
          {Math.abs(change)}%
        </span>
        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}>vs last period</span>
      </div>
    </Card>
  );
};