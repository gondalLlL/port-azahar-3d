export function initShotStaging(gameState, renderMgr, carGroup, playerGroup, trafficCars, policeCars, missionMarker, startMissionCallback) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = params.get('seed');

  if (seed) {
    gameState.seed = parseInt(seed, 10) || 1;
  }

  const titleScreen = document.getElementById('title-screen');
  const hud = document.getElementById('hud');

  if (shot) {
    console.log('Staging shot mode:', shot);
    gameState.shotMode = shot;

    if (shot === 'title') {
      gameState.state = 'TITLE';
      gameState.timeOfDay = 18.5; // golden hour
      if (titleScreen) titleScreen.classList.remove('hidden');
      if (hud) hud.classList.remove('hidden');

      // Camera override for title state: elevated three-quarter aerial view (roughly 110 m up, 150 m away) looking across rooftops toward coast/water
      renderMgr.camera.position.set(150, 110, 150);
      renderMgr.camera.lookAt(0, 20, 0);

    } else {
      if (titleScreen) titleScreen.classList.add('hidden');
      if (hud) hud.classList.remove('hidden');

      if (shot === 'drive') {
        gameState.state = 'PLAYING';
        gameState.inVehicle = true;
        gameState.timeOfDay = 13; // bright day
        const cx = 50, cz = 50;
        gameState.vehicle.x = cx;
        gameState.vehicle.z = cz;
        gameState.vehicle.rot = Math.PI / 4;
        gameState.vehicle.speed = 20;
        carGroup.position.set(cx, 0, cz);
        carGroup.rotation.y = gameState.vehicle.rot;
        playerGroup.visible = false;
        carGroup.visible = true;

        renderMgr.camera.position.set(
          cx - Math.sin(gameState.vehicle.rot) * 9,
          3.5,
          cz - Math.cos(gameState.vehicle.rot) * 9
        );
        renderMgr.camera.lookAt(cx, 1, cz);

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const dist = 15 + (i * 3);
          const tx = cx + Math.cos(angle) * dist;
          const tz = cz + Math.sin(angle) * dist;
          if (trafficCars[i]) {
            trafficCars[i].x = tx;
            trafficCars[i].z = tz;
            trafficCars[i].group.position.set(tx, 0, tz);
          }
        }

        gameState.currentMissionIndex = 0;
        if (startMissionCallback) startMissionCallback(0);

      } else if (shot === 'chase') {
        gameState.state = 'PLAYING';
        gameState.inVehicle = true;
        gameState.wantedLevel = 3;
        gameState.timeOfDay = 16;
        const cx = 100, cz = 100;
        gameState.vehicle.x = cx;
        gameState.vehicle.z = cz;
        gameState.vehicle.rot = 0;
        gameState.vehicle.speed = 25;
        carGroup.position.set(cx, 0, cz);
        carGroup.rotation.y = 0;
        playerGroup.visible = false;
        carGroup.visible = true;

        renderMgr.camera.position.set(cx, 4, cz - 10);
        renderMgr.camera.lookAt(cx, 1, cz + 5);

        for (let i = 0; i < 4; i++) {
          const px = cx + (i === 0 ? -4 : (i === 1 ? 4 : (i === 2 ? -6 : 6)));
          const pz = cz - (6 + i * 2);
          if (policeCars[i]) {
            policeCars[i].x = px;
            policeCars[i].z = pz;
            policeCars[i].group.position.set(px, 0, pz);
          }
        }

      } else if (shot === 'night') {
        gameState.state = 'PLAYING';
        gameState.inVehicle = false;
        gameState.timeOfDay = 23;
        const px = -20, pz = -20;
        gameState.player.x = px;
        gameState.player.z = pz;
        gameState.player.rot = Math.PI / 6;
        playerGroup.position.set(px, 0, pz);
        playerGroup.rotation.y = gameState.player.rot;
        playerGroup.visible = true;
        carGroup.visible = false;

        renderMgr.camera.position.set(px - Math.sin(gameState.player.rot) * 5, 2.0, pz - Math.cos(gameState.player.rot) * 5);
        renderMgr.camera.lookAt(px + Math.sin(gameState.player.rot) * 10, 1.5, pz + Math.cos(gameState.player.rot) * 10);

        if (missionMarker) {
          missionMarker.position.set(px + 20, 10, pz + 30);
          gameState.missionTarget = { x: px + 20, z: pz + 30 };
        }
      }
    }

    let frameCount = 0;
    const checkReady = () => {
      frameCount++;
      if (frameCount > 35) {
        window.__shotReady = true;
        console.log('__shotReady set to true for shot:', shot);
      } else {
        requestAnimationFrame(checkReady);
      }
    };
    requestAnimationFrame(checkReady);
  }
}
