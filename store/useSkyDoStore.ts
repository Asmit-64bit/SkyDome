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
  IslandSettings,
  UndoItem,
  ActiveTab,
  MiningBlockType,
  MiningTimerMode,
  QuestPriority,
  NumberFontStyle,
  IslandLevelUpInfo,
  DailyChestState,
  ChestRewardResult,
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
  dailyXpGoal: number;
  coins: number;
  streak: number;
  lastActiveDate: string;
  theme: 'day' | 'sunset' | 'cloudy' | 'night';
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
  setTheme: (theme: 'day' | 'sunset' | 'cloudy' | 'night') => void;
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
  2: ['Unlocked: Lush Oak Island Tree 🌳', '+5% Base XP harvest multiplier'],
  3: ['Unlocked: Mountain Cabin & Cozy Fireplace 🏡', '+10% Habit coin yield'],
  4: ['Unlocked: Deep Ore Veins (Gold & Diamond Focus Blocks) 💎', 'Unlocked: Tabular Clock HUD'],
  5: ['Unlocked: Sacred Mountain Waterfall & Pond 🌊', '+15% Quest Coin yield'],
  6: ['Unlocked: Highland Windmill 🌾', 'Master Builder Badge'],
  7: ['Unlocked: Celestial Sky Sanctuary ✨', 'Double Mystery Chest Bounty'],
};

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
      { level: 5, perk: 'Master Harvester (Unlock Windmill decor)', unlocked: false },
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
    category: 'cosmetic',
    price: 0,
    description: 'Warm glowing hearth that flickers with your productivity streak.',
    unlocked: true,
    equipped: true,
    icon: 'campfire',
  },
  {
    id: 'oak_tree',
    name: 'Majestic Oak Tree',
    category: 'cosmetic',
    price: 60,
    description: 'A leafy oak with hanging vines providing shade to your sanctuary.',
    unlocked: true,
    equipped: true,
    icon: 'tree',
  },
  {
    id: 'wooden_cabin',
    name: 'Cozy Timber Cabin',
    category: 'cosmetic',
    price: 150,
    description: 'A sturdy wood-and-stone shelter where productivity takes root.',
    unlocked: true,
    equipped: true,
    icon: 'house',
  },
  {
    id: 'waterfall',
    name: 'Cascading Waterfall',
    category: 'cosmetic',
    price: 250,
    description: 'A pure stream tumbling into the endless cloud sea.',
    unlocked: false,
    equipped: false,
    icon: 'water',
  },
  {
    id: 'windmill',
    name: 'Cobblestone Windmill',
    category: 'cosmetic',
    price: 350,
    description: 'A spinning rustic windmill watching over your Minion plots.',
    unlocked: false,
    equipped: false,
    icon: 'windmill',
  },
  {
    id: 'pet_slime',
    name: 'Friendly Cube Slime',
    category: 'companion',
    price: 450,
    description: 'A cheerful little bouncing block buddy that hops by your side.',
    unlocked: false,
    equipped: false,
    icon: 'slime',
  },
  {
    id: 'theme_sunset',
    name: 'Amber Sunset Sky',
    category: 'theme',
    price: 120,
    description: 'Golden hour palette: warm amber skies and soothing twilight horizons.',
    unlocked: true,
    equipped: false,
    icon: 'sunset',
  },
  {
    id: 'theme_cloudy',
    name: 'Slate Overcast Sky',
    category: 'theme',
    price: 120,
    description: 'Calm, minimalist cloudy atmosphere for low-distraction deep work.',
    unlocked: false,
    equipped: false,
    icon: 'cloud',
  },
  {
    id: 'theme_night',
    name: 'Starry Midnight Sky',
    category: 'theme',
    price: 220,
    description: 'Deep navy celestial heavens with distant pixel constellations.',
    unlocked: false,
    equipped: false,
    icon: 'moon',
  },
];

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
    title: 'Morning review of SkyDo daily quests',
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
    title: 'SkyDo Island Compendium & Guide',
    content: `# Welcome to SkyDo! 🏝️

SkyDo transforms your daily productivity into a thriving **Minecraft Skyblock** sanctuary.

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
      islandName: 'SkyDo Sanctuary',
      islandTitle: 'Skyblock Architect',
      islandLevel: 4,
      totalXp: 1160,
      dailyXp: 55,
      dailyXpGoal: 100,
      coins: 240,
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
          // Play sound
          soundManager.playQuestComplete(state.soundEnabled, state.soundVolume);

          // Add XP & coins
          const newDailyXp = state.dailyXp + quest.xpReward;
          const newTotalXp = state.totalXp + quest.xpReward;
          const newCoins = state.coins + quest.coinReward;

          // Check if island leveled up
          const newLevel = Math.floor(newTotalXp / 300) + 1;
          let levelUpInfo = state.levelUpModal;
          if (newLevel > state.islandLevel) {
            soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
            levelUpInfo = {
              level: newLevel,
              unlockedPerks: ISLAND_LEVEL_PERKS[newLevel] || [`Sanctuary reached Level ${newLevel}! Expansion unlocked.`],
            };
          }

          // Add skill XP based on priority
          const combatGain = quest.priority === 'legendary' ? 40 : quest.priority === 'epic' ? 25 : 10;
          get().addSkillXp('combat', combatGain);

          set({
            quests: state.quests.map((q) =>
              q.id === id
                ? {
                    ...q,
                    completed: true,
                    completedAt: new Date().toISOString(),
                    // also mark subtasks completed
                    subtasks: q.subtasks.map((st) => ({ ...st, completed: true })),
                  }
                : q
            ),
            dailyXp: newDailyXp,
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
              q.id === id ? { ...q, completed: false, completedAt: undefined } : q
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
            questToAutoClaim = { ...q, subtasks: updatedSubtasks };
            return {
              ...q,
              subtasks: updatedSubtasks,
              completed: true,
              completedAt: new Date().toISOString(),
            };
          }

          if (hasIncomplete && q.completed) {
            return {
              ...q,
              subtasks: updatedSubtasks,
              completed: false,
              completedAt: undefined,
            };
          }

          return {
            ...q,
            subtasks: updatedSubtasks,
          };
        });

        if (questToAutoClaim) {
          const qc = questToAutoClaim as Quest;
          soundManager.playQuestComplete(state.soundEnabled, state.soundVolume);
          const newDailyXp = state.dailyXp + qc.xpReward;
          const newTotalXp = state.totalXp + qc.xpReward;
          const newCoins = state.coins + qc.coinReward;

          const newLevel = Math.floor(newTotalXp / 300) + 1;
          let levelUpInfo = state.levelUpModal;
          if (newLevel > state.islandLevel) {
            soundManager.playLevelUp(state.soundEnabled, state.soundVolume);
            levelUpInfo = {
              level: newLevel,
              unlockedPerks: ISLAND_LEVEL_PERKS[newLevel] || [`Sanctuary reached Level ${newLevel}! Expansion unlocked.`],
            };
          }

          get().addSkillXp('combat', qc.priority === 'legendary' ? 40 : qc.priority === 'epic' ? 25 : 10);

          set({
            quests: updatedQuests,
            dailyXp: newDailyXp,
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
        if (!minion) return;

        const isAlreadyDone = minion.completedDates.includes(today);

        if (!isAlreadyDone) {
          soundManager.playHarvest(state.soundEnabled, state.soundVolume);
          const newDates = [today, ...minion.completedDates];
          const { currentStreak, bestStreak } = calculateStreak(newDates);
          const dropAmount = minion.level * 2;

          // Gain farming / habit XP & coins
          get().addSkillXp('farming', 25);
          const xpWon = 25;
          const coinsWon = 15 + minion.level * 2;

          const newDailyXp = state.dailyXp + xpWon;
          const newTotalXp = state.totalXp + xpWon;
          const newCoins = state.coins + coinsWon;

          const newLevel = Math.floor(newTotalXp / 300) + 1;
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
            dailyXp: newDailyXp,
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
        } else {
          // Toggle off
          soundManager.playClick(state.soundEnabled, state.soundVolume);
          const newDates = minion.completedDates.filter((d) => d !== today);
          const { currentStreak } = calculateStreak(newDates);
          set({
            minions: state.minions.map((m) =>
              m.id === id
                ? {
                    ...m,
                    completedDates: newDates,
                    streak: currentStreak,
                  }
                : m
            ),
          });
        }
      },

      harvestAllMinions: () => {
        const state = get();
        const today = getTodayDateString();
        const readyMinions = state.minions.filter((m) => !m.completedDates.includes(today));
        if (readyMinions.length === 0) return { count: 0, totalCoins: 0, totalXp: 0 };

        soundManager.playHarvest(state.soundEnabled, state.soundVolume);

        let totalCoinsGain = 0;
        let totalXpGain = 0;

        const updatedMinions = state.minions.map((m) => {
          if (m.completedDates.includes(today)) return m;

          const newDates = [today, ...m.completedDates];
          const { currentStreak, bestStreak } = calculateStreak(newDates);
          const dropAmount = m.level * 2;
          const coinsWon = 15 + m.level * 2;
          const xpWon = 25;

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

        const newDailyXp = state.dailyXp + totalXpGain;
        const newTotalXp = state.totalXp + totalXpGain;
        const newCoins = state.coins + totalCoinsGain;
        const newLevel = Math.floor(newTotalXp / 300) + 1;
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
          dailyXp: newDailyXp,
          totalXp: newTotalXp,
          islandLevel: Math.max(state.islandLevel, newLevel),
          levelUpModal: levelUpInfo,
        });

        return { count: readyMinions.length, totalCoins: totalCoinsGain, totalXp: totalXpGain };
      },

      toggleMinionDate: (id, date) => {
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

      pauseMiningTimer: () => {
        const state = get();
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
        soundManager.playBreakBlock(state.soundEnabled, state.soundVolume);

        if (state.mining.mode === 'focus') {
          const focusMins = state.timerSettings.focus;
          const oreType = state.mining.currentBlock;
          const oreBonusXp =
            oreType === 'diamond' ? 50 : oreType === 'gold' ? 35 : oreType === 'iron' ? 25 : 15;
          const xpEarned = focusMins * 2 + oreBonusXp;
          const coinEarned =
            Math.round(focusMins * 1.5) +
            (oreType === 'diamond' ? 20 : oreType === 'gold' ? 12 : oreType === 'iron' ? 8 : 4);

          // Add Mining Skill XP
          get().addSkillXp('mining', xpEarned);

          const ores = { ...state.mining.oresMined };
          ores[oreType] = (ores[oreType] || 0) + 1;

          const newDailyXp = state.dailyXp + xpEarned;
          const newTotalXp = state.totalXp + xpEarned;
          const newCoins = state.coins + coinEarned;

          const newLevel = Math.floor(newTotalXp / 300) + 1;
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
            dailyXp: newDailyXp,
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
      dailyChest: {
        lastClaimDate: undefined,
        claimStreak: 0,
      },
      buyShopItem: (id) => {
        const state = get();
        const item = state.shopItems.find((i) => i.id === id);
        if (!item || item.unlocked || state.coins < item.price) return;

        soundManager.playLevelUp(state.soundEnabled, state.soundVolume);

        let newTheme = state.theme;
        if (item.category === 'theme') {
          if (item.id === 'theme_sunset') newTheme = 'sunset';
          if (item.id === 'theme_cloudy') newTheme = 'cloudy';
          if (item.id === 'theme_night') newTheme = 'night';
        }

        set({
          coins: state.coins - item.price,
          theme: newTheme,
          shopItems: state.shopItems.map((i) =>
            i.id === id ? { ...i, unlocked: true, equipped: true } : i
          ),
        });
      },

      equipShopItem: (id) => {
        const state = get();
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        const item = state.shopItems.find((i) => i.id === id);
        if (!item || !item.unlocked) return;

        let newTheme = state.theme;
        if (item.category === 'theme') {
          if (item.id === 'theme_sunset') newTheme = 'sunset';
          if (item.id === 'theme_cloudy') newTheme = 'cloudy';
          if (item.id === 'theme_night') newTheme = 'night';
        }

        set({
          theme: newTheme,
          shopItems: state.shopItems.map((i) => {
            if (i.id === id) return { ...i, equipped: !i.equipped };
            // If category is theme, unequip other themes
            if (item.category === 'theme' && i.category === 'theme') {
              return { ...i, equipped: false };
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
        const coinsWon = rewardConfig.coins;
        const xpWon = rewardConfig.xp;
        const bonusOre = rewardConfig.ore;
        const bonusOreCount = rewardConfig.count || 0;

        const newDailyXp = state.dailyXp + xpWon;
        const newTotalXp = state.totalXp + xpWon;
        const newCoins = state.coins + coinsWon;

        // Stockpile bonus ores into mining stockpile
        const updatedOres = { ...state.mining.oresMined };
        if (bonusOre && bonusOreCount > 0) {
          updatedOres[bonusOre] = (updatedOres[bonusOre] || 0) + bonusOreCount;
        }

        // 4. Check for Island Sanctuary Level Up
        const newLevel = Math.floor(newTotalXp / 300) + 1;
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
          dailyXp: newDailyXp,
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
        soundManager.playClick(state.soundEnabled, state.soundVolume);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
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
              q.id === toast.data.id ? { ...q, completed: false } : q
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
          streak: state.streak,
          theme: state.theme,
          quests: state.quests,
          minions: state.minions,
          skills: state.skills,
          notes: state.notes,
          shopItems: state.shopItems,
          dailyChest: state.dailyChest,
          mining: state.mining,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(data, null, 2);
      },

      importDataJson: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (!parsed.quests && !parsed.islandName) {
            return false;
          }
          set({
            islandName: parsed.islandName || get().islandName,
            islandTitle: parsed.islandTitle || get().islandTitle,
            islandLevel: parsed.islandLevel || get().islandLevel,
            totalXp: parsed.totalXp || get().totalXp,
            coins: parsed.coins ?? get().coins,
            streak: parsed.streak ?? get().streak,
            theme: parsed.theme || get().theme,
            quests: parsed.quests || get().quests,
            minions: parsed.minions || get().minions,
            skills: parsed.skills || get().skills,
            notes: parsed.notes || get().notes,
            shopItems: parsed.shopItems || get().shopItems,
            dailyChest: parsed.dailyChest || get().dailyChest,
          });
          return true;
        } catch {
          return false;
        }
      },

      resetAllData: () => {
        set({
          islandName: 'SkyDo Sanctuary',
          islandTitle: 'Skyblock Architect',
          islandLevel: 4,
          totalXp: 1160,
          dailyXp: 55,
          coins: 240,
          streak: 5,
          theme: 'day',
          numberFont: 'tabular',
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
      name: 'skydo_storage_v1',
    }
  )
);
