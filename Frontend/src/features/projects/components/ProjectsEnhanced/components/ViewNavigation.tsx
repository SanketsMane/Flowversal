import { Home, LayoutGrid, Users } from 'lucide-react';

interface ViewNavigationProps {
  mainView: 'home' | 'board' | 'my-tasks';
  onViewChange: (view: 'home' | 'board' | 'my-tasks') => void;
  textPrimary: string;
  textSecondary: string;
  bgPanel: string;
  hoverBg: string;
}

export function ViewNavigation({
  mainView,
  onViewChange,
  textPrimary,
  textSecondary,
  bgPanel,
  hoverBg,
}: ViewNavigationProps) {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'board' as const,
      label: 'Board',
      icon: LayoutGrid,
    },
    {
      id: 'my-tasks' as const,
      label: 'My Tasks',
      icon: Users,
    },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = mainView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white shadow-lg'
                : `${bgPanel} ${hoverBg} ${textPrimary}`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
