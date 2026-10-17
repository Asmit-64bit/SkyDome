import * as THREE from 'three';
import { MiningBlockType } from './types';

// Helper to create a 16x16 canvas
function makeCanvas(width = 16, height = 16): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

// Helper to create a crisp pixel-art THREE.CanvasTexture
export function createPixelTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// -------------------------------------------------------------
// 1. Grass Block Textures (Top, Side with fringe, Bottom)
// -------------------------------------------------------------

export function createGrassTopTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);

  // Palette: Natural Minecraft-style grass
  const cBase = '#5FA244';
  const cLight = '#6FA852';
  const cDark = '#4F8C36';
  const cDeep = '#43772E';
  const cHighlight = '#78B85C';

  // Base fill
  ctx.fillStyle = cBase;
  ctx.fillRect(0, 0, 16, 16);

  // Pixel variation matrix for organic grass blades
  const pixels = [
    [cHighlight, 1, 1], [cLight, 2, 1], [cDark, 3, 2], [cDeep, 4, 1],
    [cHighlight, 7, 1], [cLight, 8, 2], [cDark, 9, 1], [cDeep, 12, 1],
    [cDark, 0, 4], [cLight, 1, 5], [cHighlight, 2, 4], [cDeep, 5, 4],
    [cLight, 6, 5], [cDark, 7, 4], [cDeep, 10, 5], [cHighlight, 11, 4],
    [cLight, 13, 5], [cDark, 14, 4], [cDeep, 1, 8], [cHighlight, 3, 8],
    [cLight, 4, 9], [cDark, 5, 8], [cLight, 8, 8], [cDeep, 9, 9],
    [cHighlight, 10, 8], [cDark, 12, 8], [cLight, 15, 9], [cHighlight, 0, 12],
    [cDark, 2, 13], [cLight, 3, 12], [cDeep, 6, 12], [cHighlight, 7, 13],
    [cDark, 8, 12], [cDeep, 11, 13], [cLight, 12, 12], [cHighlight, 14, 13],
  ];

  pixels.forEach(([color, x, y]) => {
    ctx.fillStyle = color as string;
    ctx.fillRect(x as number, y as number, 1, 1);
  });

  // Subtle 1px lighter top/left bevel and darker bottom/right bevel for block definition
  ctx.fillStyle = '#6BAE4F';
  ctx.fillRect(0, 0, 16, 1);
  ctx.fillRect(0, 0, 1, 16);
  ctx.fillStyle = '#3F722A';
  ctx.fillRect(0, 15, 16, 1);
  ctx.fillRect(15, 0, 1, 16);

  return createPixelTexture(canvas);
}

export function createGrassSideTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);

  // 1. Dirt background
  const dirtBase = '#8B5A2B';
  const dirtDark = '#6B421E';
  const dirtLight = '#A36E39';
  const dirtShadow = '#543315';

  ctx.fillStyle = dirtBase;
  ctx.fillRect(0, 0, 16, 16);

  // Dirt pebbles & specks
  const dirtSpecks = [
    [dirtDark, 2, 5], [dirtLight, 3, 5], [dirtDark, 7, 6], [dirtLight, 8, 7],
    [dirtShadow, 12, 5], [dirtLight, 13, 6], [dirtDark, 1, 9], [dirtLight, 2, 10],
    [dirtShadow, 5, 9], [dirtDark, 9, 10], [dirtLight, 10, 9], [dirtShadow, 14, 10],
    [dirtDark, 3, 13], [dirtLight, 4, 14], [dirtShadow, 6, 13], [dirtDark, 8, 14],
    [dirtLight, 11, 13], [dirtDark, 12, 14], [dirtShadow, 15, 13],
  ];
  dirtSpecks.forEach(([color, x, y]) => {
    ctx.fillStyle = color as string;
    ctx.fillRect(x as number, y as number, 1, 1);
  });

  // 2. Hanging grass fringe at top (classic Minecraft grass block side)
  const grassTop = '#5FA244';
  const grassLight = '#6FA852';
  const grassDark = '#3F7A2E';

  // Row 0 & 1: Solid grass top edge
  ctx.fillStyle = grassTop;
  ctx.fillRect(0, 0, 16, 2);
  ctx.fillStyle = grassLight;
  ctx.fillRect(1, 0, 3, 1);
  ctx.fillRect(7, 0, 3, 1);
  ctx.fillRect(12, 0, 2, 1);

  // Irregular hanging blades / drip fringe (Rows 2 to 4)
  const dripBlades = [
    // [col, height, color]
    [0, 3, grassTop], [1, 4, grassTop], [2, 3, grassDark],
    [4, 4, grassTop], [5, 3, grassDark],
    [7, 3, grassDark], [8, 5, grassTop], [9, 4, grassDark],
    [11, 4, grassTop], [12, 3, grassDark],
    [14, 4, grassTop], [15, 3, grassDark],
  ];

  dripBlades.forEach(([col, h, colr]) => {
    ctx.fillStyle = colr as string;
    ctx.fillRect(col as number, 2, 1, (h as number) - 2);
    // Dark grass shadow underneath the drip blade
    ctx.fillStyle = '#3F7A2E';
    ctx.fillRect(col as number, (h as number) - 1, 1, 1);
  });

  // 3. Block edge shading for crisp definition
  ctx.fillStyle = '#6E9E48';
  ctx.fillRect(0, 0, 1, 2);
  ctx.fillStyle = '#4A2A0F';
  ctx.fillRect(0, 15, 16, 1); // Dark bottom edge

  return createPixelTexture(canvas);
}

