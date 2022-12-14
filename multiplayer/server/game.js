const { GRID_SIZE } = require('./constants');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

function initGame() {
  const state = createGameState()
  randomFood(state);
  return state;
}

function createGameState() {
  return {
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
    food: {},
    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  return false;
}