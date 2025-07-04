const instructionBox = document.getElementById("instruction-overlay");
const gameCanvas = document.getElementById("canvas");
const scoreDiv = document.getElementById("score");
const highScoreDiv = document.getElementById("highScore");
const hearts = document.querySelectorAll(".icons");

const gridSize = 20;
const totalLives = 3;
let lives = totalLives;
let playerScore = 0;
let currentHighScore = 0;
let gameStarted = false;
let gamePaused = false;

const x_snake = Math.floor(gridSize / 2) + 1;
const y_snake = Math.floor(gridSize / 2) + 1;
let x_x = x_snake;
let y_y = y_snake;
let food = null;

let gameInterval;
let gameSpeedDelay = 200;

let dx = 1; // initial horizontal movement right
let dy = 0;

document.addEventListener("DOMContentLoaded", function () {
    onLoading(); // now runs only after DOM and audio setup
});

function onLoading() {
// In onLoading()
instructionBox.innerHTML = `
  <div class="instruction">
    <h1>Press Space to Start Game</h1>
    <img src="res/snake-logo-removebg.png" alt="snake logo" id="snake-logo">
  </div>`;
instructionBox.style.display = "flex";

   
}

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    if (event.code === 'Space' && !gameStarted) {
        event.preventDefault();
      if (!isAudioPlaying(currentMusic)) {
  playMusic(currentMusic);
}
        instructionBox.style.display = "none";
        startGame();
        return;
    }

    if (!gameStarted) return;

    const snakeBody = document.getElementById("snake-body");

    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            // y_y--;
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            event.preventDefault();
            if (dy !== -1) { dx = 0; dy = 1; }
            // y_y++;
            break;
        case 'ArrowLeft':
            event.preventDefault();
            if (dx !== 1) { dx = -1; dy = 0; }
            // x_x--;
            break;
        case 'ArrowRight':
            event.preventDefault();
            if (dx !== -1) { dx = 1; dy = 0; }
            // x_x++;
            break;
        default:
            return;
    }

    snakeBody.style.gridColumn = x_x;
    snakeBody.style.gridRow = y_y;

    handleBoundary();
    ifFoodAte();
}

function generateGrid() {
   const gameElements = gameCanvas.querySelectorAll(".snake-body, .snake-food");
gameElements.forEach(el => el.remove());
    gameCanvas.style.display = "grid";
    gameCanvas.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameCanvas.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
}

function startGame() {
    lives = totalLives;
    playerScore = 0;
    scoreDiv.textContent = "000";
    gameStarted = true;
    x_x = x_snake;
    y_y = y_snake;
    draw();

    gameSpeedDelay = 200; // 🔥 Reset speed here
    clearInterval(gameInterval); // Just in case

    //move snanke automatically, 
    // const intervalId = setInterval(functionToRun, delayInMilliseconds);
     gameInterval = setInterval(gameLoop, gameSpeedDelay);
   
}

function draw(){ 
    instructionBox.style.display = "none";
    hearts.forEach(heart => heart.style.display = 'inline');
    generateGrid();
    generateSnake();
    food = generateFood();
    // updateScore();
}

function generateSnake() {
    const snake = document.createElement("div");
    snake.className = "snake-body";
    snake.id = "snake-body";
    snake.style.gridColumn = x_snake;
    snake.style.gridRow = y_snake;
    gameCanvas.appendChild(snake);
}

function generateFood() {
    const existingFood = document.querySelector(".snake-food");
    if (existingFood) existingFood.remove();

    const x = Math.floor(Math.random() * gridSize) + 1;
    const y = Math.floor(Math.random() * gridSize) + 1;

    const food = document.createElement("div");
    food.className = "snake-food";
    food.style.gridColumn = x;
    food.style.gridRow = y;
    gameCanvas.appendChild(food);
    return { x, y };
}

function ifFoodAte() {
    if (food && food.x === x_x && food.y === y_y) {
        food = generateFood();
        updateScore();
         
    }
}

