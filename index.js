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
        this.hullIntegrity = 100;
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

    handleImpact() {
        this.hullIntegrity -=1;
        if (this.hullIntegrity <= 0) {
            console.log(`SHIP LOST`)
            return true;
        }
        console.log(`HULL INTEGRITY: ${this.hullIntegrity}`);
        return false;
    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
    
        return [
          {
            x: this.position.x + cos * 30 - sin * 0,
            y: this.position.y + sin * 30 + cos * 0,
          },
          {
            x: this.position.x + cos * -10 - sin * 10,
            y: this.position.y + sin * -10 + cos * 10,
          },
          {
            x: this.position.x + cos * -10 - sin * -10,
            y: this.position.y + sin * -10 + cos * -10,
          },
        ]
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

class Asteroid {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 50 * Math.random() + 10;
    }

    damage() {
        this.radius -= 10;
        this.radius <= 0 ? console.log(`Asteroid Destroyed`) :console.log(`Remaining Asteroid Integrity: ${this.radius}`);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// GAME VARIABLES
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

const SPEED = 2.5;
const REVERSE_SPEED = -0.5;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.999;
const PROJECTILE_THRUST = 3;

const projectiles = [];
const asteroids = [];

const asteroidSpawning = window.setInterval( () => {

    const asteroidSpawnIndex = Math.floor(Math.random() * 5);

    switch (asteroidSpawnIndex) {
        case 1:
            asteroids.push(new Asteroid({
                position: {
                    x: -60,
                    y: -60
                },
                velocity: {
                    x: 1 * Math.random(),
                    y: 1 * Math.random()
                }
            }))
            break;
        case 2:
            asteroids.push(new Asteroid({
                position: {
                    x: canvas.width + 60,
                    y: canvas.height + 60
                },
                velocity: {
                    x: -1 * Math.random(),
                    y: -1 * Math.random()
                }
            }))
            break;
        case 3:
            asteroids.push(new Asteroid({
                position: {
                    x: canvas.width,
                    y: -60
                },
                velocity: {
                    x: -1 * Math.random(),
                    y: 1 * Math.random()
                }
            }))
            break;
        case 4:
            asteroids.push(new Asteroid({
                position: {
                    x: -60,
                    y: canvas.height
                },
                velocity: {
                    x: 1 * Math.random(),
                    y: -1 * Math.random()
                }
            }))
            break;
    
        default:
            break;
    }
}, 2000);


//fUNCTIONS
function circleCollision(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x;
    const yDifference = circle2.position.y - circle1.position.y;
    const distanceBetweenCenters = Math.sqrt((xDifference * xDifference) + (yDifference * yDifference));

    if (circle1.radius + circle2.radius >= distanceBetweenCenters) {
        console.log(`Hit Detected`);
        return true;
    }

    return false;
}

function circleTriangleCollision(circle, triangle) {
    // Check if the circle is colliding with any of the triangle's edges
    for (let i = 0; i < 3; i++) {
      let start = triangle[i]
      let end = triangle[(i + 1) % 3]
  
      let dx = end.x - start.x
      let dy = end.y - start.y
      let length = Math.sqrt(dx * dx + dy * dy)
  
      let dot =
        ((circle.position.x - start.x) * dx +
          (circle.position.y - start.y) * dy) /
        Math.pow(length, 2)
  
      let closestX = start.x + dot * dx
      let closestY = start.y + dot * dy
  
      if (!isPointOnLineSegment(closestX, closestY, start, end)) {
        closestX = closestX < start.x ? start.x : end.x
        closestY = closestY < start.y ? start.y : end.y
      }
  
      dx = closestX - circle.position.x
      dy = closestY - circle.position.y
  
      let distance = Math.sqrt(dx * dx + dy * dy)
  
      if (distance <= circle.radius) {
        return true
      }
    }
  
    // No collision
    return false
  }
  
  function isPointOnLineSegment(x, y, start, end) {
    return (
      x >= Math.min(start.x, end.x) &&
      x <= Math.max(start.x, end.x) &&
      y >= Math.min(start.y, end.y) &&
      y <= Math.max(start.y, end.y)
    )
  }

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    player.update();

        //PROJECTILE MANAGMENT
    //loop through projectiles array from back to front. this stops flashing.as
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

    //ASTEROID MANAGMENT
    //loop through asteroids array from back to front. this stops flashing.
    for(let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();
        
        if (circleTriangleCollision(asteroid, player.getVertices())) {
            const playerDestroyed = player.handleImpact();
            if (playerDestroyed) {
                window.cancelAnimationFrame(animationId);
                clearInterval(asteroidSpawning);
            }
        }

        //Clean up asteroids off screen
        if( asteroid.position.x + asteroid.radius < - 60 ||
            asteroid.position.x - asteroid.radius > canvas.width + 60 ||
            asteroid.position.y - asteroid.radius > canvas.height + 60||
            asteroid.position.y + asteroid.radius < -60) {
            asteroids.splice(i, 1);
        }

        //Collision Checking
        for(let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            if (circleCollision(projectile ,asteroid)) {
                asteroid.damage();
                if (asteroid.radius <= 0) {
                    asteroids.splice(i, 1);
                }
                
                projectiles.splice(j, 1);
            }
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
        player.velocity.x = Math.cos(player.rotation) * REVERSE_SPEED;
        player.velocity.y = Math.sin(player.rotation) * REVERSE_SPEED;
    }
}


//EVENT LISTENERS
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
                    x: (Math.cos(player.rotation) * PROJECTILE_THRUST) + player.velocity.x,
                    y: (Math.sin(player.rotation) * PROJECTILE_THRUST) + player.velocity.y
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

//INIT GAME LOOP
animate();