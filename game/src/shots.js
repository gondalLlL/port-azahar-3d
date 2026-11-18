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
        const cx = 22;
        const cz = 50;
        gameState.vehicle.x = cx + 3.5;
        gameState.vehicle.z = cz;
        gameState.vehicle.rot = 0;
        gameState.vehicle.speed = 15;
        carGroup.position.set(gameState.vehicle.x, 0, gameState.vehicle.z);
        carGroup.rotation.y = gameState.vehicle.rot;
        playerGroup.visible = false;
        carGroup.visible = true;

        renderMgr.camera.position.set(gameState.vehicle.x, 2.5, cz - 8);
        renderMgr.camera.lookAt(gameState.vehicle.x, 1, cz + 25);

        // 3 traffic cars ahead IN FRAME: same lane +18 m, oncoming lane +30 m (rotated to face player), same lane +45 m
        if (trafficCars[0]) {
          trafficCars[0].x = cx + 3.5;
          trafficCars[0].z = cz + 18;
          trafficCars[0].group.position.set(trafficCars[0].x, 0, trafficCars[0].z);
          trafficCars[0].group.rotation.y = 0;
          trafficCars[0].group.visible = true;
        }
        if (trafficCars[1]) {
          trafficCars[1].x = cx - 3.5;
          trafficCars[1].z = cz + 30;
          trafficCars[1].group.position.set(trafficCars[1].x, 0, trafficCars[1].z);
          trafficCars[1].group.rotation.y = Math.PI;
          trafficCars[1].group.visible = true;
        }
        if (trafficCars[2]) {
          trafficCars[2].x = cx + 3.5;
          trafficCars[2].z = cz + 45;
          trafficCars[2].group.position.set(trafficCars[2].x, 0, trafficCars[2].z);
          trafficCars[2].group.rotation.y = 0;
          trafficCars[2].group.visible = true;
        }
        // 2 parked cars at curbs (±6 m lateral, +5 m and +22 m)
        if (trafficCars[3]) {
          trafficCars[3].x = cx + 3.5 + 6;
          trafficCars[3].z = cz + 5;
          trafficCars[3].group.position.set(trafficCars[3].x, 0, trafficCars[3].z);
          trafficCars[3].group.rotation.y = Math.PI / 2;
          trafficCars[3].group.visible = true;
        }
        if (trafficCars[4]) {
          trafficCars[4].x = cx + 3.5 - 6;
          trafficCars[4].z = cz + 22;
          trafficCars[4].group.position.set(trafficCars[4].x, 0, trafficCars[4].z);
          trafficCars[4].group.rotation.y = -Math.PI / 2;
          trafficCars[4].group.visible = true;
        }

        gameState.currentMissionIndex = 0;
        if (startMissionCallback) startMissionCallback(0);

      } else if (shot === 'chase') {
        gameState.state = 'PLAYING';
        gameState.inVehicle = true;
        gameState.wantedLevel = 3;
        gameState.timeOfDay = 16;
        const cx = 96;
        const cz = 100;
        gameState.vehicle.x = cx;
        gameState.vehicle.z = cz;
        gameState.vehicle.rot = 0;
        gameState.vehicle.speed = 12; // ~43 MPH
        carGroup.position.set(cx, 0, cz);
        carGroup.rotation.y = 0;
        playerGroup.visible = false;
        carGroup.visible = true;

        renderMgr.camera.position.set(cx, 4.5, cz - 10.5);
        renderMgr.camera.lookAt(cx, 1, cz + 15);

        // 3 police cars:
        // police 1: 3.4 m left, 1 m behind rear bumper (cz - 2.25 - 1 = cz - 3.25)
        if (policeCars[0]) {
          policeCars[0].x = cx - 3.4;
          policeCars[0].z = cz - 3.25;
          policeCars[0].group.position.set(policeCars[0].x, 0, policeCars[0].z);
          policeCars[0].group.rotation.y = 0;
          policeCars[0].group.visible = true;
        }
        // police 2: 3.4 m right, 1 m behind rear bumper
        if (policeCars[1]) {
          policeCars[1].x = cx + 3.4;
          policeCars[1].z = cz - 3.25;
          policeCars[1].group.position.set(policeCars[1].x, 0, policeCars[1].z);
          policeCars[1].group.rotation.y = 0;
          policeCars[1].group.visible = true;
        }
        // police 3: centered in lane, 7 m behind player car
        if (policeCars[2]) {
          policeCars[2].x = cx;
          policeCars[2].z = cz - 7;
          policeCars[2].group.position.set(policeCars[2].x, 0, policeCars[2].z);
          policeCars[2].group.rotation.y = 0;
          policeCars[2].group.visible = true;
        }

        gameState.currentMissionIndex = 2;
        if (startMissionCallback) startMissionCallback(2);

      } else if (shot === 'night') {
        gameState.state = 'PLAYING';
        gameState.inVehicle = false;
        gameState.timeOfDay = 23;
        const px = 22;
        const pz = 0;
        gameState.player.x = px;
        gameState.player.z = pz;
        gameState.player.rot = 0;
        playerGroup.position.set(px, 0, pz);
        playerGroup.rotation.y = gameState.player.rot;
        playerGroup.visible = false; // Hide on-foot player in night shot to remove bottom-center glow blob
        carGroup.visible = false;

        renderMgr.camera.position.set(px, 2.5, pz - 8);
        renderMgr.camera.lookAt(px, 1.5, pz + 20);

        if (trafficCars[0]) {
          trafficCars[0].x = px - 7;
          trafficCars[0].z = pz + 4;
          trafficCars[0].group.position.set(trafficCars[0].x, 0, trafficCars[0].z);
          trafficCars[0].group.visible = true;
        }
        if (trafficCars[1]) {
          trafficCars[1].x = px + 7;
          trafficCars[1].z = pz - 4;
          trafficCars[1].group.position.set(trafficCars[1].x, 0, trafficCars[1].z);
          trafficCars[1].group.visible = true;
        }

        if (missionMarker) {
          missionMarker.position.set(px, 10, pz + 35);
          gameState.missionTarget = { x: px, z: pz + 35 };
        }

        gameState.currentMissionIndex = 0;
        if (startMissionCallback) startMissionCallback(0);
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
