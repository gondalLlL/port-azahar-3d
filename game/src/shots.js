export function initShotStaging(gameState) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = params.get('seed');

  if (seed) {
    gameState.seed = parseInt(seed, 10) || 1;
  }

  if (shot) {
    console.log('Staging shot mode:', shot);
    gameState.shotMode = shot;
    // Setup predefined positions/states based on shot name
    if (shot === 'title') {
      gameState.state = 'TITLE';
      gameState.timeOfDay = 18; // golden hour
    } else if (shot === 'drive') {
      gameState.state = 'PLAYING';
      gameState.inVehicle = true;
      gameState.player.x = 0;
      gameState.player.z = 0;
      gameState.vehicle.speed = 25;
      gameState.timeOfDay = 14;
    } else if (shot === 'chase') {
      gameState.state = 'PLAYING';
      gameState.inVehicle = true;
      gameState.wantedLevel = 3;
      gameState.player.x = 100;
      gameState.player.z = 100;
      gameState.vehicle.speed = 30;
      gameState.timeOfDay = 22; // night
    } else if (shot === 'night') {
      gameState.state = 'PLAYING';
      gameState.inVehicle = false;
      gameState.player.x = 50;
      gameState.player.z = 50;
      gameState.timeOfDay = 23;
    }

    // Mark shot ready after a brief rendering delay
    let frameCount = 0;
    const checkReady = () => {
      frameCount++;
      if (frameCount > 15) {
        window.__shotReady = true;
        console.log('__shotReady set to true for shot:', shot);
      } else {
        requestAnimationFrame(checkReady);
      }
    };
    requestAnimationFrame(checkReady);
  }
}
