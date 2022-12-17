module.exports = {
  initGame,
  gameLoop,
}

function initGame() {
  const state = createGameState()
  return state;
}

let gameState

class Enemy {
  constructor({ position = { x: 0, y: 0 }, health }) {
    this.position = position
    this.width = 50
    this.height = 50
    this.waypointIndex = 0
    this.stun = 0
    this.health = health
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }
    this.radius = 50
    this.velocity = {
      x: 0,
      y: 0
    }
  }
  draw() {
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
    c.fillStyle = 'black'
    c.font = '32px sans-serif'
    c.fillText(Math.round(this.health * 10) / 10, this.position.x, this.position.y)
  }
  update() {
    //this.draw()

    const waypoint = gameState.waypoints[this.waypointIndex]
    const yDistance = waypoint.y - this.center.y
    const xDistance = waypoint.x - this.center.x
    const angle = Math.atan2(yDistance, xDistance)

    const speed = 3 * gameState.gamespeed

    if (this.stun <= 0) {
    this.velocity.x = Math.cos(angle) * speed
    this.velocity.y = Math.sin(angle) * speed

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    } else {
      this.stun -= gameState.gamespeed
    }

    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }

    if (this.health <= 0) {
      return true
    }

    if (
      Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) <
      Math.abs(this.velocity.x) &&
      Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) <
      Math.abs(this.velocity.y)
    ) {
      if (this.waypointIndex == gameState.waypoints.length - 1) {
        lives -= this.health * !devmode
        return true
      } else {
        this.waypointIndex++
      }
    }
  }
}

class Tower {
  constructor({ position = { x: 0, y: 0 }, type = 1 }) {
    this.type = type
    this.damage = gameState.towerDamage[this.type]
    this.range = gameState.towerRanges[this.type]
    this.speed = gameState.towerSpeeds[this.type]
    this.size = gameState.towerSizes[this.type]
    this.position = position
    this.width = this.size * 2
    this.height = this.size * 2
    this.projectileCooldown = 0
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }
    this.draw = function()  {
      c.fillStyle = 'lime'
      c.fillRect(this.center.x - this.height, this.center.y - this.width, this.width, this.height)
    }
  }
  draw() {
    c.fillStyle = 'lime'
    c.fillRect(this.center.x - this.height, this.center.y - this.width, this.width, this.height)
  }
  update() {
    //this.draw()

    if (this.projectileCooldown <= 0 && gameState.enemies.length > 0) {
      this.projectileCooldown += this.speed / gameState.gamespeed
      for (let i in gameState.enemies) {
        let enemy = gameState.enemies[i]
        if ((this.range >= distance(this.position.x, this.position.y, enemy.position.x, enemy.position.y)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x, enemy.position.y + enemy.height)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x + enemy.width, enemy.position.y)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x + enemy.width, enemy.position.y + enemy.height))) {
          gameState.projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x + (enemy.velocity.x * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20), y: enemy.position.y + (enemy.velocity.y * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20) }, damage: this.damage, lifespan: this.range, type: this.type }))
          if (this.type == 1 && gameState.upgrades[1][2] == 1) {
            gameState.projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x + (enemy.velocity.x * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20), y: enemy.position.y + (enemy.velocity.y * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20) }, damage: this.damage, lifespan: this.range, type: this.type, angleOffset: 0.523599}))
          }
          if (this.type == 1 && gameState.upgrades[1][3] == 1) {
            gameState.projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x + (enemy.velocity.x * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20), y: enemy.position.y + (enemy.velocity.y * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20) }, damage: this.damage, lifespan: this.range, type: this.type, angleOffset: -0.523599}))
          }
          if (this.type == 1 && gameState.upgrades[1][6] == 1) {
            gameState.projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x + (enemy.velocity.x * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20), y: enemy.position.y + (enemy.velocity.y * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20) }, damage: this.damage, lifespan: this.range, type: this.type, angleOffset: 0.174533}))
            gameState.projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x + (enemy.velocity.x * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20), y: enemy.position.y + (enemy.velocity.y * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20) }, damage: this.damage, lifespan: this.range, type: this.type, angleOffset: -0.174533}))
            gameState.projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x + (enemy.velocity.x * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20), y: enemy.position.y + (enemy.velocity.y * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20) }, damage: this.damage, lifespan: this.range, type: this.type, angleOffset: 0.349066}))
            gameState.projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x + (enemy.velocity.x * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20), y: enemy.position.y + (enemy.velocity.y * distance(this.position.x, this.position.y, enemy.center.x, enemy.center.y) / 20) }, damage: this.damage, lifespan: this.range, type: this.type, angleOffset: -0.349066}))
          }
          return
        }
      }
    } else {
      this.projectileCooldown -= 1 * gameState.gamespeed
    }
  }
}

