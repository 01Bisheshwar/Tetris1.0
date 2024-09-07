//Retry

function retryGame() {
    // Reset game variables
    score = 0;
    elapsedTime = 0;
    gameOver = false;
    grid = createGrid(rows, cols); // Recreate the grid

    // Hide the retry button
    document.getElementById('retryButton').style.display = 'none';

    // Restart the game
    playBackgroundMusic();
    startGame();
}


//Music

let isPaused = false;

function toggleSidePanel() {
    const panel = document.querySelector('.side-panel');
    const button = document.querySelector('.open-panel-btn');

    if (panel.style.transform === 'translateX(0%)') {
        panel.style.transform = 'translateX(100%)';
        button.style.display = 'block'; // Show button when panel is closed
    } else {
        panel.style.transform = 'translateX(0%)';
        button.style.display = 'none'; // Hide button when panel is open
    }
}

function playMusic() {
    backgroundMusic.play();
    isPaused = false;
}

function pauseMusic() {
    backgroundMusic.pause();
    isPaused = true;
}

function setVolume(volume) {
    backgroundMusic.volume = volume;
}

// Function to play background music
function playBackgroundMusic() {
    if(isPaused)
        return;
    const music = document.getElementById('backgroundMusic');
    if (music) {
        music.play().catch(error => {
            // Handle any errors that occur during playback
            console.error('Error playing background music:', error);
        });
    }
}

//Time script

let startTime;
let elapsedTime = 0; // Time in seconds
let timerInterval;


//Score script
let score = 0;


//Speed

let factor = 1;
let speed = 500; // Initial speed (milliseconds)
let speedIncreaseInterval = 10000; // Time (milliseconds) after which speed increases

//Game script

let rows,cols,blockSize;

// Tetromino shapes (I, J, L, O, S, T, Z)
const tetrominoes = [
    [[1, 1, 1, 1]],  // I
    [[1, 0, 0], [1, 1, 1]],  // J
    [[0, 0, 1], [1, 1, 1]],  // L
    [[1, 1], [1, 1]],  // O
    [[0, 1, 1], [1, 1, 0]],  // S
    [[0, 1, 0], [1, 1, 1]],  // T
    [[1, 1, 0], [0, 1, 1]]   // Z
];

// Colors for tetrominoes
const colors = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];

let grid;
let currentTetromino;
let currentColor;
let currentX, currentY;
let gameOver = false;

function updateTimer() {
    const currentTime = new Date().getTime();
    elapsedTime = Math.floor((currentTime - startTime) / 1000); // Time in seconds
    
    // Update the display (You can use an HTML element or draw it on canvas)
    document.getElementById("timerDisplay").textContent = `${elapsedTime} sec`;
}


function calculateGridSize() {
    console.log(myGameArea.canvas.width);
    console.log(myGameArea.canvas.height);
    const canvasWidth = Math.max(myGameArea.canvas.width,myGameArea.canvas.height);
    const canvasHeight = Math.min(myGameArea.canvas.width,myGameArea.canvas.height);
    factor = canvasHeight / 20;
    blockSize = canvasHeight / 20;
    rows = 20;
    cols = canvasWidth/factor;
}

// Recalculate block size and grid dimensions on window resize
window.addEventListener('resize', function() {
    playBackgroundMusic();
    calculateGridSize();
    grid = createGrid(rows, cols); // Re-create grid with new dimensions
    startTime = new Date().getTime(); // Current time in milliseconds
    timerInterval = setInterval(updateTimer, 1000);
    myGameArea.clear();
    drawGrid();
    drawTetromino();
});

function startGame() {
    playBackgroundMusic();
    calculateGridSize(); // Dynamically calculate grid dimensions
    grid = createGrid(rows, cols); // Initialize the grid
    spawnTetromino(); // Spawn the first Tetromino
    startTime = new Date().getTime(); // Current time in milliseconds
    timerInterval = setInterval(updateTimer, 1000);
    myGameArea.start();
    setInterval(increaseSpeed, speedIncreaseInterval); // Increase speed periodically
}

function increaseSpeed() {
    speed = Math.max(350, speed - 2); // Decrease the interval by 50ms, but not below 100ms
    clearInterval(myGameArea.interval);
    myGameArea.interval = setInterval(updateGameArea, speed);
}

function spawnTetromino() {
    const randomshape = Math.floor(Math.random() * tetrominoes.length);
    const randomcolor = Math.floor(Math.random() * colors.length);
    currentTetromino = tetrominoes[randomshape];
    currentColor = colors[randomcolor];  // Assign color based on tetromino
    currentX = Math.floor(cols / 2) - Math.floor(currentTetromino[0].length / 2);
    currentY = 0;

    // Check if the new tetromino immediately collides (Game Over)
    if (collisionDetection(0, 0)) {
        gameOver = true;
        clearInterval(myGameArea.interval);  // Stop the game
        clearInterval(timerInterval); // Stop the timer
        alert(`Game Over! Your score was ${score} and your time was ${elapsedTime} seconds.`);
        score = 0;
        document.getElementById("score").textContent = `${score}`;
        speed = 500;
        document.getElementById('retryButton').style.display = 'block';
    }
}

