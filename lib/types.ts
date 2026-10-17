export type QuestPriority = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  priority: QuestPriority;
  completed: boolean;
  /** Prevents duplicate XP and coin payouts after unchecking or undoing completion. */
  rewardClaimed?: boolean;
  completedAt?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  tags: string[];
  subtasks: Subtask[];
  xpReward: number;
  coinReward: number;
  order: number;
  createdAt: string;
}

export type MinionCategory = 'farming' | 'mining' | 'foraging' | 'combat' | 'fishing';
export type MinionIcon = 'wheat' | 'wood' | 'iron' | 'stone' | 'water' | 'carrot' | 'diamond' | 'book';

export interface Minion {
  id: string;
  name: string;
  habit: string;
  category: MinionCategory;
  resourceName: string;
  iconType: MinionIcon;
  frequency: 'daily' | 'weekly';
  streak: number;
  bestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  level: number;
  totalProduced: number;
}

export type MiningBlockType = 'stone' | 'iron' | 'gold' | 'diamond';
export type MiningTimerMode = 'focus' | 'short_break' | 'long_break';

export interface IslandLevelUpInfo {
  level: number;
  unlockedPerks: string[];
}

export interface MiningState {
  mode: MiningTimerMode;
  state: 'idle' | 'running' | 'paused' | 'finished';
  secondsRemaining: number;
  totalFocusMinutesCompleted: number;
  linkedQuestId?: string;
  currentBlock: MiningBlockType;
  crackStage: number; // 0 to 5
  oresMined: {
    stone: number;
    iron: number;
    gold: number;
    diamond: number;
  };
  endTimestamp?: number;
  lastTickTimestamp?: number;
}

export type SkillType = 'farming' | 'mining' | 'combat' | 'foraging' | 'fishing';

export interface SkillMilestone {
  level: number;
  perk: string;
  unlocked: boolean;
}

export interface Skill {
  id: SkillType;
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  description: string;
  color: string;
  milestones: SkillMilestone[];
}

export interface LibraryNote {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IslandTheme = 'day' | 'sunset' | 'cloudy' | 'night' | 'galaxy';
export type NumberFontStyle = 'tabular' | 'clean' | 'silkscreen' | 'pixel';

export interface ShopItem {
  id: string;
  name: string;
  category: 'pet' | 'house' | 'decoration' | 'tree' | 'farm' | 'water' | 'theme';
  price: number;
  oreCost?: Partial<Record<MiningBlockType, number>>;
  farmCrop?: 'wheat' | 'carrot' | 'potato' | 'beetroot' | 'melon' | 'pumpkin' | 'sugarcane';
  farmIncome?: number;
  description: string;
  ability?: string;
  owned: boolean;
  equipped: boolean;
  requiredLevel?: number;
  icon: string;
}

export interface DailyChestState {
  lastClaimDate?: string; // YYYY-MM-DD
  claimStreak: number;
}

export interface ChestRewardResult {
  coins: number;
  xp: number;
  bonusOre?: MiningBlockType;
  bonusOreCount?: number;
  streakDay: number;
  alreadyClaimed?: boolean;
}

export interface IslandSettings {
  islandName: string;
  islandTitle: string;
  theme: IslandTheme;
  numberFont: NumberFontStyle;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  reducedMotion: boolean;
  timerSettings: {
    focus: number; // in minutes
    shortBreak: number;
    longBreak: number;
    autoStartBreaks: boolean;
  };
  onboardingCompleted: boolean;
}

export interface UndoItem {
  id: string;
  type: 'quest_delete' | 'quest_complete' | 'note_delete' | 'minion_delete' | 'notice';
  title: string;
  data: { id?: string; quest?: Quest; note?: LibraryNote; minion?: Minion };
  timestamp: number;
}

export type ActiveTab = 'island' | 'quests' | 'minions' | 'mining' | 'skills' | 'library' | 'chest' | 'calendar' | 'settings';
