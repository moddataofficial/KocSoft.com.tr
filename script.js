const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hpBar = document.getElementById('hp-bar');
const scoreText = document.getElementById('score-text');
const upgradeMenu = document.getElementById('upgrade-menu');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let lastLevelScore = 0;
let gameOver = false;
let isPaused = false;
let particles = [];
let enemies = [];
const keys = {};
const mouse = { x: 0, y: 0 };

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

// --- TANK SINIFI ---
class Tank {
    constructor(x, y, color, isPlayer = false) {
        this.x = x; this.y = y;
        this.color = color;
        this.isPlayer = isPlayer;
        this.bodyAngle = 0;
        this.turretAngle = 0;
        this.speed = 0;
        this.maxSpeed = isPlayer ? 3.5 : 2;
        this.accel = 0.1;
        this.hp = 100;
        this.bullets = [];
        this.shotMode = 'single'; // 'single' veya 'triple'
        this.lastShot = 0;
    }

    update() {
        if (this.isPlayer) {
            if (keys['w']) this.speed = Math.min(this.speed + this.accel, this.maxSpeed);
            else if (keys['s']) this.speed = Math.max(this.speed - this.accel, -this.maxSpeed / 2);
            else this.speed *= 0.92;

            if (keys['a']) this.bodyAngle -= 0.05;
            if (keys['d']) this.bodyAngle += 0.05;
            this.turretAngle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        } else {
            // Basit Düşman Takibi
            let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            this.bodyAngle = angleToPlayer;
            this.turretAngle = angleToPlayer;
            if (Math.hypot(player.x - this.x, player.y - this.y) > 200) {
                this.x += Math.cos(this.bodyAngle) * this.speed;
                this.y += Math.sin(this.bodyAngle) * this.speed;
            }
        }
        if(this.isPlayer) {
            this.x += Math.cos(this.bodyAngle) * this.speed;
            this.y += Math.sin(this.bodyAngle) * this.speed;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Gövde
        ctx.save();
        ctx.rotate(this.bodyAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-20, -15, 40, 30);
        ctx.fillStyle = "#333";
        ctx.fillRect(-22, -18, 44, 6); ctx.fillRect(-22, 12, 44, 6);
        ctx.restore();
        // Kule
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-12, -12, 24, 24);
        ctx.fillStyle = "#111";
        ctx.fillRect(10, -4, 25, 8);
        ctx.restore();
    }
}

const player = new Tank(canvas.width / 2, canvas.height / 2, "#4a5d23", true);

// --- GELİŞTİRME SİSTEMİ (TIKLANINCA ÇALIŞAN KISIM) ---
window.applyUpgrade = function(type) {
    if (type === 'multi') {
        player.shotMode = 'triple';
    } else if (type === 'speed') {
        player.maxSpeed += 2.5;
        player.accel += 0.1;
    } else if (type === 'armor') {
        player.hp = 100;
        hpBar.style.width = "100%";
    }
    
    isPaused = false;
    upgradeMenu.classList.add('hidden');
    lastLevelScore = score; // Bir sonraki seviye için sınırı güncelle
};

window.addEventListener('mousedown', () => {
    if (isPaused || gameOver) return;
    const now = Date.now();
    if (now - player.lastShot > 400) {
        fireBullets(player);
        player.lastShot = now;
    }
});

function fireBullets(t) {
    const angles = t.shotMode === 'triple' ? [-0.2, 0, 0.2] : [0];
    angles.forEach(offset => {
        t.bullets.push({
            x: t.x + Math.cos(t.turretAngle) * 35,
            y: t.y + Math.sin(t.turretAngle) * 35,
            angle: t.turretAngle + offset,
            speed: 10
        });
    });
}

function spawnEnemy() {
    if (enemies.length < 3 + Math.floor(score/50)) {
        enemies.push(new Tank(Math.random()*canvas.width, -50, "#7a2323"));
    }
}

function loop() {
    if (isPaused || gameOver) {
        requestAnimationFrame(loop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();

    spawnEnemy();

    // Mermi Kontrolleri
    player.bullets.forEach((b, bIdx) => {
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        ctx.fillStyle = "yellow";
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();

        enemies.forEach((en, eIdx) => {
            if (Math.hypot(b.x - en.x, b.y - en.y) < 25) {
                en.hp -= 50;
                player.bullets.splice(bIdx, 1);
                if (en.hp <= 0) {
                    enemies.splice(eIdx, 1);
                    score += 25;
                    scoreText.innerText = score;
                    // Her 100 puanda geliştirme menüsü açılır
                    if (score - lastLevelScore >= 100) {
                        isPaused = true;
                        upgradeMenu.classList.remove('hidden');
                    }
                }
            }
        });
    });

    enemies.forEach((en, eIdx) => {
        en.update();
        en.draw();
        // Düşman oyuncuya çarparsa
        if (Math.hypot(en.x - player.x, en.y - player.y) < 40) {
            player.hp -= 0.5;
            hpBar.style.width = player.hp + "%";
            if (player.hp <= 0) gameOver = true;
        }
    });

    requestAnimationFrame(loop);
}

loop();
