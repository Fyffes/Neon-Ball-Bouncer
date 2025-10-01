// script.js - Neon Ball Bouncer Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const gameOverEl = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

canvas.width = 600;
canvas.height = 500;

let score = 0;
let highScore = 0;
let gameRunning = true;
let keys = {};

// Player
const player = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 40,
    width: 60,
    height: 15,
    speed: 7
};

// Balls array
let balls = [];
let spawnTimer = 0;
let spawnInterval = 60;

// Ball class
class Ball {
    constructor() {
        this.x = Math.random() * (canvas.width - 30) + 15;
        this.y = -20;
        this.radius = 12;
        this.speed = 2 + Math.random() * 2;
        this.good = Math.random() > 0.3;
        this.color = this.good ? '#00ff88' : '#ff0055';
        this.particles = [];
    }

    update() {
        this.y += this.speed;
        
        // Collision with player
        if (this.y + this.radius > player.y &&
            this.y - this.radius < player.y + player.height &&
            this.x > player.x &&
            this.x < player.x + player.width) {
            
            if (this.good) {
                score += 10;
                scoreEl.textContent = score;
                this.createParticles('#00ff88');
            } else {
                gameOver();
            }
            return true;
        }

        // Ball leaves screen
        if (this.y > canvas.height + 20) {
            if (this.good) {
                score = Math.max(0, score - 5);
                scoreEl.textContent = score;
            }
            return true;
        }
        
        return false;
    }

    draw() {
        // Shadow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        // Ball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Shine effect
        const gradient = ctx.createRadialGradient(
            this.x - 4, this.y - 4, 2,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    createParticles(color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 30,
                color: color
            });
        }
    }
}

function drawPlayer() {
    // Shadow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    
    // Player rectangle with gradient
    const gradient = ctx.createLinearGradient(
        player.x, player.y,
        player.x, player.y + player.height
    );
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(1, '#0088ff');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Top shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(player.x, player.y, player.width, 3);
    
    ctx.shadowBlur = 0;
}

function updatePlayer() {
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > 0) {
        player.x -= player.speed;
    }
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function spawnBall() {
    balls.push(new Ball());
}

function gameOver() {
    gameRunning = false;
    gameOverEl.classList.add('active');
    finalScoreEl.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
    }
}

function reset() {
    score = 0;
    balls = [];
    spawnTimer = 0;
    gameRunning = true;
    player.x = canvas.width / 2 - 30;
    scoreEl.textContent = score;
    gameOverEl.classList.remove('active');
}

function gameLoop() {
    ctx.fillStyle = 'rgba(0, 5, 17, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        updatePlayer();
        drawPlayer();
        
        // Spawn ball
        spawnTimer++;
        if (spawnTimer > spawnInterval) {
            spawnBall();
            spawnTimer = 0;
            spawnInterval = Math.max(30, 60 - score / 10);
        }
        
        // Update and draw balls
        balls = balls.filter(ball => {
            const remove = ball.update();
            if (!remove) {
                ball.draw();
            }
            return !remove;
        });
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', e => {
    keys[e.key] = true;
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

restartBtn.addEventListener('click', reset);

// Start game
gameLoop();
