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

  client.on("disconnecting", handleDisconnect);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);
  client.on('upgrade', handleUpgrade);
  client.on('mousemove', handleMouseMove);
  client.on('towerBought', handleTowerBought);
  client.on('sellTower', handleSellTower);
  client.on('gamespeedchange', handleGameSpeedChange)
  client.on('autoStartToggle', handleAutoStart)
  client.on('startGame', handleStartGame)

  function handleJoinGame({roomName, username}) {
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

    if (state[roomName].gameStarted) {
      client.emit('gameAlreadyStarted')
      return
    }

    if (username.length >= 15) {
      client.emit('usernameTooLong')
      return
    }

    if (!username) {
      client.emit('noUsername')
      return
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    state[roomName].players.push({username: username, mousepos: {x: 0, y: 0}, placingTower: 0, money: 120, id: client.id})
    client.number = 2;
    client.emit('init', 2);
      }

  function handleDisconnect() {
    try {
    let roomName = clientRooms[client.id]
    let clientNumber
    for (let i = state[roomName].players.length -1; i >= 0; i--) {
      if (state[roomName].players[i].id == client.id) {
        clientNumber = i
        state[roomName].players.splice(clientNumber, 1)
        break
      }
    }
    for (let i = state[roomName].towers.length -1; i >= 0; i--) {
      let tower = state[roomName].towers[i]
      if (tower.owner - 1 == clientNumber) {
        state[roomName].towers.splice(i, 1)
      } else if (tower.owner == 0 && clientNumber == 0) {
        state[roomName].towers.splice(i, 1)
      }
    }
  } catch (err) {
    console.log('error')
  }
  }

  function handleNewGame(username) {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    if (username.length >= 15) {
      client.emit('usernameTooLong')
      return
    }

    if (!username) {
      client.emit('noUsername')
      return
    }

    state[roomName] = initGame();
    state[roomName].players.push({username: username, mousepos: {x: 0, y: 0}, placingTower: 0, money: 120, id: client.id})

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
    console.log('created room: ' + roomName)
    startGameInterval(roomName);
  }

  function handleAutoStart(autostart) {
    let roomName = clientRooms[client.id];
    state[roomName].autostart = autostart
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

  function handleStartGame() {
    let roomName = clientRooms[client.id]
    state[roomName].gameStarted = true
  }

  function handleTowerBought(tower, playerNumber) {
    let roomName = clientRooms[client.id];
    state[roomName].tempTowers.push(tower)
    state[roomName].players[playerNumber - 1].money -= state[roomName].towerCosts[tower.type]

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

  function handleSellTower(towerToSell, playerNumber) {
    let roomName = clientRooms[client.id];
    for (let i in state[roomName].towers) {
      let tower = state[roomName].towers[i]
      if (tower.position.x == towerToSell.position.x && tower.position.y == towerToSell.position.y) {
        state[roomName].towers.splice(i, 1)
        state[roomName].players[playerNumber - 1].money += state[roomName].towerCosts[towerToSell.type] / 2
      }
    }
  }

  function handleUpgrade(upgradeInfo) {
    let roomName = clientRooms[client.id];
    let towerBeingUpgraded = upgradeInfo.towerBeingUpgraded
    let upgrade = upgradeInfo.upgrade
    if (state[roomName].players[upgradeInfo.playerNumber - 1].money >= upgradeCosts[towerBeingUpgraded][upgrade]) {
        state[roomName].upgrades[towerBeingUpgraded][upgrade] = 1
        state[roomName].players[upgradeInfo.playerNumber - 1].money -= upgradeCosts[towerBeingUpgraded][upgrade]
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
