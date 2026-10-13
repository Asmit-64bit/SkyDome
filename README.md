# SkyDo 🏝️ — Skyblock Productivity Island

A polished, production-quality productivity web application fusing the tactile charm and progression loops of **Minecraft Skyblock** with a clean, calm, and distraction-free productivity system.

---

## ⚡ Quickstart

Run the following commands to install dependencies and launch the application:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production:

```bash
npm run build
npm start
```

---

## 🎨 Visual Direction & Design System

SkyDo adheres strictly to an authentic, retro-crafted indie game menu aesthetic balanced with high readability:

- **Earthy Muted Palette (CSS Tokens):**
  - **Sky:** `#8EC9F0` (zenith) fading to `#DDF1FB` (horizon)
  - **Grass:** `#5FA244`, dark grass `#3F7A2E`
  - **Dirt:** `#8B5A2B`, dark dirt `#5E3B1C`
  - **Stone:** `#8A8D91`, dark stone `#4B4E52`, light stone `#C7C9CC`
  - **Wood / Oak:** `#B98E55`, dark oak `#6B4A2B`
  - **Gold Accent (Primary Highlight):** `#E3B341`
  - **Redstone (Danger only, muted):** `#B3392F`
  - **Diamond (Teal-blue):** `#4AA3B5`
  - **Text on Light:** `#2B2118`, **Text on Dark:** `#F4EFE6`
  - **Strictly NO purple, violet, magenta, neon, or blurry glow box-shadows.**
- **Tactile Carved Bevels:** Panels and buttons feature authentic 2-3px solid bevel borders with a lighter top/left highlight, darker bottom/right shadow edge, and flat offset drop shadows.
- **Micro-Interactions:** Buttons depress by 2px on press (`:active`), shifting the bevel inward like real Minecraft UI buttons.
- **Typography:**
  - `Pixelify Sans` for headings, labels, and badges only (`font-pixel`).
  - `Inter` for body copy, notes, and task text to ensure maximum readability and zero eye strain.
- **Procedural 8-Bit Web Audio:** Custom synthesizer using the Web Audio API (zero external audio file dependencies). Plays soft wooden clicks, level-up fanfares, chest creaks, and block break chimes. Off by default per requirement.
- **Accessibility:** Full keyboard navigation (`Tab`, `Space`, `Enter`, `Esc`), visible gold focus rings (`focus-visible`), WCAG AA contrast, and `prefers-reduced-motion` compliance.

---

## 🛠️ Core Feature Architecture

SkyDo maps everyday productivity habits to Skyblock game loops:

### 1. 🏝️ Island Hub (Dashboard) & 3D Voxel World
- **Interactive 3D Voxel Island (Three.js):** A full 3D voxel floating island with 360° mouse & touch orbit rotation, realistic PCF shadow mapping, and dynamic atmosphere lighting responsive to current sky themes (Day, Sunset, Cloudy, Night).
- **Toggleable 3D / 2D Modes:** Switch between real-time 3D voxel graphics and classic crisp 2D pixel art anytime.
- **Visual Island Growth in 3D:** As your island level advances, new 3D voxel elements spawn on your island:
  - *Level 1:* 3D Campfire with animated point lighting and flickering flame particles.
  - *Level 2:* Volumetric 3D Oak Tree with wooden trunk and leafy canopy.
  - *Level 3:* 3D Wooden Storage Chest with gold latch.
  - *Level 4:* Cozy 3D Timber Cabin with pitched roof, window, and cobblestone chimney.
  - *Level 5+:* Cascading 3D Waterfall plunging off the cliff edge, rotating Windmill blades, and companion bouncing Slime!
- **Daily Streak Campfire:** Animated campfire flame tracking consecutive productive days.
- **Quick-Add Bar:** Natural language input right on the dashboard.

### 2. 📜 Quest Log (Tasks)
- **Rarity / Priority Tiers:** *Common*, *Uncommon*, *Rare*, *Epic*, *Legendary* indicated by clean, muted border accents.
- **Subtask Checklists:** Direct inline check-off and creation of subtasks.
- **Views:** *Today*, *Upcoming*, *All*, *Completed*.
- **Drag & Reorder:** Up/down ordering controls.
- **Natural Language Parsing:** Type `"Deploy release tomorrow 5pm !epic #work"` and SkyDo automatically schedules the date, time, priority, and hashtags.
- **Celebration:** Slaying a quest triggers a pixel particle burst, XP popup, and sound.
- **Undo Toast:** Toast notification with an active countdown timer allows instant undo.

### 3. ⚙️ Minion Plots (Recurring Habits)
- **Automated Block Minions:** Cute animated characters on designated garden plots.
- **Habit Check-Off:** Checking off your daily habit makes your minion celebrate and drop resource items (*Wheat*, *Iron Ingot*, *Oak Timber*, *Polished Stone*).
- **4-Week Mini Heatmap:** 28-day contribution square grid per habit. Click any past day to toggle records.
- **Minion Tier Upgrades:** Spend coins to upgrade minions up to Tier 11, compounding resource yields.

### 4. ⚒️ Focus Mining Shaft (3D Pomodoro Timer)
- **Interactive 3D Voxel Ore Block (Three.js):** Choose between *Cobblestone*, *Iron Ore*, *Gold Ore*, and *Diamond Ore* rotating in full 3D.
- **Dynamic 3D Fracture Decals:** As focus time elapses, the 3D block progressively fractures with 5 stages of crack planes across all faces.
- **Animated 3D Pickaxe:** 3D pixel pickaxe dynamically strikes the mineral block on timer ticks.
- **Toggleable 3D / 2D:** Switch between the 3D interactive voxel block and 2D pixel art.
- **Quest Linkage & Stockpile:** Link focus sessions directly to active quests and accumulate mined ores in your vault.

