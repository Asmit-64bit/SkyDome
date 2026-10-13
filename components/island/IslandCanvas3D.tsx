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
  const islandLevel = useSkyDoStore((state) => state.islandLevel);
  const theme = useSkyDoStore((state) => state.theme);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);
  const shopItems = useSkyDoStore((state) => state.shopItems);

  // Check cosmetics
  const hasTree = islandLevel >= 2 || shopItems.find((i) => i.id === 'oak_tree')?.equipped;
  const hasCabin = islandLevel >= 3 || shopItems.find((i) => i.id === 'wooden_cabin')?.equipped;
  const hasWaterfall = islandLevel >= 5 || shopItems.find((i) => i.id === 'waterfall')?.equipped;
  const hasWindmill = islandLevel >= 6 || shopItems.find((i) => i.id === 'windmill')?.equipped;
  const hasSlime = shopItems.find((i) => i.id === 'pet_slime')?.equipped;

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
    const goldMat = new THREE.MeshLambertMaterial({ map: goldOreTex });
    const diamondMat = new THREE.MeshLambertMaterial({ map: diamondOreTex });
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x4aa3b5,
      transparent: true,
      opacity: 0.75,
    });
    const whiteWoolMat = new THREE.MeshLambertMaterial({ color: 0xf4efe6 });

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

    // 5. Dynamic Island Level Features
    // A. Campfire
    const campfireMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.7), woodLogSideMat);
    campfireMesh.position.set(-1.6, 0.62, 1.6);
    islandGroup.add(campfireMesh);

    const fireLight = new THREE.PointLight(0xe3b341, 1.5, 4);
    fireLight.position.set(-1.6, 1.1, 1.6);
    islandGroup.add(fireLight);

    const flameMat = new THREE.MeshBasicMaterial({ color: 0xb3392f });
    const flameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.28), flameMat);
    flameMesh.position.set(-1.6, 0.95, 1.6);
    islandGroup.add(flameMesh);

    // B. Oak Tree (Level 2+)
    if (hasTree) {
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
    }

    // C. Wooden Chest (Level 3+)
    if (islandLevel >= 3) {
      const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), woodPlankMat);
      chestMesh.position.set(-1.8, 0.85, 0);
      islandGroup.add(chestMesh);

      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.12), goldMat);
      latch.position.set(-1.42, 0.85, 0);
      islandGroup.add(latch);
    }

    // D. Cozy Timber Cabin (Level 4+)
    if (hasCabin) {
      for (let cx = -1; cx <= 1; cx++) {
        for (let cz = -2; cz <= 0; cz++) {
          for (let cy = 1; cy <= 2; cy++) {
            if (!(cx === 0 && cz === 0)) {
              addBlock(cx, cy, cz, woodPlankMat);
            }
          }
        }
      }
      for (let rx = -1.2; rx <= 1.2; rx += 0.8) {
        addBlock(rx, 3, -1, woodLogMaterials);
      }
      addBlock(0.8, 3.5, -1.8, stoneMat);
    }

    // E. Waterfall (Level 5+)
    if (hasWaterfall) {
      const wfMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.5, 0.3), waterMat);
      wfMesh.position.set(0, -1.4, 2.9);
      islandGroup.add(wfMesh);
    }

    // F. Windmill (Level 6+)
    let windmillBlades: THREE.Group | null = null;
    if (hasWindmill) {
      addBlock(-2.2, 1, -1.8, stoneMat);
      addBlock(-2.2, 2, -1.8, stoneMat);
      addBlock(-2.2, 3, -1.8, woodPlankMat);

      windmillBlades = new THREE.Group();
      windmillBlades.position.set(-2.2, 3, -1.25);
      islandGroup.add(windmillBlades);

      const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.05), whiteWoolMat);
      const blade2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.05), whiteWoolMat);
      windmillBlades.add(blade1);
      windmillBlades.add(blade2);
    }

    // G. Pet Slime (Companion)
    let slimeMesh: THREE.Mesh | null = null;
    if (hasSlime) {
      const slimeMat = new THREE.MeshLambertMaterial({
        color: 0x5fa244,
        transparent: true,
        opacity: 0.85,
      });
      slimeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), slimeMat);
      slimeMesh.position.set(0.5, 0.8, 1.2);
      islandGroup.add(slimeMesh);
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

        flameMesh.scale.y = 1 + Math.sin(elapsedTime * 12) * 0.25;
        fireLight.intensity = 1.3 + Math.sin(elapsedTime * 10) * 0.4;

        if (windmillBlades) {
          windmillBlades.rotation.z += 0.02;
        }

        if (slimeMesh) {
          const bounce = Math.abs(Math.sin(elapsedTime * 3));
          slimeMesh.position.y = 0.8 + bounce * 0.4;
          slimeMesh.scale.set(1 + (1 - bounce) * 0.15, 1 - (1 - bounce) * 0.2, 1 + (1 - bounce) * 0.15);
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
      goldMat.dispose();
      diamondMat.dispose();

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
  }, [islandLevel, theme, reducedMotion, hasTree, hasCabin, hasWaterfall, hasWindmill, hasSlime]);

  return (
    <div
      ref={containerRef}
      title="Click and drag to rotate the island in 360°"
      className="w-full h-full min-h-[360px] sm:min-h-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    />
  );
};
