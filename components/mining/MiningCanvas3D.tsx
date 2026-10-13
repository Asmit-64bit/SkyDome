'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { MiningBlockType } from '../../lib/types';
import { createOreBlockTexture } from '../../lib/textures';

export interface MiningCanvas3DProps {
  currentBlock: MiningBlockType;
  crackStage: number;
  isRunning: boolean;
  onBlockClick?: () => void;
}

export const MiningCanvas3D: React.FC<MiningCanvas3DProps> = ({
  currentBlock,
  crackStage,
  isRunning,
  onBlockClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSkyDoStore((state) => state.reducedMotion);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 220;
    let height = container.clientHeight || 220;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(4.5, 3.8, 5.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6e6, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    dirLight.position.set(6, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x8ec9f0, 0.5);
    backLight.position.set(-6, -4, -5);
    scene.add(backLight);

    // Group for rotating block
    const blockGroup = new THREE.Group();
    scene.add(blockGroup);

    // 3. Voxel Ore Block with Crisp 16x16 Pixel-Art Texture
    const oreTexture = createOreBlockTexture(currentBlock, crackStage);

    const baseGeo = new THREE.BoxGeometry(2, 2, 2);
    const baseMat = new THREE.MeshLambertMaterial({ map: oreTexture });
    const blockMesh = new THREE.Mesh(baseGeo, baseMat);
    blockMesh.castShadow = true;
    blockMesh.receiveShadow = true;
    blockGroup.add(blockMesh);

    // 5. 3D Pickaxe Mesh
    const pickaxeGroup = new THREE.Group();
    scene.add(pickaxeGroup);
    pickaxeGroup.position.set(2.4, 1.6, 1.2);
    pickaxeGroup.rotation.set(0.3, -0.5, -0.4);

    // Pickaxe Handle
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const handleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), handleMat);
    handleMesh.position.set(0, 0, 0);
    pickaxeGroup.add(handleMesh);

    // Pickaxe Head
    const pickHeadMat = new THREE.MeshLambertMaterial({ color: 0x4b4e52 });
    const pickHead = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.22), pickHeadMat);
    pickHead.position.set(0, 0.85, 0);
    pickHead.rotation.z = 0.25;
    pickaxeGroup.add(pickHead);

    // Pickaxe Tips
    const ironTip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.18), new THREE.MeshLambertMaterial({ color: 0xc7c9cc }));
    ironTip.position.set(-0.5, 0.72, 0);
    pickaxeGroup.add(ironTip);

    // 6. Interactive Drag & Click Detection
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let startMouseX = 0;
    let startMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let punchScale = 1;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotY += dx * 0.012;
      targetRotX += dy * 0.01;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const dist = Math.hypot(e.clientX - startMouseX, e.clientY - startMouseY);
        if (dist < 6 && onBlockClick) {
          punchScale = 0.88;
          pickaxeGroup.rotation.z -= 0.6;
          onBlockClick();
        }
      }
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) * 0.001;

      // Slow idle spin when not dragging
      if (!isDragging && !reducedMotion) {
        targetRotY += 0.008;
      }

      blockGroup.rotation.y += (targetRotY - blockGroup.rotation.y) * 0.1;
      blockGroup.rotation.x += (targetRotX - blockGroup.rotation.x) * 0.1;

      // Elastic recovery for punch scale on click
      punchScale += (1 - punchScale) * 0.18;
      blockGroup.scale.set(punchScale, punchScale, punchScale);

      // Pickaxe Swing animation when timer is running
      if (isRunning && !reducedMotion) {
        const swing = Math.sin(time * 5);
        pickaxeGroup.rotation.z += (-0.4 + swing * 0.55 - pickaxeGroup.rotation.z) * 0.2;
        pickaxeGroup.position.y = 1.6 - Math.abs(swing) * 0.35;
        pickaxeGroup.position.x = 2.4 - Math.abs(swing) * 0.45;
      } else {
        pickaxeGroup.rotation.z += (-0.4 - pickaxeGroup.rotation.z) * 0.2;
        pickaxeGroup.position.set(2.4, 1.6, 1.2);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 220;
      height = container.clientHeight || 220;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();

      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      oreTexture.dispose();
    };
  }, [currentBlock, crackStage, isRunning, reducedMotion]);

  return (
    <div
      ref={containerRef}
      onClick={onBlockClick}
      className="w-full h-full min-h-[220px] sm:min-h-[240px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    />
  );
};
