import { X, DollarSign, TrendingUp, Users, Award, CheckCircle, ArrowUpRight, Clock, Zap, Target, Trophy, Star, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MyDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyDashboardModal({ isOpen, onClose }: MyDashboardModalProps) {
  const { theme } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const bgModal = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  // Mock data - Replace with real data from API
  const earningsData = {
    totalEarnings: 2450.75,
    currentMonthEarnings: 485.50,
    pendingBalance: 125.25,
    totalUsers: 1247,
  };

  const topWorkflows = [
    { id: 1, name: 'AI Content Generator', users: 324, earnings: 812.50 },
    { id: 2, name: 'Social Media Automation', users: 289, earnings: 722.25 },
    { id: 3, name: 'Email Marketing Suite', users: 256, earnings: 640.00 },
    { id: 4, name: 'Data Analysis Pipeline', users: 198, earnings: 495.00 },
    { id: 5, name: 'Customer Support Bot', users: 180, earnings: 450.00 },
  ];

  const earningsTrend = [
    { month: 'Jan', earnings: 280 },
    { month: 'Feb', earnings: 320 },
    { month: 'Mar', earnings: 380 },
    { month: 'Apr', earnings: 420 },
    { month: 'May', earnings: 460 },
    { month: 'Jun', earnings: 485 },
  ];

  const badges = [
    { id: 1, name: 'First $100', icon: DollarSign, earned: true, color: 'from-green-400 to-emerald-600' },
    { id: 2, name: '1K Users', icon: Users, earned: true, color: 'from-blue-400 to-cyan-600' },
    { id: 3, name: 'Top Creator', icon: Trophy, earned: false, color: 'from-yellow-400 to-orange-600' },
    { id: 4, name: '10K Users', icon: Star, earned: false, color: 'from-purple-400 to-pink-600' },
  ];

  const faqs = [
    {
      question: 'How does earning work?',
      answer: 'When users subscribe to Flowversal and use your published workflows, 20% of their subscription fee is distributed among workflow creators. If a user uses workflows from 4 creators (including you), you receive 5% of their subscription (20% ÷ 4 = 5%). For example, if 50 users with $100/month subscriptions use your workflow, you earn: 50 users × $100 × 5% = $250/month.'
    },
    {
      question: 'When do I get paid?',
      answer: 'Payments are processed monthly on the 1st of each month for the previous month\'s earnings. The minimum withdrawal amount is $50. Once you reach this threshold, your earnings will be automatically processed to your chosen payment method (PayPal, Bank Transfer, or UPI).'
    },
    {
      question: 'How to maximize earnings?',
      answer: 'To maximize earnings: 1) Create high-quality, useful workflows that solve real problems. 2) Publish your workflows as public to make them discoverable. 3) Optimize workflow titles and descriptions with relevant keywords. 4) Continuously improve based on user feedback. 5) Create multiple workflows across different categories to reach more users.'
    },
    {
      question: 'Tax information',
      answer: 'For Indian creators: Earnings are subject to TDS (Tax Deducted at Source) as per Indian Income Tax Act. For US creators: You will receive a 1099-MISC form if your annual earnings exceed $600. All creators should consult with a tax professional regarding their specific tax obligations. Flowversal provides detailed earning statements for tax filing purposes.'
    },
    {
      question: 'Workflow approval process for public publishing',
      answer: 'To publish a workflow publicly: 1) Complete your workflow with all necessary fields and nodes. 2) Submit for review from the workflow builder. 3) Our admin team reviews for quality, security, and compliance (typically 24-48 hours). 4) Once approved, your workflow becomes discoverable in the public marketplace. 5) You can track approval status in your workflow list.'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`${bgModal} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
        {/* Header */}
        <div className={`sticky top-0 ${bgModal} border-b ${borderColor} px-6 py-5 flex items-center justify-between z-10`}>
          <div>
            <h2 className={`text-2xl ${textPrimary}`}>My Dashboard</h2>
            <p className={`${textSecondary} text-sm mt-1`}>Track your earnings and workflow performance</p>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-lg ${hoverBg} flex items-center justify-center transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Earnings Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Earnings */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden group hover:border-[#00C6FF]/50 transition-all`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00C6FF]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF] to-[#0072FF] flex items-center justify-center`}>
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs ${textSecondary} bg-green-500/10 text-green-500 px-2 py-1 rounded-full`}>All-time</span>
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Total Earnings</p>
                <p className={`${textPrimary} text-3xl`}>${earningsData.totalEarnings.toFixed(2)}</p>
              </div>
            </div>

            {/* Current Month */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden group hover:border-[#9D50BB]/50 transition-all`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#9D50BB]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#9D50BB] to-[#7C3AED] flex items-center justify-center`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs ${textSecondary} bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full flex items-center gap-1`}>
                    <ArrowUpRight className="w-3 h-3" />
                    +12%
                  </span>
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Current Month</p>
                <p className={`${textPrimary} text-3xl`}>${earningsData.currentMonthEarnings.toFixed(2)}</p>
              </div>
            </div>

            {/* Pending Balance */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden group hover:border-yellow-500/50 transition-all`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center`}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs ${textSecondary} bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full`}>Pending</span>
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Pending Balance</p>
                <p className={`${textPrimary} text-3xl`}>${earningsData.pendingBalance.toFixed(2)}</p>
                <p className={`${textSecondary} text-xs mt-2`}>Min. withdrawal: $50</p>
              </div>
            </div>

            {/* Total Users */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden group hover:border-green-500/50 transition-all`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs ${textSecondary} bg-green-500/10 text-green-500 px-2 py-1 rounded-full`}>Active</span>
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Total Users</p>
                <p className={`${textPrimary} text-3xl`}>{earningsData.totalUsers.toLocaleString()}</p>
                <p className={`${textSecondary} text-xs mt-2`}>Using your workflows</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Earnings Trend Chart */}
            <div className={`lg:col-span-2 ${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <h3 className={`${textPrimary} text-lg mb-6`}>Earnings Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={earningsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A3E' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="month" 
                    stroke={theme === 'dark' ? '#CFCFE8' : '#6B7280'}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#CFCFE8' : '#6B7280'}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1A1A2E' : '#FFFFFF',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#FFFFFF' : '#1F2937'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="url(#colorGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#00C6FF', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00C6FF" />
                      <stop offset="100%" stopColor="#9D50BB" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Badges & Achievements */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <h3 className={`${textPrimary} text-lg mb-6`}>Achievements</h3>
              <div className="space-y-4">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div 
                      key={badge.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${badge.earned ? bgPanel : `${bgPanel} opacity-50`} transition-all`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center relative`}>
                        <Icon className="w-6 h-6 text-white" />
                        {badge.earned && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`${textPrimary} text-sm font-medium`}>{badge.name}</p>
                        <p className={`${textSecondary} text-xs`}>{badge.earned ? 'Earned' : 'Locked'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top 5 Workflows */}
          <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} text-lg mb-4`}>Top 5 Workflows by Earnings</h3>
            <div className="space-y-3">
              {topWorkflows.map((workflow, index) => (
                <div 
                  key={workflow.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${bgPanel} ${hoverBg} transition-all`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white font-semibold`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`${textPrimary} font-medium`}>{workflow.name}</p>
                      <p className={`${textSecondary} text-sm`}>{workflow.users} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`${textPrimary} font-semibold text-lg`}>${workflow.earnings.toFixed(2)}</p>
                    <p className={`${textSecondary} text-xs`}>This month</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to Earn Section */}
          <div className={`${bgCard} rounded-xl p-6 border ${borderColor} bg-gradient-to-br from-[#00C6FF]/5 to-[#9D50BB]/5`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`${textPrimary} text-lg`}>How to Earn</h3>
                <p className={`${textSecondary} text-sm`}>Start earning in 3 simple steps</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${inputBg} rounded-xl p-5 border ${borderColor}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#0072FF] flex items-center justify-center text-white font-bold mb-4">
                  1
                </div>
                <h4 className={`${textPrimary} font-semibold mb-2`}>Create Workflow</h4>
                <p className={`${textSecondary} text-sm`}>Build amazing workflows that solve real problems for users.</p>
              </div>

              <div className={`${inputBg} rounded-xl p-5 border ${borderColor}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0072FF] to-[#9D50BB] flex items-center justify-center text-white font-bold mb-4">
                  2
                </div>
                <h4 className={`${textPrimary} font-semibold mb-2`}>Publish as Public</h4>
                <p className={`${textSecondary} text-sm`}>Submit your workflow for admin approval and publish to marketplace.</p>
              </div>

              <div className={`${inputBg} rounded-xl p-5 border ${borderColor}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9D50BB] to-[#7C3AED] flex items-center justify-center text-white font-bold mb-4">
                  3
                </div>
                <h4 className={`${textPrimary} font-semibold mb-2`}>Earn Monthly</h4>
                <p className={`${textSecondary} text-sm`}>Get 20% share of subscription fees from users using your workflows.</p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} text-lg mb-4`}>Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className={`${bgPanel} rounded-lg border ${borderColor} overflow-hidden transition-all`}
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className={`w-full flex items-center justify-between p-4 text-left ${hoverBg} transition-all`}
                  >
                    <span className={`${textPrimary} font-medium`}>{faq.question}</span>
                    <ChevronRight className={`w-5 h-5 ${textSecondary} transition-transform ${expandedFAQ === index ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedFAQ === index && (
                    <div className={`px-4 pb-4 ${textSecondary} text-sm leading-relaxed`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
