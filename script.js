const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bulletCounter = document.getElementById('bulletCount');

// Ekran boyutlarını ayarla
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Oyun Değişkenleri
const keys = {};
const mouse = { x: 0, y: 0 };
let particles = [];
let screenShake = 0;

// Tank Nesnesi (Fizik odaklı)
const tank = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    bodyAngle: 0,
    turretAngle: 0,
    speed: 0,
    maxSpeed: 4,
    accel: 0.15,
    friction: 0.08,
    rotateSpeed: 0.05,
    bullets: []
};

// Girdileri Yakala
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Ateş Etme Olayı
window.addEventListener('mousedown', () => {
    tank.bullets.push({
        x: tank.x + Math.cos(tank.turretAngle) * 35,
        y: tank.y + Math.sin(tank.turretAngle) * 35,
        angle: tank.turretAngle,
        speed: 12,
        bounces: 0,
        maxBounces: 2
    });
    
    screenShake = 7; // Ateş sarsıntısı
    spawnParticles(tank.x + Math.cos(tank.turretAngle) * 35, tank.y + Math.sin(tank.turretAngle) * 35, '#ff8800', 8);
});

// Parçacık Sistemi (Patlama efektleri için)
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: color
        });
    }
}

function update() {
    // 1. Tank Hareket ve Sürtünme
    if (keys['w']) tank.speed = Math.min(tank.speed + tank.accel, tank.maxSpeed);
    else if (keys['s']) tank.speed = Math.max(tank.speed - tank.accel, -tank.maxSpeed / 2);
    else {
        tank.speed *= (1 - tank.friction);
        if (Math.abs(tank.speed) < 0.1) tank.speed = 0;
    }

    if (keys['a']) tank.bodyAngle -= tank.rotateSpeed;
    if (keys['d']) tank.bodyAngle += tank.rotateSpeed;

    tank.x += Math.cos(tank.bodyAngle) * tank.speed;
    tank.y += Math.sin(tank.bodyAngle) * tank.speed;

    // 2. Kule Dönüşü (Mouse takibi)
    tank.turretAngle = Math.atan2(mouse.y - tank.y, mouse.x - tank.x);

    // 3. Mermi Fiziği ve Sekme
    tank.bullets.forEach((b, index) => {
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;

        // Duvarlardan sekme
        if (b.x < 0 || b.x > canvas.width) {
            b.angle = Math.PI - b.angle;
            b.bounces++;
            spawnParticles(b.x, b.y, '#fff', 5);
        }
        if (b.y < 0 || b.y > canvas.height) {
            b.angle = -b.angle;
            b.bounces++;
            spawnParticles(b.x, b.y, '#fff', 5);
        }

        if (b.bounces > b.maxBounces) {
            spawnParticles(b.x, b.y, '#ff4400', 12);
            tank.bullets.splice(index, 1);
        }
    });

    // 4. Parçacık Ömrü
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    });

    if (screenShake > 0) screenShake *= 0.9;
    bulletCounter.innerText = tank.bullets.length;
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Ekran Sallanması Uygula
    if (screenShake > 0.5) {
        ctx.translate(Math.random() * screenShake, Math.random() * screenShake);
    }

    // Partikülleri Çiz
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Mermileri Çiz
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffff00';
    tank.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Tank Gövdesi
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.bodyAngle);
    ctx.fillStyle = '#4a5d23'; // Yeşil
    ctx.fillRect(-25, -20, 50, 40);
    ctx.fillStyle = '#333'; // Paletler
    ctx.fillRect(-28, -22, 56, 8);
    ctx.fillRect(-28, 14, 56, 8);
    ctx.restore();

    // Tank Kulesi (Bağımsız)
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.turretAngle);
    ctx.fillStyle = '#5d752d';
    ctx.fillRect(-12, -12, 24, 24);
    ctx.fillStyle = '#111';
    ctx.fillRect(12, -4, 28, 8); // Namlu
    ctx.restore();

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
