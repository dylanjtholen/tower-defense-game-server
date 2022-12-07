const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1060;
canvas.height = 640;

let bound = canvas.getBoundingClientRect();
var mouseDown;
var mousex
var mousey

var enemies = []
var waypoints = [{ x: 0, y: 270 }, { x: 300, y: 270 }, { x: 300, y: 50 }, { x: 75, y: 50 }, { x: 75, y: 585 }, { x: 300, y: 585 }, { x: 300, y: 360 }, { x: 525, y: 360 }, { x: 525, y: 485 }, { x: 680, y: 485 }, { x: 680, y: 170 }, { x: 430, y: 170 }, { x: 430, y: 80 }, { x: 840, y: 80 }, { x: 840, y: 325 }, { x: 1000, y: 325 }]
var towers = []
var collisionRectangles = [{ x: 960, y: 0, w: 100, h: canvas.height }, { x: 0, y: 230, w: 350, h: 80 }, { x: 255, y: 10, w: 100, h: 300 }, { x: 35, y: 5, w: 315, h: 85 }, { x: 30, y: 5, w: 95, h: 625 }, { x: 30, y: 550, w: 325, h: 85 }, { x: 255, y: 325, w: 100, h: 305 }, { x: 260, y: 330, w: 315, h: 80 }, { x: 475, y: 330, w: 105, h: 207 }, { x: 475, y: 455, w: 260, h: 80 }, { x: 635, y: 135, w: 100, h: 405 }, { x: 385, y: 135, w: 350, h: 85 }, { x: 385, y: 35, w: 95, h: 180 }, { x: 385, y: 40, w: 510, h: 85 }, { x: 800, y: 40, w: 95, h: 340 }, { x: 800, y: 290, w: 160, h: 85 }]
var projectiles = []
var buttons = []

var towerSizes = [0, 25, 20, 30]
var towerSpeeds = [0, 60, 120, 10]
var towerCosts = [0, 10, 25, 15]
var towerDamage = [0, 1, 5, 1]
var towerRanges = [0, 500, 1000, 100]

var lives = 1
var money = 10

var enemiesCooldown

var gamespeed = 0
var gameFramesPassed = 0
var speedButtonIndex
var placingTower = 0

/*----------FUNCTION DECLARATION----------*/

function findPos(obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return { x: curleft, y: curtop };
  }
  return undefined;
}

function distance(x, y,  x2, y2) {
  return Math.sqrt((x - x2) ** 2 + (y - y2) ** 2)
}

function isColliding(x, y, w, h, x2, y2, w2, h2) {
  if ((((x <= x2) && ((x + w) >= (x2 + w2))) ||((x >= x2) && (x <= (x2 + w2)) || (((x + w) >= x2) && ((x + w) <= (x2 + w2))))) && (((y >= y2) && (y <= (y2 + h2)) || (((y + h) >= y2) && ((y + h) <= (y2 + h2)))) || ((y <= y2) && ((y + h) >= (y2 + h2))))) {
    return true
  } else if (((x <= x2) && ((x + w) >= (x2 + w2))) && ((y <= y2) && ((y + h) >= (y2 + h2)))) {
    return true
  } else {
    return false
  }
}

function validPlacement(x, y, w, h) {
  let valid = true
  for (let i in towers) {
    let tower = towers[i]
    if (isColliding(towers[i].position.x - tower.size, towers[i].position.y - tower.size, tower.size * 2, tower.size * 2, x, y, w, h)) {
      valid = false
    }
  }
  for (let i in towers) {
    let tower = towers[i]
    if (isColliding(x, y, w, h, towers[i].position.x - tower.size, towers[i].position.y - tower.size, tower.size * 2, tower.size * 2)) {
      valid = false
    }
  }
  for (let i in collisionRectangles) {
    if (isColliding(x, y, w, h, collisionRectangles[i].x, collisionRectangles[i].y, collisionRectangles[i].w, collisionRectangles[i].h)) {
      valid = false
    }
  }
  for (let i in collisionRectangles) {
    if (isColliding(collisionRectangles[i].x, collisionRectangles[i].y, collisionRectangles[i].w, collisionRectangles[i].h, x, y, w, h)) {
      valid = false
    }
  }
  if (valid) {
    return true
  } else {
    return false
  }
}

