import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Quest,
  Minion,
  MiningState,
  Skill,
  SkillType,
  LibraryNote,
  ShopItem,
  UndoItem,
  ActiveTab,
  MiningBlockType,
  MiningTimerMode,
  NumberFontStyle,
  IslandLevelUpInfo,
  DailyChestState,
  ChestRewardResult,
  IslandTheme,
} from '../lib/types';
import { soundManager } from '../lib/sound';

interface SkyDoState {
  // Navigation & modals
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  quickAddModalOpen: boolean;
  setQuickAddModalOpen: (open: boolean) => void;
  levelUpModal: IslandLevelUpInfo | null;
  setLevelUpModal: (info: IslandLevelUpInfo | null) => void;

  // Island Stats
  islandName: string;
  islandTitle: string;
  islandLevel: number;
  totalXp: number;
  dailyXp: number;
  dailyXpDate: string;
  dailyXpGoal: number;
  coins: number;
  testCoinGrantApplied: boolean;
  testLevelGrantApplied: boolean;
  grantTestCoinsForDevelopment: () => void;
  grantTestLevelForDevelopment: () => void;
  streak: number;
  lastActiveDate: string;
  theme: IslandTheme;
  numberFont: NumberFontStyle;
  setNumberFont: (font: NumberFontStyle) => void;
  soundEnabled: boolean;
  soundVolume: number;
  reducedMotion: boolean;
  timerSettings: {
    focus: number;
    shortBreak: number;
    longBreak: number;
    autoStartBreaks: boolean;
  };
  onboardingCompleted: boolean;

  // Quests
  quests: Quest[];
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'order' | 'completed'>) => void;
  editQuest: (id: string, updates: Partial<Quest>) => void;
  toggleQuest: (id: string) => void;
  deleteQuest: (id: string) => void;
  reorderQuests: (newOrder: Quest[]) => void;
  addSubtask: (questId: string, title: string) => void;
  toggleSubtask: (questId: string, subtaskId: string) => void;
  deleteSubtask: (questId: string, subtaskId: string) => void;

  // Minions (Habits)
  minions: Minion[];
  addMinion: (minion: Omit<Minion, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'level' | 'totalProduced'>) => void;
  editMinion: (id: string, updates: Partial<Minion>) => void;
  deleteMinion: (id: string) => void;
  checkMinionToday: (id: string) => void;
  harvestAllMinions: () => { count: number; totalCoins: number; totalXp: number };
  harvestFarm: () => { coins: number; crop: string } | null;
  farmLastHarvestDate?: string;
  toggleMinionDate: (id: string, date: string) => void;
  upgradeMinion: (id: string) => void;

  // Mining / Focus Timer
  mining: MiningState;
  startMiningTimer: () => void;
  pauseMiningTimer: () => void;
  resumeMiningTimer: () => void;
  resetMiningTimer: () => void;
  tickMiningTimer: () => void;
  clickMineBlock: () => { hit: boolean; bonusSecs: number; finished: boolean };
  finishMiningTimer: () => void;
  setMiningMode: (mode: MiningTimerMode) => void;
  setMiningBlock: (block: MiningBlockType) => void;
  linkMiningQuest: (questId?: string) => void;
  completeLinkedMiningQuest: () => void;

  // Skills
  skills: Record<SkillType, Skill>;
  addSkillXp: (skill: SkillType, amount: number) => void;

  // Library Notes
  notes: LibraryNote[];
  addNote: (note: Omit<LibraryNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<LibraryNote>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Chest & Shop
  shopItems: ShopItem[];
  dailyChest: DailyChestState;
  buyShopItem: (id: string) => void;
  equipShopItem: (id: string) => void;
  openChestReward: () => ChestRewardResult | null;

  // Settings & Storage
  setIslandName: (name: string) => void;
  setIslandTitle: (title: string) => void;
  setTheme: (theme: IslandTheme) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  setTimerSettings: (settings: { focus: number; shortBreak: number; longBreak: number; autoStartBreaks: boolean }) => void;
  setOnboardingCompleted: (completed: boolean) => void;

  // Undo Toast
  undoToast: UndoItem | null;
  setUndoToast: (item: UndoItem | null) => void;
  performUndo: () => void;

  // Import / Export / Reset
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  resetAllData: () => void;
}

// Generate today date string YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const ISLAND_LEVEL_PERKS: Record<number, string[]> = {
  2: ['Bazaar offer unlocked: Majestic Oak Tree (purchase to place) 🌳', '+5% Base XP harvest multiplier'],
  3: ['Bazaar offer unlocked: Cozy Timber Cabin (purchase to place) 🏡', '+10% Habit coin yield'],
  4: ['Unlocked: Deep Ore Veins (Gold & Diamond Focus Blocks) 💎', 'Unlocked: Tabular Clock HUD'],
  5: ['Bazaar offer unlocked: Cascading Waterfall (purchase to place) 🌊', '+15% Quest Coin yield'],
  6: ['Master Builder Badge'],
  7: ['Bazaar offer unlocked: Friendly Cube Slime (purchase to place) ✨'],
  12: ['New house unlocked: Birchwood Lodge 🏠'],
  14: ['Bazaar pet unlocked: Cloud Chick 🐤'],
  10: ['Bazaar offers unlocked: Cherry Blossom Tree and Sky Crystal Cluster (purchase to place) 🌸💎'],
  20: ['Bazaar offer unlocked: Sky Lantern Walk (purchase to place) 🏮'],
  21: ['Bazaar pet unlocked: Frost Wolf 🐺'],
  28: ['Bazaar pet unlocked: Moonshadow Cat 🐱'],
  35: ['Bazaar pet unlocked: Mossback Turtle 🐢'],
  42: ['Bazaar pet unlocked: Ember Fox 🦊'],
  30: ['Bazaar decoration unlocked: Sky Prism 💠'],
  40: ['Farm crop unlocked: Melons 🍉', 'Bazaar decoration unlocked: Cloud Arch 🏛️'],
  50: ['Bazaar decoration unlocked: Emerald Beacon 🟢'],
  60: ['Bazaar decoration unlocked: Sunstone Fountain ⛲'],
  70: ['Bazaar decoration unlocked: Moon Dial 🌙'],
  80: ['Bazaar decoration unlocked: Aurora Shrine ✨', 'Galaxy theme unlocked in the Bazaar 🌌'],
  90: ['Bazaar decoration unlocked: Cloud Guardian Statue 🗿'],
  100: ['Level 100 achievement: Grand Trophy available in the Bazaar 🏆'],
  8: ['Farm crop unlocked: Wheat 🌾'],
  16: ['Farm crop unlocked: Carrots 🥕'],
  24: ['Farm crop unlocked: Potatoes 🥔', 'New house unlocked: Stone Cottage 🏠'],
  32: ['Farm crop unlocked: Beetroot 🫜'],
  36: ['New house unlocked: Spruce Manor 🏠'],
  48: ['Farm crop unlocked: Pumpkins 🎃', 'New house unlocked: Cloudtop Villa 🏠'],
  56: ['Farm crop unlocked: Sugar Cane 🎋'],
};

// XP required to reach each level grows by 75 XP per level after the first.
export function getIslandXpForLevel(level: number): number {
  const completedLevels = Math.max(0, Math.floor(level) - 1);
  return completedLevels * 300 + (75 * completedLevels * (completedLevels - 1)) / 2;
}

export function getIslandLevelForXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= getIslandXpForLevel(level + 1)) level += 1;
  return level;
}

export function getMinionHarvestReward(level: number): { resources: number; coins: number } {
  const milestoneBonus = Math.floor(level / 5);
  return {
    resources: level * 2 + milestoneBonus,
    coins: 15 + level * 2 + milestoneBonus * 10,
  };
}

export function getMinionDaysUntilReady(minion: Minion, today = getTodayDateString()): number {
  if (minion.frequency !== 'weekly' || minion.completedDates.length === 0) return 0;
  const lastDate = minion.completedDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort().at(-1);
  if (!lastDate) return 0;
  const toUtcDay = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    return Date.UTC(year, month - 1, day) / 86_400_000;
  };
  return Math.max(0, 7 - (toUtcDay(today) - toUtcDay(lastDate)));
}

export function isMinionReadyToHarvest(minion: Minion, today = getTodayDateString()): boolean {
  return getMinionDaysUntilReady(minion, today) === 0
    && !minion.completedDates.includes(today);
}