### 5. 🌟 Skills & Analytics
- **5 Core Skill Disciplines:**
  - *Farming:* Levelled via daily Minion habits.
  - *Mining:* Levelled via Focus Pomodoro sessions.
  - *Combat:* Levelled by slaying high-priority, Epic, and Legendary quests.
  - *Foraging:* Levelled by documenting Library notes.
  - *Fishing:* Levelled by on-time scheduled Almanac quests.
- **Milestones:** Unlock passive perks and island decor at milestone levels.
- **Weekly Analytics:** Clean charts built with `Recharts` using the earthy muted palette (Weekly XP Production and Deep Focus Minutes).

### 6. 📚 The Island Library (Notes)
- **Bookshelf Shelf View:** Folders and tomes organized like leather books on a wooden bookshelf.
- **Clean Markdown Editor:** Full support for headers, lists, quotes, and a live toggleable Preview mode.
- **Search & Pinning:** Instantly filter notes by content or pin crucial guides to the top.

### 7. 🎁 Treasure Vault & Bazaar (Chest & Shop)
- **Daily Bounty Crate:** Open the wooden treasure chest with an authentic lid-creaking animation to harvest random coin and XP drops.
- **Bazaar Catalog:** Spend earned productivity coins on architectural island cosmetics (*Campfire*, *Oak Tree*, *Cozy Cabin*, *Windmill*, *Waterfall*, *Pet Slime*) and Sky Themes.

### 8. 📅 Almanac (Calendar)
- **Month & Week Views:** Quests with scheduled due dates appear as compact colored blocks.
- **Day Inspector:** Click any date to view scheduled objectives or plant a new due task directly.

### 9. ⚙️ Settings & Persistence
- **Themes:** Toggle between *Daytime Azure*, *Amber Sunset*, *Overcast Slate*, and *Midnight Sky*.
- **Sound Synth:** Turn procedural 8-bit sound effects on/off and adjust the master volume slider.
- **Reduced Motion:** Pause floating island bobs and cloud drifting.
- **Timer Customization:** Customize Focus, Short Break, and Long Break durations.
- **Zero Backend / JSON Portability:** All data is kept securely in `localStorage`. One-click *Export Island JSON* and *Import JSON* backup tools ensure complete data ownership.
- **Command Palette:** Press `Ctrl+K` or `Cmd+K` anywhere to search and jump to any page or command.

---

## 🏗️ Folder Structure

```
├── app/
│   ├── globals.css          # Skyblock CSS tokens, bevels, buttons, animations
│   ├── layout.tsx           # Pixelify Sans & Inter Google Font loading
│   └── page.tsx             # Server page wrapping SkyDoApp in Suspense
├── components/
│   ├── icons/
│   │   └── PixelIcons.tsx   # Original pixel-art SVG sprites
│   ├── island/
│   │   └── FloatingIslandHero.tsx # Layered sky & growing floating island
│   ├── layout/
│   │   ├── BottomTabBar.tsx # Mobile 5-tab bar + More drawer + FAB
│   │   ├── CommandPalette.tsx # Ctrl+K quick action engine
│   │   ├── OnboardingModal.tsx # 3-step intro setup
│   │   └── Sidebar.tsx      # Desktop stone navigation
│   ├── minions/
│   │   ├── MinionCard.tsx   # Animated minion plot + 4-week heatmap
│   │   └── MinionModal.tsx  # Minion configuration dialog
│   ├── quests/
│   │   ├── QuestItem.tsx    # Tactile checkbox, subtasks, priority borders
│   │   ├── QuestModal.tsx   # Full quest editor
│   │   └── QuickAddInput.tsx # Natural language date & tag parser
│   ├── ui/
│   │   ├── PixelBadge.tsx   # Rarity badges (Common - Legendary)
│   │   ├── PixelButton.tsx  # Minecraft tactile button with active depression
│   │   ├── PixelModal.tsx   # Dialog container with stone titlebar
│   │   ├── PixelPanel.tsx   # Carved stone, wood, and parchment panels
│   │   ├── PixelProgress.tsx# XP bar with bevel styling
│   │   ├── PixelTabs.tsx    # Wooden signpost tabs
│   │   └── ToastContainer.tsx # Undo toast with countdown timer
│   ├── views/
│   │   ├── CalendarView.tsx
│   │   ├── ChestView.tsx
│   │   ├── IslandDashboard.tsx
│   │   ├── LibraryView.tsx
│   │   ├── MiningView.tsx
│   │   ├── MinionsView.tsx
│   │   ├── QuestsView.tsx
│   │   ├── SettingsView.tsx
│   │   └── SkillsView.tsx
│   └── SkyDoApp.tsx         # Client root coordinator
├── lib/
│   ├── dateParser.ts        # Natural language date/time parser
│   ├── sound.ts             # Web Audio API 8-bit procedural sound synth
│   └── types.ts             # TypeScript models & types
└── store/
    └── useSkyDoStore.ts     # Zustand store with persistence & seed data
```

---

## 📜 License & Originality Notice
SkyDo is an original productivity web application. All sprites, icons, and themes are custom SVG creations designed to capture the cozy feel of voxel skyblock adventures without utilizing any proprietary Minecraft or Hypixel assets, trademarks, or textures.
