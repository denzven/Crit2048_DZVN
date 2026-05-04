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

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    const spreadX = Math.max(1, d * aspect - 1.5);
    const spreadZ = Math.max(1, d - 1.5);

    const trayGeo = new THREE.BoxGeometry(spreadX * 2 + 5, 10, spreadZ * 2 + 5);
    const trayMat = new THREE.MeshToonMaterial({ color: 0x020617, side: THREE.BackSide });
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
      else geo = new THREE.IcosahedronGeometry(1.5); 
      
      const uvs = geo.attributes.uv;
      if (uvs && s !== 6) {
        geo.clearGroups();
        for (let i = 0; i < uvs.count; i += 3) {
          geo.addGroup(i, 3, i / 3);
          uvs.setXY(i + 0, 0, 0);
          uvs.setXY(i + 1, 1, 0);
          uvs.setXY(i + 2, 0.5, 1);
        }
      } else if (uvs && s === 6) {
      }
      return geo;
    };

    const geometry = createDiceGeometry(sides);
    const numFaces = sides === 6 ? 6 : sides === 8 ? 8 : (sides === 4 ? 4 : (sides === 12 ? 12 : 20));

    const posAttr = geometry.attributes.position;
    const faceVertexCount = sides === 6 ? 6 : 3;

    const getFaceNormal = (fIdx: number) => {
      const offset = fIdx * faceVertexCount;
      const vA = new THREE.Vector3().fromBufferAttribute(posAttr, offset + 0);
      const vB = new THREE.Vector3().fromBufferAttribute(posAttr, offset + 1);
      const vC = new THREE.Vector3().fromBufferAttribute(posAttr, offset + 2);
      const cb = new THREE.Vector3(), ab = new THREE.Vector3();
      cb.subVectors(vC, vB);
      ab.subVectors(vA, vB);
      cb.cross(ab);
      return cb.normalize();
    };
    
    const faceNormal = getFaceNormal(0);
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(faceNormal, new THREE.Vector3(0, 1, 0));

    results.forEach((result, idx) => {
      const diceColor = sides === 20 ? "#f43f5e" : sides === 8 ? "#3b82f6" : "#fbbf24";
      const diceBg = "#0f172a";
      const faceValues = new Array(numFaces).fill(0);
      const materials: THREE.Material[] = Array(numFaces).fill(null);

      const centers: THREE.Vector3[] = [];
      for (let i = 0; i < numFaces; i++) {
        const offset = i * faceVertexCount;
        const vA = new THREE.Vector3().fromBufferAttribute(posAttr, offset + 0);
        const vB = new THREE.Vector3().fromBufferAttribute(posAttr, offset + 1);
        const vC = new THREE.Vector3().fromBufferAttribute(posAttr, offset + 2);
        centers.push(new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3).normalize());
      }

      const getOpposite = (fIdx: number) => {
        if (sides === 6) {
          return fIdx % 2 === 0 ? fIdx + 1 : fIdx - 1;
        }
        let best = -1;
        let minDot = 1.1;
        const target = centers[fIdx];
        centers.forEach((c, j) => {
          if (fIdx === j) return;
          const d = c.dot(target);
          if (d < minDot) { minDot = d; best = j; }
        });
        return best;
      };

      faceValues[0] = result;
      const opp0 = getOpposite(0);
      if (opp0 !== -1) faceValues[opp0] = (sides + 1) - result;

      const used = new Set([0, opp0]);
      const pool = Array.from({ length: sides }, (_, i) => i + 1).filter(v => !faceValues.includes(v));

      for (let i = 0; i < numFaces; i++) {
        if (used.has(i)) continue;
        const opp = getOpposite(i);
        if (opp !== -1 && !used.has(opp)) {
          const val = pool.pop() || 1;
          faceValues[i] = val;
          faceValues[opp] = (sides + 1) - val;
          used.add(i);
          used.add(opp);
        }
      }

      for (let i = 0; i < numFaces; i++) {
        if (faceValues[i] === 0) faceValues[i] = pool.pop() || 1;
      }

      for (let i = 0; i < numFaces; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext("2d", { alpha: false })!;
        ctx.fillStyle = diceBg; ctx.fillRect(0, 0, 512, 512);
        
        ctx.strokeStyle = diceColor; ctx.lineWidth = 15;
        ctx.beginPath();
        if (sides === 6) {
          ctx.strokeRect(30, 30, 452, 452);
        } else {
          ctx.moveTo(256, 30); ctx.lineTo(482, 482); ctx.lineTo(30, 482); ctx.closePath(); ctx.stroke();
        }
        
        ctx.fillStyle = diceColor; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `900 ${sides === 6 ? '340px' : '220px'} system-ui, sans-serif`;
        
        const val = faceValues[i];
        ctx.fillText(val.toString(), 256, sides === 6 ? 260 : 330);
        if (val === 6 || val === 9) ctx.fillRect(200, 440, 112, 18);
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        materials[i] = new THREE.MeshToonMaterial({ map: tex, color: 0xffffff });
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
      
      // Gravity
      vel.y -= 0.035;

      // Floor
      if (mesh.position.y <= 1.2) {
        mesh.position.y = 1.2;
        vel.y *= -0.35;
        vel.x *= 0.6;
        vel.z *= 0.6;
        avel.multiplyScalar(0.7);
      }
      
      // Walls
      if (Math.abs(mesh.position.x) > spreadX) { mesh.position.x = Math.sign(mesh.position.x) * spreadX; vel.x *= -0.8; }
      if (Math.abs(mesh.position.z) > spreadZ) { mesh.position.z = Math.sign(mesh.position.z) * spreadZ; vel.z *= -0.8; }

      return vel.lengthSq() > 0.001 || avel.lengthSq() > 0.001;
    };

    const handleCollisions = () => {
      const radius = 1.6;
      for (let i = 0; i < diceObjects.length; i++) {
        for (let j = i + 1; j < diceObjects.length; j++) {
          const a = diceObjects[i];
          const b = diceObjects[j];
          const diff = new THREE.Vector3().subVectors(a.position, b.position);
          const dist = diff.length();
          
          if (dist < radius * 2) {
            // Collision!
            const normal = diff.normalize();
            const overlap = radius * 2 - dist;
            
            // Push apart
            a.position.addScaledVector(normal, overlap * 0.5);
            b.position.addScaledVector(normal, -overlap * 0.5);
            
            // Bounce velocities
            const relativeVelocity = new THREE.Vector3().subVectors(a.userData.vel, b.userData.vel);
            const velocityAlongNormal = relativeVelocity.dot(normal);
            
            if (velocityAlongNormal < 0) {
              const restitution = 0.5;
              const impulseScalar = -(1 + restitution) * velocityAlongNormal / 2;
              const impulse = normal.multiplyScalar(impulseScalar);
              
              a.userData.vel.add(impulse);
              b.userData.vel.sub(impulse);
              
              // Add a bit of spin change on impact
              a.userData.avel.addScaledVector(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5), 0.2);
              b.userData.avel.addScaledVector(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5), 0.2);
            }
          }
        }
      }
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
        handleCollisions();
        
        if ((!moving && frames > 60) || frames > 240) {
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
