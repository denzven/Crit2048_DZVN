import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeDiceProps {
  sides: number;
  results: number[];
  onComplete: () => void;
}

// --- GLOBAL CACHE REGISTRY ---
// These persist across component mounts to eliminate CPU spikes on new rolls
const geometryCache: Record<number, THREE.BufferGeometry> = {};
const textureCache: Record<string, THREE.Texture> = {};

/**
 * Generates or retrieves a cached texture for a specific dice face
 */
const getCachedTexture = (sides: number, value: number, color: string): THREE.Texture => {
  const cacheKey = `${sides}-${value}-${color}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement("canvas");
  // 256x256 is plenty for small dice and 4x lighter than 512x512
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  
  // Background
  ctx.fillStyle = "#0a0a0a"; 
  ctx.fillRect(0, 0, 256, 256);
  
  // Decorative Border
  ctx.strokeStyle = color; 
  ctx.lineWidth = 8; 
  ctx.globalAlpha = 0.2;
  if (sides === 6) {
    ctx.strokeRect(20, 20, 216, 216);
  } else {
    ctx.beginPath(); 
    ctx.moveTo(128, 30); 
    ctx.lineTo(226, 226); 
    ctx.lineTo(30, 226); 
    ctx.closePath(); 
    ctx.stroke();
  }
  
  // Text
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = color; 
  ctx.textAlign = "center"; 
  ctx.textBaseline = "middle";
  ctx.font = `900 ${sides === 6 ? '170px' : '110px'} system-ui, sans-serif`;
  
  const diceY = sides === 6 ? 128 : 160;
  ctx.fillText(value.toString(), 128, diceY);
  
  // Underline for 6 and 9
  if (value === 6 || value === 9) {
    ctx.fillRect(95, diceY + (sides === 6 ? 70 : 50), 66, 8);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4; // Keeps text sharp at angles
  textureCache[cacheKey] = texture;
  return texture;
};

const ThreeDice: React.FC<ThreeDiceProps> = ({ sides, results, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 300;

    const scene = new THREE.Scene();
    const aspect = width / height;
    const d = 3.5;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 100);
    camera.position.set(0, 30, 0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance" // Hint for mobile/laptops
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x111122, 0.7));
    
    // Optimized shadows: 512 is enough for small modal view
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512); 
    sun.shadow.radius = 8;
    scene.add(sun);

    const sun2 = new THREE.DirectionalLight(0xffffff, 0.5);
    sun2.position.set(-5, 20, 5);
    sun2.castShadow = true;
    sun2.shadow.mapSize.set(256, 256);
    sun2.shadow.radius = 12;
    scene.add(sun2);

    const padding = 1.4;
    const spreadX = Math.max(0.5, d * aspect - padding);
    const spreadZ = Math.max(0.5, d - padding);

    const tray = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 })
    );
    tray.rotation.x = -Math.PI / 2;
    tray.receiveShadow = true;
    scene.add(tray);

    const getDiceGeometry = (s: number) => {
      if (geometryCache[s]) return geometryCache[s];

      let geo: THREE.BufferGeometry;
      if (s === 4) geo = new THREE.TetrahedronGeometry(1.5, 0);
      else if (s === 6) geo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
      else if (s === 8) geo = new THREE.OctahedronGeometry(1.5, 0);
      else if (s === 12) geo = new THREE.DodecahedronGeometry(1.5, 0);
      else if (s === 20) geo = new THREE.IcosahedronGeometry(1.5, 0);
      else geo = new THREE.IcosahedronGeometry(1.5, 0);

      const nonIndexed = geo.toNonIndexed();
      const count = nonIndexed.attributes.position.count;
      const uvs = nonIndexed.attributes.uv;
      const faceCount = s === 6 ? 6 : count / 3;
      const groupSize = count / faceCount;

      nonIndexed.clearGroups();
      for(let i = 0; i < faceCount; i++) nonIndexed.addGroup(i * groupSize, groupSize, i);
      
      if (uvs && s !== 6) {
          for (let i = 0; i < uvs.count; i += 3) {
              uvs.setXY(i + 0, 0, 0); uvs.setXY(i + 1, 1, 0); uvs.setXY(i + 2, 0.5, 1);
          }
      }
      
      geometryCache[s] = nonIndexed;
      return nonIndexed;
    };

    const getDiceMaterials = (s: number, targetValue: number) => {
      const mats: THREE.Material[] = [];
      const textCol = s === 20 ? "#D22B2B" : "#000080";
      const faceValues = [targetValue];
      
      const faceCount = s === 6 ? 6 : (s === 4 ? 4 : (s === 8 ? 8 : (s === 12 ? 12 : 20)));
      for(let i = 1; i < faceCount; i++) faceValues.push(((targetValue + i - 1) % s) + 1);

      for (let i = 0; i < faceCount; i++) {
        const tex = getCachedTexture(s, faceValues[i], textCol);
        mats.push(new THREE.MeshStandardMaterial({ 
          map: tex, 
          roughness: 0.35, 
          metalness: 0.1,
          envMapIntensity: 0.5 
        }));
      }
      return mats;
    };

    const geometry = getDiceGeometry(sides);
    const posAttr = geometry.attributes.position;
    const localNormal = (function() {
        const vA = new THREE.Vector3().fromBufferAttribute(posAttr, 0);
        const vB = new THREE.Vector3().fromBufferAttribute(posAttr, 1);
        const vC = new THREE.Vector3().fromBufferAttribute(posAttr, 2);
        return new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3).normalize();
    })();
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(localNormal, new THREE.Vector3(0, 1, 0));

    const diceObjects: THREE.Mesh[] = [];
    results.forEach((res, i) => {
      const materials = getDiceMaterials(sides, res);
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;

      mesh.position.set((i - (results.length - 1) / 2) * 2.0, 12, (Math.random() - 0.5) * 1.5);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = { 
        radius: 1.0,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.6, -0.8, (Math.random() - 0.5) * 0.6),
        avel: new THREE.Vector3((Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3.5)
      };
      scene.add(mesh);
      diceObjects.push(mesh);
    });

    let active = true; let frames = 0; let ending = false; let endFrame = 0;
    const animate = () => {
      if (!active) return;
      requestAnimationFrame(animate);

      if (!ending) {
        let moving = false;
        for (let i = 0; i < diceObjects.length; i++) {
            for (let j = i + 1; j < diceObjects.length; j++) {
                const d1 = diceObjects[i]; const d2 = diceObjects[j];
                const dist = d1.position.distanceTo(d2.position);
                if (dist < 2.0) {
                    const normal = new THREE.Vector3().subVectors(d1.position, d2.position).normalize();
                    const overlap = 2.0 - dist;
                    const correction = normal.clone().multiplyScalar(overlap / 2);
                    d1.position.add(correction); d2.position.sub(correction);
                    const relativeVelocity = new THREE.Vector3().subVectors(d1.userData.vel, d2.userData.vel);
                    const velocityAlongNormal = relativeVelocity.dot(normal);
                    if (velocityAlongNormal < 0) {
                        const jVal = -(1.2) * velocityAlongNormal;
                        const impulse = normal.multiplyScalar(jVal / 2);
                        d1.userData.vel.add(impulse); d2.userData.vel.sub(impulse);
                        d1.userData.avel.addScalar((Math.random() - 0.5) * 0.5); d2.userData.avel.addScalar((Math.random() - 0.5) * 0.5);
                    }
                }
            }
        }
        diceObjects.forEach(m => {
          const { vel, avel } = m.userData;
          m.position.add(vel); m.rotation.x += avel.x; m.rotation.y += avel.y; m.rotation.z += avel.z;
          vel.y -= 0.15;
          if (m.position.y <= 0.9) { m.position.y = 0.9; vel.y *= -0.3; vel.x *= 0.6; vel.z *= 0.6; avel.multiplyScalar(0.6); }
          if (frames > 35) m.quaternion.slerp(targetQuat, 0.1);
          if (Math.abs(m.position.x) > spreadX) { m.position.x = Math.sign(m.position.x) * spreadX; vel.x *= -0.7; }
          if (Math.abs(m.position.z) > spreadZ) { m.position.z = Math.sign(m.position.z) * spreadZ; vel.z *= -0.7; }
          if (Math.abs(vel.y) > 0.05 || vel.lengthSq() > 0.005 || avel.lengthSq() > 0.05) moving = true;
        });
        if (!moving && frames > 65) {
          ending = true;
          diceObjects.forEach(m => { m.userData.finalPos = m.position.clone(); });
          camera.userData.startPos = camera.position.clone();
        }
      } else {
        endFrame++;
        const t = Math.min(endFrame / 40, 1.0);
        const ease = 1 - Math.pow(1 - t, 4);
        const centroid = new THREE.Vector3();
        diceObjects.forEach(m => centroid.add(m.userData.finalPos));
        centroid.divideScalar(diceObjects.length);
        let maxDist = 0.5;
        diceObjects.forEach(m => {
            const d = m.userData.finalPos.distanceTo(centroid);
            if (d > maxDist) maxDist = d;
        });
        const targetCamPos = new THREE.Vector3(centroid.x, 30, centroid.z);
        camera.position.lerpVectors(camera.userData.startPos, targetCamPos, ease);
        const zoomBase = Math.max(0.6, 1.0 - maxDist * 0.2);
        camera.zoom = 1 + ease * zoomBase;
        camera.updateProjectionMatrix();
        if (endFrame >= 80) { active = false; onComplete(); }
      }
      renderer.render(scene, camera);
      frames++;
    };
    animate();
    return () => { active = false; renderer.dispose(); if (containerRef.current) containerRef.current.innerHTML = ''; };
  }, [sides, results, onComplete]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ThreeDice;