export function createDirtTexture(dark = false): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);

  const base = dark ? '#5E3B1C' : '#8B5A2B';
  const shadeDark = dark ? '#432710' : '#6B421E';
  const shadeLight = dark ? '#7A4F27' : '#A36E39';
  const deepShadow = dark ? '#301A08' : '#4E2C11';

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 16, 16);

  // Irregular earthy stones and clumps
  const specks = [
    [shadeDark, 1, 1], [shadeLight, 2, 1], [shadeDark, 6, 2], [shadeLight, 7, 2],
    [deepShadow, 11, 1], [shadeDark, 12, 2], [shadeLight, 14, 1],
    [shadeLight, 0, 5], [deepShadow, 3, 6], [shadeDark, 4, 5], [shadeLight, 9, 6],
    [shadeDark, 10, 5], [deepShadow, 13, 6], [shadeLight, 1, 10], [shadeDark, 2, 10],
    [deepShadow, 5, 9], [shadeLight, 7, 10], [shadeDark, 8, 10], [shadeLight, 12, 9],
    [deepShadow, 14, 10], [shadeDark, 0, 13], [shadeLight, 3, 14], [deepShadow, 5, 13],
    [shadeDark, 8, 14], [shadeLight, 10, 13], [deepShadow, 12, 14], [shadeLight, 15, 13],
  ];

  specks.forEach(([color, x, y]) => {
    ctx.fillStyle = color as string;
    ctx.fillRect(x as number, y as number, 1, 1);
  });

  // Block border bevel for clear voxel definition
  ctx.fillStyle = shadeLight;
  ctx.fillRect(0, 0, 16, 1);
  ctx.fillRect(0, 0, 1, 16);
  ctx.fillStyle = deepShadow;
  ctx.fillRect(0, 15, 16, 1);
  ctx.fillRect(15, 0, 1, 16);

  return createPixelTexture(canvas);
}

// -------------------------------------------------------------
// 2. Stone & Cobblestone Textures
// -------------------------------------------------------------

export function createStoneTexture(dark = false): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);

  // Clean, authentic stone palette (firmly gray, never black or coal-like)
  const base = dark ? '#707378' : '#8E9196';
  const light = dark ? '#888B90' : '#A8ACB2';
  const highlight = dark ? '#999DA3' : '#B8BCC2';
  const shadow = dark ? '#5E6166' : '#76797E';
  const mortar = dark ? '#505256' : '#65686D';

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 16, 16);

  // Cobblestone rock facets with natural highlights and bevels
  const rocks: Array<{ x: number; y: number; w: number; h: number; shade: string }> = [
    // Top-left rock
    { x: 1, y: 1, w: 5, h: 4, shade: light },
    // Top-right rock
    { x: 7, y: 1, w: 8, h: 3, shade: base },
    // Mid-left rock
    { x: 1, y: 6, w: 7, h: 4, shade: shadow },
    // Mid-right rock
    { x: 9, y: 5, w: 6, h: 5, shade: light },
    // Bottom-left rock
    { x: 2, y: 11, w: 5, h: 4, shade: light },
    // Bottom-right rock
    { x: 8, y: 11, w: 7, h: 4, shade: shadow },
  ];

  rocks.forEach((r) => {
    ctx.fillStyle = r.shade;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    // Subtle top glint
    ctx.fillStyle = highlight;
    ctx.fillRect(r.x, r.y, Math.max(1, r.w - 1), 1);
  });

  // Soft mortar seams (1px wide, subtle tone)
  ctx.fillStyle = mortar;
  // Horizontal dividing seams
  ctx.fillRect(0, 5, 16, 1);
  ctx.fillRect(0, 10, 16, 1);
  // Vertical separating seams
  ctx.fillRect(6, 0, 1, 5);
  ctx.fillRect(8, 5, 1, 5);
  ctx.fillRect(7, 10, 1, 6);

  // 1px beveled outer block border for voxel sharpness
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, 16, 1);
  ctx.fillRect(0, 0, 1, 16);
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 15, 16, 1);
  ctx.fillRect(15, 0, 1, 16);

  return createPixelTexture(canvas);
}

