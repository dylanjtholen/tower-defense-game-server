const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 960;
canvas.height = 640;

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

var map = new Image();
map.src = "assets/img/map.png";
window.addEventListener('load', () => {
    window.requestAnimationFrame(mainloop);
});

function mainloop() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(map, 0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(mainloop);
};
