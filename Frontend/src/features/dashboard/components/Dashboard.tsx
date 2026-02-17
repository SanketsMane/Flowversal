import { fetchAnalyticsSummary } from '@/core/api/services/analytics.service';
import { useTheme } from '@/core/theme/ThemeContext';
import { useTemplateStore } from '@/features/templates/store/templateStore';
import { Activity, Brain, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardProps {
  onCreateWorkflow?: () => void;
  onOpenTemplateLibrary?: () => void;
  onOpenProjectTemplates?: () => void;
}

export function Dashboard({ onCreateWorkflow, onOpenTemplateLibrary, onOpenProjectTemplates }: DashboardProps = {}) {
  const { theme } = useTheme();
  const { openTemplateLibrary } = useTemplateStore();

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';

  // Handler for Create Workflow button
  const handleCreateWorkflow = () => {
    if (onCreateWorkflow) {
      onCreateWorkflow();
    } else {
      // Fallback: Navigate to My Workflows page
      window.location.hash = '#/my-workflows';
    }
  };

  // Handler for Workflow Templates button
  const handleBrowseTemplates = () => {
    if (onOpenTemplateLibrary) {
      onOpenTemplateLibrary();
    } else {
      // Fallback: Open template library directly
      openTemplateLibrary();
    }
  };

  // Handler for Project Templates button
  const handleProjectTemplates = () => {
    if (onOpenProjectTemplates) {
      onOpenProjectTemplates();
    } else {
      // Navigate to projects page which has the template gallery
      window.location.hash = '#/projects';
    }
  };

  const [dashboardStats, setDashboardStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAnalyticsSummary();
        // Map icons based on labels
        const mapped = data.map(stat => {
          let Icon = Brain;
          if (stat.label.includes('Active')) Icon = Zap;
          if (stat.label.includes('Tasks')) Icon = TrendingUp;
          if (stat.label.includes('AI')) Icon = Sparkles;
          return { ...stat, icon: Icon };
        });
        setDashboardStats(mapped);
      } catch (err) {
        console.error('[Dashboard] Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const stats = dashboardStats.length > 0 ? dashboardStats : [
    {
      icon: Brain,
      label: 'Total Workflows',
      value: '...',
      change: '+0%',
      color: 'from-[#9D50BB] to-[#B876D5]',
    },
    {
      icon: Zap,
      label: 'Active Automations',
      value: '...',
      change: '+0%',
      color: 'from-[#0072FF] to-[#4F7BF7]',
    },
    {
      icon: TrendingUp,
      label: 'Tasks Completed',
      value: '...',
      change: '+0%',
      color: 'from-[#00C6FF] to-[#06B6D4]',
    },
    {
      icon: Activity,
      label: 'AI Calls',
      value: '...',
      change: '+0%',
      color: 'from-[#D946EF] to-[#E879F9]',
    },
  ];

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      <main className="mt-16 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`${textPrimary} text-4xl mb-3`}>Welcome back! 👋</h1>
          <p className={`${textSecondary} text-lg`}>
            Here's what's happening with your workflows today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${bgCard} border ${borderColor} rounded-xl p-6 hover:shadow-xl transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-500 text-sm">{stat.change}</span>
              </div>
              <h3 className={`${textPrimary} text-3xl mb-1`}>{stat.value}</h3>
              <p className={`${textSecondary} text-sm`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={`${bgCard} border ${borderColor} rounded-xl p-8`}>
          <h2 className={`${textPrimary} text-2xl mb-6`}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="flex items-center gap-4 p-4 rounded-lg border border-dashed hover:border-solid border-current hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all cursor-pointer"
              onClick={handleCreateWorkflow}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className={`${textPrimary} text-sm mb-1`}>Create Workflow</h3>
                <p className={`${textSecondary} text-xs`}>Start a new automation</p>
              </div>
            </button>

            <button
              className="flex items-center gap-4 p-4 rounded-lg border border-dashed hover:border-solid border-current hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all cursor-pointer"
              onClick={handleBrowseTemplates}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#9D50BB] to-[#B876D5] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className={`${textPrimary} text-sm mb-1`}>Workflow Templates</h3>
                <p className={`${textSecondary} text-xs`}>Explore pre-built workflows</p>
              </div>
            </button>

            <button
              className="flex items-center gap-4 p-4 rounded-lg border border-dashed hover:border-solid hover:border-[#00C6FF] hover:shadow-[0_0_20px_rgba(0,198,255,0.5)] border-current hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all cursor-pointer"
              onClick={handleProjectTemplates}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#0072FF] to-[#4F7BF7] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className={`${textPrimary} text-sm mb-1`}>Project Templates</h3>
                <p className={`${textSecondary} text-xs`}>Start from pre-built projects</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${bgCard} border ${borderColor} rounded-xl p-8 mt-6`}>
          <h2 className={`${textPrimary} text-2xl mb-6`}>Recent Activity</h2>
          <div className="space-y-4">
            {[
              { title: 'Blog Post Generator completed', time: '2 minutes ago', type: 'success' },
              { title: 'YouTube Script workflow started', time: '15 minutes ago', type: 'info' },
              { title: 'SEO Optimizer finished processing', time: '1 hour ago', type: 'success' },
              { title: 'Social Media Post scheduled', time: '3 hours ago', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${borderColor} hover:bg-gradient-to-r hover:from-[#00C6FF]/5 hover:to-[#9D50BB]/5 transition-all`}>
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <h3 className={`${textPrimary} text-sm`}>{activity.title}</h3>
                    <p className={`${textSecondary} text-xs`}>{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}