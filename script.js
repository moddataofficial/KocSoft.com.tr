const words = ["JAVASCRIPT", "TEKNOLOJI", "YAZILIM", "PROGRAMLAMA", "KLAVYE", "EKRAN", "KODLAMA"];
let selectedWord = "";
let guessedLetters = [];
let wrongAttempts = 0;
const maxAttempts = 6;

const wordDisplay = document.getElementById("wordDisplay");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");
const figureParts = document.querySelectorAll(".figure-part");

// Oyunu Başlat
function initGame() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    guessedLetters = [];
    wrongAttempts = 0;
    
    message.textContent = "";
    figureParts.forEach(part => part.style.display = "none");
    
    generateKeyboard();
    updateDisplay();
}

// Klavyeyi Oluştur (Türkçe karakterler dahil)
function generateKeyboard() {
    const letters = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
    keyboard.innerHTML = "";
    letters.split("").forEach(letter => {
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.onclick = () => handleGuess(letter, btn);
        keyboard.appendChild(btn);
    });
}

// Tahmin Kontrolü
function handleGuess(letter, btn) {
    btn.disabled = true;
    if (selectedWord.includes(letter)) {
        guessedLetters.push(letter);
        btn.style.background = "#28a745";
    } else {
        wrongAttempts++;
        btn.style.background = "#dc3545";
        figureParts[wrongAttempts - 1].style.display = "block";
    }
    
    updateDisplay();
    checkGameStatus();
}

// Ekranı Güncelle
function updateDisplay() {
    wordDisplay.textContent = selectedWord
        .split("")
        .map(letter => (guessedLetters.includes(letter) ? letter : "_"))
        .join(" ");
}

// Kazanma/Kaybetme Durumu
function checkGameStatus() {
    if (wrongAttempts === maxAttempts) {
        message.textContent = `Kaybettin! Kelime: ${selectedWord}`;
        message.style.color = "#ff4b2b";
        disableAllButtons();
    } else if (!wordDisplay.textContent.includes("_")) {
        message.textContent = "Tebrikler, Kazandın! 🎉";
        message.style.color = "#00d2ff";
        disableAllButtons();
    }
}

function disableAllButtons() {
    const buttons = document.querySelectorAll(".keyboard button");
    buttons.forEach(btn => btn.disabled = true);
}

resetBtn.addEventListener("click", initGame);

// İlk başlatma
initGame();
