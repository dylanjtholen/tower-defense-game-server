const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 960;
canvas.height = 640;

let bound = canvas.getBoundingClientRect();
let mouseDown;
let mousex
let mousey

var enemies = []
var waypoints = [{x: 0, y: 270}, {x:300, y:270}, {x:300, y:50}, {x:75, y:50}, {x:75, y:585}, {x:300, y:585}, {x:300, y:360}, {x:525, y:360}, {x:525, y:485}, {x:680, y:485}, {x:680, y:170}, {x:430, y:170}, {x:430, y:80}, {x:840, y:80}, {x:840, y:325}, {x:1000, y:325}]
var towers = []

var towerSize = 25

function isColliding(x, y, w, h, x2, y2, w2, h2) {
  if (((x > x2) && (x < (x2 + w2)) || (((x + w) > x2) && ((x + w) < (x2 + w2)))) && ((y > y2) && (y < (y2 + h2)) || (((y + h) > y2) && ((y + h) < (y2 + h2))))) {
    return true
  } else {
    return false
  }
}

function validPlacement(x, y, w, h){
  let valid = true
  for (let tower in towers) {
    if (isColliding(tower.x, tower.y, towerSize * 2, towerSize * 2, x, y, w, h)) {
      valid = false
    }
  }
  if (valid) {
    return true
  } else {
    return false
  }
}
class Enemy {
    constructor({position={x:0, y:0}}) {
    this.position = position
    this.width = 50
    this.height = 50
    this.waypointIndex = 0
    this.center = {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2
    }
    this.radius = 50
    this.health = 100
    this.velocity = {
        x: 0,
        y: 0
    }
    }
    draw() {
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
    this.draw()
 
    const waypoint = waypoints[this.waypointIndex]
    const yDistance = waypoint.y - this.center.y
    const xDistance = waypoint.x - this.center.x
    const angle = Math.atan2(yDistance, xDistance)

    const speed = 3

    this.velocity.x = Math.cos(angle) * speed
    this.velocity.y = Math.sin(angle) * speed

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }

    if (
      Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) <
        Math.abs(this.velocity.x) &&
      Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) <
        Math.abs(this.velocity.y) &&
      this.waypointIndex < waypoints.length - 1
    ) {
      this.waypointIndex++
    }
    }
}

var enemy1 = new Enemy({position: {x: -50, y: 270}})
enemies.push(enemy1)
var enemy3 = new Enemy({position: {x: -150, y: 270}})
enemies.push(enemy3)
var enemy2 = new Enemy({position: {x: -250, y: 270}})
enemies.push(enemy2)

var map = new Image();
map.src = "assets/img/map.png";
window.addEventListener('load', () => {
    window.requestAnimationFrame(mainloop);
});

function mainloop() {
  window.requestAnimationFrame(mainloop);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'red'
    c.drawImage(map, 0, 0, canvas.width, canvas.height);
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i]
        enemy.update()
    }
    c.fillStyle = 'green'
    if (towers.length > 0) {
      for (let i = 0; i < towers.length; i++) {
        //alert(towers[i].x + ', ' + towers[i].y)
        c.fillRect(towers[i].x, towers[i].y, towerSize * 2, towerSize * 2)
      }
    }
    if (validPlacement(mousex - towerSize, mousey - towerSize, towerSize * 2, towerSize * 2) = false) {
      alert('gdhf')
    }
    c.fillRect(mousex - towerSize, mousey - towerSize, towerSize * 2, towerSize * 2)
};

document.addEventListener('mousemove', function () {
    mousex = event.clientX - bound.left - canvas.clientLeft - 172;
    mousey = event.clientY - bound.top - canvas.clientTop - 3;
  });
  document.addEventListener('mousedown', function () {
    mouseDown = true;
    towers.push({x: mousex - towerSize, y: mousey - towerSize})
  });
  document.addEventListener('mouseup', function () {
    mouseDown = false
  });
