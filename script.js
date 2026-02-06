const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hpBar = document.getElementById('hp-bar');
const scoreText = document.getElementById('score-text');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let particles = [];
let enemies = [];
const keys = {};

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
const mouse = { x: 0, y: 0 };

// --- TANK SINIFI (Gerçekçi tasarım ve fizik) ---
class Tank {
    constructor(x, y, color, isPlayer = false) {
        this.x = x; this.y = y;
        this.color = color;
        this.isPlayer = isPlayer;
        this.bodyAngle = 0;
        this.turretAngle = 0;
        this.speed = 0;
        this.maxSpeed = isPlayer ? 4 : 2;
        this.hp = 100;
        this.bullets = [];
        this.lastShot = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // 1. Gölge (Gerçekçilik katar)
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(-18, -13, 45, 35);

        // 2. Gövde
        ctx.save();
        ctx.rotate(this.bodyAngle);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = "black";
        ctx.fillRect(-20, -15, 40, 30); // Ana gövde
        // Palet detayları
        ctx.fillStyle = "#222";
        ctx.fillRect(-22, -18, 44, 6);
        ctx.fillRect(-22, 12, 44, 6);
        ctx.restore();

        // 3. Kule (Turret)
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-12, -12, 24, 24);
        // Namlu detayı
        ctx.fillStyle = "#111";
        ctx.fillRect(10, -4, 25, 8);
        ctx.strokeStyle = this.color;
        ctx.strokeRect(10, -4, 25, 8);

        ctx.restore();
    }

    update() {
        if (this.isPlayer) {
            if (keys['w']) this.speed = Math.min(this.speed + 0.1, this.maxSpeed);
            else if (keys['s']) this.speed = Math.max(this.speed - 0.1, -this.maxSpeed / 2);
            else this.speed *= 0.95;

            if (keys['a']) this.bodyAngle -= 0.04;
            if (keys['d']) this.bodyAngle += 0.04;

            this.turretAngle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        }
        
        this.x += Math.cos(this.bodyAngle) * this.speed;
        this.y += Math.sin(this.bodyAngle) * this.speed;
    }
}

const player = new Tank(canvas.width / 2, canvas.height / 2, "#4a5d23", true);

// --- MERMİ VE EFEKT SİSTEMİ ---
function createExplosion(x, y, color, size = 15) {
    for (let i = 0; i < size; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color
        });
    }
}

window.addEventListener('mousedown', () => {
    if (Date.now() - player.lastShot > 400) {
        shoot(player);
        player.lastShot = Date.now();
    }
});

function shoot(t) {
    t.bullets.push({
        x: t.x + Math.cos(t.turretAngle) * 35,
        y: t.y + Math.sin(t.turretAngle) * 35,
        angle: t.turretAngle,
        speed: 8
    });
    createExplosion(t.x + Math.cos(t.turretAngle) * 35, t.y + Math.sin(t.turretAngle) * 35, "#ffcc00", 5);
}

// --- DÜŞMAN YAPAY ZEKASI (Takip ve Ateş) ---
function spawnEnemy() {
    if (enemies.length < 4 + Math.floor(score/10)) {
        const x = Math.random() < 0.5 ? -50 : canvas.width + 50;
        const y = Math.random() * canvas.height;
        enemies.push(new Tank(x, y, "#7a2323"));
    }
}

function updateGame() {
    if (gameOver) return;

    player.update();
    spawnEnemy();

    enemies.forEach((en, eIdx) => {
        const dist = Math.hypot(player.x - en.x, player.y - en.y);
        en.bodyAngle = Math.atan2(player.y - en.y, player.x - en.x);
        en.turretAngle = en.bodyAngle;

        if (dist > 250) {
            en.speed = 1.5;
        } else {
            en.speed = 0;
            if (Date.now() - en.lastShot > 1500) {
                shoot(en);
                en.lastShot = Date.now();
            }
        }
        en.update();

        // Mermi Kontrolleri
        en.bullets.forEach((eb, ebIdx) => {
            eb.x += Math.cos(eb.angle) * eb.speed;
            eb.y += Math.sin(eb.angle) * eb.speed;
            if (Math.hypot(eb.x - player.x, eb.y - player.y) < 25) {
                player.hp -= 10;
                hpBar.style.width = player.hp + "%";
                createExplosion(eb.x, eb.y, "red", 10);
                en.bullets.splice(ebIdx, 1);
                if (player.hp <= 0) {
                    gameOver = true;
                    document.getElementById('game-over').classList.remove('hidden');
                }
            }
        });
    });

    player.bullets.forEach((b, bIdx) => {
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;

        enemies.forEach((en, eIdx) => {
            if (Math.hypot(b.x - en.x, b.y - en.y) < 25) {
                en.hp -= 34;
                player.bullets.splice(bIdx, 1);
                createExplosion(b.x, b.y, "#fff", 5);
                if (en.hp <= 0) {
                    createExplosion(en.x, en.y, "#ff4400", 25);
                    enemies.splice(eIdx, 1);
                    score += 10;
                    scoreText.innerText = score.toString().padStart(3, '0');
                }
            }
        });
    });

    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    player.draw();
    player.bullets.forEach(b => {
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
    });

    enemies.forEach(en => {
        en.draw();
        en.bullets.forEach(eb => {
            ctx.fillStyle = "#ff0000";
            ctx.beginPath(); ctx.arc(eb.x, eb.y, 4, 0, Math.PI*2); ctx.fill();
        });
    });

    requestAnimationFrame(() => {
        updateGame();
        draw();
    });
}

draw();