class projectile {
  constructor({ position = { x: 0, y: 0 }, endpoint = { x: 0, y: 0 }, damage = 1, lifespan = 500, type = 0, angleOffset = 0 }) {
    this.position = position
    this.oldpositon = {x: 0, y: 0}
    this.damage = damage
    this.lifespan = lifespan
    this.angleOffset = angleOffset
    this.type = type
    this.range = 100
    this.width = 12.5
    this.height = 12.5
    this.waypointIndex = 0
    this.speed = 20
    this.distanceTravelled = 0
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }
    this.endpoint = endpoint
    this.radius = 50
    this.health = 100
    this.velocity = {
      x: 0,
      y: 0
    }
    this.yDistance = this.endpoint.y - this.center.y
    this.xDistance = this.endpoint.x - this.center.x
    this.angle = Math.atan2(this.yDistance, this.xDistance) + this.angleOffset
    if (this.angleOffset != 0) {
      this.endpoint.x = this.position.x + Math.cos(this.angle) * this.speed * 10
      this.endpoint.y = this.position.y + Math.sin(this.angle) * this.speed * 10
    }
  }
  draw() {
    c.fillStyle = 'orange'
    c.fillRect(this.center.x - this.height, this.center.y - this.width, this.width, this.height)
  }
  update() {
    //this.draw()

    if (this.type == 2) {
      this.speed = 50 * gameState.gamespeed
    } else {
      this.speed = 20 * gameState.gamespeed
    }

    if ((this.type == 2 && gameState.upgrades[2][6] == 1) || (this.type == 4)) {
    if (gameState.enemies.length > 0) {
      for (let i in gameState.enemies) {
        let enemy = gameState.enemies[i]
        let lowestDistance = 9999999
        if (distance(this.position.x, this.position.y, enemy.position.x, enemy.position.y) < lowestDistance) {
          this.endpoint.x = enemy.center.x
          this.endpoint.y = enemy.center.y
        }
      }
    }
  }

    this.yDistance = this.endpoint.y - this.center.y
    this.xDistance = this.endpoint.x - this.center.x
    this.angle = Math.atan2(this.yDistance, this.xDistance)

    this.velocity.x = Math.cos(this.angle) * this.speed
    this.velocity.y = Math.sin(this.angle) * this.speed

    this.oldpositon.x = this.position.x
    this.oldpositon.y = this.position.y
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.distanceTravelled += this.speed
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }

    for (let i = 0; i < gameState.enemies.length; i++) {
      let enemy = gameState.enemies[i]
      if (isColliding(this.position.x, this.position.y, this.width, this.height, enemy.position.x, enemy.position.y, enemy.width, enemy.height) || rectLineIntersection(enemy.position.x, enemy.position.y, enemy.width, enemy.height, this.position.x, this.position.y, this.oldpositon.x, this.oldpositon.y)) {
        if (gameState.enemies[i].health < this.damage) {
          money += gameState.enemies[i].health
          this.damage -= gameState.enemies[i].health
          gameState.enemies[i].health -= this.damage
          gameState.enemies.splice(i, 1)
          this.endpoint.x = this.position.x + this.velocity.x * 10
          this.endpoint.y = this.position.y + this.velocity.y * 10
        } else {
          money += this.damage
          gameState.enemies[i].health -= this.damage
          if (gameState.enemies[i].health <= 0) {
            gameState.enemies.splice(i, 1)
          }
          if (gameState.upgrades[2][3] == 1 && this.type == 2) {
            enemy.stun += 60
          } else if (gameState.upgrades[2][2] == 1 && this.type == 2) {
            enemy.stun += 30
          }
          return true
        }
      }
    }
    if (
      this.distanceTravelled > this.lifespan
    ) {
      return true
    }
    if (
      (Math.abs(Math.round(this.center.x) - Math.round(this.endpoint.x)) <
      Math.abs(this.velocity.x) &&
      Math.abs(Math.round(this.center.y) - Math.round(this.endpoint.y)) <
      Math.abs(this.velocity.y))
    ) {
      this.endpoint.x = this.position.x + this.velocity.x * 10
      this.endpoint.y = this.position.y + this.velocity.y * 10
    }
  }
}