function createEnemies(health) {
  if (enemies.length < 1000 && enemiesCooldown <= 0) {
    enemies.push(new Enemy({ position: { x: -100, y: 270 }, health: health }))
    enemiesCooldown += 50 / gamespeed
  } else if (enemiesCooldown != 0) {
    enemiesCooldown -= 1
  }
}

/*----------CLASSES----------*/

class Button {
  constructor({ x = 0, y = 0, w = 0, h = 0, color = 'red', text = '', pressedcolor = 'green', hovercolor = 'blue', pressedfunction = "null" }) {
    this.x = x
    this.y = y
    this.width = w
    this.height = h
    this.color = color
    this.hovercolor = hovercolor
    this.pressedcolor = pressedcolor
    this.pressedfunction = pressedfunction
    this.hover = false
    this.clicked = false
    this.declick = 0
    this.text = text
  }
  draw() {

    if (this.hover && this.clicked) {
      c.fillStyle = this.pressedcolor
    } else if (this.hover) {
      c.fillStyle = this.hovercolor
    } else {
      c.fillStyle = this.color
    }

    c.fillRect(this.x, this.y, this.width, this.height)
    c.fillStyle = 'black'
    c.fillText(this.text, this.x + ((this.width / 2) - 30), this.y + ((this.height / 2) + 10))
  }
  update() {
    if (mousex >= this.x && mousex <= this.x + this.width && mousey >= this.y && mousey <= this.y + this.height) {
      this.hover = true
    } else {
      this.hover = false
    }
    if (this.declick <= 0) {
      this.clicked = false
    } else {
      this.declick -= 1
    }
    this.draw()
  }
  onclick() {
    this.declick += 10
    this.clicked = true
    this.draw()
    setTimeout(this.pressedfunction, 0)
  }
}
class Enemy {
  constructor({ position = { x: 0, y: 0 }, health }) {
    this.position = position
    this.width = 50
    this.height = 50
    this.waypointIndex = 0
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
    this.draw()

    const waypoint = waypoints[this.waypointIndex]
    const yDistance = waypoint.y - this.center.y
    const xDistance = waypoint.x - this.center.x
    const angle = Math.atan2(yDistance, xDistance)

    const speed = 3 * gamespeed

    this.velocity.x = Math.cos(angle) * speed
    this.velocity.y = Math.sin(angle) * speed

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

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
      if (this.waypointIndex == waypoints.length - 1) {
        lives -= 1
        return true
      } else {
        this.waypointIndex++
      }
    }
  }
}

class tower {
  constructor({ position = { x: 0, y: 0 }, type = 1 }) {
    this.type = type
    this.damage = towerDamage[this.type]
    this.range = towerRanges[this.type]
    this.speed = towerSpeeds[this.type]
    this.size = towerSizes[this.type]
    this.position = position
    this.width = this.size * 2
    this.height = this.size * 2
    this.projectileCooldown = 0
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }
  }
  draw() {
    c.fillStyle = 'lime'
    c.fillRect(this.center.x - this.height, this.center.y - this.width, this.width, this.height)
  }
  update() {
    this.draw()

    if (this.projectileCooldown <= 0 && enemies.length > 0) {
      this.projectileCooldown += this.speed / gamespeed
      for (let i in enemies) {
        let enemy = enemies[i]
        if ((this.range >= distance(this.position.x, this.position.y, enemy.position.x, enemy.position.y)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x, enemy.position.y + enemy.height)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x + enemy.width, enemy.position.y)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x + enemy.width, enemy.position.y + enemy.height))) {
          projectiles.push(new projectile({ position: { x: this.position.x, y: this.position.y }, endpoint: { x: enemy.position.x, y: enemy.position.y }, damage: this.damage, lifespan: this.range }))
          return
      }
      }
    } else {
      this.projectileCooldown -= 1
    }
  }
}