function getDailyXpUpdate(state: Pick<SkyDoState, 'dailyXp' | 'dailyXpDate'>, gained: number) {
  const today = getTodayDateString();
  return {
    dailyXp: (state.dailyXpDate === today ? state.dailyXp : 0) + gained,
    dailyXpDate: today,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNonNegative(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000;
}

function isValidImport(parsed: unknown): parsed is Record<string, unknown> {
  if (!isRecord(parsed) || (!Array.isArray(parsed.quests) && typeof parsed.islandName !== 'string')) return false;
  if (parsed.islandName !== undefined && typeof parsed.islandName !== 'string') return false;
  if (parsed.islandTitle !== undefined && typeof parsed.islandTitle !== 'string') return false;
  for (const key of ['islandLevel', 'totalXp', 'dailyXp', 'dailyXpGoal', 'coins', 'streak']) {
    if (parsed[key] !== undefined && !isFiniteNonNegative(parsed[key])) return false;
  }
  if (parsed.soundVolume !== undefined && (typeof parsed.soundVolume !== 'number' || !Number.isFinite(parsed.soundVolume) || parsed.soundVolume < 0 || parsed.soundVolume > 1)) return false;
  for (const key of ['lastActiveDate', 'dailyXpDate', 'farmLastHarvestDate']) {
    if (parsed[key] !== undefined && (typeof parsed[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(parsed[key] as string))) return false;
  }
  if (parsed.quests !== undefined && (!Array.isArray(parsed.quests) || !parsed.quests.every((quest) =>
    isRecord(quest) && typeof quest.id === 'string' && typeof quest.title === 'string'
    && ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(String(quest.priority))
    && typeof quest.completed === 'boolean' && Array.isArray(quest.tags) && quest.tags.every((tag) => typeof tag === 'string')
    && Array.isArray(quest.subtasks) && quest.subtasks.every((task) => isRecord(task)
      && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.completed === 'boolean')
    && isFiniteNonNegative(quest.xpReward) && isFiniteNonNegative(quest.coinReward)
  ))) return false;
  if (parsed.minions !== undefined && (!Array.isArray(parsed.minions) || !parsed.minions.every((minion) =>
    isRecord(minion) && typeof minion.id === 'string' && typeof minion.name === 'string'
    && typeof minion.habit === 'string' && typeof minion.resourceName === 'string'
    && ['farming', 'mining', 'foraging', 'combat', 'fishing'].includes(String(minion.category))
    && ['wheat', 'wood', 'iron', 'stone', 'water', 'carrot', 'diamond', 'book'].includes(String(minion.iconType))
    && (minion.frequency === 'daily' || minion.frequency === 'weekly')
    && Array.isArray(minion.completedDates) && minion.completedDates.every((date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date))
    && Number.isInteger(minion.level) && Number(minion.level) >= 1 && isFiniteNonNegative(minion.totalProduced)
  ))) return false;
  for (const key of ['skills', 'dailyChest', 'mining', 'timerSettings']) {
    if (parsed[key] !== undefined && !isRecord(parsed[key])) return false;
  }
  if (parsed.shopItems !== undefined && !Array.isArray(parsed.shopItems)) return false;
  if (parsed.notes !== undefined && !Array.isArray(parsed.notes)) return false;
  if (parsed.mining !== undefined) {
    const mining = parsed.mining as Record<string, unknown>;
    const oresMined = mining.oresMined;
    if (!['focus', 'short_break', 'long_break'].includes(String(mining.mode))
      || !['idle', 'running', 'paused', 'finished'].includes(String(mining.state))
      || !['stone', 'iron', 'gold', 'diamond'].includes(String(mining.currentBlock))
      || !isFiniteNonNegative(mining.secondsRemaining) || Number(mining.secondsRemaining) > 7_200
      || !isFiniteNonNegative(mining.totalFocusMinutesCompleted)
      || !isRecord(oresMined)
      || !['stone', 'iron', 'gold', 'diamond'].every((ore) => isFiniteNonNegative(oresMined[ore]))) return false;
  }
  if (parsed.dailyChest !== undefined) {
    const chest = parsed.dailyChest as Record<string, unknown>;
    if (!isFiniteNonNegative(chest.claimStreak)
      || (chest.lastClaimDate !== undefined && (typeof chest.lastClaimDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(chest.lastClaimDate)))) return false;
  }
  if (parsed.timerSettings !== undefined) {
    const settings = parsed.timerSettings as Record<string, unknown>;
    if (!['focus', 'shortBreak', 'longBreak'].every((key) => isFiniteNonNegative(settings[key]))
      || (settings.autoStartBreaks !== undefined && typeof settings.autoStartBreaks !== 'boolean')) return false;
  }
  if (parsed.skills !== undefined) {
    const skills = parsed.skills as Record<string, unknown>;
    if (!['farming', 'mining', 'combat', 'foraging', 'fishing'].every((key) => {
      const skill = skills[key];
      return isRecord(skill) && Number.isInteger(skill.level) && Number(skill.level) >= 1
        && isFiniteNonNegative(skill.xp) && isFiniteNonNegative(skill.nextLevelXp)
        && Array.isArray(skill.milestones);
    })) return false;
  }
  if (parsed.notes !== undefined && !(parsed.notes as unknown[]).every((note) =>
    isRecord(note) && typeof note.id === 'string' && typeof note.title === 'string'
    && typeof note.content === 'string' && typeof note.folder === 'string'
    && Array.isArray(note.tags) && note.tags.every((tag) => typeof tag === 'string')
    && typeof note.pinned === 'boolean'
  )) return false;
  if (parsed.shopItems !== undefined && !(parsed.shopItems as unknown[]).every((item) =>
    isRecord(item) && typeof item.id === 'string'
  )) return false;
  return true;
}

// Robust consecutive streak calculator
export function calculateStreak(completedDates: string[]): { currentStreak: number; bestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const uniqueSortedDates = Array.from(new Set(completedDates)).sort().reverse();
  const dateSet = new Set(uniqueSortedDates);

  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yYear = yesterdayDate.getFullYear();
  const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
  const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
  const yesterday = `${yYear}-${yMonth}-${yDay}`;

  let currentStreak = 0;
  const checkDate = new Date();

  if (dateSet.has(today)) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (dateSet.has(yesterday)) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 2);
  } else {
    currentStreak = 0;
  }

  if (currentStreak > 0) {
    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (dateSet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let bestStreak = currentStreak;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  const ascendingDates = [...uniqueSortedDates].reverse();
  for (const dateStr of ascendingDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const cur = new Date(y, m - 1, d);

    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffMs = cur.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }
    prevDate = cur;
  }

  return { currentStreak, bestStreak };
}

// Initial default seed skills
const initialSkills: Record<SkillType, Skill> = {
  farming: {
    id: 'farming',
    name: 'Farming',
    level: 4,
    xp: 380,
    nextLevelXp: 600,
    description: 'Nurture healthy recurring habits with daily Minion harvests.',
    color: '#5FA244',
    milestones: [
      { level: 1, perk: 'Novice Planter (+5% habit coins)', unlocked: true },
      { level: 3, perk: 'Green Thumb (Habit streak protection)', unlocked: true },
      { level: 5, perk: 'Master Harvester', unlocked: false },
      { level: 10, perk: 'Demeter Blessing (Double harvest drops)', unlocked: false },
    ],
  },
  mining: {
    id: 'mining',
    name: 'Mining',
    level: 3,
    xp: 220,
    nextLevelXp: 450,
    description: 'Deep focus Pomodoro sessions cracking raw ore blocks.',
    color: '#8A8D91',
    milestones: [
      { level: 1, perk: 'Stone Pickaxe (+10 XP per 25m focus)', unlocked: true },
      { level: 3, perk: 'Iron Vein (Unlock Iron Ore focus block)', unlocked: true },
      { level: 5, perk: 'Gold Rush (Gold ore awards bonus coins)', unlocked: false },
      { level: 10, perk: 'Diamond Core (Master of uninterrupted flow)', unlocked: false },
    ],
  },
  combat: {
    id: 'combat',
    name: 'Combat',
    level: 2,
    xp: 160,
    nextLevelXp: 350,
    description: 'Slaying high-priority, Epic, and Legendary quests.',
    color: '#B3392F',
    milestones: [
      { level: 1, perk: 'Wooden Broadsword (+15% XP on Epic quests)', unlocked: true },
      { level: 3, perk: 'Warrior Stamina (+20 coins on Legendary clears)', unlocked: false },
      { level: 5, perk: 'Boss Slayer (Unlock Combat Banner)', unlocked: false },
      { level: 10, perk: 'Hero of the Realm (Legendary quest glow badge)', unlocked: false },
    ],
  },
  foraging: {
    id: 'foraging',
    name: 'Foraging',
    level: 3,
    xp: 290,
    nextLevelXp: 400,
    description: 'Documenting wisdom, project blueprints, and library notes.',
    color: '#B98E55',
    milestones: [
      { level: 1, perk: 'Tree Chopper (+10 XP per written note)', unlocked: true },
      { level: 3, perk: 'Woodland Scribe (Unlimited pinned notes)', unlocked: true },
      { level: 5, perk: 'Forest Sage (Unlock Cozy Hut expansion)', unlocked: false },
      { level: 10, perk: 'Ancient Scholar (Library master perk)', unlocked: false },
    ],
  },
  fishing: {
    id: 'fishing',
    name: 'Fishing',
    level: 2,
    xp: 110,
    nextLevelXp: 300,
    description: 'Calendar foresight and clearing planned quests on-time.',
    color: '#4AA3B5',
    milestones: [
      { level: 1, perk: 'Cast the Line (+10% on-time quest reward)', unlocked: true },
      { level: 3, perk: 'Good Catch (Streak multiplier on calendar plans)', unlocked: false },
      { level: 5, perk: 'Sea Emperor (Unlock Island Waterfall)', unlocked: false },
      { level: 10, perk: 'Abyssal Navigator (Master timekeeper)', unlocked: false },
    ],
  },
};

const initialShopItems: ShopItem[] = [
  {
    id: 'campfire',
    name: 'Torch Campfire',
    category: 'decoration',
    price: 0,
    description: 'Warm glowing hearth that flickers with your productivity streak.',
    owned: true,
    equipped: true,
    icon: 'campfire',
  },
  {
    id: 'farm_plot',
    name: 'Sanctuary Farm Patch',
    category: 'farm',
    price: 90,
    farmCrop: 'wheat',
    farmIncome: 20,
    description: 'A tidy wheat patch. Harvest it once per day to earn 20 coins.',
    owned: false,
    equipped: false,
    requiredLevel: 8,
    icon: 'farm',
  },
  {
    id: 'farm_carrot', name: 'Carrot Field', category: 'farm', price: 260, farmCrop: 'carrot', farmIncome: 35,
    description: 'A bright carrot patch that earns coins when harvested each day.', owned: false, equipped: false, requiredLevel: 16, icon: 'farm',
  },
  {
    id: 'farm_potato', name: 'Potato Rows', category: 'farm', price: 420, farmCrop: 'potato', farmIncome: 50,
    description: 'Hardy potato rows with a reliable daily coin harvest.', owned: false, equipped: false, requiredLevel: 24, icon: 'farm',
  },
  {
    id: 'farm_beetroot', name: 'Beetroot Beds', category: 'farm', price: 650, farmCrop: 'beetroot', farmIncome: 70,
    description: 'Deep red beetroot beds that bring a bigger daily payout.', owned: false, equipped: false, requiredLevel: 32, icon: 'farm',
  },
  {
    id: 'farm_melon', name: 'Melon Patch', category: 'farm', price: 900, farmCrop: 'melon', farmIncome: 95,
    description: 'A lush melon patch with a generous daily coin harvest.', owned: false, equipped: false, requiredLevel: 40, icon: 'farm',
  },
  {
    id: 'farm_pumpkin', name: 'Pumpkin Field', category: 'farm', price: 1200, farmCrop: 'pumpkin', farmIncome: 125,
    description: 'A broad pumpkin field built for a valuable daily harvest.', owned: false, equipped: false, requiredLevel: 48, icon: 'farm',
  },
  {
    id: 'farm_sugarcane', name: 'Sugar Cane Grove', category: 'farm', price: 1600, farmCrop: 'sugarcane', farmIncome: 160,
    description: 'Tall sugar cane stalks that deliver the richest farm payout.', owned: false, equipped: false, requiredLevel: 56, icon: 'farm',
  },
  {
    id: 'blossom_tree',
    name: 'Cherry Blossom Tree',
    category: 'tree',
    price: 600,
    description: 'A flowering pink canopy that brings a soft spring glow to your island.',
    owned: false,
    equipped: false,
    requiredLevel: 24,
    icon: 'blossom',
  },
  {
    id: 'birch_tree', name: 'Silver Birch', category: 'tree', price: 900,
    description: 'A bright-barked birch with a light, airy green canopy.',
    owned: false, equipped: false, requiredLevel: 10, icon: 'tree',
  },
  {
    id: 'spruce_tree', name: 'Snowcap Spruce', category: 'tree', price: 1400,
    description: 'A tall evergreen with a layered, tapered silhouette.',
    owned: false, equipped: false, requiredLevel: 18, icon: 'tree',
  },
  {
    id: 'willow_tree', name: 'Weeping Willow', category: 'tree', price: 2100,
    description: 'A graceful willow with long leafy branches that drape toward the grass.',
    owned: false, equipped: false, requiredLevel: 36, icon: 'tree',
  },
  {
    id: 'maple_tree', name: 'Golden Maple', category: 'tree', price: 3000,
    description: 'A warm autumn maple with a full canopy of amber and gold leaves.',
    owned: false, equipped: false, requiredLevel: 48, icon: 'tree',
  },
  {
    id: 'crystal_shrine',
    name: 'Sky Crystal Cluster',
    category: 'decoration',
    price: 500,
    oreCost: { stone: 8, iron: 2 },
    description: 'A luminous blue crystal formation gathered from the island depths.',
    owned: false,
    equipped: false,
    requiredLevel: 10,
    icon: 'crystal',
  },
  {
    id: 'sky_lanterns',
    name: 'Sky Lantern Walk',
    category: 'decoration',
    price: 850,
    oreCost: { stone: 12, iron: 4 },
    description: 'Warm lanterns lining a quiet path above the clouds.',
    owned: false,
    equipped: false,
    requiredLevel: 20,
    icon: 'lantern',
  },
  {
    id: 'sky_prism',
    name: 'Sky Prism',
    category: 'decoration',
    price: 1400,
    oreCost: { iron: 8, gold: 2 },
    description: 'A radiant crystal centerpiece that catches the light above the clouds.',
    owned: false,
    equipped: false,
    requiredLevel: 30,
    icon: 'crystal',
  },
  {
    id: 'cloud_arch',
    name: 'Cloud Arch',
    category: 'decoration',
    price: 1800,
    oreCost: { stone: 24, iron: 8 },
    description: 'A pale stone gateway with a golden keystone.',
    owned: false,
    equipped: false,
    requiredLevel: 40,
    icon: 'decoration',
  },
  {
    id: 'emerald_beacon',
    name: 'Emerald Beacon',
    category: 'decoration',
    price: 2200,
    oreCost: { iron: 12, gold: 5 },
    description: 'A green-lit beacon marking your island’s growing renown.',
    owned: false,
    equipped: false,
    requiredLevel: 50,
    icon: 'crystal',
  },
  {
    id: 'sunstone_fountain',
    name: 'Sunstone Fountain',
    category: 'decoration',
    price: 2600,
    oreCost: { stone: 30, gold: 8 },
    description: 'A warm golden fountain with water spilling over its stone basin.',
    owned: false,
    equipped: false,
    requiredLevel: 60,
    icon: 'water',
  },
  {
    id: 'moon_dial',
    name: 'Moon Dial',
    category: 'decoration',
    price: 3000,
    oreCost: { iron: 16, gold: 8 },
    description: 'A celestial timepiece set into a moonlit stone plinth.',
    owned: false,
    equipped: false,
    requiredLevel: 70,
    icon: 'moon',
  },
  {
    id: 'aurora_shrine',
    name: 'Aurora Shrine',
    category: 'decoration',
    price: 3400,
    oreCost: { gold: 12, diamond: 2 },
    description: 'A tranquil shrine crowned with glowing blue and green crystals.',
    owned: false,
    equipped: false,
    requiredLevel: 80,
    icon: 'crystal',
  },
  {
    id: 'cloud_guardian',
    name: 'Cloud Guardian Statue',
    category: 'decoration',
    price: 3800,
    oreCost: { stone: 40, diamond: 3 },
    description: 'A proud stone sentinel keeping watch over your sanctuary.',
    owned: false,
    equipped: false,
    requiredLevel: 90,
    icon: 'decoration',
  },
  {
    id: 'grand_trophy',
    name: 'Grand Trophy',
    category: 'decoration',
    price: 0,
    description: 'A golden monument awarded for reaching island level 100.',
    owned: false,
    equipped: false,
    requiredLevel: 100,
    icon: 'trophy',
  },
  {
    id: 'oak_tree',
    name: 'Majestic Oak Tree',
    category: 'tree',
    price: 60,
    description: 'A leafy oak with hanging vines providing shade to your sanctuary.',
    owned: false,
    equipped: false,
    requiredLevel: 2,
    icon: 'tree',
  },
  {
    id: 'wooden_cabin',
    name: 'Cozy Timber Cabin',
    category: 'house',
    price: 150,
    description: 'A sturdy wood-and-stone shelter where productivity takes root.',
    owned: false,
    equipped: false,
    requiredLevel: 3,
    icon: 'house',
  },
  {
    id: 'birch_lodge', name: 'Birchwood Lodge', category: 'house', price: 500,
    description: 'A bright timber lodge with pale walls and a welcoming roof.',
    owned: false, equipped: false, requiredLevel: 12, icon: 'house',
  },
  {
    id: 'stone_cottage', name: 'Stone Cottage', category: 'house', price: 900,
    description: 'A sturdy slate-roof cottage built for a growing sanctuary.',
    owned: false, equipped: false, requiredLevel: 24, icon: 'house',
  },
  {
    id: 'spruce_manor', name: 'Spruce Manor', category: 'house', price: 1500,
    description: 'A deep green manor with a bold, forest-inspired silhouette.',
    owned: false, equipped: false, requiredLevel: 36, icon: 'house',
  },
  {
    id: 'cloud_villa', name: 'Cloudtop Villa', category: 'house', price: 2400,
    description: 'An airy pale-stone villa topped with a sky-blue roof.',
    owned: false, equipped: false, requiredLevel: 48, icon: 'house',
  },
  {
    id: 'waterfall',
    name: 'Cascading Waterfall',
    category: 'water',
    price: 250,
    description: 'A pure stream tumbling into the endless cloud sea.',
    owned: false,
    equipped: false,
    requiredLevel: 5,
    icon: 'water',
  },
  {
    id: 'pet_slime',
    name: 'Friendly Cube Slime',
    category: 'pet',
    price: 450,
    description: 'A cheerful little bouncing block buddy that hops by your side.',
    ability: '+10% XP from completed quests.',
    owned: false,
    equipped: false,
    requiredLevel: 7,
    icon: 'slime',
  },
  {
    id: 'pet_chick',
    name: 'Cloud Chick',
    category: 'pet',
    price: 550,
    description: 'A sunny little chick with soft cloud-white wings.',
    ability: '+10% coins from minion harvests.',
    owned: false,
    equipped: false,
    requiredLevel: 14,
    icon: 'chick',
  },
  {
    id: 'pet_turtle',
    name: 'Mossback Turtle',
    category: 'pet',
    price: 700,
    description: 'A steady green friend carrying a cozy woodland shell.',
    ability: '+10% XP from minion harvests.',
    owned: false,
    equipped: false,
    requiredLevel: 35,
    icon: 'turtle',
  },
  {
    id: 'pet_fox',
    name: 'Ember Fox',
    category: 'pet',
    price: 900,
    description: 'A bright-tailed island fox that follows your adventures.',
    ability: '+15% coins from daily chest rewards.',
    owned: false,
    equipped: false,
    requiredLevel: 42,
    icon: 'fox',
  },
  {
    id: 'pet_wolf',
    name: 'Frost Wolf',
    category: 'pet',
    price: 1100,
    description: 'A loyal gray wolf with bright eyes and a fluffy tail.',
    ability: '+10% XP from focus mining.',
    owned: false,
    equipped: false,
    requiredLevel: 21,
    icon: 'wolf',
  },
  {
    id: 'pet_cat',
    name: 'Moonshadow Cat',
    category: 'pet',
    price: 1250,
    description: 'A soft gray cat with bright eyes, fine whiskers, and a curled tail.',
    ability: '+10% coins from completed quests.',
    owned: false,
    equipped: false,
    requiredLevel: 28,
    icon: 'cat',
  },
  {
    id: 'theme_sunset',
    name: 'Amber Sunset Sky',
    category: 'theme',
    price: 120,
    description: 'Golden hour palette: warm amber skies and soothing twilight horizons.',
    owned: false,
    equipped: false,
    icon: 'sunset',
  },
  {
    id: 'theme_cloudy',
    name: 'Slate Overcast Sky',
    category: 'theme',
    price: 120,
    description: 'Calm, minimalist cloudy atmosphere for low-distraction deep work.',
    owned: false,
    equipped: false,
    icon: 'cloud',
  },
  {
    id: 'theme_night',
    name: 'Starry Midnight Sky',
    category: 'theme',
    price: 220,
    description: 'Deep navy celestial heavens with distant pixel constellations.',
    owned: false,
    equipped: false,
    icon: 'moon',
  },
  {
    id: 'theme_galaxy',
    name: 'Galaxy Sky',
    category: 'theme',
    price: 1800,
    description: 'A deep violet space sky scattered with glowing stars and nebulae.',
    owned: false,
    equipped: false,
    requiredLevel: 80,
    icon: 'crystal',
  },
];

type LegacyShopItem = Partial<ShopItem> & { id: string; unlocked?: boolean; purchased?: boolean };

function normalizeShopItems(items: unknown): ShopItem[] {
  const savedItems = Array.isArray(items) ? items as LegacyShopItem[] : [];
  const normalized = initialShopItems.map((catalogItem) => {
    const saved = savedItems.find((item) => item?.id === catalogItem.id);
    if (catalogItem.price === 0) {
      const owned = catalogItem.id === 'grand_trophy' ? saved?.owned === true : true;
      return { ...catalogItem, owned, equipped: owned && (saved?.equipped ?? catalogItem.equipped) };
    }
    if (!saved) return { ...catalogItem, owned: false, equipped: false };

    // Old buggy seed data showed these paid items as unlocked/equipped by default.
    const legacyStarterIds = ['oak_tree', 'wooden_cabin', 'theme_sunset'];
    const legacySeededAsFree = legacyStarterIds.includes(catalogItem.id)
      && saved.owned !== true && saved.purchased !== true;
    const owned = !legacySeededAsFree && (typeof saved.owned === 'boolean'
      ? saved.owned
      : saved.purchased === true || saved.unlocked === true);

    return { ...catalogItem, owned, equipped: owned && saved.equipped === true };
  });
  const equippedCategories = new Set<ShopItem['category']>();
  return normalized.map((item) => {
    if (!item.equipped) return item;
    if (equippedCategories.has(item.category)) return { ...item, equipped: false };
    equippedCategories.add(item.category);
    return item;
  });
}

function hasEquippedPet(items: ShopItem[], petId: string): boolean {
  return items.some((item) => item.id === petId && item.category === 'pet' && item.owned && item.equipped);
}

// Helper to calculate recent 28 days
function getSeedPastDates(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

const recentDays = getSeedPastDates(28);

const initialMinions: Minion[] = [
  {
    id: 'minion_wheat',
    name: 'Wheat Minion',
    habit: 'Drink 2L Fresh Water Daily',
    category: 'farming',
    resourceName: 'Golden Wheat',
    iconType: 'wheat',
    frequency: 'daily',
    streak: 6,
    bestStreak: 14,
    completedDates: [recentDays[0], recentDays[1], recentDays[2], recentDays[3], recentDays[4], recentDays[5], recentDays[8], recentDays[10], recentDays[11], recentDays[14]],
    level: 4,
    totalProduced: 142,
  },
  {
    id: 'minion_iron',
    name: 'Iron Minion',
    habit: 'Morning Workout & Stretch',
    category: 'combat',
    resourceName: 'Iron Ingot',
    iconType: 'iron',
    frequency: 'daily',
    streak: 4,
    bestStreak: 10,
    completedDates: [recentDays[0], recentDays[1], recentDays[2], recentDays[3], recentDays[7], recentDays[9], recentDays[12]],
    level: 3,
    totalProduced: 98,
  },
  {
    id: 'minion_oak',
    name: 'Oak Minion',
    habit: 'Read 25 Pages of Non-Fiction',
    category: 'foraging',
    resourceName: 'Oak Timber',
    iconType: 'wood',
    frequency: 'daily',
    streak: 5,
    bestStreak: 9,
    completedDates: [recentDays[0], recentDays[1], recentDays[2], recentDays[3], recentDays[4], recentDays[6], recentDays[11]],
    level: 3,
    totalProduced: 85,
  },
  {
    id: 'minion_cobble',
    name: 'Cobble Minion',
    habit: 'Clean & Organize Work Desk',
    category: 'mining',
    resourceName: 'Polished Stone',
    iconType: 'stone',
    frequency: 'daily',
    streak: 8,
    bestStreak: 12,
    completedDates: [recentDays[0], recentDays[1], recentDays[2], recentDays[3], recentDays[4], recentDays[5], recentDays[6], recentDays[7], recentDays[9]],
    level: 5,
    totalProduced: 210,
  },
  {
    id: 'minion_fishing',
    name: 'Angler Minion',
    habit: 'Evening 5-Minute Gratitude Log',
    category: 'fishing',
    resourceName: 'Prismarine Shard',
    iconType: 'water',
    frequency: 'daily',
    streak: 3,
    bestStreak: 7,
    completedDates: [recentDays[0], recentDays[1], recentDays[2], recentDays[5], recentDays[8]],
    level: 2,
    totalProduced: 44,
  },
];

const initialQuests: Quest[] = [
  {
    id: 'q1',
    title: 'Review production roadmap & sprint milestones',
    description: 'Ensure all tasks have clear deliverables and deadlines.',
    priority: 'epic',
    completed: false,
    dueDate: recentDays[0],
    dueTime: '17:00',
    tags: ['work', 'planning'],
    subtasks: [
      { id: 'st1', title: 'Check sprint backlog priorities', completed: true },
      { id: 'st2', title: 'Verify client integration endpoints', completed: false },
      { id: 'st3', title: 'Publish release update notes', completed: false },
    ],
    xpReward: 45,
    coinReward: 25,
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q2',
    title: 'Deep focus: Refactor data persistence layer',
    description: 'Add auto-save safeguards and optimistic UI updates.',
    priority: 'rare',
    completed: false,
    dueDate: recentDays[0],
    dueTime: '15:30',
    tags: ['coding', 'focus'],
    subtasks: [
      { id: 'st4', title: 'Write unit tests for state actions', completed: true },
      { id: 'st5', title: 'Profile local storage performance', completed: false },
    ],
    xpReward: 35,
    coinReward: 20,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q3',
    title: 'Morning review of SkyDome daily quests',
    description: 'Plan out the top 3 high-impact objectives.',
    priority: 'uncommon',
    completed: true,
    completedAt: new Date().toISOString(),
    dueDate: recentDays[0],
    tags: ['routine'],
    subtasks: [],
    xpReward: 20,
    coinReward: 10,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q4',
    title: 'Design clean responsive layout for mobile viewport',
    description: 'Test bottom tab navigation and touch hitboxes.',
    priority: 'legendary',
    completed: false,
    dueDate: recentDays[0], // Today
    dueTime: '19:00',
    tags: ['design', 'mobile'],
    subtasks: [
      { id: 'st6', title: 'Bottom bar 5-tab layout', completed: true },
      { id: 'st7', title: 'Slide-up More drawer', completed: true },
      { id: 'st8', title: 'Floating action button placement', completed: true },
    ],
    xpReward: 60,
    coinReward: 40,
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q5',
    title: 'Stockpile 30 minutes of deep focus mining',
    description: 'Knock out uninterrupted work in Pomodoro mode.',
    priority: 'common',
    completed: false,
    dueDate: recentDays[0],
    tags: ['focus'],
    subtasks: [],
    xpReward: 15,
    coinReward: 10,
    order: 4,
    createdAt: new Date().toISOString(),
  },
];

const initialNotes: LibraryNote[] = [
  {
    id: 'note_welcome',
    title: 'SkyDome Island Compendium & Guide',
    content: `# Welcome to SkyDome! 🏝️

SkyDome transforms your daily productivity into a thriving **Minecraft Skyblock** sanctuary.

### 🌟 Core Systems
- **Island:** Your floating home. As you complete quests and build habits, your island levels up and expands!
- **Quests:** Daily tasks with RPG rarity tiers (*Common* through *Legendary*).
- **Minions:** Automated worker habits that produce resources every day you stay consistent.
- **Focus Mining:** A Pomodoro timer where your pickaxe cracks minerals to forge focus ores.
- **Skills:** Level up Farming, Mining, Combat, Foraging, and Fishing to unlock island perks!
- **Chest:** Spend earned coins on cosmetic island architecture and atmospheric sky themes.

> *"Great islands aren't built in a day — they are forged block by block."*
`,
    folder: 'Guides',
    tags: ['guide', 'getting-started'],
    pinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note_minions',
    title: 'Minion Compound Habit Philosophy',
    content: `# The Minion Compound Effect ⚙️

Just like in Skyblock, an automated Minion works tirelessly in the background:

1. **Start Small:** Pick habits with low friction (e.g. 1 glass of water, 5 pages of reading).
2. **Never Break Twice:** If you miss a day, restart the streak immediately tomorrow.
3. **Upgrade Tier:** When you hit a 14-day streak, upgrade the minion level for extra resource output!

### Current Minion Assignments:
- **Wheat:** Hydration (Physical vitality)
- **Iron:** Calisthenics & posture
- **Oak:** Continuous learning & books
- **Cobble:** Workspace order
`,
    folder: 'Habits',
    tags: ['habits', 'minions'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note_sprint',
    title: 'Q4 Product Roadmap & Sprint Architecture',
    content: `# Q4 Objectives 🚀

- [x] Architecture design & state persistence
- [x] Beveled pixel design system
- [x] Responsive layout with mobile drawer
- [ ] Weekly analytics charts review
- [ ] Final keyboard shortcuts & sound polish
`,
    folder: 'Projects',
    tags: ['work', 'roadmap'],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useSkyDoStore = create<SkyDoState>()(
  persist(
    (set, get) => ({
      activeTab: 'island',
      setActiveTab: (tab) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        set({ activeTab: tab });
      },
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      quickAddModalOpen: false,
      setQuickAddModalOpen: (open) => set({ quickAddModalOpen: open }),
      levelUpModal: null,
      setLevelUpModal: (info) => set({ levelUpModal: info }),

      // Island defaults
      islandName: 'SkyDome Sanctuary',
      islandTitle: 'Skyblock Architect',
      islandLevel: 4,
      totalXp: 1160,
      dailyXp: 55,
      dailyXpDate: getTodayDateString(),
      dailyXpGoal: 100,
      coins: 240,
      farmLastHarvestDate: undefined,
      testCoinGrantApplied: false,
      testLevelGrantApplied: false,
      streak: 5,
      lastActiveDate: getTodayDateString(),
      theme: 'day',
      numberFont: 'tabular',
      soundEnabled: false, // Default off per requirement
      soundVolume: 0.5,
      reducedMotion: false,
      timerSettings: {
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
        autoStartBreaks: false,
      },
      onboardingCompleted: true,

      // Quests
      quests: initialQuests,
      addQuest: (q) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const xpReward = q.priority === 'legendary' ? 60 : q.priority === 'epic' ? 45 : q.priority === 'rare' ? 30 : q.priority === 'uncommon' ? 20 : 15;
        const coinReward = q.priority === 'legendary' ? 40 : q.priority === 'epic' ? 25 : q.priority === 'rare' ? 18 : q.priority === 'uncommon' ? 12 : 8;

        const newQuest: Quest = {
          ...q,
          id: `quest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          completed: false,
          rewardClaimed: false,
          xpReward,
          coinReward,
          order: state.quests.length,
          createdAt: new Date().toISOString(),
        };

        set({ quests: [newQuest, ...state.quests] });
      },

      editQuest: (id, updates) => {
        set((state) => ({
          quests: state.quests.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }));
      },

      toggleQuest: (id) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === id);
        if (!quest) return;

        const willComplete = !quest.completed;

        if (willComplete) {
          const shouldGrantReward = !quest.rewardClaimed;
          // Play sound
          soundManager.playQuestComplete(state.soundEnabled, state.soundVolume);

          // Add XP & coins
          const questXpReward = shouldGrantReward ? Math.round(quest.xpReward * (hasEquippedPet(state.shopItems, 'pet_slime') ? 1.1 : 1)) : 0;
          const questCoinReward = shouldGrantReward ? Math.round(quest.coinReward * (hasEquippedPet(state.shopItems, 'pet_cat') ? 1.1 : 1)) : 0;
          const dailyXpUpdate = shouldGrantReward ? getDailyXpUpdate(state, questXpReward) : {};
          const newTotalXp = state.totalXp + questXpReward;
          const newCoins = state.coins + questCoinReward;

          // Check if island leveled up
          const newLevel = getIslandLevelForXp(newTotalXp);
          let levelUpInfo = state.levelUpModal;
          if (newLevel > state.islandLevel) {
            soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
            levelUpInfo = {
              level: newLevel,
              unlockedPerks: ISLAND_LEVEL_PERKS[newLevel] || [`Sanctuary reached Level ${newLevel}! Expansion unlocked.`],
            };
          }

          // Add skill XP based on priority
          if (shouldGrantReward) {
            const combatGain = quest.priority === 'legendary' ? 40 : quest.priority === 'epic' ? 25 : 10;
            get().addSkillXp('combat', combatGain);
          }

          set({
            quests: state.quests.map((q) =>
              q.id === id
                ? {
                    ...q,
                    completed: true,
                    rewardClaimed: true,
                    completedAt: new Date().toISOString(),
                    // also mark subtasks completed
                    subtasks: q.subtasks.map((st) => ({ ...st, completed: true })),
                  }
                : q
            ),
            ...dailyXpUpdate,
            totalXp: newTotalXp,
            coins: newCoins,
            islandLevel: Math.max(state.islandLevel, newLevel),
            levelUpModal: levelUpInfo,
            undoToast: {
              id: `undo_${Date.now()}`,
              type: 'quest_complete',
              title: `Completed "${quest.title}" (+${quest.xpReward} XP)`,
              data: { id },
              timestamp: Date.now(),
            },
          });
        } else {
          soundManager.playClick(state.soundEnabled, state.soundVolume);
          set({
            quests: state.quests.map((q) =>
              q.id === id ? { ...q, completed: false, completedAt: undefined, rewardClaimed: q.rewardClaimed ?? true } : q
            ),
          });
        }
      },

      deleteQuest: (id) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const quest = state.quests.find((q) => q.id === id);
        if (!quest) return;

        set({
          quests: state.quests.filter((q) => q.id !== id),
          undoToast: {
            id: `undo_${Date.now()}`,
            type: 'quest_delete',
            title: `Deleted "${quest.title}"`,
            data: { quest },
            timestamp: Date.now(),
          },
        });
      },

      reorderQuests: (newOrder) => {
        set({ quests: newOrder });
      },

      addSubtask: (questId, title) => {
        if (!title.trim()) return;
        set((state) => ({
          quests: state.quests.map((q) => {
            if (q.id !== questId) return q;
            return {
              ...q,
              subtasks: [
                ...q.subtasks,
                { id: `st_${Date.now()}`, title: title.trim(), completed: false },
              ],
            };
          }),
        }));
      },

      toggleSubtask: (questId, subtaskId) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);

        let questToAutoClaim: Quest | null = null;

        const updatedQuests = state.quests.map((q) => {
          if (q.id !== questId) return q;
          const updatedSubtasks = q.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );

          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          const hasIncomplete = updatedSubtasks.some((st) => !st.completed);

          if (allDone && !q.completed) {
            questToAutoClaim = { ...q, subtasks: updatedSubtasks, rewardClaimed: q.rewardClaimed ?? false };
            return {
              ...q,
              subtasks: updatedSubtasks,
              completed: true,
              rewardClaimed: true,
              completedAt: new Date().toISOString(),
            };
          }

          if (hasIncomplete && q.completed) {
            return {
              ...q,
              subtasks: updatedSubtasks,
              completed: false,
              completedAt: undefined,
              rewardClaimed: q.rewardClaimed ?? true,
            };
          }

          return {
            ...q,
            subtasks: updatedSubtasks,
          };
        });

        if (questToAutoClaim) {
          const qc = questToAutoClaim as Quest;
          const shouldGrantReward = !qc.rewardClaimed;
          soundManager.playQuestComplete(state.soundEnabled, state.soundVolume);
          const questXpReward = shouldGrantReward ? Math.round(qc.xpReward * (hasEquippedPet(state.shopItems, 'pet_slime') ? 1.1 : 1)) : 0;
          const questCoinReward = shouldGrantReward ? Math.round(qc.coinReward * (hasEquippedPet(state.shopItems, 'pet_cat') ? 1.1 : 1)) : 0;
          const dailyXpUpdate = shouldGrantReward ? getDailyXpUpdate(state, questXpReward) : {};
          const newTotalXp = state.totalXp + questXpReward;
          const newCoins = state.coins + questCoinReward;

          const newLevel = getIslandLevelForXp(newTotalXp);
          let levelUpInfo = state.levelUpModal;
          if (newLevel > state.islandLevel) {
            soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
            levelUpInfo = {
              level: newLevel,
              unlockedPerks: ISLAND_LEVEL_PERKS[newLevel] || [`Sanctuary reached Level ${newLevel}! Expansion unlocked.`],
            };
          }

          if (shouldGrantReward) get().addSkillXp('combat', qc.priority === 'legendary' ? 40 : qc.priority === 'epic' ? 25 : 10);

          set({
            quests: updatedQuests,
            ...dailyXpUpdate,
            totalXp: newTotalXp,
            coins: newCoins,
            islandLevel: Math.max(state.islandLevel, newLevel),
            levelUpModal: levelUpInfo,
            undoToast: {
              id: `undo_${Date.now()}`,
              type: 'quest_complete',
              title: `All subtasks checked! Completed "${qc.title}" (+${qc.xpReward} XP)`,
              data: { id: qc.id },
              timestamp: Date.now(),
            },
          });
          return;
        }

        set({ quests: updatedQuests });
      },

      deleteSubtask: (questId, subtaskId) => {
        set((state) => ({
          quests: state.quests.map((q) => {
            if (q.id !== questId) return q;
            return {
              ...q,
              subtasks: q.subtasks.filter((st) => st.id !== subtaskId),
            };
          }),
        }));
      },

      // Minions
      minions: initialMinions,
      addMinion: (m) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const newMinion: Minion = {
          ...m,
          id: `minion_${Date.now()}`,
          streak: 0,
          bestStreak: 0,
          completedDates: [],
          level: 1,
          totalProduced: 0,
        };
        set({ minions: [...state.minions, newMinion] });
      },

      editMinion: (id, updates) => {
        set((state) => ({
          minions: state.minions.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },

      deleteMinion: (id) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const minion = state.minions.find((m) => m.id === id);
        if (!minion) return;

        set({
          minions: state.minions.filter((m) => m.id !== id),
          undoToast: {
            id: `undo_${Date.now()}`,
            type: 'minion_delete',
            title: `Removed minion "${minion.name}"`,
            data: { minion },
            timestamp: Date.now(),
          },
        });
      },

      checkMinionToday: (id) => {
        const state = get();
        const today = getTodayDateString();
        const minion = state.minions.find((m) => m.id === id);
        if (!minion || !isMinionReadyToHarvest(minion, today)) return;

        soundManager.playHarvest(state.soundEnabled, state.soundVolume);
        const newDates = [today, ...minion.completedDates];
        const { currentStreak, bestStreak } = calculateStreak(newDates);
        const reward = getMinionHarvestReward(minion.level);
        const dropAmount = reward.resources;

        // Equipped pets boost minion harvest rewards.
        const xpWon = Math.round(25 * (hasEquippedPet(state.shopItems, 'pet_turtle') ? 1.1 : 1));
        const coinsWon = Math.round(reward.coins * (hasEquippedPet(state.shopItems, 'pet_chick') ? 1.1 : 1));
        get().addSkillXp('farming', xpWon);

        const dailyXpUpdate = getDailyXpUpdate(state, xpWon);
        const newTotalXp = state.totalXp + xpWon;
        const newCoins = state.coins + coinsWon;

        const newLevel = getIslandLevelForXp(newTotalXp);
        let levelUpInfo = state.levelUpModal;
        if (newLevel > state.islandLevel) {
          soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
          levelUpInfo = {
            level: newLevel,
            unlockedPerks: ISLAND_LEVEL_PERKS[newLevel] || [`Sanctuary reached Level ${newLevel}! Expansion unlocked.`],
          };
        }

        set({
            coins: newCoins,
            ...dailyXpUpdate,
            totalXp: newTotalXp,
            islandLevel: Math.max(state.islandLevel, newLevel),
            levelUpModal: levelUpInfo,
            minions: state.minions.map((m) =>
              m.id === id
                ? {
                    ...m,
                    completedDates: newDates,
                    streak: currentStreak,
                    bestStreak: Math.max(m.bestStreak, bestStreak),
                    totalProduced: m.totalProduced + dropAmount,
                  }
                : m
            ),
        });
      },

      harvestAllMinions: () => {
        const state = get();
        const today = getTodayDateString();
        const readyMinions = state.minions.filter((m) => isMinionReadyToHarvest(m, today));
        if (readyMinions.length === 0) return { count: 0, totalCoins: 0, totalXp: 0 };

        soundManager.playHarvest(state.soundEnabled, state.soundVolume);

        let totalCoinsGain = 0;
        let totalXpGain = 0;

        const updatedMinions = state.minions.map((m) => {
          if (!isMinionReadyToHarvest(m, today)) return m;

          const newDates = [today, ...m.completedDates];
          const { currentStreak, bestStreak } = calculateStreak(newDates);
          const reward = getMinionHarvestReward(m.level);
          const dropAmount = reward.resources;
          const coinsWon = Math.round(reward.coins * (hasEquippedPet(state.shopItems, 'pet_chick') ? 1.1 : 1));
          const xpWon = Math.round(25 * (hasEquippedPet(state.shopItems, 'pet_turtle') ? 1.1 : 1));

          totalCoinsGain += coinsWon;
          totalXpGain += xpWon;

          return {
            ...m,
            completedDates: newDates,
            streak: currentStreak,
            bestStreak: Math.max(bestStreak, m.bestStreak),
            totalProduced: m.totalProduced + dropAmount,
          };
        });

        get().addSkillXp('farming', totalXpGain);

        const dailyXpUpdate = getDailyXpUpdate(state, totalXpGain);
        const newTotalXp = state.totalXp + totalXpGain;
        const newCoins = state.coins + totalCoinsGain;
        const newLevel = getIslandLevelForXp(newTotalXp);
        let levelUpInfo = state.levelUpModal;
        if (newLevel > state.islandLevel) {
          soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
          levelUpInfo = {
            level: newLevel,
            unlockedPerks: ISLAND_LEVEL_PERKS[newLevel] || [`Sanctuary reached Level ${newLevel}! Expansion unlocked.`],
          };
        }

        set({
          minions: updatedMinions,
          coins: newCoins,
          ...dailyXpUpdate,
          totalXp: newTotalXp,
          islandLevel: Math.max(state.islandLevel, newLevel),
          levelUpModal: levelUpInfo,
        });

        return { count: readyMinions.length, totalCoins: totalCoinsGain, totalXp: totalXpGain };
      },

      harvestFarm: () => {
        const state = get();
        const farm = state.shopItems.find((item) => item.category === 'farm' && item.owned && item.equipped && item.farmIncome);
        const today = getTodayDateString();
        if (!farm?.farmIncome || state.farmLastHarvestDate === today) return null;
        soundManager.playHarvest(state.soundEnabled, state.soundVolume);
        set({ coins: state.coins + farm.farmIncome, farmLastHarvestDate: today });
        return { coins: farm.farmIncome, crop: farm.farmCrop ?? 'crops' };
      },

      toggleMinionDate: (id, date) => {
        if (date === getTodayDateString()) return;
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        set({
          minions: state.minions.map((m) => {
            if (m.id !== id) return m;
            const exists = m.completedDates.includes(date);
            const completedDates = exists
              ? m.completedDates.filter((d) => d !== date)
              : [date, ...m.completedDates];
            const { currentStreak, bestStreak } = calculateStreak(completedDates);
            return {
              ...m,
              completedDates,
              streak: currentStreak,
              bestStreak: Math.max(m.bestStreak, bestStreak),
            };
          }),
        });
      },

      upgradeMinion: (id) => {
        const state = get();
        const minion = state.minions.find((m) => m.id === id);
        if (!minion) return;
        const upgradeCost = minion.level * 50;

        if (state.coins < upgradeCost) return;

        soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
        set({
          coins: state.coins - upgradeCost,
          minions: state.minions.map((m) =>
            m.id === id ? { ...m, level: m.level + 1 } : m
          ),
        });
      },

      // Mining / Pomodoro Timer
      mining: {
        mode: 'focus',
        state: 'idle',
        secondsRemaining: 25 * 60,
        totalFocusMinutesCompleted: 125,
        linkedQuestId: 'q2',
        currentBlock: 'stone',
        crackStage: 0,
        oresMined: {
          stone: 24,
          iron: 8,
          gold: 2,
          diamond: 1,
        },
      },

      startMiningTimer: () => {
        const state = get();
        if (state.mining.state === 'running') return;
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const now = Date.now();
        const configuredMinutes = state.mining.mode === 'focus'
          ? state.timerSettings.focus
          : state.mining.mode === 'short_break'
            ? state.timerSettings.shortBreak
            : state.timerSettings.longBreak;
        const secondsRemaining = state.mining.state === 'finished' || state.mining.secondsRemaining <= 0
          ? configuredMinutes * 60
          : state.mining.secondsRemaining;
        set((s) => ({
          mining: {
            ...s.mining,
            state: 'running',
            secondsRemaining,
            endTimestamp: now + secondsRemaining * 1000,
            lastTickTimestamp: now,
          },
        }));
      },

      pauseMiningTimer: () => {
        const state = get();
        if (state.mining.state !== 'running') return;
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        set((s) => ({
          mining: {
            ...s.mining,
            state: 'paused',
            endTimestamp: undefined,
          },
        }));
      },

      resumeMiningTimer: () => {
        const state = get();
        if (state.mining.state !== 'paused' || state.mining.secondsRemaining <= 0) return;
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const now = Date.now();
        set((s) => ({
          mining: {
            ...s.mining,
            state: 'running',
            endTimestamp: now + s.mining.secondsRemaining * 1000,
            lastTickTimestamp: now,
          },
        }));
      },

      resetMiningTimer: () => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const mins =
          state.mining.mode === 'focus'
            ? state.timerSettings.focus
            : state.mining.mode === 'short_break'
            ? state.timerSettings.shortBreak
            : state.timerSettings.longBreak;
        set((s) => ({
          mining: {
            ...s.mining,
            state: 'idle',
            secondsRemaining: mins * 60,
            crackStage: 0,
            endTimestamp: undefined,
            lastTickTimestamp: undefined,
          },
        }));
      },

      tickMiningTimer: () => {
        const s = get();
        if (s.mining.state !== 'running') return;

        const totalSecs =
          s.mining.mode === 'focus'
            ? s.timerSettings.focus * 60
            : s.mining.mode === 'short_break'
            ? s.timerSettings.shortBreak * 60
            : s.timerSettings.longBreak * 60;

        let secondsLeft: number;
        const now = Date.now();

        if (s.mining.endTimestamp) {
          secondsLeft = Math.max(0, Math.round((s.mining.endTimestamp - now) / 1000));
        } else {
          secondsLeft = Math.max(0, s.mining.secondsRemaining - 1);
        }

        if (secondsLeft <= 0) {
          get().finishMiningTimer();
          return;
        }

        const progress = Math.max(0, Math.min(1, 1 - secondsLeft / totalSecs));
        const newCrackStage = Math.min(5, Math.floor(progress * 6));

        // Subtly play tap on crack changes in focus mode
        if (newCrackStage !== s.mining.crackStage && s.mining.mode === 'focus') {
          soundManager.playPickaxeHit(s.soundEnabled, s.soundVolume);
        }

        set({
          mining: {
            ...s.mining,
            secondsRemaining: secondsLeft,
            crackStage: newCrackStage,
            lastTickTimestamp: now,
          },
        });
      },

      clickMineBlock: () => {
        const state = get();
        const m = state.mining;

        if (m.state === 'idle') {
          get().startMiningTimer();
          soundManager.playPickaxeHit(state.soundEnabled, state.soundVolume);
          return { hit: true, bonusSecs: 0, finished: false };
        }

        if (m.state === 'paused') {
          get().resumeMiningTimer();
          soundManager.playPickaxeHit(state.soundEnabled, state.soundVolume);
          return { hit: true, bonusSecs: 0, finished: false };
        }

        if (m.state === 'running') {
          soundManager.playPickaxeHit(state.soundEnabled, state.soundVolume);
          const newSecs = m.secondsRemaining - 1;

          if (newSecs <= 1) {
            get().finishMiningTimer();
            return { hit: true, bonusSecs: 1, finished: true };
          }

          const totalSecs =
            m.mode === 'focus'
              ? state.timerSettings.focus * 60
              : m.mode === 'short_break'
              ? state.timerSettings.shortBreak * 60
              : state.timerSettings.longBreak * 60;

          const progress = Math.max(0, Math.min(1, 1 - newSecs / totalSecs));
          const newCrackStage = Math.min(5, Math.floor(progress * 6));
          const newEndTimestamp = m.endTimestamp ? m.endTimestamp - 1000 : undefined;

          set({
            mining: {
              ...m,
              secondsRemaining: newSecs,
              endTimestamp: newEndTimestamp,
              crackStage: newCrackStage,
            },
          });

          return { hit: true, bonusSecs: 1, finished: false };
        }

        return { hit: false, bonusSecs: 0, finished: false };
      },

      finishMiningTimer: () => {
        const state = get();
        if (state.mining.state !== 'running') return;
        soundManager.playBreakBlock(state.soundEnabled, state.soundVolume);

        if (state.mining.mode === 'focus') {
          const focusMins = state.timerSettings.focus;
          const oreType = state.mining.currentBlock;
          const oreBonusXp =
            oreType === 'diamond' ? 50 : oreType === 'gold' ? 35 : oreType === 'iron' ? 25 : 15;
          const baseXpEarned = focusMins * 2 + oreBonusXp;
          const xpEarned = Math.round(baseXpEarned * (hasEquippedPet(state.shopItems, 'pet_wolf') ? 1.1 : 1));
          const coinEarned =
            Math.round(focusMins * 1.5) +
            (oreType === 'diamond' ? 20 : oreType === 'gold' ? 12 : oreType === 'iron' ? 8 : 4);

          // Add Mining Skill XP
          get().addSkillXp('mining', xpEarned);

          const ores = { ...state.mining.oresMined };
          ores[oreType] = (ores[oreType] || 0) + 1;

          const dailyXpUpdate = getDailyXpUpdate(state, xpEarned);
          const newTotalXp = state.totalXp + xpEarned;
          const newCoins = state.coins + coinEarned;

          const newLevel = getIslandLevelForXp(newTotalXp);
          let levelUpInfo = state.levelUpModal;
          if (newLevel > state.islandLevel) {
            soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
            levelUpInfo = {
              level: newLevel,
              unlockedPerks:
                ISLAND_LEVEL_PERKS[newLevel] || [
                  `Sanctuary reached Level ${newLevel}! Expansion unlocked.`,
                ],
            };
          }

          set((s) => ({
            coins: newCoins,
            ...dailyXpUpdate,
            totalXp: newTotalXp,
            islandLevel: Math.max(s.islandLevel, newLevel),
            levelUpModal: levelUpInfo,
            mining: {
              ...s.mining,
              state: 'finished',
              secondsRemaining: 0,
              crackStage: 5,
              totalFocusMinutesCompleted: s.mining.totalFocusMinutesCompleted + focusMins,
              oresMined: ores,
              endTimestamp: undefined,
            },
          }));
        } else {
          // Break timer finished
          set((s) => ({
            mining: {
              ...s.mining,
              state: 'finished',
              secondsRemaining: 0,
              crackStage: 0,
              endTimestamp: undefined,
            },
          }));
        }
      },

      completeLinkedMiningQuest: () => {
        const state = get();
        const linkedId = state.mining.linkedQuestId;
        if (!linkedId) return;

        const quest = state.quests.find((q) => q.id === linkedId);
        if (!quest) return;

        if (!quest.completed) {
          get().toggleQuest(linkedId);
        }

        set((s) => ({
          mining: { ...s.mining, linkedQuestId: undefined },
        }));
      },

      setMiningMode: (mode) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const mins =
          mode === 'focus'
            ? state.timerSettings.focus
            : mode === 'short_break'
            ? state.timerSettings.shortBreak
            : state.timerSettings.longBreak;
        set((s) => ({
          mining: {
            ...s.mining,
            mode,
            state: 'idle',
            secondsRemaining: mins * 60,
            crackStage: 0,
            endTimestamp: undefined,
          },
        }));
      },

      setMiningBlock: (block) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        set((s) => ({
          mining: { ...s.mining, currentBlock: block },
        }));
      },

      linkMiningQuest: (questId) => {
        set((s) => ({
          mining: { ...s.mining, linkedQuestId: questId },
        }));
      },

      // Skills
      skills: initialSkills,
      addSkillXp: (skillType, amount) => {
        set((state) => {
          const skill = state.skills[skillType];
          if (!skill) return state;

          const newXp = skill.xp + amount;
          let newLevel = skill.level;
          let nextLevelXp = skill.nextLevelXp;

          if (newXp >= skill.nextLevelXp) {
            newLevel += 1;
            nextLevelXp = Math.round(skill.nextLevelXp * 1.5);
            soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
          }

          // Check milestones
          const milestones = skill.milestones.map((m) =>
            m.level <= newLevel ? { ...m, unlocked: true } : m
          );

          return {
            skills: {
              ...state.skills,
              [skillType]: {
                ...skill,
                level: newLevel,
                xp: newXp,
                nextLevelXp,
                milestones,
              },
            },
          };
        });
      },

      // Notes
      notes: initialNotes,
      addNote: (n) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const newNote: LibraryNote = {
          ...n,
          id: `note_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Foraging XP reward
        get().addSkillXp('foraging', 15);
        set({ notes: [newNote, ...state.notes] });
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      deleteNote: (id) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const note = state.notes.find((n) => n.id === id);
        if (!note) return;

        set({
          notes: state.notes.filter((n) => n.id !== id),
          undoToast: {
            id: `undo_${Date.now()}`,
            type: 'note_delete',
            title: `Deleted note "${note.title}"`,
            data: { note },
            timestamp: Date.now(),
          },
        });
      },

      togglePinNote: (id) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        set({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        });
      },

      // Chest & Shop
      shopItems: initialShopItems,
      grantTestCoinsForDevelopment: () => {
        if (process.env.NODE_ENV !== 'development') return;
        const state = get();
        if (state.testCoinGrantApplied) return;
        set({
          coins: state.coins + 100_000,
          testCoinGrantApplied: true,
        });
      },
      grantTestLevelForDevelopment: () => {
        if (process.env.NODE_ENV !== 'development') return;
        const state = get();
        if (state.testLevelGrantApplied) return;
        set({
          islandLevel: 100,
          totalXp: Math.max(state.totalXp, getIslandXpForLevel(100)),
          testLevelGrantApplied: true,
        });
      },
      dailyChest: {
        lastClaimDate: undefined,
        claimStreak: 0,
      },
      buyShopItem: (id) => {
        const state = get();
        const item = state.shopItems.find((i) => i.id === id);
        const hasOreMaterials = Object.entries(item?.oreCost ?? {}).every(
          ([ore, amount]) => state.mining.oresMined[ore as MiningBlockType] >= (amount ?? 0)
        );
        if (!item || item.owned || state.coins < item.price
          || !hasOreMaterials || state.islandLevel < (item.requiredLevel ?? 1)) return;

        soundManager.playLevelUp(state.soundEnabled, state.soundVolume);

        let newTheme = state.theme;
        if (item.category === 'theme') {
          if (item.id === 'theme_sunset') newTheme = 'sunset';
          if (item.id === 'theme_cloudy') newTheme = 'cloudy';
          if (item.id === 'theme_night') newTheme = 'night';
          if (item.id === 'theme_galaxy') newTheme = 'galaxy';
        }

        set({
          coins: state.coins - item.price,
          theme: newTheme,
          mining: {
            ...state.mining,
            oresMined: Object.fromEntries(
              Object.entries(state.mining.oresMined).map(([ore, amount]) => [
                ore,
                amount - (item.oreCost?.[ore as MiningBlockType] ?? 0),
              ])
            ) as MiningState['oresMined'],
          },
          shopItems: state.shopItems.map((i) => {
            if (i.id === id) return { ...i, owned: true, equipped: true };
            if (i.category === item.category) return { ...i, equipped: false };
            return i;
          }),
        });
      },

      equipShopItem: (id) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const item = state.shopItems.find((i) => i.id === id);
        if (!item?.owned || (!item.equipped && state.islandLevel < (item.requiredLevel ?? 1))) return;

        const willEquip = !item.equipped;
        let newTheme = state.theme;
        if (item.category === 'theme') {
          const selectedTheme = item.id.replace('theme_', '') as IslandTheme;
          newTheme = willEquip ? selectedTheme : state.theme === selectedTheme ? 'day' : state.theme;
        }

        set({
          theme: newTheme,
          shopItems: state.shopItems.map((i) => {
            if (i.category === item.category) {
              return { ...i, equipped: i.id === id ? willEquip : false };
            }
            return i;
          }),
        });
      },

      openChestReward: () => {
        const state = get();
        const today = getTodayDateString();

        // 1. Guard against claiming more than once per day
        if (state.dailyChest.lastClaimDate === today) {
          return {
            coins: 0,
            xp: 0,
            streakDay: state.dailyChest.claimStreak,
            alreadyClaimed: true,
          };
        }

        soundManager.playChestOpen(state.soundEnabled, state.soundVolume);

        // 2. Calculate consecutive daily claim streak
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yYear = yesterdayDate.getFullYear();
        const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
        const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
        const yesterday = `${yYear}-${yMonth}-${yDay}`;

        let newStreak = 1;
        if (state.dailyChest.lastClaimDate === yesterday) {
          newStreak = (state.dailyChest.claimStreak || 0) + 1;
        } else if (!state.dailyChest.lastClaimDate) {
          newStreak = 1;
        } else {
          // Streak broke (missed a day)
          newStreak = 1;
        }

        // 3. Scaled tier loot by streak day (Days 1 to 7+)
        const streakTier = Math.min(7, newStreak);
        const tierTable: Record<
          number,
          { coins: number; xp: number; ore?: MiningBlockType; count?: number }
        > = {
          1: { coins: 35, xp: 20 },
          2: { coins: 50, xp: 30 },
          3: { coins: 70, xp: 45, ore: 'stone', count: 2 },
          4: { coins: 95, xp: 60, ore: 'iron', count: 1 },
          5: { coins: 130, xp: 80, ore: 'gold', count: 1 },
          6: { coins: 175, xp: 110, ore: 'diamond', count: 1 },
          7: { coins: 250, xp: 150, ore: 'diamond', count: 2 },
        };

        const rewardConfig = tierTable[streakTier] || tierTable[7];
        const coinsWon = Math.round(rewardConfig.coins * (hasEquippedPet(state.shopItems, 'pet_fox') ? 1.15 : 1));
        const xpWon = rewardConfig.xp;
        const bonusOre = rewardConfig.ore;
        const bonusOreCount = rewardConfig.count || 0;

        const dailyXpUpdate = getDailyXpUpdate(state, xpWon);
        const newTotalXp = state.totalXp + xpWon;
        const newCoins = state.coins + coinsWon;

        // Stockpile bonus ores into mining stockpile
        const updatedOres = { ...state.mining.oresMined };
        if (bonusOre && bonusOreCount > 0) {
          updatedOres[bonusOre] = (updatedOres[bonusOre] || 0) + bonusOreCount;
        }

        // 4. Check for Island Sanctuary Level Up
        const newLevel = getIslandLevelForXp(newTotalXp);
        let levelUpInfo = state.levelUpModal;
        if (newLevel > state.islandLevel) {
          soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
          levelUpInfo = {
            level: newLevel,
            unlockedPerks:
              ISLAND_LEVEL_PERKS[newLevel] || [
                `Sanctuary reached Level ${newLevel}! Expansion unlocked.`,
              ],
          };
        }

        set({
          coins: newCoins,
          ...dailyXpUpdate,
          totalXp: newTotalXp,
          islandLevel: Math.max(state.islandLevel, newLevel),
          levelUpModal: levelUpInfo,
          dailyChest: {
            lastClaimDate: today,
            claimStreak: newStreak,
          },
          mining: {
            ...state.mining,
            oresMined: updatedOres,
          },
        });

        return {
          coins: coinsWon,
          xp: xpWon,
          bonusOre,
          bonusOreCount,
          streakDay: newStreak,
          alreadyClaimed: false,
        };
      },

      // Settings
      setIslandName: (name) => set({ islandName: name }),
      setIslandTitle: (title) => set({ islandTitle: title }),
      setTheme: (theme) => {
        const state = get();
        if (theme !== 'day' && !state.shopItems.find((item) => item.id === `theme_${theme}`)?.owned) return;
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
        set({
          theme,
          shopItems: state.shopItems.map((item) => item.category === 'theme'
            ? { ...item, equipped: item.id === `theme_${theme}` }
            : item),
        });
      },
      setNumberFont: (font) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-number-font', font);
        }
        set({ numberFont: font });
      },
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
      setTimerSettings: (settings) => set({ timerSettings: settings }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      // Undo Toast
      undoToast: null,
      setUndoToast: (item) => set({ undoToast: item }),
      performUndo: () => {
        const state = get();
        const toast = state.undoToast;
        if (!toast) return;

        soundManager.playClick(state.soundEnabled, state.soundVolume);

        if (toast.type === 'quest_delete' && toast.data.quest) {
          set({ quests: [toast.data.quest, ...state.quests], undoToast: null });
        } else if (toast.type === 'quest_complete' && toast.data.id) {
          set({
            quests: state.quests.map((q) =>
              q.id === toast.data.id ? { ...q, completed: false, completedAt: undefined, rewardClaimed: true } : q
            ),
            undoToast: null,
          });
        } else if (toast.type === 'note_delete' && toast.data.note) {
          set({ notes: [toast.data.note, ...state.notes], undoToast: null });
        } else if (toast.type === 'minion_delete' && toast.data.minion) {
          set({ minions: [...state.minions, toast.data.minion], undoToast: null });
        }
      },

      // Data Backup & Export / Import
      exportDataJson: () => {
        const state = get();
        const data = {
          islandName: state.islandName,
          islandTitle: state.islandTitle,
          islandLevel: state.islandLevel,
          totalXp: state.totalXp,
          coins: state.coins,
          dailyXp: state.dailyXp,
          dailyXpDate: state.dailyXpDate,
          dailyXpGoal: state.dailyXpGoal,
          streak: state.streak,
          lastActiveDate: state.lastActiveDate,
          theme: state.theme,
          numberFont: state.numberFont,
          soundEnabled: state.soundEnabled,
          soundVolume: state.soundVolume,
          reducedMotion: state.reducedMotion,
          timerSettings: state.timerSettings,
          onboardingCompleted: state.onboardingCompleted,
          quests: state.quests,
          minions: state.minions,
          skills: state.skills,
          notes: state.notes,
          shopItems: state.shopItems,
          dailyChest: state.dailyChest,
          mining: state.mining,
          farmLastHarvestDate: state.farmLastHarvestDate,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(data, null, 2);
      },

      importDataJson: (jsonString) => {
        try {
          const parsed: unknown = JSON.parse(jsonString);
          if (!isValidImport(parsed)) return false;
          const current = get();
          const shopItems = normalizeShopItems(parsed.shopItems || get().shopItems);
          const requestedTheme = typeof parsed.theme === 'string' ? parsed.theme : current.theme;
          const theme: IslandTheme = requestedTheme === 'day'
            ? 'day'
            : shopItems.some((item) => item.id === `theme_${requestedTheme}` && item.owned)
              ? requestedTheme as IslandTheme
              : 'day';
          const importedXp = typeof parsed.totalXp === 'number' ? parsed.totalXp : current.totalXp;
          const importedLevel = typeof parsed.islandLevel === 'number'
            ? Math.max(parsed.islandLevel, getIslandLevelForXp(importedXp))
            : Math.max(current.islandLevel, getIslandLevelForXp(importedXp));
          const importedMining = isRecord(parsed.mining) ? parsed.mining as unknown as MiningState : current.mining;
          const safeTimerSettings = isRecord(parsed.timerSettings)
            ? {
                focus: Math.min(120, Math.max(5, Number(parsed.timerSettings.focus) || current.timerSettings.focus)),
                shortBreak: Math.min(30, Math.max(1, Number(parsed.timerSettings.shortBreak) || current.timerSettings.shortBreak)),
                longBreak: Math.min(60, Math.max(5, Number(parsed.timerSettings.longBreak) || current.timerSettings.longBreak)),
                autoStartBreaks: parsed.timerSettings.autoStartBreaks === true,
              }
            : current.timerSettings;
          const today = getTodayDateString();
          const importedDailyXpDate = typeof parsed.dailyXpDate === 'string' ? parsed.dailyXpDate : today;
          set({
            islandName: typeof parsed.islandName === 'string' ? parsed.islandName : current.islandName,
            islandTitle: typeof parsed.islandTitle === 'string' ? parsed.islandTitle : current.islandTitle,
            islandLevel: importedLevel,
            totalXp: importedXp,
            dailyXp: importedDailyXpDate === today && typeof parsed.dailyXp === 'number' ? parsed.dailyXp : 0,
            dailyXpDate: today,
            dailyXpGoal: typeof parsed.dailyXpGoal === 'number' ? parsed.dailyXpGoal : current.dailyXpGoal,
            coins: typeof parsed.coins === 'number' ? parsed.coins : current.coins,
            streak: typeof parsed.streak === 'number' ? parsed.streak : current.streak,
            lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : current.lastActiveDate,
            theme,
            numberFont: parsed.numberFont === 'clean' || parsed.numberFont === 'silkscreen' || parsed.numberFont === 'pixel' ? parsed.numberFont : current.numberFont,
            soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : current.soundEnabled,
            soundVolume: typeof parsed.soundVolume === 'number' ? Math.min(1, parsed.soundVolume) : current.soundVolume,
            reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : current.reducedMotion,
            timerSettings: safeTimerSettings,
            onboardingCompleted: typeof parsed.onboardingCompleted === 'boolean' ? parsed.onboardingCompleted : current.onboardingCompleted,
            farmLastHarvestDate: typeof parsed.farmLastHarvestDate === 'string' ? parsed.farmLastHarvestDate : current.farmLastHarvestDate,
            quests: Array.isArray(parsed.quests) ? parsed.quests.map((quest) => ({ ...quest, rewardClaimed: quest.rewardClaimed === true || quest.completed })) as Quest[] : current.quests,
            minions: Array.isArray(parsed.minions) ? parsed.minions as Minion[] : current.minions,
            skills: isRecord(parsed.skills) ? parsed.skills as unknown as Record<SkillType, Skill> : current.skills,
            notes: Array.isArray(parsed.notes) ? parsed.notes as LibraryNote[] : current.notes,
            mining: { ...importedMining, state: importedMining.state === 'running' ? 'paused' : importedMining.state, endTimestamp: undefined },
            shopItems: shopItems.map((item) => item.category === 'theme'
              ? { ...item, equipped: item.id === `theme_${theme}` }
              : item),
            dailyChest: isRecord(parsed.dailyChest) ? parsed.dailyChest as unknown as DailyChestState : current.dailyChest,
          });
          return true;
        } catch {
          return false;
        }
      },

      resetAllData: () => {
        set({
          islandName: 'SkyDome Sanctuary',
          islandTitle: 'Skyblock Architect',
          islandLevel: 4,
          totalXp: 1160,
          dailyXp: 55,
          dailyXpDate: getTodayDateString(),
          dailyXpGoal: 100,
          coins: 240,
          streak: 5,
          lastActiveDate: getTodayDateString(),
          theme: 'day',
          numberFont: 'tabular',
          soundEnabled: false,
          soundVolume: 0.5,
          reducedMotion: false,
          timerSettings: { focus: 25, shortBreak: 5, longBreak: 15, autoStartBreaks: false },
          onboardingCompleted: true,
          activeTab: 'island',
          commandPaletteOpen: false,
          quickAddModalOpen: false,
          levelUpModal: null,
          undoToast: null,
          farmLastHarvestDate: undefined,
          testCoinGrantApplied: false,
          testLevelGrantApplied: false,
          quests: initialQuests,
          minions: initialMinions,
          skills: initialSkills,
          notes: initialNotes,
          shopItems: initialShopItems,
          dailyChest: {
            lastClaimDate: undefined,
            claimStreak: 0,
          },
          mining: {
            mode: 'focus',
            state: 'idle',
            secondsRemaining: 25 * 60,
            totalFocusMinutesCompleted: 125,
            linkedQuestId: 'q2',
            currentBlock: 'stone',
            crackStage: 0,
            oresMined: { stone: 24, iron: 8, gold: 2, diamond: 1 },
          },
        });
      },
    }),
    {
      name: 'SkyDo_storage_v1',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<SkyDoState>;
        const shopItems = normalizeShopItems(persisted.shopItems ?? currentState.shopItems);
        const today = getTodayDateString();
        const hasDailyXpForToday = persisted.dailyXpDate === today;
        const requestedTheme = persisted.theme ?? currentState.theme;
        const theme = requestedTheme === 'day' || shopItems.some(
          (item) => item.id === `theme_${requestedTheme}` && item.owned
        ) ? requestedTheme : 'day';
        return {
          ...currentState,
          ...persisted,
          dailyXpDate: today,
          dailyXp: hasDailyXpForToday ? persisted.dailyXp ?? currentState.dailyXp : 0,
          theme,
          shopItems: shopItems.map((item) => item.category === 'theme'
            ? { ...item, equipped: item.id === `theme_${theme}` }
            : item),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state && process.env.NODE_ENV === 'development') {
          state.grantTestCoinsForDevelopment();
          state.grantTestLevelForDevelopment();
        }
        if (state && state.islandName === 'SkyDo Sanctuary') {
          state.islandName = 'SkyDome Sanctuary';
        }
      },
    }
  )
);
export const useSkyDomeStore = useSkyDoStore;