function createEnemies() {
  if (gameState.enemies.length < 1000 && gameState.enemiesCooldown <= 0) {
    if (!gameState.roundWaiting) {
      gameState.enemies.push(new Enemy({ position: { x: -100, y: 270 }, health: gameState.rounds[gameState.round][gameState.roundIndex] * Math.ceil(gameState.round * 0.2) }))
      gameState.roundIndex += 1
      if (gameState.roundIndex + 1 > gameState.rounds[gameState.round].length) {
        gameState.roundIndex = 0
        roundWaiting = true
      }
      gameState.enemiesCooldown += 50 / gameState.gamespeed
    } else if (gameState.enemies.length == 0) {
      gameState.round += 1
      for (let i in gameState.players) {
        players[i].money += 100
      }
      gameState.roundWaiting = false
      if (gameState.upgrades[2][1] == 1) {
      for (let i in gameState.towers) {
        if (towers[i].type == 2) {
          gameState.towers[i].projectileCooldown = -480
        }
      }
    }
      if (!gameState.autostart) {
        gameState.gamespeed = 0
        gameState.projectiles = []
    }
  } else if (gameState.enemiesCooldown > 0) {
    gameState.enemiesCooldown -= 1
  }
}
}

function createGameState() {
  return {
    gameFramesPassed: 0,
    gamespeed: 0,
    enemiesCooldown: 0,
    round: 1,
    roundIndex: 0,
    roundWaiting: false,
    towers: [],
    projectiles: [],
    enemies: [],
    waypoints: [{ x: 0, y: 270 }, { x: 300, y: 270 }, { x: 300, y: 50 }, { x: 75, y: 50 }, { x: 75, y: 585 }, { x: 300, y: 585 }, { x: 300, y: 360 }, { x: 525, y: 360 }, { x: 525, y: 485 }, { x: 680, y: 485 }, { x: 680, y: 170 }, { x: 430, y: 170 }, { x: 430, y: 80 }, { x: 840, y: 80 }, { x: 840, y: 325 }, { x: 1000, y: 325 }],
     towerSizes: [0, 25, 20, 30, 100],
     towerSpeeds: [0, 60, 120, 10, 1],
     towerCosts: [0, 120, 220, 320, 100000],
     towerDamage: [0, 2, 5, 1, 20],
     towerRanges: [0, 200, 1000, 100, 2000],
     rounds: [ [], [1, 1, 1, 1, 1, 1, 1, 2, 2, 2], [1, 2, 1, 2, 1, 2, 1, 2], [3, 2, 3, 3, 2, 3, 2, 2, 3, 2, 2], [2, 3, 2, 3, 2], [3, 4, 5, 4, 4, 5, 5, 6, 6, 3, 5, 4], [4, 7, 5, 7, 7, 8, 6, 8, 8, 6], [6, 8, 8, 8, 6], [9, 9, 9, 7, 9, 7, 7, 9], [9, 11, 10, 7], [13, 9, 13, 10, 11, 14, 14, 8, 13, 8, 13, 12, 14, 10], [13, 12, 9, 15, 13, 8, 15, 9, 10, 13, 13], [11, 10, 16, 11, 15, 14, 11, 14, 12], [10, 18, 18, 15, 12, 17, 15, 15, 11, 14, 14, 10, 14, 10, 12], [13, 18, 20, 15, 11, 15, 15, 20, 18, 17, 13, 19, 17, 17, 16], [21, 11, 15, 12, 15, 20, 21, 11, 11, 15, 16, 17, 20, 12, 19], [19, 13, 16, 16, 17, 20, 12, 18, 20, 12, 13, 13, 21, 18, 12, 17, 15, 21], [21, 22, 21, 24, 23, 24, 23, 18, 17, 17, 18, 16, 15, 19, 24, 17, 19, 16], [18, 23, 26, 24, 22, 15, 25, 18, 26, 21, 21, 24, 16, 18, 25, 18], [16, 17, 19, 15, 22, 16, 19, 16, 22, 22, 27, 23, 17, 17, 23, 25], [18, 16, 15, 15, 17, 22, 26, 28, 15, 23, 19, 21, 17, 20, 24, 22, 24, 27, 15, 26], [21, 22, 21, 18, 28, 25, 16, 27, 23, 29, 30, 28, 18, 20, 20, 24, 27, 23], [20, 20, 21, 31, 19, 26, 23, 31, 32, 17, 17, 18, 23, 23, 32, 32, 25, 31], [21, 20, 28, 33, 18, 32, 19, 29, 19, 33, 29, 18, 24, 27, 22, 30, 20, 32], [21, 21, 26, 20, 28, 29, 19, 24, 29, 27, 31, 19], [31, 30, 22, 34, 19, 26, 36, 23, 35, 31, 33, 35, 26], [32, 35, 21, 25, 36, 28, 21, 20, 23, 23, 24, 20, 38, 37, 23, 23, 30, 36, 22, 38, 30], [29, 31, 30, 38, 39, 25, 22, 28, 24, 22, 33, 35, 28, 33, 30], [36, 22, 38, 34, 25, 28, 39, 32, 40, 26, 30, 33, 27, 34, 22, 28, 31, 26, 25, 26, 24], [42, 39, 30, 36, 22, 37, 28, 27, 37, 31, 33, 29, 33, 31, 30, 22, 24, 41, 40, 27, 41, 31, 40], [28, 39, 39, 30, 28, 28, 24, 30, 40, 31, 34, 38, 42, 29, 30, 27, 24], [45, 32, 39, 29, 45, 40, 24, 28, 28, 31, 43, 24, 34, 42, 35, 39, 42, 31, 42, 39, 45, 26, 26, 37, 29], [30, 32, 25, 25, 41, 26, 28, 30, 36, 31, 45, 42, 38, 45, 41, 44, 28, 28, 42, 34, 39, 33, 25, 32], [35, 27, 26, 27, 31, 44, 35, 28, 33, 42, 28, 42, 46, 35, 44, 32, 36, 43, 39, 43, 35, 37], [50, 37, 29, 50, 43, 31, 33, 48, 37, 50, 40, 46, 50, 35, 34, 40, 49, 43, 35], [51, 38, 40, 38, 50, 35, 41, 48, 47, 48, 33, 51, 38, 41, 28, 35, 27, 29, 41, 32, 44, 30, 47, 40, 34, 47, 34], [39, 47, 28, 34, 41, 30, 37, 33, 47, 51, 46, 43, 43, 45, 41, 49, 34, 50, 44, 31, 34, 48], [32, 31, 33, 52, 33, 49, 43, 31, 45, 43, 41, 29, 46, 34, 47, 36, 30, 41, 44, 42], [32, 42, 49, 41, 50, 32, 47, 37, 30, 47, 49, 42, 42, 39, 53, 39, 44, 40, 55, 44, 45, 52], [43, 34, 45, 43, 52, 33, 35, 46, 44, 32, 36, 35, 42, 50, 51, 34, 34, 54, 45, 54, 48, 54, 54, 37, 33, 54], [39, 56, 42, 49, 31, 57, 39, 55, 55, 39, 40, 55, 51, 50, 44, 49, 53, 38, 57, 31, 41, 37, 31], [59, 56, 33, 39, 47, 60, 41, 51, 58, 48, 41, 41, 53, 58, 34, 34, 47, 50, 33, 54, 37, 37, 40, 51, 53, 56, 47, 33], [50, 53, 36, 44, 44, 47, 55, 47, 55, 46, 61, 61, 57, 33, 61, 38, 59, 50, 56, 35, 41, 41, 41, 61], [53, 46, 39, 37, 63, 44, 34, 43, 45, 54, 40, 53, 49, 42, 35, 46, 34, 40, 49, 48, 46, 57, 39, 48, 46, 54, 51, 55, 47], [57, 47, 57, 63, 63, 64, 35, 40, 49, 47, 42, 57, 35, 45, 44, 49, 61, 58, 50, 48, 45, 36, 50, 52, 57, 57], [45, 51, 62, 49, 59, 35, 41, 60, 65, 38, 50, 53, 50, 64, 62, 35, 58, 36, 57, 60, 36, 47, 48, 41, 39, 44, 59, 37, 65, 54, 48, 37], [67, 44, 65, 63, 43, 45, 40, 42, 40, 38, 58, 36, 51, 64, 55, 44, 40, 50, 51, 38, 66, 67, 68, 40, 66, 40, 56, 51, 44], [60, 65, 69, 49, 62, 44, 61, 50, 57, 37, 50, 58, 51, 61, 65, 39, 48, 53, 37, 45, 59, 46, 60, 56, 68], [47, 44, 56, 70, 67, 61, 44, 38, 53, 54, 49, 55, 46, 62, 45, 38, 70, 62, 47, 69, 70, 46, 63, 52, 59, 68], [67, 55, 66, 61, 40, 41, 39, 50, 69, 69, 48, 39, 42, 56, 56, 38, 45, 64, 63, 59, 61, 70, 57, 63, 40, 48, 66, 41, 48, 68, 64, 60, 45, 52], [45, 74, 65, 69, 46, 74, 53, 54, 42, 71, 64, 51, 71, 39, 67, 47, 70, 46, 59, 72, 49, 74, 66, 61, 67, 64, 62, 70, 53, 52, 70], [46, 43, 59, 73, 52, 54, 51, 41, 56, 52, 56, 55, 54, 49, 60, 44, 68, 65, 60, 55, 60, 56, 41, 67, 43, 56, 71, 61, 47, 66, 57, 71], [55, 56, 72, 41, 52, 62, 71, 63, 54, 67, 63, 57, 42, 56, 65, 47, 49, 71, 70, 41, 74, 50, 45, 63, 50, 74, 62, 68, 50], [57, 74, 68, 52, 62, 60, 56, 62, 68, 68, 77, 55, 45, 55, 61, 54, 64, 66, 48, 48, 45, 73, 77, 78, 54, 50, 61, 55, 73, 59, 44, 65, 70, 44, 60, 59], [45, 51, 65, 44, 46, 66, 54, 65, 65, 80, 56, 45, 53, 57, 56, 42, 45, 48, 72, 43, 62, 44, 73, 73, 52, 63, 58, 55, 74], [52, 67, 59, 70, 48, 59, 71, 50, 66, 57, 55, 75, 65, 67, 45, 61, 80, 43, 69, 60, 67, 66, 43, 44, 78, 57, 52, 45, 57, 45, 72, 63, 78, 80, 76, 68, 58], [75, 61, 47, 73, 61, 72, 79, 56, 53, 63, 51, 45, 65, 54, 48, 68, 72, 62, 53, 56, 50, 69, 70, 44, 62, 46, 69, 82, 58, 56, 82, 57, 61, 59, 62, 45, 72], [57, 57, 77, 56, 66, 72, 48, 59, 51, 57, 83, 66, 63, 81, 54, 52, 82, 65, 61, 58, 47, 47, 77, 83, 67, 83, 64, 59, 83, 47, 59, 61, 48, 84, 63], [62, 65, 65, 65, 67, 46, 58, 83, 77, 47, 57, 83, 73, 62, 64, 72, 69, 60, 77, 64, 86, 60, 86, 72, 48, 48, 82, 60, 60, 59, 82, 69, 86], [66, 69, 73, 68, 51, 70, 53, 47, 62, 78, 65, 61, 66, 65, 71, 52, 75, 55, 46, 56, 81, 51, 63, 66, 64, 78, 61, 50, 61, 81, 82, 78, 50, 63, 78, 71], [75, 75, 83, 56, 86, 84, 69, 88, 69, 50, 82, 57, 77, 85, 85, 51, 51, 59, 65, 58, 71, 50, 73, 61, 79, 71, 86, 51, 58, 78, 78, 54, 63, 83], [83, 78, 50, 60, 54, 84, 81, 77, 63, 84, 49, 75, 50, 89, 83, 63, 52, 53, 82, 48, 87, 66, 70, 83, 51, 52, 67, 52, 55, 79, 75, 85, 74, 72, 50, 58, 64, 65, 78], [82, 58, 73, 73, 68, 54, 65, 59, 89, 81, 65, 92, 82, 63, 90, 79, 66, 77, 75, 87, 52, 54, 70, 60, 67, 71, 54, 67, 60, 54, 75, 63, 77, 72, 50, 68, 62, 75, 83], [82, 52, 87, 79, 76, 61, 78, 82, 82, 63, 61, 70, 79, 58, 57, 79, 74, 59, 85, 65, 53, 86, 70, 63, 81, 90, 77, 62, 84, 62, 77, 70, 93, 83, 56, 73, 53, 74], [76, 78, 90, 70, 66, 74, 57, 58, 94, 60, 52, 62, 84, 91, 82, 80, 54, 61, 83, 71, 86, 86, 52, 82, 91, 64, 56, 85, 54, 88, 65, 51, 79, 94, 53, 67, 94, 65, 82, 73, 75, 63], [69, 52, 85, 96, 78, 76, 71, 90, 82, 53, 84, 64, 84, 63, 89, 78, 79, 54, 54, 96, 92, 75, 62, 56, 94, 75, 72, 90, 61, 52, 85, 82, 52, 73, 86, 94], [56, 52, 75, 86, 83, 92, 75, 52, 87, 52, 81, 64, 91, 52, 54, 71, 82, 77, 78, 75, 82, 67, 77, 63, 98, 98, 61, 61, 81, 96, 95, 63, 98, 83, 67, 82, 98, 57], [99, 57, 79, 69, 77, 63, 97, 63, 56, 54, 90, 57, 86, 92, 95, 66, 69, 63, 78, 65, 81, 85, 99, 85, 64, 99, 57, 79, 61, 74, 77, 78, 86, 67, 89, 88, 65, 56, 64, 84, 90], [75, 56, 59, 65, 81, 55, 76, 94, 91, 85, 74, 76, 54, 85, 70, 92, 77, 91, 91, 84, 78, 99, 65, 86, 63, 60, 95, 65, 62, 67, 62, 93, 88, 99, 80, 76, 82, 78, 56, 60], [56, 72, 92, 90, 87, 99, 99, 90, 59, 99, 102, 58, 96, 57, 99, 71, 97, 97, 62, 81, 72, 89, 79, 87, 99, 78, 61, 81, 99, 67, 59, 97, 86, 98, 67, 68, 59, 58, 76, 62, 65, 63], [66, 85, 104, 99, 70, 95, 58, 104, 85, 100, 75, 96, 102, 69, 104, 84, 85, 68, 96, 82, 59, 96, 99, 61, 74, 58, 86, 80, 58, 86, 88, 88, 101, 75, 83, 60, 83, 87, 82, 68], [70, 72, 76, 73, 63, 70, 84, 95, 76, 83, 83, 86, 104, 87, 93, 71, 64, 58, 97, 62, 83, 105, 72, 77, 64, 88, 70, 58, 95, 70, 87, 101, 56, 73, 72, 65, 65, 63, 71, 69, 79, 71, 103, 101], [63, 93, 77, 93, 60, 84, 96, 65, 96, 59, 78, 72, 94, 80, 74, 63, 94, 65, 101, 92, 66, 65, 100, 87, 102, 80, 92, 83, 78, 59, 66, 97, 104, 69, 65, 103, 68, 64], [83, 63, 82, 70, 68, 107, 86, 86, 59, 58, 108, 71, 100, 89, 92, 59, 99, 108, 85, 85, 106, 76, 97, 73, 67, 65, 74, 60, 96, 68, 96, 97, 93, 92, 85, 88, 90, 102, 91], [106, 109, 60, 94, 97, 81, 69, 99, 65, 110, 58, 72, 93, 90, 88, 83, 93, 110, 102, 65, 93, 69, 65, 98, 60, 62, 109, 76, 97, 78, 108, 102, 70, 85, 101, 108, 99, 69, 110, 96, 75, 85, 105, 76], [69, 111, 93, 73, 109, 89, 63, 75, 107, 91, 60, 96, 74, 72, 90, 59, 60, 77, 98, 88, 94, 74, 77, 63, 62, 60, 76, 70, 66, 96, 61, 78, 108, 67, 111, 81, 95], [60, 111, 99, 84, 74, 76, 93, 83, 98, 66, 82, 94, 92, 101, 61, 96, 78, 99, 73, 65, 83, 85, 66, 102, 72, 92, 65, 93, 82, 73, 75, 80, 85, 72, 102, 65, 77, 71, 64, 79, 107], [69, 62, 91, 90, 100, 72, 100, 91, 101, 104, 69, 79, 84, 91, 87, 65, 108, 102, 108, 76, 77, 112, 89, 95, 104, 71, 97, 69, 76, 99, 68, 91, 102, 74, 103, 95, 76, 97, 62, 100, 73, 67, 94, 111, 81, 66], [83, 98, 84, 103, 72, 78, 90, 89, 109, 93, 81, 111, 108, 96, 86, 68, 79, 102, 74, 113, 74, 104, 79, 72, 112, 112, 79, 101, 109, 91, 116, 114, 116, 99, 97, 107, 70, 88, 66, 77, 82, 73], [95, 84, 104, 74, 101, 114, 104, 115, 64, 76, 78, 79, 116, 106, 75, 86, 83, 102, 64, 90, 101, 77, 105, 65, 100, 72, 72, 67, 77, 93, 112, 68, 73, 98, 74, 78, 100, 76, 99, 71, 101, 95, 86, 96], [110, 85, 82, 103, 95, 96, 75, 101, 112, 108, 71, 71, 101, 105, 118, 82, 84, 74, 97, 108, 76, 87, 85, 82, 71, 79, 116, 87, 104, 99, 81, 91, 73, 72, 101, 82, 67, 67, 97, 96], [93, 105, 103, 82, 95, 92, 100, 86, 71, 100, 118, 73, 92, 113, 112, 120, 119, 100, 101, 119, 86, 120, 75, 92, 74, 96, 115, 82, 65, 117, 96, 94, 80, 72, 64, 64, 114, 116, 91, 113, 98, 105, 115, 107], [66, 87, 97, 121, 75, 87, 121, 72, 77, 96, 87, 110, 78, 111, 114, 107, 121, 87, 83, 106, 99, 76, 103, 83, 122, 65, 87, 89, 112, 115, 90, 87, 73, 119, 102, 69, 99, 92, 121, 91, 82, 73, 96, 110, 115], [90, 91, 98, 101, 114, 120, 83, 78, 84, 74, 71, 106, 115, 78, 112, 93, 85, 120, 68, 96, 120, 103, 120, 73, 68, 98, 68, 77, 90, 77, 95, 116, 92, 103, 87, 105, 78, 76, 98, 115, 86, 79, 116], [105, 70, 78, 87, 79, 115, 66, 104, 99, 80, 106, 85, 66, 80, 123, 122, 83, 88, 116, 123, 124, 119, 81, 67, 88, 70, 95, 77, 105, 104, 90, 91, 112, 90, 119, 87, 75, 67, 112, 71, 96, 89, 107, 71, 108, 115, 73, 77, 115, 96], [78, 75, 109, 82, 76, 120, 74, 105, 118, 113, 105, 68, 99, 67, 67, 76, 86, 122, 98, 125, 100, 123, 107, 72, 73, 82, 121, 99, 101, 79, 69, 101, 75, 90, 73, 91, 75, 73, 69, 114, 78, 81, 120, 102, 90, 95, 104, 76, 102, 111, 94], [121, 72, 93, 128, 100, 119, 68, 82, 91, 72, 123, 96, 84, 119, 113, 120, 74, 101, 124, 80, 107, 73, 82, 81, 104, 103, 88, 126, 96, 123, 116, 97, 117, 91, 128, 109, 81, 80, 78, 107, 107, 72, 106, 82, 112, 124, 102], [91, 77, 110, 79, 107, 76, 82, 99, 70, 129, 129, 87, 83, 110, 108, 113, 99, 89, 101, 118, 104, 90, 97, 106, 82, 100, 80, 99, 108, 101, 104, 125, 86, 123, 117, 70, 126, 108, 128, 93, 101, 112, 123, 125, 81, 76, 98, 122, 118, 91], [103, 117, 118, 93, 104, 78, 78, 104, 128, 94, 102, 120, 107, 124, 76, 113, 126, 95, 119, 80, 129, 105, 77, 87, 126, 81, 81, 81, 114, 119, 94, 99, 77, 78, 116, 95, 74, 109, 102, 84, 103, 95, 125, 121, 75, 91, 70, 73, 117, 103, 125, 122], [87, 73, 113, 101, 98, 110, 96, 111, 118, 85, 116, 128, 127, 120, 86, 114, 120, 92, 96, 85, 122, 103, 109, 103, 102, 76, 95, 124, 124, 119, 100, 88, 128, 101, 109, 70, 95, 112, 95, 101, 131, 101, 100, 83], [85, 92, 128, 113, 89, 107, 84, 102, 103, 104, 102, 77, 90, 84, 128, 103, 132, 75, 74, 133, 117, 105, 129, 100, 119, 83, 76, 104, 72, 75, 76, 119, 99, 132, 85, 76, 122, 92, 127, 133, 72, 73, 130, 128, 96, 113, 73, 132, 101, 74, 81, 109], [73, 126, 79, 111, 133, 132, 75, 90, 81, 133, 72, 132, 122, 94, 77, 80, 120, 92, 126, 114, 93, 90, 72, 129, 104, 104, 97, 74, 121, 104, 75, 86, 112, 132, 114, 100, 130, 100, 99, 130, 109, 120, 76, 127, 113, 105, 72], [117, 100, 78, 119, 127, 106, 130, 119, 96, 96, 129, 129, 73, 121, 124, 88, 96, 88, 97, 95, 117, 119, 122, 111, 129, 98, 114, 76, 111, 130, 136, 100, 111, 104, 98, 115, 91, 102, 83, 122, 128, 126, 129, 119, 78, 124], [77, 104, 74, 88, 77, 138, 111, 88, 92, 106, 102, 76, 95, 80, 132, 137, 84, 106, 135, 132, 133, 80, 87, 96, 119, 136, 84, 125, 136, 135, 138, 84, 131, 77, 92, 107, 78, 119, 86, 93, 113, 121, 124, 115, 104, 78, 94, 94, 107, 112, 137, 122, 137, 110, 82, 130], [116, 135, 83, 133, 140, 84, 96, 109, 99, 92, 103, 93, 77, 134, 138, 75, 114, 85, 119, 131, 74, 97, 121, 134, 130, 108, 129, 111, 120, 114, 122, 76, 112, 116, 101, 136, 77, 132, 128, 81, 126, 112, 121, 126, 78, 103, 111, 108, 100, 92, 77, 94, 79], [123, 98, 79, 85, 98, 86, 120, 109, 141, 137, 141, 139, 100, 97, 87, 105, 75, 124, 120, 117, 135, 118, 125, 129, 104, 92, 126, 80, 75, 92, 118, 105, 117, 117, 109, 111, 103, 122, 138, 119, 105, 115, 96, 75, 103, 127, 134, 126, 121, 119, 125, 133, 131, 131], [135, 103, 109, 109, 97, 80, 83, 101, 83, 124, 100, 126, 87, 134, 92, 90, 105, 85, 93, 77, 124, 83, 123, 120, 125, 86, 130, 122, 111, 111, 90, 112, 108, 88, 128, 142, 139, 120, 138, 95, 115, 142, 99, 100, 133, 106, 126, 88], [138, 134, 100, 124, 142, 91, 96, 141, 138, 93, 107, 129, 108, 108, 130, 92, 84, 116, 96, 97, 124, 99, 83, 117, 85, 144, 90, 96, 141, 77, 130, 128, 94, 118, 140, 88, 84, 101, 115, 97, 134, 90, 83, 114, 142, 110, 86, 95, 77], [114, 107, 136, 132, 93, 114, 125, 134, 124, 97, 106, 78, 123, 139, 82, 144, 144, 81, 134, 140, 139, 96, 112, 88, 127, 82, 142, 93, 146, 96, 145, 105, 116, 133, 78, 84, 145, 127, 133, 101, 117, 112, 111, 108, 116, 112, 97, 95, 94], [1000], [2000]],
    upgrades: [[], [0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, -1]],
    players: [{
      mousepos: {
        x: 3,
        y: 10,
      },
      placingTower: 0,
      money: 120
    }, {
        mousepos: {
            x: 3,
            y: 10,
          },
          placingTower: 0,
          money: 120
        }],
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  gameState = state
  for (let i in gameState.towers) {
    let tower = new Tower(gameState.towers[i])
    tower.update
    gameState.towers[i] = tower
  }
  for (let i in gameState.projectiles) {
    let projectile = new projectile(gameState.projectiles[i])
    projectile.update()
    gameState.projectiles[i] = projectile
  }
  for (let i in gameState.enemies) {
    let enemy = new Enemy(gameState.enemies[i])
    enemy.update()
    gameState.enemies[i] = enemy
  }

  if (gameState.gamespeed > 0) {
    createEnemies()
  }

  return gameState;
}