function createGrid(rows, cols) {
    // Initialize a 2D array with zeros
    let grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = 0; // 0 indicates an empty cell
        }
    }
    return grid;
}

var myGameArea = {
    canvas: document.getElementById("tetrisCanvas"),
    start: function () {
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 500); // Move tetromino down every 500ms
        window.addEventListener('keydown', function (e) {
            myGameArea.key = e.keyCode;
            handleKeyPress();
        });
        window.addEventListener('keyup', function (e) {
            myGameArea.key = false;
        });
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};


function handleKeyPress() {
    if (myGameArea.key == 37) { moveTetromino(-1, 0); }  // Left arrow
    if (myGameArea.key == 39) { moveTetromino(1, 0); }   // Right arrow
    if (myGameArea.key == 40) { moveTetromino(0, 1); }   // Down arrow
    if (myGameArea.key == 38) { rotateTetromino(); }     // Up arrow (rotate)
}

function moveTetromino(deltaX, deltaY) {
    if (!collisionDetection(deltaX, deltaY)) {
        currentX += deltaX;
        currentY += deltaY;
    } else if (deltaY === 1) { // Tetromino hit the bottom or another block
        lockTetromino();       // Lock the tetromino in place
        clearFullRows();       // Clear any full rows
        spawnTetromino();      // Spawn the next tetromino
    }
}

function rotateTetromino() {
    const rotatedTetromino = currentTetromino[0].map((_, index) =>
        currentTetromino.map(row => row[index])
    ).reverse();

    // Temporarily update currentTetromino for collision detection
    const previousTetromino = currentTetromino;
    currentTetromino = rotatedTetromino;

    if (!collisionDetection(0, 0)) {
        // If no collision, accept the rotation
        return;
    }

    // Revert to the previous tetromino if rotation is not possible
    currentTetromino = previousTetromino;
}

function updateGameArea() {
    if (gameOver) return;

    myGameArea.clear();
    drawGrid();
    drawTetromino();

    // Move tetromino down automatically
    moveTetromino(0, 1);
}

function moveleft() {
    moveTetromino(-1, 0);  // Move the tetromino left
}

function moveright() {
    moveTetromino(1, 0);  // Move the tetromino right
}

function movedown() {
    moveTetromino(0, 1);  // Move the tetromino right
}

function moveup() {
    rotateTetromino();  // Rotate the tetromino
}

function clearmove() {
    myGameArea.key = false;  // Clear the key state
}

// Optional for touch events if you want to simulate button releases
document.addEventListener('touchend', clearmove);


function drawGrid() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== 0) {
                drawBlock(c, r, colors[grid[r][c] - 1]);
            }
        }
    }
}

function drawTetromino() {
    for (let r = 0; r < currentTetromino.length; r++) {
        for (let c = 0; c < currentTetromino[r].length; c++) {
            if (currentTetromino[r][c] !== 0) {
                drawBlock(currentX + c, currentY + r, currentColor);
            }
        }
    }
}


function drawBlock(x, y, color) {
    const ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function collisionDetection(deltaX, deltaY, newTetromino = currentTetromino) {
    for (let r = 0; r < newTetromino.length; r++) {
        for (let c = 0; c < newTetromino[r].length; c++) {
            if (newTetromino[r][c] !== 0) {
                let newX = currentX + c + deltaX;
                let newY = currentY + r + deltaY;

                // Check boundaries and grid collisions
                if (newX < 0 || newX >= cols || newY >= rows || (newY >= 0 && grid[newY][newX] !== 0)) {
                    return true; // Collision detected
                }
            }
        }
    }
    return false;
}


// Lock the tetromino in place on the grid
function lockTetromino() {
    for (let r = 0; r < currentTetromino.length; r++) {
        for (let c = 0; c < currentTetromino[r].length; c++) {
            if (currentTetromino[r][c] != 0) {
                grid[currentY + r][currentX + c] = colors.indexOf(currentColor) + 1;
            }
        }
    }
}

// Clear any full rows and move the rows above down
function clearFullRows() {
    for (let r = rows - 1; r >= 0; r--) {
        // Check if the row is fully filled (all blocks are non-zero)
        if (grid[r].every(cell => cell !== 0)) {
            // If the row is fully filled, clear the row

            score+=10;
            document.getElementById("score").textContent = `${score}`;
            grid.splice(r, 1);  // Remove the row
            grid.unshift(new Array(cols).fill(0));  // Add a new empty row at the top
        }
    }
}

window.onload = function() {
    startGame();
};