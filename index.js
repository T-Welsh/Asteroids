console.log('index.js init');

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'black';
ctx.fillRect(0,0,canvas.width,canvas.height);

// CLASSES
class Player {
    constructor({position, velocity, rotation}) {
        this.position = position; // {x, y}
        this.velocity = velocity;
        this.rotation = rotation;
        }

    draw() {
        ctx.save();
        ctx.translate(this.position.x,this.position.y);
        ctx.rotate(this.rotation);
        ctx.translate(-this.position.x, -this.position.y);
        ctx.beginPath();
        ctx.moveTo(this.position.x + 30, this.position.y);
        ctx.lineTo(this.position.x - 10, this.position.y - 10);
        ctx.lineTo(this.position.x - 10, this.position.y + 10);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Projectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}



const player = new Player({
        position: {x:(canvas.width / 2), y:(canvas.height / 2)},
        velocity: {x:0, y:0},
        rotation: 0
    }
    );

player.draw();

console.log(player);

const keys = {
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const SPEED = 1.6;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.99;
const PROJECTILE_THRUST = 3;
const projectiles = [];

function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    player.update();

    //loop through projectiles array from back to front. this stops flashing.
    for(let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.update();
        
        //Clean up projectiles off screen
        if( projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y - projectile.radius > canvas.height ||
            projectile.position.y + projectile.radius < 0) {
            projectiles.splice(i, 1);
        }
    }

    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED;
        player.velocity.y = Math.sin(player.rotation) * SPEED;
    }
    if (!keys.w.pressed) {
        player.velocity.x *= FRICTION;
        player.velocity.y *= FRICTION;
    }
    if (keys.a.pressed) {
        player.rotation -= ROTATIONAL_SPEED;
    }
    if (keys.d.pressed) {
        player.rotation += ROTATIONAL_SPEED;
    }
    if (keys.s.pressed) {
        //player.velocity.x = 1;
    }
}

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = true;
            break;
        case 'KeyA':
            keys.a.pressed = true;
            break;
        case 'KeyS':
            keys.s.pressed = true;
            break;
        case 'KeyD':
            keys.d.pressed = true;
            break;
        case 'Space':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + Math.cos(player.rotation) * 30, // offset by player edge
                    y: player.position.y + Math.sin(player.rotation) * 30
                },
                velocity: {
                    x: Math.cos(player.rotation) * PROJECTILE_THRUST/*(player.velocity.x + PROJECTILE_THRUST)*/,
                    y: Math.sin(player.rotation) * PROJECTILE_THRUST/*(player.velocity.y + PROJECTILE_THRUST)*/
                }
            }));
            break;
    
        default:
            break;
    }
});
window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = false;
            break;
        case 'KeyA':
            keys.a.pressed = false;
            break;
        case 'KeyS':
            keys.s.pressed = false;
            break;
        case 'KeyD':
            keys.d.pressed = false;
            break;
    
        default:
            break;
    }
});

animate();