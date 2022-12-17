const io = require('socket.io')();
const { initGame, gameLoop } = require('./game');

const state = {};
const clientRooms = {};
const FRAME_RATE = 60

var upgradeCosts = [[], [1000, 2000, 4000, 4000, 3000, 3000, 10000], [1000, 4000, 5000, 3000, 3000, 5000, 10000], [1000, 2000, 1000, 3000, 2000, 2000, 10000], []]

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

io.on('connection', client => {

  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);
  client.on('upgrade', handleUpgrade);
  client.on('mousemove', handleMouseMove);
  client.on('towerBought', handleTowerBought);
  client.on('sellTower', handleSellTower);
  client.on('gamespeedchange', handleGameSpeedChange)

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 3) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    startGameInterval(roomName);
    console.log('started game: ' + roomName)
      }

  function handleNewGame() {
    console.log('making new game')
    let roomName = makeid(5);
    console.log(`game code is: ${roomName}`)
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  function handleGameSpeedChange(gamespeed) {
    let roomName = clientRooms[client.id];
      if (gamespeed.previousgamespeed == 1 && gamespeed.gamespeed == 2) {
        state[roomName].gamespeed = 2
        state[roomName].enemiesCooldown /= 2
      } else if (gamespeed.previousgamespeed == 2 && gamespeed.gamespeed == 1) {
        state[roomName].gamespeed = 1
        state[roomName].enemiesCooldown *= 2
      } else if (gamespeed.previousgamespeed == 0 && gamespeed.gamespeed == 1) {
        state[roomName].gamespeed = 1
      }
  }

  function handleTowerBought(tower) {
    let roomName = clientRooms[client.id];
    state[roomName].towers.push(tower)
    state[roomName].money -= state[roomName].towerCosts[tower.type]

  }

  function handleMouseMove(info) {
    let roomName = clientRooms[client.id];
    try {
    state[roomName].players[info.playerNumber - 1].mousepos.x = info.x
    state[roomName].players[info.playerNumber - 1].mousepos.y = info.y
    }
    catch(err) {
      //console.log(state[roomName].players)
      //console.log(err)
    }
  }

  function handleSellTower(towerToSell) {
    let roomName = clientRooms[client.id];
    for (i in state[roomName].towers) {
      let tower = state[roomName].towers[i]
      if (tower === towerToSell) {
        state[roomName].towers.splice(i, 1)
      }
    }
  }

  function handleUpgrade(upgradeInfo) {
    let roomName = clientRooms[client.id];
    let towerBeingUpgraded = upgradeInfo.towerBeingUpgraded
    let upgrade = upgradeInfo.upgrade
    if (state[roomName].money >= upgradeCosts[towerBeingUpgraded][upgrade]) {
        state[roomName].upgrades[towerBeingUpgraded][upgrade] = 1
        state[roomName].money -= upgradeCosts[towerBeingUpgraded][upgrade]
        //update damages
        if ((upgrade == 4 || upgrade == 5) && towerBeingUpgraded == 1) {
          state[roomName].towerDamage[1] += 2
        }
        if ((upgrade == 4) && towerBeingUpgraded == 2) {
          state[roomName].towerDamage[2] += 2
        }
        if ((upgrade == 5) && towerBeingUpgraded == 2) {
          state[roomName].towerDamage[2] += 3
        }
        if ((upgrade == 4 || upgrade == 5) && towerBeingUpgraded == 3) {
          state[roomName].towerDamage[3] += 1
        }
        if ((upgrade == 3) && towerBeingUpgraded == 3) {
          state[roomName].towerDamage[3] += 2
        }
        //update ranges
        if ((upgrade == 1) && towerBeingUpgraded == 1) {
          state[roomName].towerRanges[1] += 100
        }
        if ((upgrade == 0 || upgrade == 1) && towerBeingUpgraded == 3) {
          state[roomName].towerDamage[3] += 100
        }
        //update speeds
        if ((upgrade == 0) && towerBeingUpgraded == 1) {
          state[roomName].towerSpeeds[1] /= 2
        }
        if ((upgrade == 0) && towerBeingUpgraded == 2) {
          state[roomName].towerSpeeds[2] /= 2
        }
        if ((upgrade == 2) && towerBeingUpgraded == 3) {
          state[roomName].towerSpeeds[3] /= 2
        }
        if (upgrade == 6 && towerBeingUpgraded == 3) {
          state[roomName].towerSpeeds[3] = 1
        }
        //update existing towers
        for (let i in state[roomName].towers) {
          let tower = state[roomName].towers[i]
          tower.damage = state[roomName].towerDamage[tower.type]
          tower.range = state[roomName].towerRanges[tower.type]
          tower.speed = state[roomName].towerSpeeds[tower.type]
        }
      }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    let tempState = state[roomName]
    state[roomName] = gameLoop(tempState);
      emitGameState(roomName, state[roomName])
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);