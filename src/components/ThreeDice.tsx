import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeDiceProps {
  sides: number;
  results: number[];
  onComplete: () => void;
}

const ThreeDice: React.FC<ThreeDiceProps> = ({ sides, results, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 256;

    const scene = new THREE.Scene();
    const aspect = width / height;
    const d = 3.2;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 100);
    camera.position.set(0, 15, 0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 20, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const spreadX = Math.max(1, d * aspect - 1.5);
    const spreadZ = Math.max(1, d - 1.5);

    const trayGeo = new THREE.BoxGeometry(spreadX * 2 + 2, 10, spreadZ * 2 + 2);
    const trayMat = new THREE.MeshToonMaterial({ color: 0x050505, side: THREE.BackSide });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.y = 4.5;
    tray.receiveShadow = true;
    scene.add(tray);

    const diceObjects: THREE.Mesh[] = [];
    
    // Geometry factory for all 7 polyhedral dice
    const createDiceGeometry = (s: number) => {
      let geo: THREE.BufferGeometry;
      if (s === 4) geo = new THREE.TetrahedronGeometry(1.5);
      else if (s === 6) geo = new THREE.BoxGeometry(2, 2, 2);
      else if (s === 8) geo = new THREE.OctahedronGeometry(1.5);
      else if (s === 12) geo = new THREE.DodecahedronGeometry(1.5);
      else if (s === 20) geo = new THREE.IcosahedronGeometry(1.5);
      else geo = new THREE.IcosahedronGeometry(1.5); // Proxy for D10/D100
      
      const uvs = geo.attributes.uv;
      if (uvs) {
        for (let i = 0; i < uvs.count; i += 3) {
          geo.addGroup(i, 3, i / 3);
          uvs.setXY(i + 0, 0, 0);
          uvs.setXY(i + 1, 1, 0);
          uvs.setXY(i + 2, 0.5, 1);
        }
      }
      return geo;
    };

    const geometry = createDiceGeometry(sides);

    // Calculate target rotation for face 0
    const posAttr = geometry.attributes.position;
    const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, 0);
    const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, 1);
    const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, 2);
    const faceNormal = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(v1, v0),
      new THREE.Vector3().subVectors(v2, v0)
    ).normalize();
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(faceNormal, new THREE.Vector3(0, 1, 0));

    results.forEach((result, idx) => {
      // Materials
      const materials: THREE.Material[] = [];
      const diceColor = sides === 20 ? "#f43f5e" : sides === 8 ? "#3b82f6" : "#fbbf24";
      const diceBg = "#0f172a";
      const numFaces = sides === 6 ? 6 : sides === 8 ? 8 : 20;

      for (let i = 0; i < numFaces; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = diceBg; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = diceColor; ctx.lineWidth = 6;
        ctx.beginPath();
        if (sides === 6) ctx.strokeRect(10, 10, 236, 236);
        else { ctx.moveTo(128, 10); ctx.lineTo(246, 246); ctx.lineTo(10, 246); ctx.closePath(); ctx.stroke(); }
        ctx.fillStyle = diceColor; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `900 ${sides === 6 ? '160px' : '110px'} sans-serif`;
        const val = (i === 0) ? result : Math.floor(Math.random() * sides) + 1;
        ctx.fillText(val.toString(), 128, sides === 6 ? 130 : 165);
        if (val === 6 || val === 9) ctx.fillRect(100, 220, 56, 8);
        materials.push(new THREE.MeshToonMaterial({ map: new THREE.CanvasTexture(canvas), color: 0xffffff }));
      }

      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Position Spread
      const spread = (idx - (results.length - 1) / 2) * 2;
      mesh.position.set(spread, 15 + Math.random() * 5, (Math.random() - 0.5) * spreadZ);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      mesh.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.2, (Math.random() - 0.5) * 0.4);
      mesh.userData.avel = new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5);
      
      scene.add(mesh);
      diceObjects.push(mesh);
    });

    const applyPhysics = (mesh: THREE.Mesh) => {
      const vel = mesh.userData.vel;
      const avel = mesh.userData.avel;
      mesh.position.add(vel);
      mesh.rotation.x += avel.x;
      mesh.rotation.y += avel.y;
      mesh.rotation.z += avel.z;
      vel.y -= 0.035;

      if (mesh.position.y <= 1.2) {
        mesh.position.y = 1.2;
        vel.y *= -0.35;
        vel.x *= 0.6;
        vel.z *= 0.6;
        avel.multiplyScalar(0.7);
      }
      
      if (Math.abs(mesh.position.x) > spreadX) { mesh.position.x = Math.sign(mesh.position.x) * spreadX; vel.x *= -0.8; }
      if (Math.abs(mesh.position.z) > spreadZ) { mesh.position.z = Math.sign(mesh.position.z) * spreadZ; vel.z *= -0.8; }

      return vel.lengthSq() > 0.001 || avel.lengthSq() > 0.001;
    };

    let active = true;
    let frames = 0;
    let ending = false;
    let endFrame = 0;

    const animate = () => {
      if (!active) return;
      requestAnimationFrame(animate);

      if (!ending) {
        let moving = false;
        diceObjects.forEach(m => { if (applyPhysics(m)) moving = true; });
        if ((!moving && frames > 45) || frames > 180) {
          ending = true;
          diceObjects.forEach(m => {
            m.userData.startPos = m.position.clone();
            m.userData.startQuat = m.quaternion.clone();
          });
        }
      } else {
        endFrame++;
        const t = Math.min(endFrame / 25, 1.0);
        const ease = 1 - Math.pow(1 - t, 3);
        diceObjects.forEach((m, i) => {
          const spread = (i - (diceObjects.length - 1) / 2) * 2.5;
          m.position.lerpVectors(m.userData.startPos, new THREE.Vector3(spread, 3.5, 0), ease);
          m.quaternion.slerpQuaternions(m.userData.startQuat, targetQuat, ease);
          m.scale.setScalar(1 + ease * 0.6);
        });

        if (endFrame >= 55) {
          active = false;
          onComplete();
        }
      }

      renderer.render(scene, camera);
      frames++;
    };
    animate();

    return () => {
      active = false;
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [sides, results, onComplete]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ThreeDice;