class projectile {
  constructor({ position = { x: 0, y: 0 }, endpoint = { x: 0, y: 0 }, damage = 1, lifespan = 500 }) {
    this.position = position
    this.damage = damage
    this.lifespan = lifespan
    this.range = 100
    this.width = 12.5
    this.height = 12.5
    this.waypointIndex = 0
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
    this.angle = Math.atan2(this.yDistance, this.xDistance)
  }
  draw() {
    c.fillStyle = 'orange'
    c.fillRect(this.center.x - this.height, this.center.y - this.width, this.width, this.height)
  }
  update() {
    this.draw()

    const speed = 20 * gamespeed

    if (enemies.length > 0) {
      for (let i in enemies) {
        let enemy = enemies[i]
        if ((this.range >= distance(this.position.x, this.position.y, enemy.position.x, enemy.position.y)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x, enemy.position.y + enemy.height)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x + enemy.width, enemy.position.y)) || (this.range >= distance(this.position.x, this.position.y, enemy.position.x + enemy.width, enemy.position.y + enemy.height))) {
          this.endpoint.x = enemy.center.x
          this.endpoint.y = enemy.center.y
      }
      }
    }

    this.yDistance = this.endpoint.y - this.center.y
    this.xDistance = this.endpoint.x - this.center.x
    this.angle = Math.atan2(this.yDistance, this.xDistance)

    this.velocity.x = Math.cos(this.angle) * speed
    this.velocity.y = Math.sin(this.angle) * speed

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.distanceTravelled += speed
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }

    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i]
      if (isColliding(this.position.x, this.position.y, this.width, this.height, enemy.position.x, enemy.position.y, enemy.width, enemy.height)) {
        if (enemies[i].health < this.damage) {
          money += enemies[i].health
          enemies[i].health -= this.damage
          this.damage -= enemies[i].health
          if (enemies[i].health <= 0) {
            enemies.splice(i, 1)
          }
          this.endpoint.x = this.position.x + this.velocity.x * 10
          this.endpoint.y = this.position.y + this.velocity.y * 10
        } else {
          money += this.damage
          enemies[i].health -= this.damage
          if (enemies[i].health <= 0) {
            enemies.splice(i, 1)
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
      Math.abs(Math.round(this.center.x) - Math.round(this.endpoint.x)) <
      Math.abs(this.velocity.x) &&
      Math.abs(Math.round(this.center.y) - Math.round(this.endpoint.y)) <
      Math.abs(this.velocity.y)
    ) {return true}
  }
}
function buttonpressed() {
  gamespeed = 1
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i] === startbutton) {
      buttons.splice(i, 1)
    }
  }
  var speedButton = new Button({ x: 960, y: 540, w: 100, h: 100, color: 'red', text: 'fast', hovercolor: 'blue', pressedcolor: 'green', pressedfunction: changeSpeed })
  speedButtonIndex = buttons.length
  buttons.push(speedButton)
}

function changeSpeed() {
  if (gamespeed == 1) {
    gamespeed = 2
    buttons[speedButtonIndex].text = 'slow'
  } else {
    gamespeed = 1
    buttons[speedButtonIndex].text = 'fast'
  }
}

function placetower1() {
  if (placingTower != 1) {
    placingTower = 1
  } else {
    placingTower = 0
  }
}

function placetower2() {
  if (placingTower != 2) {
    placingTower = 2
  } else {
    placingTower = 0
  }
}

function placetower3() {
  if (placingTower != 3) {
    placingTower = 3
  } else {
    placingTower = 0
  }
}