function updateScore() {
    playSoundEffect('score'); 
    playerScore++;
    scoreDiv.textContent = playerScore.toString().padStart(3, '0');
    if (playerScore % 5 === 0) {
        increaseSpeed();
    }
}

function updateHighScore() {
    if (playerScore > currentHighScore) {
    playSoundEffect('highScore'); 
        currentHighScore = playerScore;
        highScoreDiv.textContent = playerScore.toString().padStart(3, '0');
    }
}

function handleBoundary() {
    if (x_x < 1 || x_x > gridSize || y_y < 1 || y_y > gridSize) {
        loseLife();
    }
}

function loseLife() {
    lives--;
    playSoundEffect('heart');
    if (lives > 0) {
        hearts[lives].style.display = 'none';
    }

    if (lives <= 0) {
        gameOver();
    } else {
        restartRound();
    }
}

function restartRound() {
    updateHighScore();
    playerScore = 0;
    scoreDiv.textContent = "000";

    x_x = x_snake;
    y_y = y_snake;

    const snakeBody = document.getElementById("snake-body");
    if (snakeBody) {
        snakeBody.style.gridColumn = x_snake;
        snakeBody.style.gridRow = y_snake;
    }
}

function gameOver() {
 gameStarted = false;
 playSoundEffect('gameEnd');
    updateHighScore();
    resetstuff(); // Clears snake and food only

    // Update instruction overlay content and show it
instructionBox.innerHTML = `
  <div class="instruction">
    <h1>GAME OVER</h1>
    <h2>Press Space to Restart</h2>
    <img src="res/snake-logo-removebg.png" alt="snake logo" id="snake-logo">
  </div>`;
instructionBox.style.display = "flex";
   
}

function resetstuff(){
    // Reset lives and score, but do not restart game yet
    lives = totalLives;
    playerScore = 0;
    scoreDiv.textContent = "000";
    // updateHighScore();
    hearts.forEach(heart => heart.style.display = 'inline');

    // Remove only game elements, NOT the instruction overlay
    const snake = document.getElementById("snake-body");
    const foodEl = document.querySelector(".snake-food");

    if (snake) snake.remove();
    if (foodEl) foodEl.remove();
    
}

function gameLoop() {
    const snakeBody = document.getElementById("snake-body");
    if (!snakeBody) return;

    x_x += dx;
    y_y += dy;

    snakeBody.style.gridColumn = x_x;
    snakeBody.style.gridRow = y_y;

    handleBoundary();
    ifFoodAte();
}

//manage the speed of the moving snake

function increaseSpeed(){
 if (gameSpeedDelay > 100) {
        gameSpeedDelay -= 10;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeedDelay);
    }
}

//pause game
function pauseGame(btn) {
    if (!gameStarted || gamePaused) return;
    btn.textContent = "resume";
    gamePaused = true;
    clearInterval(gameInterval); // Stop the game loop

    instructionBox.innerHTML = `
      <div class="instruction">
        <h1>Game Paused</h1>
        <h2>Press 'resume' to Resume</h2>
      </div>`;
    instructionBox.style.display = "flex";

}

function resumeGame(btn) {
    if (!gameStarted || !gamePaused) return;
    btn.textContent = "pause";
    gamePaused = false;
    instructionBox.style.display = "none";
    gameInterval = setInterval(gameLoop, gameSpeedDelay);
}


//like reset highscore and like the whole game, including the theme
function resetWholeGame() {
    currentHighScore = 0;
    scoreDiv.textContent = "000";
    highScoreDiv.textContent =  "000";

    startGame();
}

//add modes? like noob, easy, kachaow and idk pro? for speed

//theme stuff, make it dynamic cause im done with the style sheet rn its perfect as it is(im too scared to change any shit)

//increase snake body
//Collision check with self is missing
// No clear handling when food spawns on snake (after implementing body growth)

function playSoundEffect(effect) {
    if (window.isMuted) return;

    const sound = window.musicEffects[effect];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.warn("Failed to play sound:", err));
    }
}


