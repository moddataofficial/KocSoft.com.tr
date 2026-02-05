// Canvas elementini ve 2D render context'ini al
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun ayarları
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// HTML element referansları
const playerHealthDisplay = document.getElementById('playerHealth');
const scoreDisplay = document.getElementById('scoreDisplay');
const startGameBtn = document.getElementById('startGameBtn');

// Oyun durumu değişkenleri
let gameRunning = false;
let score = 0;
let playerHealth = 100;

// Klavye tuşları durumu
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false // Ateş etmek için
};

// Fare durumu
const mouse = {
    x: 0,
    y: 0,
    clicked: false
};

// --- Oyun Nesneleri (Objeler) ---
// Oyuncu tankı
const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    size: 40,
    speed: 3,
    angle: 0, // Radyan cinsinden
    color: 'green',
    turretColor: 'darkgreen',
    fireCooldown: 0, // Atış bekleme süresi
    maxFireCooldown: 20 // Atışlar arası frame sayısı
};

const bullets = []; // Mermi dizisi
const enemies = []; // Düşman tankları dizisi
const explosions = []; // Patlama efektleri

// --- Event Listeners (Olay Dinleyicileri) ---
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    // Canvas'ın sayfadaki konumunu hesaba kat
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Sol tık
        mouse.clicked = true;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        mouse.clicked = false;
    }
});

startGameBtn.addEventListener('click', () => {
    if (!gameRunning) {
        resetGame(); // Oyunu sıfırla
        startGameBtn.style.display = 'none'; // Butonu gizle
        gameRunning = true;
        gameLoop(); // Oyun döngüsünü başlat
    }
});

// --- Yardımcı Fonksiyonlar ---
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Oyun Döngüsü ve Başlangıç ---
function resetGame() {
    score = 0;
    playerHealth = 100;
    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT / 2;
    player.angle = 0;
    player.fireCooldown = 0;
    bullets.length = 0; // Diziyi sıfırla
    enemies.length = 0; // Diziyi sıfırla
    explosions.length = 0; // Diziyi sıfırla
    playerHealthDisplay.textContent = `Can: ${playerHealth}`;
    scoreDisplay.textContent = `Skor: ${score}`;
    spawnEnemy(); // İlk düşmanı oluştur
}
