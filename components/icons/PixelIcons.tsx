import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function IconIsland({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Skyblock Island */}
      <rect x="2" y="5" width="12" height="3" fill="#5FA244" />
      <rect x="4" y="4" width="8" height="2" fill="#75BA57" />
      <rect x="3" y="8" width="10" height="3" fill="#8B5A2B" />
      <rect x="5" y="11" width="6" height="2" fill="#5E3B1C" />
      <rect x="7" y="13" width="2" height="2" fill="#4B4E52" />
      {/* Small sapling */}
      <rect x="7" y="2" width="2" height="2" fill="#3F7A2E" />
      <rect x="7" y="4" width="2" height="1" fill="#6B4A2B" />
    </svg>
  );
}

export function IconQuest({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Scroll */}
      <rect x="3" y="2" width="10" height="12" fill="#FAF6ED" stroke="#6B4A2B" strokeWidth="1" />
      <rect x="5" y="5" width="6" height="1" fill="#8A8D91" />
      <rect x="5" y="8" width="4" height="1" fill="#8A8D91" />
      <rect x="5" y="11" width="5" height="1" fill="#8A8D91" />
      {/* Seal */}
      <rect x="10" y="9" width="3" height="3" fill="#E3B341" />
    </svg>
  );
}

export function IconMinion({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Cute Block Head */}
      <rect x="3" y="3" width="10" height="8" fill="#B98E55" />
      <rect x="4" y="2" width="8" height="2" fill="#CFA46B" />
      {/* Eyes */}
      <rect x="5" y="6" width="2" height="2" fill="#2B2118" />
      <rect x="9" y="6" width="2" height="2" fill="#2B2118" />
      {/* Cheeks */}
      <rect x="4" y="8" width="1" height="1" fill="#D97736" />
      <rect x="11" y="8" width="1" height="1" fill="#D97736" />
      {/* Body / Overalls */}
      <rect x="4" y="11" width="8" height="3" fill="#4B4E52" />
      <rect x="6" y="12" width="4" height="2" fill="#E3B341" />
    </svg>
  );
}

export function IconPickaxe({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Pickaxe Head */}
      <rect x="9" y="2" width="5" height="2" fill="#8A8D91" />
      <rect x="13" y="4" width="2" height="3" fill="#4B4E52" />
      <rect x="7" y="2" width="3" height="2" fill="#C7C9CC" />
      <rect x="6" y="4" width="2" height="1" fill="#C7C9CC" />
      <rect x="5" y="5" width="2" height="2" fill="#8A8D91" />
      {/* Handle */}
      <rect x="7" y="7" width="2" height="2" fill="#8B5A2B" />
      <rect x="5" y="9" width="2" height="2" fill="#B98E55" />
      <rect x="3" y="11" width="2" height="2" fill="#6B4A2B" />
      <rect x="2" y="12" width="2" height="2" fill="#5E3B1C" />
    </svg>
  );
}

export function IconSword({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Blade */}
      <rect x="12" y="2" width="2" height="2" fill="#C7C9CC" />
      <rect x="10" y="4" width="3" height="2" fill="#8A8D91" />
      <rect x="8" y="6" width="3" height="2" fill="#C7C9CC" />
      <rect x="6" y="8" width="3" height="2" fill="#8A8D91" />
      {/* Crossguard */}
      <rect x="4" y="10" width="3" height="2" fill="#E3B341" />
      <rect x="7" y="10" width="2" height="1" fill="#B88B27" />
      <rect x="4" y="8" width="1" height="2" fill="#B88B27" />
      {/* Handle & Pommel */}
      <rect x="3" y="11" width="2" height="2" fill="#6B4A2B" />
      <rect x="2" y="13" width="2" height="2" fill="#E3B341" />
    </svg>
  );
}

export function IconHoe({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Hoe Blade */}
      <rect x="8" y="2" width="6" height="2" fill="#5FA244" />
      <rect x="12" y="4" width="2" height="3" fill="#3F7A2E" />
      {/* Handle */}
      <rect x="7" y="5" width="2" height="2" fill="#8B5A2B" />
      <rect x="5" y="7" width="2" height="2" fill="#B98E55" />
      <rect x="3" y="9" width="2" height="2" fill="#6B4A2B" />
      <rect x="2" y="11" width="2" height="3" fill="#5E3B1C" />
    </svg>
  );
}