// -------------------------------------------------------------
// 3. Wood Log (Bark & Top Rings) and Planks
// -------------------------------------------------------------

export function createWoodLogSideTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);
  const base = '#6B4A2B';
  const dark = '#4E331B';
  const light = '#855E38';
  const deep = '#382210';

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 16, 16);

  // Vertical bark ridges
  for (let x = 0; x < 16; x += 3) {
    ctx.fillStyle = dark;
    ctx.fillRect(x, 0, 1, 16);
    ctx.fillStyle = light;
    ctx.fillRect(x + 1, 0, 1, 16);
  }

  // Knot marks
  ctx.fillStyle = deep;
  ctx.fillRect(4, 5, 2, 3);
  ctx.fillRect(11, 10, 2, 2);

  return createPixelTexture(canvas);
}

export function createWoodLogTopTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);
  const bark = '#54371B';
  const woodLight = '#B98E55';
  const woodRing = '#8C6036';
  const woodCore = '#6B4A2B';

  // Outer bark border
  ctx.fillStyle = bark;
  ctx.fillRect(0, 0, 16, 16);

  // Inner wood
  ctx.fillStyle = woodLight;
  ctx.fillRect(2, 2, 12, 12);

  // Concentric ring 1
  ctx.fillStyle = woodRing;
  ctx.strokeRect(3.5, 3.5, 9, 9);

  // Concentric ring 2
  ctx.strokeRect(5.5, 5.5, 5, 5);

  // Pith / core
  ctx.fillStyle = woodCore;
  ctx.fillRect(7, 7, 2, 2);

  return createPixelTexture(canvas);
}

export function createWoodPlankTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);
  const base = '#B98E55';
  const light = '#CEAA75';
  const shadow = '#966D38';
  const groove = '#5E3E19';

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 16, 16);

  // 4 horizontal wood planks
  for (let y = 0; y < 16; y += 4) {
    ctx.fillStyle = groove;
    ctx.fillRect(0, y, 16, 1);
    ctx.fillStyle = light;
    ctx.fillRect(0, y + 1, 16, 1);
    ctx.fillStyle = shadow;
    ctx.fillRect(0, y + 3, 16, 1);
  }

  // Nail specks
  ctx.fillStyle = groove;
  ctx.fillRect(2, 2, 1, 1);
  ctx.fillRect(13, 2, 1, 1);
  ctx.fillRect(5, 6, 1, 1);
  ctx.fillRect(11, 10, 1, 1);
  ctx.fillRect(3, 14, 1, 1);

  return createPixelTexture(canvas);
}

// -------------------------------------------------------------
// 4. Foliage / Leaves Texture
// -------------------------------------------------------------

