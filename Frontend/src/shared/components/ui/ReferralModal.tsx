import { X, Copy, Share2, Users, Gift, Trophy, Star, Crown, Award, Mail, MessageCircle, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { theme } = useTheme();
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  const bgModal = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  // Mock data - Replace with real data from API
  const referralCode = 'FLOW-JD2024';
  const affiliateLink = 'https://flowversal.com/ref/FLOW-JD2024';
  
  const referralStats = {
    totalReferrals: 15,
    activeCreators: 12,
    bonusEarned: 450.00,
    pendingBonus: 75.00,
  };

  const creatorTiers = [
    {
      name: 'Bronze',
      icon: Award,
      minEarnings: 0,
      maxEarnings: 1000,
      color: 'from-orange-400 to-amber-600',
      benefits: ['Basic creator badge', '5% referral bonus', 'Email support'],
      current: false,
    },
    {
      name: 'Silver',
      icon: Star,
      minEarnings: 1000,
      maxEarnings: 5000,
      color: 'from-gray-300 to-gray-500',
      benefits: ['Silver creator badge', '7.5% referral bonus', 'Priority email support', 'Featured in marketplace'],
      current: true,
    },
    {
      name: 'Gold',
      icon: Trophy,
      minEarnings: 5000,
      maxEarnings: 10000,
      color: 'from-yellow-400 to-yellow-600',
      benefits: ['Gold creator badge', '10% referral bonus', 'Priority support', 'Featured in homepage', 'Monthly creator spotlight'],
      current: false,
    },
    {
      name: 'Platinum',
      icon: Crown,
      minEarnings: 10000,
      maxEarnings: Infinity,
      color: 'from-purple-400 to-pink-600',
      benefits: ['Platinum creator badge', '15% referral bonus', 'Dedicated account manager', 'Premium placement', 'Exclusive events access', 'Early feature access'],
      current: false,
    },
  ];

  const recentReferrals = [
    { id: 1, name: 'Sarah Johnson', status: 'Active', earned: '$25', date: '2 days ago' },
    { id: 2, name: 'Mike Chen', status: 'Active', earned: '$25', date: '5 days ago' },
    { id: 3, name: 'Emily Davis', status: 'Pending', earned: '$0', date: '1 week ago' },
    { id: 4, name: 'Alex Turner', status: 'Active', earned: '$25', date: '2 weeks ago' },
  ];

  const copyToClipboard = (text: string, type: 'referral' | 'affiliate') => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          if (type === 'referral') {
            setCopiedReferral(true);
            setTimeout(() => setCopiedReferral(false), 2000);
          } else {
            setCopiedAffiliate(true);
            setTimeout(() => setCopiedAffiliate(false), 2000);
          }
        })
        .catch(() => {
          // Fallback to legacy method
          copyToClipboardFallback(text, type);
        });
    } else {
      // Use fallback for older browsers or when clipboard API is blocked
      copyToClipboardFallback(text, type);
    }
  };

  const copyToClipboardFallback = (text: string, type: 'referral' | 'affiliate') => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      if (type === 'referral') {
        setCopiedReferral(true);
        setTimeout(() => setCopiedReferral(false), 2000);
      } else {
        setCopiedAffiliate(true);
        setTimeout(() => setCopiedAffiliate(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    
    textArea.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`${bgModal} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
        {/* Header */}
        <div className={`sticky top-0 ${bgModal} border-b ${borderColor} px-6 py-5 flex items-center justify-between z-10`}>
          <div>
            <h2 className={`text-2xl ${textPrimary}`}>Referral Program</h2>
            <p className={`${textSecondary} text-sm mt-1`}>Invite creators and earn bonus rewards</p>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-lg ${hoverBg} flex items-center justify-center transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Referral Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00C6FF]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF] to-[#0072FF] flex items-center justify-center mb-3`}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Total Referrals</p>
                <p className={`${textPrimary} text-3xl`}>{referralStats.totalReferrals}</p>
              </div>
            </div>

            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3`}>
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Active Creators</p>
                <p className={`${textPrimary} text-3xl`}>{referralStats.activeCreators}</p>
              </div>
            </div>

            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#9D50BB]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#9D50BB] to-[#7C3AED] flex items-center justify-center mb-3`}>
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Bonus Earned</p>
                <p className={`${textPrimary} text-3xl`}>${referralStats.bonusEarned.toFixed(2)}</p>
              </div>
            </div>

            <div className={`${bgCard} rounded-xl p-6 border ${borderColor} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-3`}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <p className={`${textSecondary} text-sm mb-1`}>Pending Bonus</p>
                <p className={`${textPrimary} text-3xl`}>${referralStats.pendingBonus.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Referral Code & Affiliate Link */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Code */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <h3 className={`${textPrimary} text-lg mb-4 flex items-center gap-2`}>
                <Gift className="w-5 h-5 text-[#00C6FF]" />
                Your Referral Code
              </h3>
              <div className={`${bgPanel} rounded-lg p-4 border ${borderColor} mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <code className={`${textPrimary} text-xl font-mono`}>{referralCode}</code>
                  <button
                    onClick={() => copyToClipboard(referralCode, 'referral')}
                    className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg transition-all flex items-center gap-2`}
                  >
                    {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedReferral ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className={`${textSecondary} text-sm`}>Share this code with other creators</p>
              </div>
              <div className="flex gap-2">
                <button className={`flex-1 px-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${hoverBg} transition-all flex items-center justify-center gap-2`}>
                  <Mail className="w-4 h-4" />
                  <span className={`${textPrimary} text-sm`}>Email</span>
                </button>
                <button className={`flex-1 px-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${hoverBg} transition-all flex items-center justify-center gap-2`}>
                  <MessageCircle className="w-4 h-4" />
                  <span className={`${textPrimary} text-sm`}>Message</span>
                </button>
                <button className={`flex-1 px-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${hoverBg} transition-all flex items-center justify-center gap-2`}>
                  <Share2 className="w-4 h-4" />
                  <span className={`${textPrimary} text-sm`}>Share</span>
                </button>
              </div>
            </div>

            {/* Affiliate Link */}
            <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
              <h3 className={`${textPrimary} text-lg mb-4 flex items-center gap-2`}>
                <Share2 className="w-5 h-5 text-[#9D50BB]" />
                Affiliate Link
              </h3>
              <div className={`${bgPanel} rounded-lg p-4 border ${borderColor} mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <code className={`${textPrimary} text-sm font-mono truncate flex-1 mr-3`}>{affiliateLink}</code>
                  <button
                    onClick={() => copyToClipboard(affiliateLink, 'affiliate')}
                    className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#9D50BB] to-[#7C3AED] text-white hover:shadow-lg transition-all flex items-center gap-2 flex-shrink-0`}
                  >
                    {copiedAffiliate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedAffiliate ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className={`${textSecondary} text-sm`}>Share this link on social media or your website</p>
              </div>
              <p className={`${textSecondary} text-sm mb-3`}>Earn <span className="text-[#00C6FF] font-semibold">$25</span> for each creator who signs up and creates their first public workflow!</p>
            </div>
          </div>

          {/* Creator Tier System */}
          <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} text-lg mb-6`}>Creator Tier System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {creatorTiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div 
                    key={tier.name}
                    className={`${tier.current ? `${bgPanel} border-2 border-[#00C6FF]` : bgPanel} rounded-xl p-5 border ${tier.current ? '' : borderColor} relative overflow-hidden transition-all`}
                  >
                    {tier.current && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#00C6FF] text-white text-xs font-semibold">
                        Current
                      </div>
                    )}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className={`${textPrimary} font-semibold text-center mb-2`}>{tier.name}</h4>
                    <p className={`${textSecondary} text-xs text-center mb-4`}>
                      ${tier.minEarnings.toLocaleString()}
                      {tier.maxEarnings !== Infinity ? ` - $${tier.maxEarnings.toLocaleString()}` : '+'}
                    </p>
                    <div className="space-y-2">
                      {tier.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 text-green-500 flex-shrink-0 mt-0.5`} />
                          <span className={`${textSecondary} text-xs`}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Referrals */}
          <div className={`${bgCard} rounded-xl p-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} text-lg mb-4`}>Recent Referrals</h3>
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <div 
                  key={referral.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${bgPanel} ${hoverBg} transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white font-semibold">
                      {referral.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className={`${textPrimary} font-medium`}>{referral.name}</p>
                      <p className={`${textSecondary} text-sm`}>{referral.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`${textPrimary} font-semibold`}>{referral.earned}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        referral.status === 'Active' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {referral.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support & Help */}
          <div className={`${bgCard} rounded-xl p-6 border ${borderColor} bg-gradient-to-br from-[#00C6FF]/5 to-[#9D50BB]/5`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className={`${textPrimary} text-lg mb-2 flex items-center gap-2`}>
                  <ExternalLink className="w-5 h-5 text-[#00C6FF]" />
                  Need Help?
                </h3>
                <p className={`${textSecondary} text-sm`}>
                  Visit our help center for guides, tutorials, and FAQs about the referral program.
                </p>
              </div>
              <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">
                <ExternalLink className="w-4 h-4" />
                Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}