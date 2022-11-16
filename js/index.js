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
    c.drawImage(map, 0, 0, canvas.width, canvas.height);
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i]
        enemy.update()
    }
  for (let i = 0; i < towers.length; i++) {
      c.fillRect(tower[i].x, tower[i].y, 100, 100)
  }
};

document.addEventListener('mousemove', function () {
    mousex = event.clientX - bound.left - canvas.clientLeft - 172;
    mousey = event.clientY - bound.top - canvas.clientTop - 3;
  });
  document.addEventListener('mousedown', function () {
    mouseDown = true;
    towers.push({x: mousex, y: mousey})
  });
  document.addEventListener('mouseup', function () {
    mouseDown = false
  });
