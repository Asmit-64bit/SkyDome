import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface PixelTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const PixelTabs: React.FC<PixelTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto p-1 bg-[#E8DEC7] border-2 border-[#C9B997] rounded-xs ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-sans font-semibold transition-all cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#E3B341] ${
              isActive
                ? 'bg-[#E3B341] text-[#2B2118] border-t-2 border-l-2 border-[#FBE186] border-r-2 border-b-2 border-[#99701A] font-bold shadow-xs'
                : 'bg-[#FAF6ED] text-[#5A4D3F] border-t border-l border-white border-r border-b border-[#C3B497] hover:bg-[#F3EAD7]'
            }`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-xs font-sans ${
                  isActive
                    ? 'bg-[#2B2118] text-[#E3B341] font-bold'
                    : 'bg-[#E2D5BA] text-[#4A3D2F]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
