import React from 'react';

export interface PixelPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'parchment' | 'stone' | 'wood' | 'slot' | 'slot-light';
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PixelPanel: React.FC<PixelPanelProps> = ({
  variant = 'parchment',
  title,
  icon,
  actions,
  children,
  className = '',
  ...props
}) => {
  const panelStyles = {
    parchment: 'pixel-panel-parchment text-[#2B2118]',
    stone: 'pixel-panel-stone text-[#F4EFE6]',
    wood: 'pixel-panel-wood text-[#F4EFE6]',
    slot: 'pixel-slot text-[#F4EFE6]',
    'slot-light': 'pixel-slot-light text-[#2B2118]',
  };

  return (
    <div className={`p-4 ${panelStyles[variant]} ${className}`} {...props}>
      {(title || actions || icon) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {title && (
              <h3 className="font-pixel text-base tracking-wide font-medium">
                {title}
              </h3>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
