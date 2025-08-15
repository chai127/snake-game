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
let gameInterval;
let gameSpeedDelay = 200;
let food;
const x_snake = Math.floor(gridSize / 2) + 1;
const y_snake = Math.floor(gridSize / 2) + 1;
let snakeBody = [{x: x_snake, y: y_snake}];

let dx = 1; // initial horizontal movement right
let dy = 0;

document.addEventListener("DOMContentLoaded", function () {
    onLoading(); // runs only after DOM and audio setup
});

function onLoading() {
    instructionBox.innerHTML = `
    <div class="instruction">
        <h1>Press Space to Start Game</h1>
        <img src="res/snake-logo-removebg.png" alt="snake logo" id="snake-logo">
    </div>`;
    instructionBox.style.display = "flex"; 
}

function startGame() {
    if(!gameStarted || gamePaused) {
        gameStarted = true;
    }
    // starts from scratch
    playerScore = 0;
    lives = totalLives;
    gameSpeedDelay = 200;
    scoreDiv.textContent = "000";
    clearInterval(gameInterval); 
    gameInterval = setInterval(gameLoop, gameSpeedDelay);
    food = generateFoodCoordinates(); 
    snakeBody = [{ x: x_snake, y: y_snake }];
    draw();
} 

function increaseSpeed(){
    if (gameSpeedDelay > 100) {
        gameSpeedDelay -= 10;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeedDelay);
    }
}
function pauseGame(btn) {
    if (!gameStarted || gamePaused) return;
    btn.textContent = "resume";
    gamePaused = true;
    clearInterval(gameInterval); // stop the game loop
    if (isAudioPlaying(currentMusic)) {
        currentMusic.pause();
        }

    instructionBox.innerHTML = `
      <div class="instruction">
        <h1>Game Paused</h1>
        <h2>Press 'resume' to Resume</h2>
      </div>`;
    instructionBox.style.display = "flex";

    document.getElementById("pause").blur(); // unfocuses
}
function resumeGame(btn) {
    if (!gameStarted || !gamePaused) return;
    btn.textContent = "pause";
    if (!isAudioPlaying(currentMusic) && !isMuted) {
        currentMusic.play();
        }
    gamePaused = false;
    instructionBox.style.display = "none";
    document.getElementById("pause").blur();
    gameInterval = setInterval(gameLoop, gameSpeedDelay);
}
function playSoundEffect(effect) {
    if (window.isMuted) return;

    const sound = window.musicEffects[effect];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.warn("Failed to play sound:", err));
    }
}
function handleBoundary() {
    const head = snakeBody[0];
    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
        loseLife();
    }
    console.log(`Snake head position: x=${head.x}, y=${head.y}`);
}
function handleSelfCollison() {
    const head = snakeBody[0];

    for (let i = 1; i < snakeBody.length; i++) {  
        let part = snakeBody[i];
        if (part.x === head.x && part.y === head.y) {
            loseLife();
            break;
        }
    }
}

// score logic
function updateScore() {
    playerScore++;
    playSoundEffect('score'); 
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
function loseLife()  {
    // console.log("here");
    lives--;
    playSoundEffect('heart');
    if (lives >= 0 && hearts[lives]) {
        hearts[lives].style.display = 'none';
    }

    if (lives <= 0) {
        gameOver();
    } else {
        startRound();
    }

}
// game overr
function startRound() {
    clearInterval(gameInterval);
   
        setTimeout(() => {
            updateHighScore();
            playerScore = 0;
            scoreDiv.textContent = playerScore.toString().padStart(3, '0');
            snakeBody = [{ x: x_snake, y: y_snake }];
            dx = 1;
            dy = 0;
            food = generateFoodCoordinates();

            gameInterval = setInterval(gameLoop, gameSpeedDelay);
        }, 800);
}
function gameOver() {
    gameStarted = false;
    playSoundEffect('gameEnd');
    clearInterval(gameInterval);
        updateHighScore();
        resetOnGameOver(); // clears 

    // update instruction overlay content and show it
    instructionBox.innerHTML = `
    <div class="instruction">
        <h1>GAME OVER</h1>
        <h2>Press Space to Restart</h2>
        <img src="res/snake-logo-removebg.png" alt="snake logo" id="snake-logo">
    </div>`;
    instructionBox.style.display = "flex";
   
}
function resetOnGameOver() {
    lives = totalLives;
    hearts.forEach(heart => heart.style.display = 'inline');
    const gameElements = gameCanvas.querySelectorAll(".snake-body, .snake-food");
    gameElements.forEach(el => el.remove());

    playerScore = 0;
    scoreDiv.textContent = "000";

    snakeBody = [{ x: x_snake, y: y_snake }];

    dx = 1;
    dy = 0;

    food = generateFoodCoordinates();

    clearInterval(gameInterval);
}
// for restart button
function resetWholeGame() {
    clearInterval(gameInterval);
    resetOnGameOver();
    currentHighScore = 0;
    highScoreDiv.textContent = "000";

    gameSpeedDelay = 200;
    gameStarted = false;
    gamePaused = true;
    clearInterval(gameInterval);
   instructionBox.innerHTML = `
        <div class="instruction">
            <h1>Press Space to Start Game</h1>
            <img src="res/snake-logo-removebg.png" alt="snake logo" id="snake-logo">
        </div>`;
    instructionBox.style.display = "flex"; 
}
// all generates
function generateGrid() {
    const gameElements = gameCanvas.querySelectorAll(".snake-body, .snake-food");
    gameElements.forEach(el => el.remove());
    gameCanvas.style.display = "grid";
    gameCanvas.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameCanvas.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
}

// make snake
function makeSnake() {
    if (gameStarted) {
    snakeBody.forEach((block, index) => {
        const snake = document.createElement('div');
        snake.className = "snake-body";
        snake.id = "snake-body";

        if (index === 0) {
            snake.classList.add("snake-head");
        }

        snake.style.gridColumn = block.x;
        snake.style.gridRow = block.y;

        gameCanvas.appendChild(snake);
    });
    }
}

// make food
function makeFood() {
    const existingFood = document.querySelector(".snake-food");
    if (existingFood) existingFood.remove();
    const foodElem = document.createElement("div");  
    foodElem.className = "snake-food";
    foodElem.style.gridColumn = food.x;  
    foodElem.style.gridRow = food.y;
    gameCanvas.appendChild(foodElem);
}

// make food coordinates
function generateFoodCoordinates() {
    let x, y;
    let isOnSnake;

    do {
        x = Math.floor(Math.random() * gridSize) + 1;
        y = Math.floor(Math.random() * gridSize) + 1;

        // this is really impoertantt!!!!!!! some() method -->   array.some(callback(element, index, array), thisArg);
        isOnSnake = snakeBody.some(segment => segment.x === x && segment.y === y);

    } while (isOnSnake);

    return { x, y };
}

// draw all on canvas
function draw(){
    hearts.forEach((heart, index) => {
        heart.style.display = index < lives ? 'inline' : 'none';
    });
    generateGrid();
    makeSnake();
    makeFood();
}

// moving snake
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

    switch (event.key) {
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
        default:
            return;
    }

    event.preventDefault();

}

function move() {
    const newHead = {
        x: snakeBody[0].x + dx,
        y: snakeBody[0].y + dy
    };

    const newSnake = [newHead, ...snakeBody];

    // if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
        updateScore();
        food = generateFoodCoordinates();
    } else {
        newSnake.pop(); // no growth
    }

    snakeBody = newSnake;
}

// game loop 
function gameLoop() {
    move();
    handleBoundary();
    handleSelfCollison();
    draw();
}