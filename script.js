const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hpBar = document.getElementById('hp-bar');
const scoreText = document.getElementById('score-text');
const upgradeMenu = document.getElementById('upgrade-menu');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let level = 1;
let gameOver = false;
let isPaused = false;
let particles = [];
let enemies = [];
let walls = [];
const keys = {};
const mouse = { x: 0, y: 0 };

// --- DUVAR SİSTEMİ ---
function createMap() {
    for(let i=0; i<8; i++) {
        walls.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            w: 60, h: 60, hp: 100
        });
    }
}
createMap();

// --- TANK SINIFI ---
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
        this.shotMode = 1; // 1: Tekli, 3: Üçlü Atış
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Gölge ve Gövde (Önceki çizim kodlarınla aynı, daha temiz görünüm)
        ctx.save();
        ctx.rotate(this.bodyAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-20, -15, 40, 30);
        ctx.fillStyle = "#222";
        ctx.fillRect(-22, -18, 44, 6);
        ctx.fillRect(-22, 12, 44, 6);
        ctx.restore();

        ctx.rotate(this.turretAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-12, -12, 24, 24);
        ctx.fillStyle = "#111";
        ctx.fillRect(10, -4, 25, 8);
        ctx.restore();
    }
}

const player = new Tank(canvas.width / 2, canvas.height / 2, "#4a5d23", true);

// --- GELİŞTİRME FONKSİYONU ---
window.upgrade = function(type) {
    if(type === 'multi') player.shotMode = 3;
    if(type === 'speed') player.maxSpeed += 2;
    if(type === 'armor') player.hp = 100;
    
    isPaused = false;
    upgradeMenu.classList.add('hidden');
};

function shoot(t) {
    const angles = t.shotMode === 3 ? [-0.2, 0, 0.2] : [0];
    
    angles.forEach(offset => {
        t.bullets.push({
            x: t.x + Math.cos(t.turretAngle) * 35,
            y: t.y + Math.sin(t.turretAngle) * 35,
            angle: t.turretAngle + offset,
            speed: 10
        });
    });
}

// --- ÇARPIŞMA KONTROLÜ ---
function checkWallCollision(obj, nextX, nextY) {
    for(let wall of walls) {
        if(nextX > wall.x && nextX < wall.x + wall.w && nextY > wall.y && nextY < wall.y + wall.h) {
            return true;
        }
    }
    return false;
}

function updateGame() {
    if (gameOver || isPaused) return;

    // Oyuncu Hareketi ve Duvar Kontrolü
    let nextX = player.x + Math.cos(player.bodyAngle) * player.speed;
    let nextY = player.y + Math.sin(player.bodyAngle) * player.speed;
    
    if(!checkWallCollision(player, nextX, nextY)) {
        player.x = nextX;
        player.y = nextY;
    }
    
    // Skor ve Seviye Atlama
    if(score >= level * 50) {
        level++;
        isPaused = true;
        upgradeMenu.classList.remove('hidden');
    }

    // Mermi ve Duvar Etkileşimi
    player.bullets.forEach((b, bIdx) => {
        walls.forEach((wall, wIdx) => {
            if(b.x > wall.x && b.x < wall.x + wall.w && b.y > wall.y && b.y < wall.y + wall.h) {
                wall.hp -= 10;
                player.bullets.splice(bIdx, 1);
                if(wall.hp <= 0) walls.splice(wIdx, 1);
            }
        });
    });

    // (Diğer update ve draw fonksiyonlarını öncekiyle birleştir)
    // ... Düşman takibi ve çizim döngüsü ...
}

// (Önceki kodun geri kalanını buraya ekleyerek çalıştırabilirsin)
