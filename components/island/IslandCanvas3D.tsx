'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import {
  createGrassTopTexture,
  createGrassSideTexture,
  createDirtTexture,
  createStoneTexture,
  createWoodLogSideTexture,
  createWoodLogTopTexture,
  createWoodPlankTexture,
  createLeavesTexture,
  createOreBlockTexture,
} from '../../lib/textures';

export const IslandCanvas3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useSkyDoStore((state) => state.theme);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);
  const shopItems = useSkyDoStore((state) => state.shopItems);

  // Only owned and equipped Bazaar items appear on the island.
  const isOwnedAndEquipped = (id: string) => shopItems.some(
    (item) => item.id === id && item.owned && item.equipped
  );
  const hasCampfire = isOwnedAndEquipped('campfire');
  const activeFarm = shopItems.find((item) => item.category === 'farm' && item.owned && item.equipped);
  const activeFarmId = activeFarm?.id ?? '';
  const activeFarmCrop = activeFarm?.farmCrop ?? 'wheat';
  const hasFarm = Boolean(activeFarm);
  const activeTree = shopItems.find((item) => item.category === 'tree' && item.owned && item.equipped);
  const activeTreeId = activeTree?.id ?? '';
  const hasCrystalShrine = isOwnedAndEquipped('crystal_shrine');
  const hasSkyLanterns = isOwnedAndEquipped('sky_lanterns');
  const activeHouse = shopItems.find((item) => item.category === 'house' && item.owned && item.equipped);
  const activeHouseId = activeHouse?.id ?? '';
  const hasCabin = Boolean(activeHouse);
  const hasWaterfall = isOwnedAndEquipped('waterfall');
  const hasSlime = isOwnedAndEquipped('pet_slime');
  const hasChick = isOwnedAndEquipped('pet_chick');
  const hasTurtle = isOwnedAndEquipped('pet_turtle');
  const hasFox = isOwnedAndEquipped('pet_fox');
  const hasWolf = isOwnedAndEquipped('pet_wolf');
  const hasCat = isOwnedAndEquipped('pet_cat');
  const hasSkyPrism = isOwnedAndEquipped('sky_prism');
  const hasCloudArch = isOwnedAndEquipped('cloud_arch');
  const hasEmeraldBeacon = isOwnedAndEquipped('emerald_beacon');
  const hasSunstoneFountain = isOwnedAndEquipped('sunstone_fountain');
  const hasMoonDial = isOwnedAndEquipped('moon_dial');
  const hasAuroraShrine = isOwnedAndEquipped('aurora_shrine');
  const hasCloudGuardian = isOwnedAndEquipped('cloud_guardian');
  const hasGrandTrophy = isOwnedAndEquipped('grand_trophy');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 320;

    // 1. Scene, Camera, Transparent Renderer
    const scene = new THREE.Scene();

    const themeLightColors: Record<string, { light: number; amb: number }> = {
      day: { light: 0xfffaed, amb: 0x90b5d0 },
      sunset: { light: 0xffd199, amb: 0xaa7050 },
      cloudy: { light: 0xe0e6ed, amb: 0x7a8690 },
      night: { light: 0x8aa8cf, amb: 0x223344 },
      galaxy: { light: 0xd5b9ff, amb: 0x38214f },
    };

    const lightColor = themeLightColors[theme] || themeLightColors.day;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Warm natural lighting matching the sky)
    const hemiLight = new THREE.HemisphereLight(lightColor.light, lightColor.amb, 0.95);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(lightColor.light, 1.3);
    dirLight.position.set(12, 16, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    scene.add(dirLight);

    // Island Pivot Group
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // 3. Procedural Voxel Textures & Materials
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const grassTopTex = createGrassTopTexture();
    const grassSideTex = createGrassSideTexture();
    const dirtTex = createDirtTexture(false);
    const darkDirtTex = createDirtTexture(true);
    const stoneTex = createStoneTexture(false);
    const darkStoneTex = createStoneTexture(true);
    const woodLogSideTex = createWoodLogSideTexture();
    const woodLogTopTex = createWoodLogTopTexture();
    const woodPlankTex = createWoodPlankTexture();
    const leavesTex = createLeavesTexture(false);
    const leavesLightTex = createLeavesTexture(true);
    const goldOreTex = createOreBlockTexture('gold', 0);
    const diamondOreTex = createOreBlockTexture('diamond', 0);

    const grassTopMat = new THREE.MeshLambertMaterial({ map: grassTopTex });
    const grassSideMat = new THREE.MeshLambertMaterial({ map: grassSideTex });
    const dirtMat = new THREE.MeshLambertMaterial({ map: dirtTex });
    const darkDirtMat = new THREE.MeshLambertMaterial({ map: darkDirtTex });

    // 6-face Grass Block material array: [+X, -X, +Y, -Y, +Z, -Z]
    // Top is lush grass, sides are dirt with hanging grass fringe, bottom is dirt!
    const grassBlockMaterials: THREE.Material[] = [
      grassSideMat, // +X
      grassSideMat, // -X
      grassTopMat,  // +Y (lush grass top)
      dirtMat,      // -Y (dirt bottom)
      grassSideMat, // +Z
      grassSideMat, // -Z
    ];

    // 6-face Wood Log material array:
    const woodLogSideMat = new THREE.MeshLambertMaterial({ map: woodLogSideTex });
    const woodLogTopMat = new THREE.MeshLambertMaterial({ map: woodLogTopTex });
    const woodLogMaterials: THREE.Material[] = [
      woodLogSideMat, // +X
      woodLogSideMat, // -X
      woodLogTopMat,  // +Y (rings)
      woodLogTopMat,  // -Y (rings)
      woodLogSideMat, // +Z
      woodLogSideMat, // -Z
    ];

    const stoneMat = new THREE.MeshLambertMaterial({ map: stoneTex });
    const darkStoneMat = new THREE.MeshLambertMaterial({ map: darkStoneTex });
    const woodPlankMat = new THREE.MeshLambertMaterial({ map: woodPlankTex });
    const leavesMat = new THREE.MeshLambertMaterial({ map: leavesTex });
    const leavesLightMat = new THREE.MeshLambertMaterial({ map: leavesLightTex });
    const birchLeavesMat = new THREE.MeshLambertMaterial({ map: leavesTex, color: 0xc3d889 });
    const spruceLeavesMat = new THREE.MeshLambertMaterial({ map: leavesTex, color: 0x315b3c });
    const willowLeavesMat = new THREE.MeshLambertMaterial({ map: leavesTex, color: 0x739a53 });
    const mapleLeavesMat = new THREE.MeshLambertMaterial({ map: leavesTex, color: 0xd88b32 });
    const mapleLightMat = new THREE.MeshLambertMaterial({ map: leavesLightTex, color: 0xf0bd4d });
    const birchTrunkMat = new THREE.MeshLambertMaterial({ color: 0xe5ddc5 });
    const goldMat = new THREE.MeshLambertMaterial({ map: goldOreTex });
    const diamondMat = new THREE.MeshLambertMaterial({ map: diamondOreTex });
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x4aa3b5,
      transparent: true,
      opacity: 0.75,
    });
    const cropLooks: Record<string, { stem: number; leaf: number; produce: number; accent: number }> = {
      wheat: { stem: 0x8b762d, leaf: 0x57963a, produce: 0xe3b341, accent: 0xc99524 },
      carrot: { stem: 0x4f7c32, leaf: 0x5c9638, produce: 0xe27836, accent: 0xb55325 },
      potato: { stem: 0x527b34, leaf: 0x648a3d, produce: 0xc49b5a, accent: 0x9a7540 },
      beetroot: { stem: 0x4c7334, leaf: 0x52813d, produce: 0xa83245, accent: 0x722537 },
      melon: { stem: 0x44723a, leaf: 0x4d8c3e, produce: 0x5ca84b, accent: 0x34783d },
      pumpkin: { stem: 0x557b35, leaf: 0x638d39, produce: 0xe8892f, accent: 0xb85522 },
      sugarcane: { stem: 0x4d8c44, leaf: 0x6ba84c, produce: 0xa8cc70, accent: 0x39743d },
    };
    const cropLook = cropLooks[activeFarmCrop] ?? cropLooks.wheat;
    const cropStemMat = new THREE.MeshLambertMaterial({ color: cropLook.stem });
    const cropLeafMat = new THREE.MeshLambertMaterial({ color: cropLook.leaf });
    const cropHeadMat = new THREE.MeshLambertMaterial({ color: cropLook.produce });
    const cropAccentMat = new THREE.MeshLambertMaterial({ color: cropLook.accent });
    const irrigationMat = new THREE.MeshLambertMaterial({ color: 0x4aa3b5, emissive: 0x163f48 });
    const cropStemGeo = new THREE.BoxGeometry(0.12, 0.42, 0.12);
    const cropLeafGeo = new THREE.BoxGeometry(0.2, 0.08, 0.12);
    const cropHeadGeo = new THREE.BoxGeometry(0.2, 0.16, 0.2);
    const cropAccentGeo = new THREE.BoxGeometry(0.045, 0.28, 0.035);
    const cropJointGeo = new THREE.BoxGeometry(0.14, 0.035, 0.14);
    const gardenSoilGeo = new THREE.BoxGeometry(0.88, 0.08, 0.88);
    const pathStoneGeo = new THREE.BoxGeometry(0.52, 0.09, 0.52);
    const irrigationGeo = new THREE.BoxGeometry(0.12, 0.04, 1.82);
    const campfireLogGeo = new THREE.BoxGeometry(0.88, 0.18, 0.2);
    const campfireStoneGeo = new THREE.BoxGeometry(0.24, 0.16, 0.24);
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x8bd4e8, emissive: 0x21414b });
    const houseStyles: Record<string, { walls: number; roof: number }> = {
      birch_lodge: { walls: 0xd5bd8b, roof: 0x684b35 },
      stone_cottage: { walls: 0x87919a, roof: 0x455361 },
      spruce_manor: { walls: 0x4f684d, roof: 0x4b3429 },
      cloud_villa: { walls: 0xe5e1d5, roof: 0x6d9dbd },
    };
    const houseStyle = houseStyles[activeHouseId];
    const houseWallMat = houseStyle
      ? new THREE.MeshLambertMaterial({ color: houseStyle.walls })
      : woodPlankMat;
    const houseRoofMat = new THREE.MeshLambertMaterial({ color: houseStyle?.roof ?? 0x76533a });
    const slimeFaceMat = new THREE.MeshLambertMaterial({ color: 0x243b23 });
    const slimeHighlightMat = new THREE.MeshLambertMaterial({ color: 0x9bd779 });
    const chickMat = new THREE.MeshLambertMaterial({ color: 0xf2c94c });
    const chickWingMat = new THREE.MeshLambertMaterial({ color: 0xfff1cf });
    const petDarkMat = new THREE.MeshLambertMaterial({ color: 0x3c3028 });
    const turtleMat = new THREE.MeshLambertMaterial({ color: 0x5fa244 });
    const turtleShellMat = new THREE.MeshLambertMaterial({ color: 0x67513a });
    const turtleShellDetailMat = new THREE.MeshLambertMaterial({ color: 0x94744b });
    const foxMat = new THREE.MeshLambertMaterial({ color: 0xe27836 });
    const wolfMat = new THREE.MeshLambertMaterial({ color: 0x8796a5 });
    const catMat = new THREE.MeshLambertMaterial({ color: 0x87919b });
    const catEyeMat = new THREE.MeshLambertMaterial({ color: 0x8fce72 });
    const catEarMat = new THREE.MeshLambertMaterial({ color: 0xc98289 });
    const petLightMat = new THREE.MeshLambertMaterial({ color: 0xf4efe6 });
    const blossomMat = new THREE.MeshLambertMaterial({ color: 0xe78da7 });
    const blossomLightMat = new THREE.MeshLambertMaterial({ color: 0xf5bdd0 });
    const crystalMat = new THREE.MeshLambertMaterial({ color: 0x62c9ed, emissive: 0x164b66 });
    const lanternGlassMat = new THREE.MeshBasicMaterial({ color: 0xffd66b });
    const campfireFlameGeo = new THREE.BoxGeometry(0.28, 0.38, 0.28);
    const campfireCoreGeo = new THREE.BoxGeometry(0.14, 0.22, 0.14);
    const campfireFlameMat = new THREE.MeshBasicMaterial({ color: 0xb3392f });
    const campfireCoreMat = new THREE.MeshBasicMaterial({ color: 0xffd45c });
    const cabinWindowGeo = new THREE.BoxGeometry(0.42, 0.42, 0.08);
    const cabinWindowBarGeo = new THREE.BoxGeometry(0.06, 0.48, 0.1);
    const cabinWindowCrossbarGeo = new THREE.BoxGeometry(0.48, 0.06, 0.1);
    const cabinDoorGeo = new THREE.BoxGeometry(0.52, 1.3, 0.12);
    const cabinDoorFrameGeo = new THREE.BoxGeometry(0.1, 1.46, 0.16);
    const cabinDoorTopFrameGeo = new THREE.BoxGeometry(0.72, 0.1, 0.16);
    const cabinDoorBraceGeo = new THREE.BoxGeometry(0.4, 0.08, 0.05);
    const doorLatchGeo = new THREE.BoxGeometry(0.055, 0.075, 0.05);
    const waterfallBedGeo = new THREE.BoxGeometry(1.18, 0.22, 0.55);
    const waterfallStreamGeo = new THREE.BoxGeometry(0.22, 4.6, 0.4);
    const waterfallDropGeo = new THREE.BoxGeometry(0.16, 0.24, 0.3);
    const slimeBodyGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const slimeEyeGeo = new THREE.BoxGeometry(0.07, 0.09, 0.035);
    const slimeSmileGeo = new THREE.BoxGeometry(0.14, 0.035, 0.04);
    const slimeShineGeo = new THREE.BoxGeometry(0.14, 0.06, 0.035);
    const lanternGeo = new THREE.BoxGeometry(0.28, 0.34, 0.28);
    const lanternTopGeo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
    const lanternBeamGeo = new THREE.BoxGeometry(0.72, 0.1, 0.1);

    const addBlock = (
      x: number,
      y: number,
      z: number,
      material: THREE.Material | THREE.Material[]
    ) => {
      const mesh = new THREE.Mesh(boxGeo, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      islandGroup.add(mesh);
      return mesh;
    };

    // 4. Construct Voxel Floating Island
    // Layer Y = 0 (Lush Grass Surface with dirt sides & fringe)
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        const distSq = x * x + z * z;
        if (distSq <= 10.5) {
          addBlock(x, 0, z, grassBlockMaterials);
        }
      }
    }

    // Layer Y = -1 (Dirt upper layer)
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        const distSq = x * x + z * z;
        if (distSq <= 9.5) {
          const mat = (x + z) % 3 === 0 ? darkDirtMat : dirtMat;
          addBlock(x, -1, z, mat);
        }
      }
    }

    // Layer Y = -2 (Dirt / Stone transition)
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const distSq = x * x + z * z;
        if (distSq <= 6) {
          const mat = distSq >= 4 ? dirtMat : stoneMat;
          addBlock(x, -2, z, mat);
        }
      }
    }

    // Layer Y = -3 (Stone layer with ores)
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.abs(x) + Math.abs(z) <= 2) {
          const isOre = (x === 1 && z === 0) || (x === -1 && z === 1);
          const mat = isOre ? goldMat : (x === 0 && z === -1) ? diamondMat : stoneMat;
          addBlock(x, -3, z, mat);
        }
      }
    }

    // Layer Y = -4 & -5 (Tapering stalactite tip)
    addBlock(0, -4, 0, stoneMat);
    addBlock(1, -4, 0, stoneMat);
    addBlock(0, -4, 1, darkStoneMat);
    addBlock(0, -5, 0, stoneMat);

    // Hanging Vines
    const vineMat = new THREE.MeshBasicMaterial({ color: 0x3f7a2e });
    const vine1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 0.15), vineMat);
    vine1.position.set(-2.8, -0.9, 0);
    islandGroup.add(vine1);

    const vine2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 0.15), vineMat);
    vine2.position.set(2.6, -1.2, 1.5);
    islandGroup.add(vine2);

    // A small working garden and stepping stones give the open edge more life.
    if (hasFarm) {
      const gardenTiles = [
        { x: 2, z: 0, height: 0.72 },
        { x: 3, z: 0, height: 1 },
        { x: 2, z: 1, height: 0.88 },
        { x: 3, z: 1, height: 0.64 },
      ];
      gardenTiles.forEach(({ x, z, height }, index) => {
        const soil = new THREE.Mesh(gardenSoilGeo, darkDirtMat);
        soil.position.set(x, 0.54, z);
        soil.receiveShadow = true;
        islandGroup.add(soil);

        const plantOffsets = [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]] as const;
        plantOffsets.forEach(([dx, dz], plantIndex) => {
          const plantHeight = height * (plantIndex === 1 ? 0.82 : 1);
          const growthScale = activeFarmCrop === 'sugarcane'
            ? plantHeight * 1.85
            : activeFarmCrop === 'wheat' ? plantHeight * 1.25
              : activeFarmCrop === 'melon' || activeFarmCrop === 'pumpkin' ? plantHeight * 0.58
                : plantHeight * 0.78;
          const stem = new THREE.Mesh(cropStemGeo, cropStemMat);
          stem.scale.y = growthScale;
          stem.scale.x = activeFarmCrop === 'sugarcane' ? 0.72 : 1;
          stem.position.set(x + dx, 0.58 + 0.21 * growthScale, z + dz);
          stem.castShadow = true;
          islandGroup.add(stem);

          const leafY = activeFarmCrop === 'sugarcane'
            ? 0.66 + 0.38 * growthScale
            : 0.65 + 0.16 * growthScale;
          const leaf = new THREE.Mesh(cropLeafGeo, cropLeafMat);
          leaf.scale.set(activeFarmCrop === 'melon' ? 1.7 : 1, activeFarmCrop === 'sugarcane' ? 1.4 : 1, 1.3);
          leaf.position.set(x + dx + (plantIndex % 2 ? 0.08 : -0.08), leafY, z + dz);
          leaf.rotation.y = plantIndex * Math.PI / 4;
          islandGroup.add(leaf);
          if (['carrot', 'beetroot', 'sugarcane'].includes(activeFarmCrop)) {
            const secondLeaf = new THREE.Mesh(cropLeafGeo, cropLeafMat);
            secondLeaf.scale.set(1.1, 1, 1.25);
            secondLeaf.position.set(x + dx - 0.08, leafY + 0.04, z + dz);
            secondLeaf.rotation.y = -plantIndex * Math.PI / 4;
            islandGroup.add(secondLeaf);
          }

          const seedHead = new THREE.Mesh(cropHeadGeo, cropHeadMat);
          if (activeFarmCrop === 'carrot') {
            seedHead.scale.set(0.78, 1.8, 0.78);
            seedHead.position.set(x + dx, 0.68, z + dz);
          } else if (activeFarmCrop === 'potato') {
            seedHead.scale.set(0.8, 0.72, 0.8);
            seedHead.position.set(x + dx, 0.65, z + dz);
          } else if (activeFarmCrop === 'beetroot') {
            seedHead.scale.set(1.3, 1.55, 1.3);
            seedHead.position.set(x + dx, 0.69, z + dz);
          } else if (activeFarmCrop === 'melon') {
            seedHead.scale.set(1.9, 1.9, 1.9);
            seedHead.position.set(x + dx, 0.72, z + dz);
          } else if (activeFarmCrop === 'pumpkin') {
            seedHead.scale.set(1.8, 2, 1.8);
            seedHead.position.set(x + dx, 0.72, z + dz);
          } else if (activeFarmCrop === 'sugarcane') {
            seedHead.scale.set(0.7, 0.55, 0.7);
            seedHead.position.set(x + dx, 0.58 + 0.42 * growthScale + 0.08, z + dz);
          } else {
            seedHead.scale.set(0.8, 1.2, 0.8);
            seedHead.position.set(x + dx, 0.58 + 0.42 * growthScale + 0.08, z + dz);
          }
          seedHead.castShadow = true;
          islandGroup.add(seedHead);

          if (activeFarmCrop === 'potato') {
            const smallTuber = new THREE.Mesh(cropHeadGeo, cropHeadMat);
            smallTuber.scale.set(0.62, 0.55, 0.62);
            smallTuber.position.set(x + dx + 0.12, 0.63, z + dz + 0.08);
            islandGroup.add(smallTuber);
          }
          if (activeFarmCrop === 'melon' || activeFarmCrop === 'pumpkin') {
            [-0.055, 0.055].forEach((stripeX) => {
              const rib = new THREE.Mesh(cropAccentGeo, cropAccentMat);
              rib.position.set(x + dx + stripeX, seedHead.position.y, z + dz + 0.2);
              rib.scale.set(1, activeFarmCrop === 'melon' ? 0.8 : 1.15, 1);
              islandGroup.add(rib);
            });
          }
          if (activeFarmCrop === 'sugarcane') {
            [0.32, 0.62].forEach((jointHeight) => {
              const joint = new THREE.Mesh(cropJointGeo, cropAccentMat);
              joint.position.set(x + dx, 0.58 + growthScale * jointHeight * 0.42, z + dz);
              islandGroup.add(joint);
            });
          }
        });
      });

      const irrigationChannel = new THREE.Mesh(irrigationGeo, irrigationMat);
      irrigationChannel.position.set(2.5, 0.61, 0.5);
      islandGroup.add(irrigationChannel);

      [[1.2, 0.8], [1.2, 1.5]].forEach(([x, z]) => {
        const stone = new THREE.Mesh(pathStoneGeo, darkStoneMat);
        stone.position.set(x, 0.54, z);
        stone.receiveShadow = true;
        islandGroup.add(stone);
      });
    }

    // 5. Dynamic Island Level Features
    // A. Campfire
    let flameMesh: THREE.Mesh | null = null;
    let fireLight: THREE.PointLight | null = null;
    if (hasCampfire) {
      [-0.32, 0.32].forEach((offset, index) => {
        const log = new THREE.Mesh(campfireLogGeo, woodLogMaterials);
        log.position.set(-1.6, 0.62 + index * 0.08, 1.6);
        log.rotation.y = offset > 0 ? Math.PI / 4 : -Math.PI / 4;
        log.castShadow = true;
        islandGroup.add(log);
      });
      [[-0.42, 0], [0.42, 0], [0, -0.42], [0, 0.42]].forEach(([dx, dz]) => {
        const stone = new THREE.Mesh(campfireStoneGeo, darkStoneMat);
        stone.position.set(-1.6 + dx, 0.58, 1.6 + dz);
        stone.castShadow = true;
        islandGroup.add(stone);
      });

      fireLight = new THREE.PointLight(0xe3b341, 1.5, 4);
      fireLight.position.set(-1.6, 1.1, 1.6);
      islandGroup.add(fireLight);

      flameMesh = new THREE.Mesh(campfireFlameGeo, campfireFlameMat);
      flameMesh.position.set(-1.6, 0.95, 1.6);
      islandGroup.add(flameMesh);
      const innerFlame = new THREE.Mesh(campfireCoreGeo, campfireCoreMat);
      innerFlame.position.set(-1.6, 0.91, 1.6);
      islandGroup.add(innerFlame);
    }

    // B. Oak Tree (Bazaar cosmetic)
    if (activeTreeId === 'oak_tree') {
      addBlock(1.8, 1, -1.5, woodLogMaterials);
      addBlock(1.8, 2, -1.5, woodLogMaterials);
      addBlock(1.8, 3, -1.5, woodLogMaterials);

      for (let lx = 0; lx <= 3; lx++) {
        for (let lz = -3; lz <= 0; lz++) {
          for (let ly = 3; ly <= 5; ly++) {
            const dx = lx - 1.8;
            const dz = lz - (-1.5);
            if (dx * dx + dz * dz <= 2.2) {
              const lMat = (lx + ly) % 2 === 0 ? leavesMat : leavesLightMat;
              addBlock(lx, ly, lz, lMat);
            }
          }
        }
      }
      addBlock(1.8, 6, -1.5, leavesLightMat);
      addBlock(1.8, 5, -2.5, woodLogMaterials);
      addBlock(1.8, 5, -0.5, woodLogMaterials);
      [[0.8, 6, -1.5], [2.8, 6, -1.5], [1.8, 6, -2.5], [1.8, 6, -0.5]].forEach(([x, y, z]) => {
        addBlock(x, y, z, leavesMat);
      });
    }

    // H. Cherry Blossom Tree: a layered pink canopy with a broad silhouette.
    if (activeTreeId === 'blossom_tree') {
      const blossomTrunk = addBlock(-1.8, 1, -1.5, woodLogMaterials);
      blossomTrunk.scale.set(0.72, 1.2, 0.72);
      addBlock(-1.8, 2, -1.5, woodLogMaterials);
      addBlock(-1.8, 3, -1.5, woodLogMaterials);
      const canopy = [
        [-2.8, 3.5, -1.5], [-1.8, 3.5, -2.5], [-0.8, 3.5, -1.5], [-1.8, 3.5, -0.5],
        [-2.3, 4.5, -2], [-1.3, 4.5, -2], [-2.3, 4.5, -1], [-1.3, 4.5, -1],
        [-1.8, 5.5, -1.5],
      ];
      canopy.forEach(([x, y, z], index) => {
        addBlock(x, y, z, index % 3 === 0 ? blossomLightMat : blossomMat);
      });
    }

    if (activeTreeId === 'birch_tree') {
      const x = 1.8; const z = -1.5;
      [1, 2, 3].forEach((y) => addBlock(x, y, z, birchTrunkMat));
      [[x, 4, z], [x - 1, 4, z], [x + 1, 4, z], [x, 4, z - 1], [x, 4, z + 1], [x - 0.5, 5, z], [x + 0.5, 5, z], [x, 5, z - 0.5]].forEach(([lx, y, lz]) => addBlock(lx, y, lz, birchLeavesMat));
    }

    if (activeTreeId === 'spruce_tree') {
      const x = 1.8; const z = -1.5;
      [1, 2, 3, 4].forEach((y) => addBlock(x, y, z, woodLogMaterials));
      [[x, 2, z], [x - 1, 2, z], [x + 1, 2, z], [x, 2, z - 1], [x, 2, z + 1], [x, 3, z], [x - 1, 3, z], [x + 1, 3, z], [x, 3, z - 1], [x, 3, z + 1], [x, 4, z], [x - 0.5, 4, z], [x + 0.5, 4, z], [x, 4, z - 0.5], [x, 4, z + 0.5], [x, 5, z]].forEach(([lx, y, lz]) => addBlock(lx, y, lz, spruceLeavesMat));
    }

    if (activeTreeId === 'willow_tree') {
      const x = 1.8; const z = -1.5;
      [1, 2, 3, 4].forEach((y) => addBlock(x, y, z, woodLogMaterials));
      [[x, 4, z], [x - 1, 4, z], [x + 1, 4, z], [x, 4, z - 1], [x, 4, z + 1], [x - 1, 5, z], [x + 1, 5, z], [x, 5, z - 1], [x, 5, z + 1], [x - 1, 3, z], [x + 1, 3, z], [x, 3, z - 1], [x, 3, z + 1], [x - 1, 2, z], [x + 1, 2, z], [x, 2, z - 1], [x, 2, z + 1]].forEach(([lx, y, lz]) => addBlock(lx, y, lz, willowLeavesMat));
    }

    if (activeTreeId === 'maple_tree') {
      const x = 1.8; const z = -1.5;
      [1, 2, 3].forEach((y) => addBlock(x, y, z, woodLogMaterials));
      [[x, 4, z], [x - 1, 4, z], [x + 1, 4, z], [x, 4, z - 1], [x, 4, z + 1], [x - 1, 5, z], [x + 1, 5, z], [x, 5, z - 1], [x, 5, z + 1], [x, 6, z]].forEach(([lx, y, lz], index) => addBlock(lx, y, lz, index % 3 === 0 ? mapleLightMat : mapleLeavesMat));
    }

    // I. Sky Crystal Cluster: stepped, glowing shards rise from a stone base.
    if (hasCrystalShrine) {
      const crystalCenterX = -1.5;
      addBlock(crystalCenterX, 0.62, -2.5, darkStoneMat);
      const shards = [
        { x: crystalCenterX - 0.34, y: 1.15, z: -2.5, scale: [0.36, 1.1, 0.36] },
        { x: crystalCenterX + 0.08, y: 1.38, z: -2.58, scale: [0.32, 1.55, 0.32] },
        { x: crystalCenterX + 0.42, y: 1.02, z: -2.46, scale: [0.3, 0.84, 0.3] },
      ];
      shards.forEach(({ x, y, z, scale }) => {
        const shard = addBlock(x, y, z, crystalMat);
        shard.scale.set(scale[0], scale[1], scale[2]);
      });
    }

    // J. Sky Lantern Walk: chunky voxel posts and warm glowing lanterns.
    if (hasSkyLanterns) {
      [[-2.2, 1.7, 1.1], [0, 2.1, 2.2], [2.2, 1.7, 1.1]].forEach(([x, y, z]) => {
        const postHeight = y - 0.5;
        const post = addBlock(x, 0.5 + postHeight / 2, z, woodLogSideMat);
        post.scale.set(0.14, postHeight, 0.14);
        const arm = new THREE.Mesh(lanternBeamGeo, woodLogMaterials);
        arm.position.set(x, y, z);
        islandGroup.add(arm);
        const lanternX = x + 0.28;
        const chain = addBlock(lanternX, y - 0.2, z, darkStoneMat);
        chain.scale.set(0.07, 0.28, 0.07);
        const glass = new THREE.Mesh(lanternGeo, lanternGlassMat);
        glass.position.set(lanternX, y - 0.48, z);
        glass.castShadow = true;
        islandGroup.add(glass);
        const cap = new THREE.Mesh(lanternTopGeo, woodLogMaterials);
        cap.position.set(lanternX, y - 0.27, z);
        islandGroup.add(cap);
        const light = new THREE.PointLight(0xffc85a, 0.55, 2.5);
        light.position.set(lanternX, y - 0.45, z);
        islandGroup.add(light);
      });
    }

    // K. Level milestone decorations sit on the front lawn, clear of the cabin.
    const milestoneDecorX = -1.25;
    const milestoneDecorZ = 2;
    if (hasSkyPrism) {
      addBlock(milestoneDecorX, 0.62, milestoneDecorZ, darkStoneMat);
      [[-0.3, 1.12, 0.3], [0, 1.38, 0.34], [0.3, 1.08, 0.28]].forEach(([x, y, size]) => {
        const shard = addBlock(milestoneDecorX + x, y, milestoneDecorZ, crystalMat);
        shard.scale.set(size, size * 2.3, size);
        shard.rotation.z = x * 0.55;
      });
    }
    if (hasCloudArch) {
      addBlock(milestoneDecorX - 0.7, 1.15, milestoneDecorZ, stoneMat).scale.set(0.28, 1.3, 0.32);
      addBlock(milestoneDecorX + 0.7, 1.15, milestoneDecorZ, stoneMat).scale.set(0.28, 1.3, 0.32);
      addBlock(milestoneDecorX, 1.8, milestoneDecorZ, stoneMat).scale.set(1.65, 0.28, 0.34);
      addBlock(milestoneDecorX, 1.98, milestoneDecorZ, goldMat).scale.set(0.38, 0.2, 0.38);
    }
    if (hasEmeraldBeacon) {
      addBlock(milestoneDecorX, 0.62, milestoneDecorZ, darkStoneMat);
      addBlock(milestoneDecorX, 1.05, milestoneDecorZ, goldMat).scale.set(0.72, 0.32, 0.72);
      addBlock(milestoneDecorX, 1.72, milestoneDecorZ, leavesMat).scale.set(0.48, 1.12, 0.48);
      addBlock(milestoneDecorX, 2.38, milestoneDecorZ, crystalMat).scale.set(0.68, 0.22, 0.68);
    }
    if (hasSunstoneFountain) {
      addBlock(milestoneDecorX, 0.62, milestoneDecorZ, stoneMat).scale.set(1.45, 0.22, 1.15);
      addBlock(milestoneDecorX - 0.48, 0.82, milestoneDecorZ, stoneMat).scale.set(0.2, 0.28, 0.9);
      addBlock(milestoneDecorX + 0.48, 0.82, milestoneDecorZ, stoneMat).scale.set(0.2, 0.28, 0.9);
      addBlock(milestoneDecorX, 0.82, milestoneDecorZ - 0.35, stoneMat).scale.set(0.9, 0.28, 0.18);
      addBlock(milestoneDecorX, 0.82, milestoneDecorZ + 0.35, stoneMat).scale.set(0.9, 0.28, 0.18);
      addBlock(milestoneDecorX, 0.83, milestoneDecorZ, waterMat).scale.set(0.72, 0.08, 0.68);
      addBlock(milestoneDecorX, 1.18, milestoneDecorZ, goldMat).scale.set(0.3, 0.55, 0.3);
    }
    if (hasMoonDial) {
      addBlock(milestoneDecorX, 0.68, milestoneDecorZ, darkStoneMat).scale.set(1.25, 0.28, 1.05);
      addBlock(milestoneDecorX, 1.05, milestoneDecorZ, stoneMat).scale.set(0.82, 0.48, 0.82);
      addBlock(milestoneDecorX, 1.34, milestoneDecorZ, goldMat).scale.set(0.72, 0.1, 0.72);
      const pointer = addBlock(milestoneDecorX + 0.12, 1.44, milestoneDecorZ, goldMat);
      pointer.scale.set(0.1, 0.08, 0.56);
      pointer.rotation.y = -0.45;
    }
    if (hasAuroraShrine) {
      addBlock(milestoneDecorX, 0.62, milestoneDecorZ, stoneMat).scale.set(1.25, 0.22, 0.9);
      addBlock(milestoneDecorX, 0.95, milestoneDecorZ, darkStoneMat).scale.set(0.68, 0.42, 0.55);
      [[-0.34, 1.45, 0.34], [0, 1.72, 0.38], [0.34, 1.42, 0.32]].forEach(([x, y, size]) => {
        const crystal = addBlock(milestoneDecorX + x, y, milestoneDecorZ, crystalMat);
        crystal.scale.set(size, size * 2, size);
        crystal.rotation.z = x * 0.45;
      });
      addBlock(milestoneDecorX + 0.42, 1.32, milestoneDecorZ + 0.02, leavesLightMat).scale.set(0.16, 0.72, 0.16);
    }
    if (hasCloudGuardian) {
      addBlock(milestoneDecorX, 0.66, milestoneDecorZ, darkStoneMat).scale.set(1.05, 0.28, 0.82);
      addBlock(milestoneDecorX, 1.2, milestoneDecorZ, stoneMat).scale.set(0.62, 0.82, 0.5);
      addBlock(milestoneDecorX, 1.88, milestoneDecorZ, stoneMat).scale.set(0.72, 0.58, 0.58);
      addBlock(milestoneDecorX - 0.48, 1.18, milestoneDecorZ, stoneMat).scale.set(0.28, 0.72, 0.32);
      addBlock(milestoneDecorX + 0.48, 1.18, milestoneDecorZ, stoneMat).scale.set(0.28, 0.72, 0.32);
      addBlock(milestoneDecorX - 0.17, 1.92, milestoneDecorZ + 0.32, lanternGlassMat).scale.set(0.1, 0.1, 0.06);
      addBlock(milestoneDecorX + 0.17, 1.92, milestoneDecorZ + 0.32, lanternGlassMat).scale.set(0.1, 0.1, 0.06);
    }
    if (hasGrandTrophy) {
      // A broad stepped plinth and oversized gold cup mark the level-100 reward.
      addBlock(milestoneDecorX, 0.62, milestoneDecorZ, darkStoneMat).scale.set(1.55, 0.22, 1.2);
      addBlock(milestoneDecorX, 0.82, milestoneDecorZ, goldMat).scale.set(1.18, 0.2, 0.92);
      addBlock(milestoneDecorX, 1.02, milestoneDecorZ, woodPlankMat).scale.set(0.86, 0.2, 0.68);
      addBlock(milestoneDecorX, 1.55, milestoneDecorZ, goldMat).scale.set(0.56, 0.82, 0.5);
      addBlock(milestoneDecorX, 2.02, milestoneDecorZ, goldMat).scale.set(0.82, 0.16, 0.58);
      addBlock(milestoneDecorX - 0.43, 1.66, milestoneDecorZ, goldMat).scale.set(0.16, 0.5, 0.22);
      addBlock(milestoneDecorX + 0.43, 1.66, milestoneDecorZ, goldMat).scale.set(0.16, 0.5, 0.22);
      addBlock(milestoneDecorX, 2.22, milestoneDecorZ, goldMat).scale.set(0.2, 0.24, 0.2);
    }

    // C. Cozy Timber Cabin (Bazaar cosmetic)
    if (hasCabin) {
      // Stone footings and hollow perimeter walls give the cabin a clear footprint.
      for (let cx = -1; cx <= 1; cx++) {
        for (let cz = -2; cz <= 0; cz++) {
          const isPerimeter = Math.abs(cx) === 1 || cz === -2 || cz === 0;
          if (isPerimeter) {
            const footing = addBlock(cx, 0.46, cz, darkStoneMat);
            footing.scale.set(0.96, 0.12, 0.96);
          }
          for (let cy = 1; cy <= 2; cy++) {
            if (isPerimeter && !(cx === 0 && cz === 0)) {
              addBlock(cx, cy, cz, houseWallMat);
            }
          }
        }
      }

      // Dark timber corner posts and a stepped pitched roof replace the flat wood cap.
      [-1, 1].forEach((x) => [-2.48, 0.48].forEach((z) => {
        const cornerPost = addBlock(x, 1.48, z, woodLogMaterials);
        cornerPost.scale.set(0.2, 2.05, 0.2);
      }));
      [-1, 1].forEach((x) => {
        const eave = addBlock(x, 2.65, -1, houseRoofMat);
        eave.scale.set(1.15, 0.42, 3.15);
      });
      const roofRidge = addBlock(0, 3.12, -1, houseRoofMat);
      roofRidge.scale.set(1.1, 0.48, 3.15);
      [-2, -1, 0].forEach((z) => {
        const gable = addBlock(0, 2.45, z, houseWallMat);
        gable.scale.set(0.86, 0.58, 0.92);
      });

      // Short stone chimney sits on the rear roof slope.
      const chimney = addBlock(0.68, 3.17, -1.8, stoneMat);
      chimney.scale.set(0.42, 0.62, 0.42);
      const chimneyCap = addBlock(0.68, 3.54, -1.8, darkStoneMat);
      chimneyCap.scale.set(0.58, 0.12, 0.58);

      if (activeHouseId === 'birch_lodge') {
        [-0.78, 0.78].forEach((x) => {
          addBlock(x, 1.28, 0.98, woodLogMaterials).scale.set(0.14, 1.25, 0.14);
        });
        addBlock(0, 1.92, 0.98, houseRoofMat).scale.set(1.9, 0.16, 0.9);
      } else if (activeHouseId === 'stone_cottage') {
        addBlock(-0.68, 3.05, -1.8, stoneMat).scale.set(0.36, 0.62, 0.36);
        addBlock(-0.68, 3.42, -1.8, darkStoneMat).scale.set(0.5, 0.12, 0.5);
      } else if (activeHouseId === 'spruce_manor') {
        [-1.38, 1.38].forEach((x) => {
          addBlock(x, 1.38, -1, houseWallMat).scale.set(0.72, 1.72, 1.8);
          addBlock(x, 2.34, -1, houseRoofMat).scale.set(0.9, 0.28, 2);
        });
      } else if (activeHouseId === 'cloud_villa') {
        addBlock(0, 3.5, -1.25, houseWallMat).scale.set(0.7, 0.55, 0.72);
        addBlock(0, 3.82, -1.25, houseRoofMat).scale.set(0.95, 0.16, 0.92);
        addBlock(0, 2.28, 0.76, houseRoofMat).scale.set(2.25, 0.12, 0.24);
      }

      // A timber lintel frames the door and spans the front facade.
      const frontLintel = addBlock(0, 2.08, 0.52, woodLogMaterials);
      frontLintel.scale.set(2.25, 0.16, 0.18);

      // Framed blue windows, a recessed door, and warm latch make the facade legible.
      [-0.72, 0.72].forEach((x) => {
        const windowPane = new THREE.Mesh(cabinWindowGeo, windowMat);
        windowPane.position.set(x, 1.72, 0.54);
        islandGroup.add(windowPane);
        const windowBar = new THREE.Mesh(cabinWindowBarGeo, woodLogSideMat);
        windowBar.position.set(x, 1.72, 0.59);
        islandGroup.add(windowBar);
        const windowCrossbar = new THREE.Mesh(cabinWindowCrossbarGeo, woodLogSideMat);
        windowCrossbar.position.set(x, 1.72, 0.59);
        islandGroup.add(windowCrossbar);
      });
      const cabinDoor = new THREE.Mesh(cabinDoorGeo, woodLogMaterials);
      cabinDoor.position.set(0, 1.15, 0.58);
      islandGroup.add(cabinDoor);
      [-0.31, 0.31].forEach((x) => {
        const doorFrame = new THREE.Mesh(cabinDoorFrameGeo, woodLogMaterials);
        doorFrame.position.set(x, 1.2, 0.63);
        islandGroup.add(doorFrame);
      });
      const doorTopFrame = new THREE.Mesh(cabinDoorTopFrameGeo, woodLogMaterials);
      doorTopFrame.position.set(0, 1.9, 0.63);
      islandGroup.add(doorTopFrame);
      const doorBrace = new THREE.Mesh(cabinDoorBraceGeo, woodLogMaterials);
      doorBrace.position.set(0, 1.12, 0.66);
      doorBrace.rotation.z = -Math.PI / 5;
      islandGroup.add(doorBrace);
      const doorLatch = new THREE.Mesh(doorLatchGeo, goldMat);
      doorLatch.position.set(0.16, 1.18, 0.68);
      islandGroup.add(doorLatch);
    }

    // E. Waterfall (Bazaar cosmetic)
    const waterfallDrops: THREE.Mesh[] = [];
    if (hasWaterfall) {
      const waterfallBed = new THREE.Mesh(waterfallBedGeo, darkStoneMat);
      waterfallBed.scale.set(1.25, 0.82, 0.82);
      waterfallBed.position.set(0, 0.48, 3.22);
      islandGroup.add(waterfallBed);
      [-0.42, 0, 0.42].forEach((x, index) => {
        const stream = new THREE.Mesh(waterfallStreamGeo, waterMat);
        stream.scale.x = index === 1 ? 2 : 1.5;
        stream.position.set(x, -1.75, 3.58);
        islandGroup.add(stream);
      });
      [-0.38, 0, 0.38].forEach((x, column) => {
        [0, 1, 2].forEach((dropIndex) => {
          const drop = new THREE.Mesh(waterfallDropGeo, waterMat);
          drop.position.set(x + (dropIndex % 2 ? 0.08 : -0.08), 0.25 - dropIndex * 1.8 - column * 0.45, 3.76);
          waterfallDrops.push(drop);
          islandGroup.add(drop);
        });
      });
    }

    // G. Pet Slime (Companion)
    let slimeMesh: THREE.Mesh | null = null;
    if (hasSlime) {
      const slimeMat = new THREE.MeshLambertMaterial({
        color: 0x5fa244,
        transparent: true,
        opacity: 0.85,
      });
      slimeMesh = new THREE.Mesh(slimeBodyGeo, slimeMat);
      slimeMesh.position.set(0.5, 0.8, 1.2);
      islandGroup.add(slimeMesh);
      [-0.13, 0.13].forEach((x) => {
        const eye = new THREE.Mesh(slimeEyeGeo, slimeFaceMat);
        eye.position.set(x, 0.06, 0.29);
        slimeMesh?.add(eye);
      });
      const smile = new THREE.Mesh(slimeSmileGeo, slimeFaceMat);
      smile.position.set(0, -0.09, 0.29);
      slimeMesh.add(smile);
      const shine = new THREE.Mesh(slimeShineGeo, slimeHighlightMat);
      shine.position.set(-0.12, 0.19, 0.285);
      slimeMesh.add(shine);
    }

    // Additional voxel pets share the same companion spot and bounce animation.
    let petCompanion: THREE.Group | null = null;
    const addPetPart = (
      parent: THREE.Object3D,
      material: THREE.Material,
      position: [number, number, number],
      scale: [number, number, number]
    ) => {
      const part = new THREE.Mesh(boxGeo, material);
      part.position.set(...position);
      part.scale.set(...scale);
      part.castShadow = true;
      parent.add(part);
      return part;
    };

    if (hasChick || hasTurtle || hasFox || hasWolf || hasCat) {
      petCompanion = new THREE.Group();
      petCompanion.position.set(0.5, 0.72, 1.2);
      islandGroup.add(petCompanion);

      if (hasChick) {
        addPetPart(petCompanion, chickMat, [0, 0, 0], [0.42, 0.38, 0.36]);
        addPetPart(petCompanion, chickMat, [0, 0.2, 0.18], [0.3, 0.28, 0.28]);
        addPetPart(petCompanion, chickWingMat, [-0.25, 0.03, 0], [0.16, 0.2, 0.24]);
        addPetPart(petCompanion, chickWingMat, [0.25, 0.03, 0], [0.16, 0.2, 0.24]);
        addPetPart(petCompanion, goldMat, [0, 0.14, 0.38], [0.18, 0.1, 0.16]);
        [-0.08, 0.08].forEach((x) => addPetPart(petCompanion!, petDarkMat, [x, 0.25, 0.33], [0.045, 0.07, 0.035]));
      } else if (hasTurtle) {
        addPetPart(petCompanion, turtleMat, [0, -0.015, 0], [0.44, 0.18, 0.38]);
        // Layered shell gives the turtle a domed silhouette and visible scutes.
        addPetPart(petCompanion, turtleShellMat, [0, 0.16, -0.025], [0.42, 0.22, 0.34]);
        addPetPart(petCompanion, turtleShellDetailMat, [0, 0.29, -0.025], [0.3, 0.1, 0.25]);
        addPetPart(petCompanion, turtleShellMat, [0, 0.35, -0.025], [0.16, 0.06, 0.15]);
        [[-0.075, -0.08], [0.075, -0.08], [-0.075, 0.045], [0.075, 0.045]].forEach(([x, z]) => {
          addPetPart(petCompanion!, turtleShellMat, [x, 0.35, z], [0.1, 0.025, 0.09]);
        });
        addPetPart(petCompanion, turtleMat, [0, 0.055, 0.31], [0.23, 0.2, 0.22]);
        [[-0.22, -0.14], [0.22, -0.14], [-0.22, 0.14], [0.22, 0.14]].forEach(([x, z]) => {
          addPetPart(petCompanion!, turtleMat, [x, -0.105, z], [0.16, 0.12, 0.16]);
        });
        [-0.06, 0.06].forEach((x) => addPetPart(petCompanion!, petDarkMat, [x, 0.105, 0.405], [0.035, 0.05, 0.025]));
      } else if (hasFox) {
        addPetPart(petCompanion, foxMat, [0, -0.03, 0], [0.46, 0.28, 0.32]);
        addPetPart(petCompanion, foxMat, [0, 0.13, 0.18], [0.3, 0.28, 0.28]);
        [-0.1, 0.1].forEach((x) => addPetPart(petCompanion!, foxMat, [x, 0.36, 0.14], [0.09, 0.18, 0.1]));
        addPetPart(petCompanion, petLightMat, [0, 0.03, 0.36], [0.18, 0.13, 0.09]);
        const tail = addPetPart(petCompanion, foxMat, [0.27, 0.12, -0.1], [0.18, 0.18, 0.42]);
        tail.rotation.x = -Math.PI / 5;
        addPetPart(petCompanion, petLightMat, [0.29, 0.2, -0.28], [0.16, 0.16, 0.14]);
        [-0.08, 0.08].forEach((x) => addPetPart(petCompanion!, petDarkMat, [x, 0.19, 0.31], [0.04, 0.06, 0.03]));
      } else if (hasWolf) {
        addPetPart(petCompanion, wolfMat, [0, -0.03, 0], [0.48, 0.3, 0.34]);
        addPetPart(petCompanion, wolfMat, [0, 0.16, 0.18], [0.34, 0.32, 0.3]);
        [-0.12, 0.12].forEach((x) => addPetPart(petCompanion!, wolfMat, [x, 0.4, 0.12], [0.1, 0.2, 0.1]));
        addPetPart(petCompanion, petLightMat, [0, 0.04, 0.38], [0.2, 0.14, 0.1]);
        const tail = addPetPart(petCompanion, wolfMat, [0.28, 0.08, -0.13], [0.16, 0.16, 0.38]);
        tail.rotation.x = -Math.PI / 5;
        [-0.08, 0.08].forEach((x) => addPetPart(petCompanion!, petDarkMat, [x, 0.22, 0.33], [0.04, 0.06, 0.03]));
      } else {
        addPetPart(petCompanion, catMat, [0, -0.02, 0], [0.42, 0.26, 0.34]);
        [[-0.14, -0.1], [0.14, -0.1], [-0.14, 0.12], [0.14, 0.12]].forEach(([x, z]) => {
          addPetPart(petCompanion!, catMat, [x, -0.18, z], [0.1, 0.16, 0.11]);
        });
        // Round face, short muzzle, upright ears, and whiskers distinguish the cat from the fox.
        addPetPart(petCompanion, catMat, [0, 0.15, 0.18], [0.32, 0.28, 0.26]);
        [-0.11, 0.11].forEach((x) => {
          addPetPart(petCompanion!, catMat, [x, 0.36, 0.12], [0.1, 0.17, 0.1]);
          addPetPart(petCompanion!, catEarMat, [x, 0.36, 0.177], [0.045, 0.1, 0.018]);
        });
        addPetPart(petCompanion, petLightMat, [0, 0.035, 0.34], [0.18, 0.11, 0.09]);
        addPetPart(petCompanion, catEarMat, [0, 0.09, 0.392], [0.045, 0.035, 0.025]);
        [-0.075, 0.075].forEach((x) => addPetPart(petCompanion!, catEyeMat, [x, 0.2, 0.315], [0.04, 0.055, 0.025]));
        [-1, 1].forEach((side) => {
          [0, 0.055].forEach((y) => {
            const whisker = addPetPart(petCompanion!, petLightMat, [side * 0.17, y, 0.35], [0.12, 0.018, 0.018]);
            whisker.rotation.z = side * (y === 0 ? -0.12 : 0.12);
          });
        });
        // Short, curled tail instead of the fox's long plume.
        addPetPart(petCompanion, catMat, [0.22, 0.08, -0.2], [0.12, 0.16, 0.12]);
        addPetPart(petCompanion, catMat, [0.3, 0.22, -0.2], [0.12, 0.18, 0.12]);
        addPetPart(petCompanion, catMat, [0.24, 0.34, -0.2], [0.12, 0.12, 0.12]);
        addPetPart(petCompanion, catMat, [0.16, 0.32, -0.2], [0.12, 0.12, 0.12]);
      }
    }

    // 6. Interactive Drag Orbit Rotation Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX = Math.max(-0.22, Math.min(0.32, targetRotationX + deltaY * 0.006));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX = Math.max(-0.22, Math.min(0.32, targetRotationX + deltaY * 0.006));
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 7. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Gentle auto hover spin
      if (!isDragging && !reducedMotion) {
        targetRotationY += 0.0035;
      }

      islandGroup.rotation.y += (targetRotationY - islandGroup.rotation.y) * 0.08;
      islandGroup.rotation.x += (targetRotationX - islandGroup.rotation.x) * 0.08;

      // Floating Bobbing Effect
      if (!reducedMotion) {
        islandGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.22;

        if (flameMesh && fireLight) {
          flameMesh.scale.y = 1 + Math.sin(elapsedTime * 12) * 0.25;
          fireLight.intensity = 1.3 + Math.sin(elapsedTime * 10) * 0.4;
        }

        waterfallDrops.forEach((drop) => {
          drop.position.y -= 0.055;
          if (drop.position.y < -4.3) drop.position.y = 0.45;
        });


        if (slimeMesh) {
          const bounce = Math.abs(Math.sin(elapsedTime * 3));
          slimeMesh.position.y = 0.8 + bounce * 0.4;
          slimeMesh.scale.set(1 + (1 - bounce) * 0.15, 1 - (1 - bounce) * 0.2, 1 + (1 - bounce) * 0.15);
        }
        if (petCompanion) {
          petCompanion.position.y = 0.72 + Math.abs(Math.sin(elapsedTime * 2.6)) * 0.18;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 400;
      height = container.clientHeight || 320;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      boxGeo.dispose();
      grassTopMat.dispose();
      grassSideMat.dispose();
      dirtMat.dispose();
      darkDirtMat.dispose();
      stoneMat.dispose();
      darkStoneMat.dispose();
      woodLogSideMat.dispose();
      woodLogTopMat.dispose();
      woodPlankMat.dispose();
      leavesMat.dispose();
      leavesLightMat.dispose();
      birchLeavesMat.dispose();
      spruceLeavesMat.dispose();
      willowLeavesMat.dispose();
      mapleLeavesMat.dispose();
      mapleLightMat.dispose();
      birchTrunkMat.dispose();
      goldMat.dispose();
      diamondMat.dispose();
      cropStemMat.dispose();
      cropLeafMat.dispose();
      cropHeadMat.dispose();
      cropAccentMat.dispose();
      irrigationMat.dispose();
      campfireFlameMat.dispose();
      campfireCoreMat.dispose();
      windowMat.dispose();
      if (houseWallMat !== woodPlankMat) houseWallMat.dispose();
      houseRoofMat.dispose();
      slimeFaceMat.dispose();
      slimeHighlightMat.dispose();
      chickMat.dispose();
      chickWingMat.dispose();
      petDarkMat.dispose();
      turtleMat.dispose();
      turtleShellMat.dispose();
      turtleShellDetailMat.dispose();
      foxMat.dispose();
      wolfMat.dispose();
      catMat.dispose();
      catEyeMat.dispose();
      catEarMat.dispose();
      petLightMat.dispose();
      blossomMat.dispose();
      blossomLightMat.dispose();
      crystalMat.dispose();
      lanternGlassMat.dispose();
      cropStemGeo.dispose();
      cropLeafGeo.dispose();
      cropHeadGeo.dispose();
      cropAccentGeo.dispose();
      cropJointGeo.dispose();
      gardenSoilGeo.dispose();
      pathStoneGeo.dispose();
      irrigationGeo.dispose();
      campfireLogGeo.dispose();
      campfireStoneGeo.dispose();
      campfireFlameGeo.dispose();
      campfireCoreGeo.dispose();
      cabinWindowGeo.dispose();
      cabinWindowBarGeo.dispose();
      cabinWindowCrossbarGeo.dispose();
      cabinDoorGeo.dispose();
      cabinDoorFrameGeo.dispose();
      cabinDoorTopFrameGeo.dispose();
      cabinDoorBraceGeo.dispose();
      doorLatchGeo.dispose();
      waterfallBedGeo.dispose();
      waterfallStreamGeo.dispose();
      waterfallDropGeo.dispose();
      slimeBodyGeo.dispose();
      slimeEyeGeo.dispose();
      slimeSmileGeo.dispose();
      slimeShineGeo.dispose();
      lanternGeo.dispose();
      lanternTopGeo.dispose();
      lanternBeamGeo.dispose();

      grassTopTex.dispose();
      grassSideTex.dispose();
      dirtTex.dispose();
      darkDirtTex.dispose();
      stoneTex.dispose();
      darkStoneTex.dispose();
      woodLogSideTex.dispose();
      woodLogTopTex.dispose();
      woodPlankTex.dispose();
      leavesTex.dispose();
      leavesLightTex.dispose();
      goldOreTex.dispose();
      diamondOreTex.dispose();
    };
  }, [theme, reducedMotion, hasCampfire, hasFarm, activeFarmId, activeFarmCrop, activeTreeId, hasCabin, activeHouseId, hasWaterfall, hasSlime, hasChick, hasTurtle, hasFox, hasWolf, hasCat, hasCrystalShrine, hasSkyLanterns, hasSkyPrism, hasCloudArch, hasEmeraldBeacon, hasSunstoneFountain, hasMoonDial, hasAuroraShrine, hasCloudGuardian, hasGrandTrophy]);

  return (
    <div
      ref={containerRef}
      title="Click and drag to rotate the island in 360°"
      className="w-full h-full min-h-[360px] sm:min-h-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    />
  );
};