var startbutton = new Button({ x: 960, y: 540, w: 100, h: 100, color: 'red', text: 'start', hovercolor: 'blue', pressedcolor: 'green', pressedfunction: buttonpressed })
var tower1button = new Button({ x: 960, y: 0, w: 100, h: 100, color: 'lime', text: 'tower1', hovercolor: 'green', pressedcolor: 'blue', pressedfunction: placetower1 })
var tower2button = new Button({ x: 960, y: 100, w: 100, h: 100, color: 'lime', text: 'tower2', hovercolor: 'green', pressedcolor: 'blue', pressedfunction: placetower2 })
var tower3button = new Button({ x: 960, y: 200, w: 100, h: 100, color: 'lime', text: 'tower3', hovercolor: 'green', pressedcolor: 'blue', pressedfunction: placetower3 })
buttons.push(startbutton)
buttons.push(tower1button)
buttons.push(tower2button)
buttons.push(tower3button)

var map = new Image();
map.src = "img/map.png";
window.addEventListener('load', () => {
  enemiesCooldown = 30
  c.drawImage(map, 0, 0, canvas.width, canvas.height)
  requestAnimationFrame(mainloop);
});

/*----------MAIN LOOP----------*/

function mainloop() {
  requestAnimationFrame(mainloop);
  gameFramesPassed += gamespeed
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = 'red'
  c.drawImage(map, 0, 0, canvas.width - 100, canvas.height);
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i]
    if (enemy.update()) {
      enemies.splice(i, 1)
    }
  }
  if (towers.length > 0) {
    for (let i = 0; i < towers.length; i++) {
      let tower = towers[i]
      tower.update()
    }
  }
  if (projectiles.length > 0) {
    for (let i = 0; i < projectiles.length; i++) {
      let projectile = projectiles[i]
      if (projectile.update()) {
        projectiles.splice(i, 1)
      }
    }
  }
  if (gamespeed > 0) {
    createEnemies(Math.round((gameFramesPassed / 2000) + 1))
  }
  if (lives <= 0) {
    c.font = '96px sans-serif'
    c.fillStyle = 'red'
    c.fillText("GAME OVER", canvas.width / 2 - 300, canvas.height / 2)
    gamespeed = 0
    return
  }
  c.fillStyle = 'lime'
  if (!validPlacement(mousex - towerSizes[placingTower], mousey - towerSizes[placingTower], towerSizes[placingTower] * 2, towerSizes[placingTower] * 2)) {
    c.fillStyle = 'red'
  }
  //-----UI ELEMENTS-----
  if (placingTower > 0) {
    c.fillRect(mousex - towerSizes[placingTower], mousey - towerSizes[placingTower], towerSizes[placingTower] * 2, towerSizes[placingTower] * 2)
    c.beginPath()
    c.arc(mousex, mousey, towerRanges[placingTower], 0, 2 * Math.PI)
    c.fillStyle = 'rgba(240, 248, 255, 0.05)'
    c.fill()
    c.fillStyle = 'rgb(240, 248, 255)'
    c.stroke()
    c.closePath()
  }
  c.fillStyle = 'white'
  c.font = '30px sans-serif'
  c.fillText("Money: " + Math.round(money), 0, 30)
  c.fillText("Lives: " + lives, 0, 70)
  for (let i = 0; i < buttons.length; i++) {
    let button = buttons[i]
    button.update()
  }
};

/*----------MOUSE EVENTS----------*/

canvas.addEventListener('mousemove', function () {
  let pos = findPos(canvas)
  mousex = event.pageX - pos.x
  mousey = event.pageY - pos.y
})
canvas.addEventListener('mousedown', function () {
  mouseDown = true
  if (placingTower > 0 && validPlacement(mousex - towerSizes[placingTower], mousey - towerSizes[placingTower], towerSizes[placingTower] * 2, towerSizes[placingTower] * 2) && money > 9) {
    money -= 10
    towers.push(new tower({ position: { x: mousex, y: mousey }, type: placingTower }))
    placingTower = 0
  }
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].hover) {
      buttons[i].click = true
      buttons[i].onclick()
    }
  }
});
canvas.addEventListener('mouseup', function () {
  mouseDown = false
});