export function IconAxe({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Axe Head */}
      <rect x="8" y="2" width="5" height="4" fill="#8A8D91" />
      <rect x="11" y="4" width="3" height="3" fill="#C7C9CC" />
      <rect x="8" y="6" width="3" height="2" fill="#4B4E52" />
      {/* Handle */}
      <rect x="6" y="6" width="2" height="3" fill="#8B5A2B" />
      <rect x="4" y="9" width="2" height="3" fill="#B98E55" />
      <rect x="2" y="12" width="2" height="2" fill="#5E3B1C" />
    </svg>
  );
}

export function IconFishingRod({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Rod */}
      <rect x="13" y="1" width="2" height="2" fill="#6B4A2B" />
      <rect x="10" y="3" width="3" height="2" fill="#8B5A2B" />
      <rect x="7" y="5" width="3" height="2" fill="#B98E55" />
      <rect x="4" y="7" width="3" height="2" fill="#B98E55" />
      <rect x="2" y="9" width="2" height="5" fill="#5E3B1C" />
      {/* Line & hook */}
      <rect x="13" y="3" width="1" height="9" fill="#E6DCBF" />
      <rect x="11" y="12" width="3" height="1" fill="#4AA3B5" />
      <rect x="11" y="11" width="1" height="1" fill="#4AA3B5" />
    </svg>
  );
}

export function IconSkills({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Star / Medal */}
      <rect x="6" y="2" width="4" height="2" fill="#E3B341" />
      <rect x="4" y="4" width="8" height="2" fill="#FBE186" />
      <rect x="2" y="6" width="12" height="4" fill="#E3B341" />
      <rect x="4" y="10" width="8" height="2" fill="#B88B27" />
      <rect x="6" y="12" width="4" height="2" fill="#99701A" />
      <rect x="7" y="7" width="2" height="2" fill="#FAF6ED" />
    </svg>
  );
}

export function IconLibrary({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Leather Book */}
      <rect x="3" y="2" width="10" height="12" fill="#8B5A2B" />
      <rect x="2" y="2" width="2" height="12" fill="#5E3B1C" />
      <rect x="5" y="4" width="7" height="8" fill="#FAF6ED" />
      <rect x="6" y="6" width="5" height="1" fill="#6B4A2B" />
      <rect x="6" y="8" width="4" height="1" fill="#6B4A2B" />
      <rect x="6" y="10" width="5" height="1" fill="#6B4A2B" />
      <rect x="4" y="1" width="2" height="3" fill="#B3392F" />
    </svg>
  );
}

export function IconChest({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Chest body */}
      <rect x="2" y="3" width="12" height="10" fill="#B98E55" />
      <rect x="2" y="3" width="12" height="2" fill="#6B4A2B" />
      <rect x="2" y="8" width="12" height="1" fill="#4B4E52" />
      <rect x="2" y="12" width="12" height="1" fill="#5E3B1C" />
      <rect x="2" y="3" width="1" height="10" fill="#6B4A2B" />
      <rect x="13" y="3" width="1" height="10" fill="#6B4A2B" />
      {/* Iron / Gold latch */}
      <rect x="7" y="7" width="2" height="3" fill="#E3B341" />
      <rect x="7" y="8" width="2" height="1" fill="#2B2118" />
    </svg>
  );
}

export function IconCalendar({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Calendar */}
      <rect x="2" y="2" width="12" height="12" fill="#FAF6ED" stroke="#6B4A2B" strokeWidth="1" />
      <rect x="2" y="2" width="12" height="3" fill="#B3392F" />
      <rect x="4" y="1" width="2" height="2" fill="#4B4E52" />
      <rect x="10" y="1" width="2" height="2" fill="#4B4E52" />
      {/* Days grid */}
      <rect x="4" y="7" width="2" height="2" fill="#8A8D91" />
      <rect x="7" y="7" width="2" height="2" fill="#E3B341" />
      <rect x="10" y="7" width="2" height="2" fill="#8A8D91" />
      <rect x="4" y="10" width="2" height="2" fill="#5FA244" />
      <rect x="7" y="10" width="2" height="2" fill="#8A8D91" />
      <rect x="10" y="10" width="2" height="2" fill="#4AA3B5" />
    </svg>
  );
}

