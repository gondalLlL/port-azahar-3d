import * as THREE from '../vendor/three/three.module.min.js';
import { CONFIG } from './config.js';

export class RenderManager {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0008);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 3000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    this.hemiLight.position.set(0, 500, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(300, 600, 300);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    // Minimap Canvas setup
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  updateLighting(timeOfDay) {
    // timeOfDay: 0 to 24 (12 = noon, 0 = midnight)
    const sunAngle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    const sunDist = 800;
    this.dirLight.position.x = Math.cos(sunAngle) * sunDist;
    this.dirLight.position.y = Math.sin(sunAngle) * sunDist;

    let isNight = timeOfDay < 6 || timeOfDay > 19;
    let skyColor = isNight ? 0x050811 : (timeOfDay < 8 ? 0xd35400 : 0x87ceeb);
    this.scene.background.setHex(skyColor);
    this.scene.fog.color.setHex(skyColor);

    this.dirLight.intensity = isNight ? 0.2 : Math.max(0.4, Math.sin(sunAngle) * 1.2);
  }

  renderMinimap(playerPos, trafficCars, policeCars, missionTarget) {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const scaleMap = 0.15; // world units to minimap pixels

    ctx.fillStyle = '#111a24';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    // center on player
    ctx.translate(-playerPos.x * scaleMap, -playerPos.z * scaleMap);

    // Draw roads grid representation briefly
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    const step = (CONFIG.BLOCK_SIZE + CONFIG.ROAD_WIDTH) * scaleMap;
    for (let wx = -600; wx < 600; wx += step * (1/scaleMap)) {
      ctx.beginPath();
      ctx.moveTo(wx, -600);
      ctx.lineTo(wx, 600);
      ctx.stroke();
    }

    // Draw mission target blip
    if (missionTarget) {
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(missionTarget.x * scaleMap, missionTarget.z * scaleMap, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw traffic cars
    ctx.fillStyle = '#3498db';
    trafficCars.forEach(c => {
      ctx.fillRect(c.x * scaleMap - 2, c.z * scaleMap - 2, 4, 4);
    });

    // Draw police cars
    ctx.fillStyle = '#e74c3c';
    policeCars.forEach(c => {
      ctx.fillRect(c.x * scaleMap - 3, c.z * scaleMap - 3, 6, 6);
    });

    // Draw Player blip
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(playerPos.x * scaleMap, playerPos.z * scaleMap, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
