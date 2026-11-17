import * as THREE from '../vendor/three/three.module.min.js';
import { CONFIG } from './config.js';
import { SeededRandom } from './random.js';

export function createCityWorld(scene, seed = 1) {
  const rng = new SeededRandom(seed);
  
  // 1. Procedural Ground Texture (2048x2048)
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // Background / base asphalt
  ctx.fillStyle = '#1c222d';
  ctx.fillRect(0, 2048 - 400, 2048, 400); // south beach sand
  ctx.fillStyle = '#222831';
  ctx.fillRect(0, 0, 2048, 2048);

  const scale = 2048 / CONFIG.WORLD_SIZE;
  const halfWorld = CONFIG.WORLD_SIZE / 2;

  function worldToCanvas(wx, wz) {
    return {
      x: (wx + halfWorld) * scale,
      y: (wz + halfWorld) * scale
    };
  }

  // Draw Districts block tints & Parks
  CONFIG.DISTRICTS.forEach((d) => {
    const p1 = worldToCanvas(d.bounds.xMin, d.bounds.zMin);
    const p2 = worldToCanvas(d.bounds.xMax, d.bounds.zMax);
    ctx.fillStyle = '#' + d.color.toString(16).padStart(6, '0');
    ctx.globalAlpha = 0.15;
    ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.globalAlpha = 1.0;
  });

  // Draw Roads grid
  ctx.strokeStyle = '#34495e';
  ctx.lineWidth = CONFIG.ROAD_WIDTH * scale;
  ctx.lineCap = 'round';

  const step = CONFIG.BLOCK_SIZE + CONFIG.ROAD_WIDTH;
  for (let wx = -halfWorld + 30; wx < halfWorld; wx += step) {
    const p1 = worldToCanvas(wx, -halfWorld);
    const p2 = worldToCanvas(wx, halfWorld);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Road markings (center yellow dashed)
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = CONFIG.ROAD_WIDTH * scale;
  }

  for (let wz = -halfWorld + 30; wz < halfWorld; wz += step) {
    const p1 = worldToCanvas(-halfWorld, wz);
    const p2 = worldToCanvas(halfWorld, wz);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = CONFIG.ROAD_WIDTH * scale;
  }

  // South beach strip & ocean marker
  ctx.fillStyle = '#e5be9e';
  ctx.fillRect(0, 2048 - 150, 2048, 150);

  const groundTexture = new THREE.CanvasTexture(canvas);
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;

  const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD_SIZE, CONFIG.WORLD_SIZE);
  const groundMat = new THREE.MeshStandardMaterial({ map: groundTexture, roughness: 0.8 });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Animated Water Plane (South)
  const waterGeo = new THREE.PlaneGeometry(CONFIG.WORLD_SIZE, 400);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x1abc9c, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, -0.5, CONFIG.WORLD_SIZE / 2 + 200);
  scene.add(waterMesh);

  // 2. Buildings Generation (InstancedMesh)
  const buildingBoxes = [];
  const buildingInfos = [];

  for (let x = -halfWorld + 40; x < halfWorld - 40; x += step) {
    for (let z = -halfWorld + 40; z < halfWorld - 40; z += step) {
      // skip center intersections or give space
      const bWidth = CONFIG.BLOCK_SIZE - 8;
      const bDepth = CONFIG.BLOCK_SIZE - 8;
      const height = rng.range(12, 55);
      const bx = x + CONFIG.BLOCK_SIZE / 2 - 4;
      const bz = z + CONFIG.BLOCK_SIZE / 2 - 4;

      buildingInfos.push({ x: bx, z: bz, width: bWidth, depth: bDepth, height });
    }
  }

  // Create Facade Canvas Texture for Buildings
  const facadeCanvas = document.createElement('canvas');
  facadeCanvas.width = 256;
  facadeCanvas.height = 256;
  const fCtx = facadeCanvas.getContext('2d');
  fCtx.fillStyle = '#34495e';
  fCtx.fillRect(0, 0, 256, 256);
  // draw grid of windows
  fCtx.fillStyle = '#7f8c8d';
  for (let wx = 20; wx < 236; wx += 35) {
    for (let wy = 20; wy < 236; wy += 45) {
      fCtx.fillRect(wx, wy, 20, 30);
    }
  }
  const facadeTexture = new THREE.CanvasTexture(facadeCanvas);

  // Night lit windows texture (emissive)
  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = 256;
  nightCanvas.height = 256;
  const nCtx = nightCanvas.getContext('2d');
  nCtx.fillStyle = '#000000';
  nCtx.fillRect(0, 0, 256, 256);
  nCtx.fillStyle = '#f1c40f';
  for (let wx = 20; wx < 236; wx += 35) {
    for (let wy = 20; wy < 236; wy += 45) {
      if (rng.next() > 0.3) {
        nCtx.fillRect(wx, wy, 20, 30);
      }
    }
  }
  const nightTexture = new THREE.CanvasTexture(nightCanvas);

  const buildingMat = new THREE.MeshStandardMaterial({
    map: facadeTexture,
    emissiveMap: nightTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.0,
    roughness: 0.7
  });

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const instancedBuildings = new THREE.InstancedMesh(boxGeo, buildingMat, buildingInfos.length);
  instancedBuildings.castShadow = true;
  instancedBuildings.receiveShadow = true;

  const dummy = new THREE.Object3D();
  buildingInfos.forEach((b, idx) => {
    dummy.position.set(b.x, b.height / 2, b.z);
    dummy.scale.set(b.width, b.height, b.depth);
    dummy.updateMatrix();
    instancedBuildings.setMatrixAt(idx, dummy.matrix);
  });
  instancedBuildings.instanceMatrix.needsUpdate = true;
  scene.add(instancedBuildings);

  // 3. Neon Mile Signage & Glow
  const neonGroup = new THREE.Group();
  const signGeo = new THREE.PlaneGeometry(16, 6);
  
  // Create neon sign canvas
  const neonCanvas = document.createElement('canvas');
  neonCanvas.width = 256;
  neonCanvas.height = 128;
  const nc = neonCanvas.getContext('2d');
  nc.fillStyle = '#8e44ad';
  nc.fillRect(0, 0, 256, 128);
  nc.fillStyle = '#00ffff';
  nc.font = 'bold 36px monospace';
  nc.textAlign = 'center';
  nc.fillText('AZAHAR HOTEL', 128, 75);
  const neonTex = new THREE.CanvasTexture(neonCanvas);

  const neonMat = new THREE.MeshBasicMaterial({ map: neonTex, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const sign = new THREE.Mesh(signGeo, neonMat);
    sign.position.set(rng.range(-150, 150), rng.range(15, 35), rng.range(-150, 150));
    if (i % 2 === 0) sign.rotation.y = Math.PI / 2;
    neonGroup.add(sign);
  }
  scene.add(neonGroup);

  return { groundMesh, waterMesh, instancedBuildings, neonGroup, buildingInfos };
}