export function IconSettings({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Stone Gear */}
      <rect x="6" y="2" width="4" height="12" fill="#8A8D91" />
      <rect x="2" y="6" width="12" height="4" fill="#8A8D91" />
      <rect x="4" y="4" width="8" height="8" fill="#8A8D91" />
      <rect x="5" y="5" width="6" height="6" fill="#C7C9CC" />
      <rect x="7" y="7" width="2" height="2" fill="#4B4E52" />
    </svg>
  );
}

export function IconCampfire({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Wood Base */}
      <rect x="2" y="12" width="12" height="2" fill="#6B4A2B" />
      <rect x="4" y="10" width="8" height="2" fill="#8B5A2B" />
      {/* Animated Fire Pixels */}
      <g className="animate-flame origin-bottom">
        <rect x="6" y="3" width="4" height="3" fill="#B3392F" />
        <rect x="5" y="5" width="6" height="4" fill="#D97736" />
        <rect x="7" y="6" width="2" height="3" fill="#E3B341" />
        <rect x="7" y="2" width="2" height="2" fill="#E3B341" />
      </g>
    </svg>
  );
}

export function IconCoin({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel inline-block ${className}`} {...props}>
      <rect x="4" y="2" width="8" height="12" fill="#E3B341" />
      <rect x="2" y="4" width="12" height="8" fill="#E3B341" />
      <rect x="5" y="3" width="6" height="10" fill="#FBE186" />
      <rect x="3" y="5" width="10" height="6" fill="#FBE186" />
      <rect x="6" y="5" width="4" height="6" fill="#E3B341" />
      <rect x="7" y="6" width="2" height="4" fill="#99701A" />
    </svg>
  );
}

export function IconOre({ type = 'stone', size = 24, className = '', ...props }: IconProps & { type?: 'stone' | 'iron' | 'gold' | 'diamond' }) {
  if (type === 'stone') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
        {/* Base Cobblestone Block */}
        <rect x="1" y="1" width="14" height="14" fill="#93969B" />
        <rect x="1" y="1" width="14" height="1" fill="#C7C9CC" />
        <rect x="1" y="1" width="1" height="14" fill="#C7C9CC" />
        <rect x="14" y="1" width="1" height="14" fill="#6A6D71" />
        <rect x="1" y="14" width="14" height="1" fill="#6A6D71" />
        {/* Top-left rock facet */}
        <rect x="2" y="2" width="5" height="4" fill="#A8ACB2" />
        <rect x="2" y="2" width="4" height="1" fill="#D3D7DC" />
        {/* Top-right rock facet */}
        <rect x="8" y="2" width="6" height="3" fill="#888B90" />
        <rect x="8" y="2" width="4" height="1" fill="#BAC0C7" />
        {/* Mid-left rock facet */}
        <rect x="2" y="7" width="6" height="4" fill="#808388" />
        <rect x="2" y="7" width="4" height="1" fill="#BAC0C7" />
        {/* Mid-right rock facet */}
        <rect x="9" y="6" width="5" height="4" fill="#A8ACB2" />
        <rect x="9" y="6" width="4" height="1" fill="#D3D7DC" />
        {/* Bottom rock facets */}
        <rect x="2" y="12" width="5" height="2" fill="#A8ACB2" />
        <rect x="8" y="11" width="6" height="3" fill="#888B90" />
        {/* Thin subtle mortar crevices */}
        <rect x="1" y="6" width="14" height="1" fill="#65686D" />
        <rect x="1" y="11" width="14" height="1" fill="#65686D" />
        <rect x="7" y="1" width="1" height="5" fill="#65686D" />
        <rect x="8" y="6" width="1" height="5" fill="#65686D" />
      </svg>
    );
  }

  const gemColors = {
    iron: '#D4AF87',
    gold: '#E3B341',
    diamond: '#4AA3B5',
  };
  const color = gemColors[type] || '#D4AF87';

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      {/* Base Stone Block */}
      <rect x="1" y="1" width="14" height="14" fill="#8A8D91" />
      <rect x="1" y="1" width="14" height="2" fill="#C7C9CC" />
      <rect x="1" y="1" width="2" height="14" fill="#C7C9CC" />
      <rect x="13" y="1" width="2" height="14" fill="#5E6166" />
      <rect x="1" y="13" width="14" height="2" fill="#5E6166" />
      {/* Embedded mineral flecks */}
      <rect x="4" y="4" width="2" height="2" fill={color} />
      <rect x="5" y="5" width="3" height="2" fill={color} />
      <rect x="10" y="5" width="2" height="3" fill={color} />
      <rect x="9" y="10" width="3" height="2" fill={color} />
      <rect x="4" y="9" width="3" height="2" fill={color} />
      <rect x="3" y="10" width="2" height="2" fill={color} />
    </svg>
  );
}

export function IconCheck({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      <rect x="12" y="3" width="2" height="2" fill="currentColor" />
      <rect x="10" y="5" width="2" height="2" fill="currentColor" />
      <rect x="8" y="7" width="2" height="2" fill="currentColor" />
      <rect x="6" y="9" width="2" height="2" fill="currentColor" />
      <rect x="4" y="7" width="2" height="2" fill="currentColor" />
      <rect x="2" y="5" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

export function IconPlus({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      <rect x="7" y="3" width="2" height="10" fill="currentColor" />
      <rect x="3" y="7" width="10" height="2" fill="currentColor" />
    </svg>
  );
}

export function IconTrash({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      <rect x="3" y="4" width="10" height="10" fill="currentColor" />
      <rect x="2" y="2" width="12" height="2" fill="currentColor" />
      <rect x="6" y="1" width="4" height="1" fill="currentColor" />
      <rect x="5" y="6" width="2" height="6" fill="#FAF6ED" />
      <rect x="9" y="6" width="2" height="6" fill="#FAF6ED" />
    </svg>
  );
}

export function IconSound({ muted = false, size = 18, className = '', ...props }: IconProps & { muted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      <rect x="2" y="5" width="3" height="6" fill="currentColor" />
      <rect x="5" y="3" width="3" height="10" fill="currentColor" />
      {!muted ? (
        <>
          <rect x="10" y="5" width="2" height="6" fill="currentColor" />
          <rect x="13" y="3" width="2" height="10" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="10" y="4" width="2" height="2" fill="#B3392F" />
          <rect x="12" y="6" width="2" height="2" fill="#B3392F" />
          <rect x="14" y="8" width="2" height="2" fill="#B3392F" />
          <rect x="14" y="4" width="2" height="2" fill="#B3392F" />
          <rect x="10" y="8" width="2" height="2" fill="#B3392F" />
        </>
      )}
    </svg>
  );
}

export function IconSparkle({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      <rect x="7" y="2" width="2" height="12" fill="#E3B341" />
      <rect x="2" y="7" width="12" height="2" fill="#E3B341" />
      <rect x="5" y="5" width="6" height="6" fill="#FBE186" />
      <rect x="7" y="7" width="2" height="2" fill="#FFFFFF" />
    </svg>
  );
}

export function IconSearch({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      <rect x="3" y="3" width="7" height="2" fill="currentColor" />
      <rect x="3" y="8" width="7" height="2" fill="currentColor" />
      <rect x="2" y="4" width="2" height="5" fill="currentColor" />
      <rect x="9" y="4" width="2" height="5" fill="currentColor" />
      <rect x="8" y="8" width="2" height="2" fill="currentColor" />
      <rect x="10" y="10" width="2" height="2" fill="currentColor" />
      <rect x="12" y="12" width="3" height="3" fill="currentColor" />
    </svg>
  );
}

export function IconFilter({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`crisp-pixel ${className}`} {...props}>
      <rect x="2" y="2" width="12" height="2" fill="currentColor" />
      <rect x="4" y="5" width="8" height="2" fill="currentColor" />
      <rect x="6" y="8" width="4" height="2" fill="currentColor" />
      <rect x="7" y="10" width="2" height="4" fill="currentColor" />
    </svg>
  );
}
