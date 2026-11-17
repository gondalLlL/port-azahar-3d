import * as THREE from '../vendor/three/three.module.min.js';
import { CONFIG } from './config.js';
import { SeededRandom } from './random.js';
import { InputManager } from './input.js';
import { AudioManager } from './audio.js';
import { createCityWorld } from './world.js';
import { RenderManager } from './render.js';
import { initShotStaging } from './shots.js';

// Game State
const gameState = {
  seed: 1,
  state: 'TITLE', // TITLE, PLAYING, PAUSED, GAMEOVER, VICTORY
  shotMode: null,
  timeOfDay: 12, // 0 - 24 hours
  cash: 0,
  health: 100,
  maxHealth: 100,
  armor: 100,
  maxArmor: 100,
  wantedLevel: 0,
  currentMissionIndex: 0,
  missionActive: false,
  missionTimer: 0,
  missionTarget: null,
  dropsCollected: 0,
  inVehicle: false,
  player: { x: 0, y: 0, z: 0, rot: 0, speed: 0 },
  vehicle: { x: 0, y: 0, z: 0, rot: 0, speed: 0, steer: 0 }
};

const input = new InputManager();
const audio = new AudioManager();
const container = document.getElementById('canvas-container');
const renderMgr = new RenderManager(container);

// Generate World
const world = createCityWorld(renderMgr.scene, gameState.seed);

// Create Player Mesh (low poly figure)
const playerGroup = new THREE.Group();
const bodyGeo = new THREE.CylinderGeometry(0.5, 0.4, 1.8, 8);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
const playerBody = new THREE.Mesh(bodyGeo, bodyMat);
playerBody.position.y = 0.9;
playerBody.castShadow = true;
playerGroup.add(playerBody);

const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const playerHead = new THREE.Mesh(headGeo, headMat);
playerHead.position.y = 1.9;
playerGroup.add(playerHead);
renderMgr.scene.add(playerGroup);

// Create Player Car Group
const carGroup = new THREE.Group();
const carBodyGeo = new THREE.BoxGeometry(2.2, 1.0, 4.5);
const carMat = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.2, metalness: 0.8 });
const carMesh = new THREE.Mesh(carBodyGeo, carMat);
carMesh.position.y = 0.6;
carMesh.castShadow = true;
carGroup.add(carMesh);

const cabinGeo = new THREE.BoxGeometry(1.8, 0.8, 2.2);
const cabinMesh = new THREE.Mesh(cabinGeo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 }));
cabinMesh.position.set(0, 1.3, -0.2);
carGroup.add(cabinMesh);
renderMgr.scene.add(carGroup);

// Traffic Cars & Police Cars arrays
const trafficCars = [];
const policeCars = [];
const rng = new SeededRandom(123);

const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 8);
wheelGeo.rotateZ(Math.PI / 2);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

for (let i = 0; i < 15; i++) {
  const tcGroup = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: rng.choice([0x95a5a6, 0xe67e22, 0x27ae60, 0xd35400, 0x3498db, 0xe74c3c]), roughness: 0.3, metalness: 0.6 });
  const tm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 4.2), bodyMat);
  tm.position.y = 0.5;
  tcGroup.add(tm);

  const tcCabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 2.0), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 }));
  tcCabin.position.set(0, 1.2, -0.2);
  tcGroup.add(tcCabin);

  [[-1.0, 0.35, 1.4], [1.0, 0.35, 1.4], [-1.0, 0.35, -1.4], [1.0, 0.35, -1.4]].forEach(pos => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(...pos);
    tcGroup.add(w);
  });

  tcGroup.position.set(rng.range(-500, 500), 0, rng.range(-500, 500));
  renderMgr.scene.add(tcGroup);
  trafficCars.push({ group: tcGroup, x: tcGroup.position.x, z: tcGroup.position.z, speed: rng.range(5, 15), dir: rng.choice([0, Math.PI/2, Math.PI, Math.PI*1.5]) });
}

