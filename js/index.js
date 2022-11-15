const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 960;
canvas.height = 640;

let mouseDown;
let mousex
let mousey

var enemies = []

class Enemy {
    constructor({position={x:0, y:0}}) {
    this.position = position
    this.width = 50
    this.height = 50
    this.wayPointPosition = 0
    }
    draw() {
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
    }
}

var enemy1 = new Enemy({position: {x: 50, y: 250}})
enemies.push(enemy1)
var enemy3 = new Enemy({position: {x: 50, y: 400}})
enemies.push(enemy3)
var enemy2 = new Enemy({position: {x: 50, y: 100}})
enemies.push(enemy2)

var map = new Image();
map.src = "assets/img/map.png";
window.addEventListener('load', () => {
    window.requestAnimationFrame(mainloop);
});

function mainloop() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(map, 0, 0, canvas.width, canvas.height);
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i]
        enemy.update()
    }
    window.requestAnimationFrame(mainloop);
};

document.addEventListener('mousemove', function () {
    mousex = clientX - bound.left - canvas.clientLeft;
    mousey = clientY - bound.top - canvas.clientTop;
  });
  document.addEventListener('mousedown', function () {
    mouseDown = true;
  });
  document.addEventListener('mouseup', function () {
    mouseDown = false;
  });