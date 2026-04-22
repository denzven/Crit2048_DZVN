// --- FULLY 3D THREE.JS DICE ENGINE (Inspired by dice-box) ---
const FixedDiceEngine = (function () {
  let activeRenderers = {};

  function clear(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = "";
    if (activeRenderers[containerId]) {
      activeRenderers[containerId].dispose();
      delete activeRenderers[containerId];
    }
  }

  // High friction, highly grounded physics step
  function applyPhysics(mesh, widthBounds, heightBounds) {
    let p = mesh.position,
      r = mesh.rotation,
      v = mesh.userData.vel,
      av = mesh.userData.avel;

    if (v.lengthSq() === 0 && av.lengthSq() === 0) return false;

    p.add(v);
    r.x += av.x;
    r.y += av.y;
    r.z += av.z;
    v.y -= 0.025; // Stronger Gravity

    let bounced = false;

    // Floor collision
    if (p.y <= 1.0) {
      p.y = 1.0;
      if (v.y < 0) {
        if (Math.abs(v.y) > 0.1) bounced = true;
        v.y *= -0.3; // Very low bounciness
        if (Math.abs(v.y) < 0.05) v.y = 0;
      }
      v.x *= 0.6;
      v.z *= 0.6; // High floor sliding friction
      av.multiplyScalar(0.7); // High floor spinning friction
    }

    // Wall collisions
    if (p.x > widthBounds) {
      p.x = widthBounds;
      v.x *= -0.8;
      bounced = true;
    }
    if (p.x < -widthBounds) {
      p.x = -widthBounds;
      v.x *= -0.8;
      bounced = true;
    }
    if (p.z > heightBounds) {
      p.z = heightBounds;
      v.z *= -0.8;
      bounced = true;
    }
    if (p.z < -heightBounds) {
      p.z = -heightBounds;
      v.z *= -0.8;
      bounced = true;
    }

    // Hard sleep threshold to completely kill micro-movements
    if (p.y <= 1.05 && v.lengthSq() < 0.001 && av.lengthSq() < 0.001) {
      v.set(0, 0, 0);
      av.set(0, 0, 0);
    }

    return bounced;
  }

  // Deterministically figures out which face lands up
  function simulateRoll(mesh, widthBounds, heightBounds) {
    // Fast-forward physics simulation (up to 1000 steps just in case)
    for (let i = 0; i < 1000; i++) {
      applyPhysics(mesh, widthBounds, heightBounds);
      if (
        mesh.userData.vel.lengthSq() === 0 &&
        mesh.userData.avel.lengthSq() === 0
      )
        break;
    }

    mesh.updateMatrixWorld();

    let topFace = 0;
    let maxDot = -1;
    mesh.geometry.computeVertexNormals();
    const normals = mesh.geometry.attributes.normal;
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    const localNormal = new THREE.Vector3();
    const worldNormal = new THREE.Vector3();

    for (let i = 0; i < normals.count; i += 3) {
      localNormal.fromBufferAttribute(normals, i);
      worldNormal.copy(localNormal).applyMatrix3(normalMatrix).normalize();
      const dot = worldNormal.dot(new THREE.Vector3(0, 1, 0));
      if (dot > maxDot) {
        maxDot = dot;
        topFace = i / 3;
      }
    }
    return topFace;
  }

  function createDice(sides, targetResult, idx, count, spreadX, spreadZ) {
    let geometry;
    const theme = DICE_THEMES[config.diceTheme] || DICE_THEMES.default;
    const color = theme[sides] || theme[20];
    const bgColor = theme.bg;

    // Base scale sizes
    if (sides === 6) {
      geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0).toNonIndexed();
      geometry.clearGroups();
      for (let i = 0; i < 6; i++) geometry.addGroup(i * 6, 6, i);
    } else if (sides === 8) {
      geometry = new THREE.OctahedronGeometry(1.5).toNonIndexed();
    } else if (sides === 10) {
      geometry = new THREE.IcosahedronGeometry(1.5).toNonIndexed();
    } else {
      geometry = new THREE.IcosahedronGeometry(1.5).toNonIndexed();
    }

    if (sides !== 6) {
      const uvs = geometry.attributes.uv;
      for (let i = 0; i < uvs.count; i += 3) {
        geometry.addGroup(i, 3, i / 3);
        uvs.setXY(i + 0, 0, 0);
        uvs.setXY(i + 1, 1, 0);
        uvs.setXY(i + 2, 0.5, 1);
      }
    }

    // Switch to Toon Material for that NPR cartoonish style
    const mesh = new THREE.Mesh(geometry, new THREE.MeshToonMaterial());
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.position.set(
      (Math.random() - 0.5) * spreadX,
      12 + Math.random() * 5 + idx * 2,
      (Math.random() - 0.5) * spreadZ,
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );

    const force = 0.5;
    mesh.userData.vel = new THREE.Vector3(
      (Math.random() - 0.5) * force,
      0.2 + Math.random() * 0.2,
      (Math.random() - 0.5) * force,
    );
    mesh.userData.avel = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
    );

    const initPos = mesh.position.clone();
    const initRot = mesh.rotation.clone();
    const initVel = mesh.userData.vel.clone();
    const initAvel = mesh.userData.avel.clone();

    const topTriIndex = simulateRoll(mesh, spreadX, spreadZ);
    const topMatIndex = sides === 6 ? Math.floor(topTriIndex / 2) : topTriIndex;

    // --- PRE-CALCULATE PERFECT UPRIGHT ROTATION FOR THE END ANIMATION ---
    let localNormal, localUp;
    if (sides === 6) {
      const boxNormals = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1),
      ];
      const boxUps = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0),
      ];
      localNormal = boxNormals[topMatIndex];
      localUp = boxUps[topMatIndex];
    } else {
      const posAttr = mesh.geometry.attributes.position;
      const i0 = topTriIndex * 3;
      const i1 = topTriIndex * 3 + 1;
      const i2 = topTriIndex * 3 + 2;
      let v0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
      let v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
      let v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);

      let edge1 = new THREE.Vector3().subVectors(v1, v0);
      let edge2 = new THREE.Vector3().subVectors(v2, v0);
      localNormal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

      let midBottom = new THREE.Vector3()
        .addVectors(v0, v1)
        .multiplyScalar(0.5);
      localUp = new THREE.Vector3().subVectors(v2, midBottom).normalize();
    }

    // We want localNormal mapped to +Y, and localUp mapped to -Z (Up on screen)
    let localRight = new THREE.Vector3()
      .crossVectors(localUp, localNormal)
      .normalize();
    let localBack = new THREE.Vector3().copy(localUp).negate();
    let basisMat = new THREE.Matrix4().makeBasis(
      localRight,
      localNormal,
      localBack,
    );
    // The inverse matrix aligns the local face to exactly point towards the camera upright
    mesh.userData.targetQuat = new THREE.Quaternion()
      .setFromRotationMatrix(basisMat)
      .invert();

    // Restore pre-simulation state
    mesh.position.copy(initPos);
    mesh.rotation.copy(initRot);
    mesh.userData.vel.copy(initVel);
    mesh.userData.avel.copy(initAvel);

    const numMats = sides === 6 ? 6 : sides === 8 ? 8 : 20;
    const materials = [];
    for (let i = 0; i < numMats; i++) {
      let num =
        i === topMatIndex
          ? targetResult
          : Math.floor(Math.random() * sides) + 1;
      if (i !== topMatIndex && num === targetResult) num = (num % sides) + 1;

      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      // Solid dark background matching UI
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 256, 256);

      if (sides === 6) {
        // Thinner lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, 244, 244);
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Extremely bold, large font for maximum readability
        ctx.font = "900 160px sans-serif";
        ctx.fillText(num, 128, 140);
      } else {
        ctx.beginPath();
        ctx.moveTo(128, 10);
        ctx.lineTo(246, 246);
        ctx.lineTo(10, 246);
        ctx.closePath();
        ctx.fillStyle = bgColor;
        ctx.fill();
        // Thinner lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 110px sans-serif";
        ctx.fillText(num, 128, 165);
        if (num === 6 || num === 9) {
          ctx.fillRect(100, 220, 56, 8);
        }
      }

      // Use Toon material (color white so the texture map is purely visible)
      materials.push(
        new THREE.MeshToonMaterial({
          map: new THREE.CanvasTexture(canvas),
          color: 0xffffff,
        }),
      );
    }
    mesh.material = materials;
    return mesh;
  }

  function roll(containerId, diceArray, results) {
    return new Promise((resolve) => {
      const container = document.getElementById(containerId);
      clear(containerId);

      const width = container.clientWidth || 300;
      const height = container.clientHeight || 200;

      const scene = new THREE.Scene();
      const aspect = width / height;
      const d = 3.2;
      const camera = new THREE.OrthographicCamera(
        -d * aspect,
        d * aspect,
        d,
        -d,
        1,
        100,
      );
      camera.position.set(0, 15, 0);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Transparent
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      activeRenderers[containerId] = renderer;

      // Simple soft lighting required for the Toon material to look cel-shaded
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 20, 5);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.left = -10;
      dirLight.shadow.camera.right = 10;
      dirLight.shadow.camera.top = 10;
      dirLight.shadow.camera.bottom = -10;
      scene.add(dirLight);

      const spreadX = Math.max(1, d * aspect - 1.5);
      const spreadZ = Math.max(1, d - 1.5);

      // Tray matching theme bg
      const trayGeo = new THREE.BoxGeometry(
        spreadX * 2 + 2,
        10,
        spreadZ * 2 + 2,
      );
      const theme = DICE_THEMES[config.diceTheme] || DICE_THEMES.default;
      const trayMat = new THREE.MeshToonMaterial({
        color: theme.tray,
        side: THREE.BackSide,
      });
      const tray = new THREE.Mesh(trayGeo, trayMat);
      tray.position.y = 4;
      tray.receiveShadow = true;
      scene.add(tray);

      const diceObjects = [];
      diceArray.forEach((sides, idx) => {
        const die = createDice(
          sides,
          results[idx],
          idx,
          diceArray.length,
          spreadX,
          spreadZ,
        );
        scene.add(die);
        diceObjects.push(die);
      });

      let active = true;
      let frames = 0;

      // Animation state
      let ending = false;
      let endFrame = 0;

      function animate() {
        if (!active) return;
        requestAnimationFrame(animate);

        if (!ending) {
          let moving = false;
          diceObjects.forEach((mesh) => {
            const bounced = applyPhysics(mesh, spreadX, spreadZ);
            if (bounced && frames % 5 === 0) SFX.diceClatter();
            if (
              mesh.userData.vel.lengthSq() > 0 ||
              mesh.userData.avel.lengthSq() > 0
            )
              moving = true;
          });

          // Trigger the 'Ending' animation phase once physics is done, or cap at 180 frames max
          if ((!moving && frames > 20) || frames > 180) {
            ending = true;
            SFX.slide();
            diceObjects.forEach((mesh, i) => {
              // Store current values for lerping
              mesh.userData.startPos = mesh.position.clone();
              mesh.userData.startScale = mesh.scale.clone();
              mesh.userData.startQuat = mesh.quaternion.clone();

              // Center them towards the camera and spread them neatly if multiple
              let spread = 2.5;
              let targetX = (i - (diceObjects.length - 1) / 2) * spread;
              mesh.userData.targetPos = new THREE.Vector3(targetX, 3.5, 0); // lifted
              mesh.userData.targetScale = new THREE.Vector3(1.6, 1.6, 1.6); // larger
            });
          }
        } else {
          // Ending animation: lerp dice towards camera, scale up, and snap rotate perfectly upright
          endFrame++;
          let t = Math.min(endFrame / 25, 1.0);
          let ease = 1 - Math.pow(1 - t, 3); // Cubic ease out

          diceObjects.forEach((mesh) => {
            mesh.position.lerpVectors(
              mesh.userData.startPos,
              mesh.userData.targetPos,
              ease,
            );
            mesh.scale.lerpVectors(
              mesh.userData.startScale,
              mesh.userData.targetScale,
              ease,
            );
            // Slerp rotation towards mathematically perfect upright face
            mesh.quaternion.slerpQuaternions(
              mesh.userData.startQuat,
              mesh.userData.targetQuat,
              ease,
            );
          });

          if (endFrame === 1) SFX.powerUp(); // Distinct sound as they float up

          if (endFrame >= 45) {
            // Give user time to see them centered
            active = false;
            resolve();
          }
        }

        renderer.render(scene, camera);
        frames++;
      }
      animate();
    });
  }

  return { roll, clear };
})();