export function createLeavesTexture(light = false): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);
  const base = light ? '#63A84B' : '#448A2E';
  const lightTone = light ? '#7BC462' : '#5FA244';
  const darkTone = light ? '#4B8E35' : '#336F20';
  const deepTone = light ? '#367024' : '#225213';

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 16, 16);

  // Dappled leaf clusters
  for (let x = 0; x < 16; x += 2) {
    for (let y = 0; y < 16; y += 2) {
      const r = (x * 7 + y * 13) % 4;
      ctx.fillStyle = r === 0 ? lightTone : r === 1 ? darkTone : r === 2 ? deepTone : base;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return createPixelTexture(canvas);
}

// -------------------------------------------------------------
// 5. Mining Ore Block Textures (Stone base + Gems + Cracks)
// -------------------------------------------------------------

export interface OrePalette {
  gemLight: string;
  gemBase: string;
  gemDark: string;
  gemSocket: string;
}

export const ORE_PALETTES: Record<string, OrePalette> = {
  diamond: {
    gemLight: '#AAFAFF',
    gemBase: '#4AA3B5',
    gemDark: '#267382',
    gemSocket: '#133D45',
  },
  gold: {
    gemLight: '#FFF28A',
    gemBase: '#E3B341',
    gemDark: '#A37517',
    gemSocket: '#4D3508',
  },
  iron: {
    gemLight: '#F7E7D7',
    gemBase: '#D4AF87',
    gemDark: '#9C734C',
    gemSocket: '#503822',
  },
};

export function createOreBlockTexture(
  blockType: MiningBlockType,
  crackStage = 0
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(16, 16);

  if (blockType === 'stone') {
    // 1. Pure Authentic Cobblestone (No coal/ore flecks — clean interlocking stones with mortar crevices)
    const cobblePalette = [
      '#93969B', // 0: main stone face
      '#A8ACB2', // 1: light stone highlight
      '#BAC0C7', // 2: bright stone edge glint
      '#808388', // 3: stone shadow
      '#6C6F74', // 4: mortar seam between rocks
    ];

    const cobbleMap = [
      [4, 1, 1, 2, 0, 4, 1, 2, 1, 0, 3, 4, 1, 2, 0, 4],
      [1, 2, 0, 0, 3, 4, 2, 1, 0, 0, 3, 4, 2, 1, 3, 4],
      [1, 0, 0, 3, 3, 4, 1, 0, 0, 3, 4, 4, 1, 0, 3, 4],
      [4, 3, 3, 4, 3, 4, 3, 3, 4, 4, 1, 1, 0, 3, 4, 4],
      [4, 1, 2, 1, 0, 4, 1, 4, 1, 2, 2, 1, 0, 3, 4, 4],
      [1, 2, 1, 0, 0, 3, 4, 1, 2, 1, 0, 0, 3, 3, 4, 4],
      [1, 0, 0, 0, 3, 3, 4, 1, 0, 0, 0, 3, 4, 4, 1, 2],
      [4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 4, 4, 1, 2, 2, 1],
      [4, 3, 4, 1, 2, 1, 0, 4, 3, 1, 2, 1, 0, 0, 3, 4],
      [1, 2, 1, 2, 1, 0, 3, 4, 1, 2, 1, 0, 0, 3, 3, 4],
      [2, 1, 0, 0, 0, 3, 4, 4, 1, 0, 0, 3, 3, 4, 4, 4],
      [4, 3, 3, 3, 4, 4, 1, 1, 3, 3, 4, 4, 4, 1, 2, 1],
      [4, 1, 2, 1, 4, 1, 2, 1, 0, 4, 1, 2, 1, 2, 1, 0],
      [1, 2, 1, 0, 4, 2, 1, 0, 3, 4, 2, 1, 0, 0, 3, 3],
      [1, 0, 3, 3, 4, 1, 0, 3, 4, 4, 1, 0, 0, 3, 3, 4],
      [4, 3, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 3, 4],
    ];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = cobblePalette[cobbleMap[y][x]];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  } else {
    // 2. Smooth Stone Matrix Base for Ores (Iron, Gold, Diamond)
    const stoneTones = [
      '#8A8D91', // 0: mid stone base
      '#96999D', // 1: light stone
      '#A3A6AA', // 2: bright highlight stone
      '#7D8084', // 3: subtle shade
      '#6E7175', // 4: dark shadow
      '#5C5F63', // 5: deep rock crevice
    ];

    const stoneMap = [
      [0, 1, 2, 1, 0, 3, 0, 1, 1, 0, 3, 4, 0, 1, 2, 0],
      [1, 2, 1, 0, 3, 4, 3, 0, 0, 1, 0, 3, 4, 3, 1, 1],
      [0, 1, 0, 4, 5, 4, 0, 1, 2, 1, 0, 0, 3, 0, 0, 2],
      [3, 0, 3, 5, 4, 3, 1, 2, 1, 0, 3, 4, 0, 1, 1, 0],
      [4, 3, 0, 3, 0, 1, 1, 0, 0, 3, 4, 5, 3, 0, 2, 1],
      [3, 0, 1, 0, 1, 2, 0, 3, 4, 4, 5, 4, 0, 1, 1, 0],
      [0, 1, 2, 1, 0, 1, 3, 4, 5, 3, 3, 0, 1, 2, 0, 3],
      [1, 0, 1, 0, 3, 0, 4, 5, 4, 0, 1, 2, 1, 0, 3, 4],
      [0, 3, 0, 4, 4, 3, 3, 4, 0, 1, 2, 1, 0, 3, 4, 5],
      [1, 4, 3, 5, 3, 0, 1, 0, 3, 0, 1, 0, 3, 4, 3, 4],
      [0, 3, 0, 4, 0, 1, 2, 1, 4, 3, 0, 1, 0, 3, 0, 3],
      [3, 0, 1, 0, 3, 0, 1, 0, 5, 4, 3, 0, 1, 2, 1, 0],
      [4, 3, 2, 1, 4, 3, 0, 3, 4, 3, 0, 3, 0, 1, 0, 3],
      [3, 0, 1, 0, 5, 4, 3, 0, 0, 1, 2, 1, 3, 0, 3, 4],
      [0, 1, 0, 3, 4, 3, 0, 1, 1, 2, 1, 0, 4, 3, 4, 5],
      [1, 2, 1, 0, 3, 0, 1, 2, 0, 1, 0, 3, 5, 4, 3, 4],
    ];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = stoneTones[stoneMap[y][x]];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Embed ore veins only for iron, gold, diamond
    const pal = ORE_PALETTES[blockType];
    if (pal) {
      const orePixels: Array<[number, number, 'light' | 'base' | 'dark' | 'socket']> = [
        // Cluster 1 (Top-Right vein)
        [10, 2, 'socket'], [11, 2, 'dark'], [12, 2, 'light'], [13, 2, 'socket'],
        [9, 3, 'socket'], [10, 3, 'dark'], [11, 3, 'base'], [12, 3, 'base'], [13, 3, 'dark'],
        [10, 4, 'light'], [11, 4, 'base'], [12, 4, 'dark'], [13, 4, 'socket'],
        [11, 5, 'socket'],

        // Cluster 2 (Mid-Left vein)
        [2, 6, 'socket'], [3, 6, 'light'], [4, 6, 'socket'],
        [1, 7, 'socket'], [2, 7, 'dark'], [3, 7, 'base'], [4, 7, 'base'], [5, 7, 'dark'],
        [2, 8, 'dark'], [3, 8, 'base'], [4, 8, 'dark'], [5, 8, 'socket'],
        [3, 9, 'socket'], [4, 9, 'dark'],

        // Cluster 3 (Bottom-Right vein)
        [8, 10, 'socket'], [9, 10, 'light'], [10, 10, 'dark'],
        [7, 11, 'socket'], [8, 11, 'dark'], [9, 11, 'base'], [10, 11, 'base'], [11, 11, 'socket'],
        [8, 12, 'dark'], [9, 12, 'base'], [10, 12, 'dark'],
        [9, 13, 'socket'],

        // Cluster 4 (Top-Left small crystal)
        [4, 2, 'dark'], [5, 2, 'light'], [6, 2, 'socket'],
        [5, 3, 'base'], [6, 3, 'dark'],

        // Cluster 5 (Mid-Right small crystal)
        [13, 7, 'light'], [14, 7, 'dark'],
        [12, 8, 'dark'], [13, 8, 'base'], [14, 8, 'socket'],
      ];

      orePixels.forEach(([x, y, type]) => {
        if (type === 'light') ctx.fillStyle = pal.gemLight;
        else if (type === 'base') ctx.fillStyle = pal.gemBase;
        else if (type === 'dark') ctx.fillStyle = pal.gemDark;
        else ctx.fillStyle = pal.gemSocket;

        ctx.fillRect(x, y, 1, 1);
      });
    }
  }

  // 3. Progressive Fracture Cracks (painted directly onto the texture)
  if (crackStage > 0) {
    const crackColor = '#141416';
    const crackStress = 'rgba(255, 255, 255, 0.55)';

    const crackStages: Array<Array<[number, number]>> = [
      // Stage 1: Fine initial fissure
      [[7, 1], [8, 2], [8, 3], [7, 4], [8, 5]],
      // Stage 2: Spreading into body
      [[7, 6], [6, 7], [5, 8], [9, 6], [10, 7]],
      // Stage 3: Branching web
      [[3, 8], [4, 9], [11, 8], [12, 9], [7, 8], [8, 9]],
      // Stage 4: Deep spiderweb fractures
      [[2, 5], [3, 6], [8, 10], [8, 11], [9, 12], [13, 10], [14, 11]],
      // Stage 5: Shattering edge fractures
      [[1, 4], [2, 12], [3, 13], [8, 13], [8, 14], [14, 13], [14, 6], [15, 7]],
    ];

    for (let s = 0; s < crackStage; s++) {
      const pixels = crackStages[s];
      if (pixels) {
        pixels.forEach(([cx, cy]) => {
          ctx.fillStyle = crackColor;
          ctx.fillRect(cx, cy, 1, 1);
          if (s >= 2 && cx + 1 < 16) {
            ctx.fillStyle = crackStress;
            ctx.fillRect(cx + 1, cy, 1, 1);
          }
        });
      }
    }
  }

  return createPixelTexture(canvas);
}
