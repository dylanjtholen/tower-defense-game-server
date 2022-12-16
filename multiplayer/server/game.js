module.exports = {
  initGame,
  gameLoop,
}

function initGame() {
  const state = createGameState()
  return state;
}

function createGameState() {
  return {
    towers: [],
    projectiles: [],
    enemies: [],
     towerSizes: [0, 25, 20, 30, 100],
     towerSpeeds: [0, 60, 120, 10, 1],
     towerCosts: [0, 120, 220, 320, 100000],
     towerDamage: [0, 2, 5, 1, 20],
     towerRanges: [0, 200, 1000, 100, 2000],
    upgrades: [[], [0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, -1]],
    players: [{
      mousepos: {
        x: 3,
        y: 10,
      },
      placingTower: 0,
    }, {
        mousepos: {
            x: 3,
            y: 10,
          },
          placingTower: 0,
        }],
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  return false;
}