for (let i = 0; i < 6; i++) {
  const pcGroup = new THREE.Group();
  const pm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 4.4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.5 }));
  pm.position.y = 0.5;
  pcGroup.add(pm);

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 2.0), doorMat);
  doorL.position.set(-1.12, 0.5, 0);
  pcGroup.add(doorL);
  const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 2.0), doorMat);
  doorR.position.set(1.12, 0.5, 0);
  pcGroup.add(doorR);

  const lbMatRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const lbMatBlue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const lbRed = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.4), lbMatRed);
  lbRed.position.set(-0.3, 1.2, 0);
  pcGroup.add(lbRed);
  const lbBlue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.4), lbMatBlue);
  lbBlue.position.set(0.3, 1.2, 0);
  pcGroup.add(lbBlue);

  pcGroup.position.set(rng.range(-300, 300), 0, rng.range(-300, 300));
  renderMgr.scene.add(pcGroup);
  policeCars.push({ group: pcGroup, x: pcGroup.position.x, z: pcGroup.position.z, speed: 18, lbRed, lbBlue });
}

// Mission Marker Cylinder
const markerGeo = new THREE.CylinderGeometry(4, 4, 20, 16, 1, true);
const markerMat = new THREE.MeshBasicMaterial({ color: 0xf39c12, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
const missionMarker = new THREE.Mesh(markerGeo, markerMat);
missionMarker.position.set(0, 10, 0);
renderMgr.scene.add(missionMarker);

// Initialize shot staging
initShotStaging(gameState, renderMgr, carGroup, playerGroup, trafficCars, policeCars, missionMarker, startMission);

// UI Event Handlers
document.getElementById('start-btn').addEventListener('click', () => {
  startGame(false);
});
document.getElementById('continue-btn').addEventListener('click', () => {
  loadGame();
  startGame(true);
});
document.getElementById('resume-btn').addEventListener('click', () => {
  togglePause(false);
});
document.getElementById('restart-btn').addEventListener('click', () => {
  location.reload();
});
document.getElementById('respawn-btn').addEventListener('click', () => {
  respawn();
});
document.getElementById('free-roam-btn').addEventListener('click', () => {
  document.getElementById('victory-screen').classList.add('hidden');
  gameState.state = 'PLAYING';
});

function startGame(isContinue) {
  document.getElementById('title-screen').classList.add('hidden');
  gameState.state = 'PLAYING';
  if (!isContinue) {
    gameState.cash = 1000;
    gameState.health = 100;
    gameState.armor = 100;
    gameState.currentMissionIndex = 0;
  }
  startMission(gameState.currentMissionIndex);
  audio.playSting();
}

function togglePause(pause) {
  gameState.state = pause ? 'PAUSED' : 'PLAYING';
  document.getElementById('pause-screen').classList.toggle('hidden', !pause);
}

function startMission(idx) {
  if (idx >= CONFIG.MISSIONS.length) {
    gameState.state = 'VICTORY';
    document.getElementById('victory-screen').classList.remove('hidden');
    return;
  }
  const m = CONFIG.MISSIONS[idx];
  gameState.missionActive = true;
  gameState.missionTimer = m.timeLimit;
  gameState.missionTarget = m.targetPos || m.drops[0];
  
  document.getElementById('mission-title').innerText = `Mission ${m.id}: ${m.title}`;
  document.getElementById('mission-desc').innerText = m.desc;
  document.getElementById('mission-timer').classList.remove('hidden');

  showDialogue(m.client, m.dialogue);
  saveGame();
}

function showDialogue(speaker, text) {
  const b = document.getElementById('dialogue-banner');
  document.getElementById('dialogue-speaker').innerText = speaker;
  document.getElementById('dialogue-text').innerText = text;
  b.style.opacity = '1';
  setTimeout(() => { b.style.opacity = '0'; }, 5000);
}

function saveGame() {
  try {
    localStorage.setItem('port_azahar_save', JSON.stringify({
      cash: gameState.cash,
      health: gameState.health,
      armor: gameState.armor,
      currentMissionIndex: gameState.currentMissionIndex
    }));
  } catch (e) {}
}

function loadGame() {
  try {
    const data = JSON.parse(localStorage.getItem('port_azahar_save'));
    if (data) {
      gameState.cash = data.cash;
      gameState.health = data.health;
      gameState.armor = data.armor;
      gameState.currentMissionIndex = data.currentMissionIndex;
    }
  } catch (e) {}
}

function respawn() {
  document.getElementById('gameover-screen').classList.add('hidden');
  gameState.health = 100;
  gameState.wantedLevel = 0;
  gameState.player.x = 0;
  gameState.player.z = 0;
  gameState.state = 'PLAYING';
}

function triggerGameOver(reason) {
  gameState.state = 'GAMEOVER';
  document.getElementById('gameover-title').innerText = reason;
  document.getElementById('gameover-screen').classList.remove('hidden');
}

// Game Loop
let lastTime = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (gameState.state === 'PLAYING') {
    update(dt);
  }

  // Render
  renderMgr.updateLighting(gameState.timeOfDay);
  let isNight = gameState.timeOfDay < 6 || gameState.timeOfDay > 19;
  if (world.buildingMat) {
    world.buildingMat.emissiveIntensity = isNight ? 0.8 : 0.0;
  }
  const flash = Math.floor(now * 0.01) % 2 === 0;
  policeCars.forEach(pc => {
    if (pc.lbRed && pc.lbBlue) {
      pc.lbRed.material.color.setHex(flash ? 0xff0000 : 0x0000ff);
      pc.lbBlue.material.color.setHex(flash ? 0x0000ff : 0xff0000);
    }
  });

  renderMgr.renderer.render(renderMgr.scene, renderMgr.camera);

  if (gameState.state === 'PLAYING' || gameState.shotMode) {
    renderMgr.renderMinimap(gameState.inVehicle ? gameState.vehicle : gameState.player, trafficCars, policeCars, gameState.missionTarget);
    updateHUD();
  }
}
requestAnimationFrame(loop);

function update(dt) {
  // Day cycle increment
  gameState.timeOfDay = (gameState.timeOfDay + dt * 0.1) % 24;

  // Mission timer
  if (gameState.missionActive) {
    gameState.missionTimer -= dt;
    const mins = Math.floor(gameState.missionTimer / 60);
    const secs = Math.floor(gameState.missionTimer % 60);
    document.getElementById('mission-timer').innerText = `TIME: ${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    if (gameState.missionTimer <= 0) {
      triggerGameOver('MISSION FAILED (TIME OUT)');
    }
  }

  // Input & Player / Car movement
  const moveSpeed = 10 * dt;
  const rotSpeed = 2.5 * dt;

  if (input.isDown('Escape')) {
    togglePause(true);
    return;
  }

  // Enter/Exit car toggle (E or F)
  if (input.isDown('KeyE') || input.isDown('KeyF')) {
    // debounce toggle
    if (!gameState._carToggleDebounce) {
      gameState.inVehicle = !gameState.inVehicle;
      gameState._carToggleDebounce = true;
      setTimeout(() => { gameState._carToggleDebounce = false; }, 500);
    }
  }

  if (gameState.inVehicle) {
    document.getElementById('speedo-panel').classList.remove('hidden');
    // Car Physics
    if (input.isDown('KeyW') || input.isDown('ArrowUp')) {
      gameState.vehicle.speed = Math.min(gameState.vehicle.speed + 15 * dt, 45);
      audio.playEngine(gameState.vehicle.speed / 45);
    } else if (input.isDown('KeyS') || input.isDown('ArrowDown')) {
      gameState.vehicle.speed = Math.max(gameState.vehicle.speed - 20 * dt, -15);
    } else {
      gameState.vehicle.speed *= 0.98; // friction
    }

    if (input.isDown('KeyA') || input.isDown('ArrowLeft')) {
      gameState.vehicle.rot += rotSpeed * (gameState.vehicle.speed / 20);
    }
    if (input.isDown('KeyD') || input.isDown('ArrowRight')) {
      gameState.vehicle.rot -= rotSpeed * (gameState.vehicle.speed / 20);
    }

    gameState.vehicle.x += Math.sin(gameState.vehicle.rot) * gameState.vehicle.speed * dt;
    gameState.vehicle.z += Math.cos(gameState.vehicle.rot) * gameState.vehicle.speed * dt;

    carGroup.position.set(gameState.vehicle.x, 0, gameState.vehicle.z);
    carGroup.rotation.y = gameState.vehicle.rot;
    playerGroup.position.copy(carGroup.position);
    playerGroup.visible = false;
    carGroup.visible = true;

    document.getElementById('speedo').innerText = `${Math.round(Math.abs(gameState.vehicle.speed) * 3.6)} MPH`;

    // Chase Camera behind car
    const camDist = 12;
    const camHeight = 5;
    renderMgr.camera.position.set(
      gameState.vehicle.x - Math.sin(gameState.vehicle.rot) * camDist,
      camHeight,
      gameState.vehicle.z - Math.cos(gameState.vehicle.rot) * camDist
    );
    renderMgr.camera.lookAt(gameState.vehicle.x, gameState.vehicle.y + 1, gameState.vehicle.z);

  } else {
    document.getElementById('speedo-panel').classList.add('hidden');
    // On foot movement
    let spd = moveSpeed * (input.isDown('ShiftLeft') ? 1.8 : 1.0);
    if (input.isDown('KeyW') || input.isDown('ArrowUp')) {
      gameState.player.x += Math.sin(gameState.player.rot) * spd;
      gameState.player.z += Math.cos(gameState.player.rot) * spd;
    }
    if (input.isDown('KeyS') || input.isDown('ArrowDown')) {
      gameState.player.x -= Math.sin(gameState.player.rot) * spd * 0.6;
      gameState.player.z -= Math.cos(gameState.player.rot) * spd * 0.6;
    }
    if (input.isDown('KeyA') || input.isDown('ArrowLeft')) {
      gameState.player.rot += rotSpeed * 1.5;
    }
    if (input.isDown('KeyD') || input.isDown('ArrowRight')) {
      gameState.player.rot -= rotSpeed * 1.5;
    }

    playerGroup.position.set(gameState.player.x, 0, gameState.player.z);
    playerGroup.rotation.y = gameState.player.rot;
    playerGroup.visible = true;
    carGroup.visible = false;

    // Follow camera behind player
    const camDist = 6;
    const camHeight = 3;
    renderMgr.camera.position.set(
      gameState.player.x - Math.sin(gameState.player.rot) * camDist,
      camHeight,
      gameState.player.z - Math.cos(gameState.player.rot) * camDist
    );
    renderMgr.camera.lookAt(gameState.player.x, gameState.player.y + 1, gameState.player.z);
  }

  // Combat action on click
  if (input.consumeClick()) {
    if (gameState.inVehicle) {
      audio.playGunshot();
    } else {
      audio.playPunch();
    }
  }

  // Traffic AI update
  trafficCars.forEach(tc => {
    tc.x += Math.sin(tc.dir) * tc.speed * dt;
    tc.z += Math.cos(tc.dir) * tc.speed * dt;
    if (Math.abs(tc.x) > 580 || Math.abs(tc.z) > 580) tc.dir += Math.PI;
    tc.group.position.set(tc.x, 0, tc.z);
  });

  // Police AI pursuit if wanted
  policeCars.forEach(pc => {
    if (gameState.wantedLevel > 0) {
      const pPos = gameState.inVehicle ? gameState.vehicle : gameState.player;
      const dx = pPos.x - pc.x;
      const dz = pPos.z - pc.z;
      const angle = Math.atan2(dx, dz);
      pc.x += Math.sin(angle) * pc.speed * dt;
      pc.z += Math.cos(angle) * pc.speed * dt;
      pc.group.position.set(pc.x, 0, pc.z);

      // Check distance to player -> Busted or damage
      const dist = Math.hypot(dx, dz);
      if (dist < 4) {
        triggerGameOver('BUSTED BY POLICE');
      }
    }
  });

  // Mission target check
  if (gameState.missionTarget) {
    const pPos = gameState.inVehicle ? gameState.vehicle : gameState.player;
    const distToTarget = Math.hypot(pPos.x - gameState.missionTarget.x, pPos.z - gameState.missionTarget.z);
    missionMarker.position.set(gameState.missionTarget.x, 10, gameState.missionTarget.z);

    if (distToTarget < 8) {
      audio.playPickup();
      gameState.cash += CONFIG.MISSIONS[gameState.currentMissionIndex].reward;
      gameState.currentMissionIndex++;
      startMission(gameState.currentMissionIndex);
    }
  }
}

function updateHUD() {
  document.getElementById('health-val').innerText = Math.round(gameState.health);
  document.getElementById('health-fill').style.width = `${(gameState.health / gameState.maxHealth) * 100}%`;
  document.getElementById('armor-val').innerText = Math.round(gameState.armor);
  document.getElementById('armor-fill').style.width = `${(gameState.armor / gameState.maxArmor) * 100}%`;
  document.getElementById('cash-display').innerText = `$${gameState.cash.toLocaleString()}`;

  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < gameState.wantedLevel ? '★' : '☆';
  }
  document.getElementById('wanted-stars').innerText = stars;
}
