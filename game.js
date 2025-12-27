// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Game state
let gameRunning = true;
let keys = {};
let thrownCount = 0;

// Player properties
let player = {
    x: 100,
    y: CANVAS_HEIGHT / 2,
    width: 50,
    height: 80,
    speed: 3,
    facing: 'right',
    walkCycle: 0,
    isMoving: false,
    isThrowing: false,
    throwTimer: 0
};

// Throwable object
let throwableObject = null;

// Cliff properties
const CLIFF_EDGE = CANVAS_WIDTH - 150;

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    render();

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Handle player movement
    const wasMoving = player.isMoving;
    player.isMoving = false;

    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
        player.facing = 'left';
        player.isMoving = true;
    }
    if (keys['ArrowRight'] && player.x < CLIFF_EDGE - player.width) {
        player.x += player.speed;
        player.facing = 'right';
        player.isMoving = true;
    }

    // Update walk cycle
    if (player.isMoving) {
        player.walkCycle += 0.2;
        if (player.walkCycle > Math.PI * 2) player.walkCycle = 0;
    } else {
        player.walkCycle = 0;
    }

    // Update throwing animation
    if (player.isThrowing) {
        player.throwTimer--;
        if (player.throwTimer <= 0) {
            player.isThrowing = false;
        }
    }

    // Handle throwing
    if (keys[' '] && throwableObject && player.x >= CLIFF_EDGE - player.width && !player.isThrowing) {
        throwObject();
    }

    // Update throwable object physics
    if (throwableObject) {
        updateThrowableObject();
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground and cliff
    drawEnvironment();

    // Draw player
    drawPlayer();

    // Draw throwable object
    if (throwableObject) {
        drawThrowableObject();
    }
}

// Draw environment
function drawEnvironment() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.7, '#98FB98');
    skyGradient.addColorStop(1, '#D2B48C');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Mountains in background
    ctx.fillStyle = '#708090';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 200);
    ctx.lineTo(150, CANVAS_HEIGHT - 300);
    ctx.lineTo(300, CANVAS_HEIGHT - 250);
    ctx.lineTo(450, CANVAS_HEIGHT - 280);
    ctx.lineTo(600, CANVAS_HEIGHT - 200);
    ctx.closePath();
    ctx.fill();

    // Ground (positioned at character's feet level)
    const groundY = player.y + player.height;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, CANVAS_HEIGHT - groundY);

    // Grass on ground
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < CLIFF_EDGE; i += 10) {
        const height = Math.random() * 5 + 5;
        ctx.fillRect(i, groundY, 8, -height);
    }

    // Cliff face - solid black box
    ctx.fillStyle = '#000000';
    ctx.fillRect(CLIFF_EDGE, groundY, CANVAS_WIDTH - CLIFF_EDGE, CANVAS_HEIGHT - groundY);

    // Warning sign near cliff edge
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(CLIFF_EDGE - 30, groundY + 20, 25, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText('!', CLIFF_EDGE - 20, groundY + 40);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(130, 80, 35, 0, Math.PI * 2);
    ctx.arc(160, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(400, 60, 25, 0, Math.PI * 2);
    ctx.arc(425, 60, 30, 0, Math.PI * 2);
    ctx.arc(450, 60, 25, 0, Math.PI * 2);
    ctx.fill();
}

// Draw player (Kazuya Mishima style)
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const width = player.width;
    const height = player.height;

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 2, y + height, width, 5);

    // White gi top
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 5, y + 20, width - 10, height - 40);

    // Black belt
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y + 35, width, 8);

    // Gi sleeves
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y + 20, 8, 15);
    ctx.fillRect(x + width - 8, y + 20, 8, 15);

    // Pants
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 8, y + 43, width - 16, height - 43);

    // Legs (walking animation)
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 6;
    const legOffset = Math.sin(player.walkCycle) * 5;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(x + 15, y + height - 10);
    ctx.lineTo(x + 15 + legOffset, y + height);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(x + width - 15, y + height - 10);
    ctx.lineTo(x + width - 15 - legOffset, y + height);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#FDBCB4'; // Skin color
    ctx.beginPath();
    ctx.arc(x + width/2, y + 12, 12, 0, Math.PI * 2);
    ctx.fill();

    // Spiky black hair (Kazuya style)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x + width/2 - 10, y + 5);
    ctx.lineTo(x + width/2 - 8, y - 2);
    ctx.lineTo(x + width/2 - 3, y + 2);
    ctx.lineTo(x + width/2, y - 5);
    ctx.lineTo(x + width/2 + 3, y + 2);
    ctx.lineTo(x + width/2 + 8, y - 2);
    ctx.lineTo(x + width/2 + 10, y + 5);
    ctx.closePath();
    ctx.fill();

    // Eyes (intense stare)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + width/2 - 6, y + 8, 3, 4); // Left eye
    ctx.fillRect(x + width/2 + 3, y + 8, 3, 4); // Right eye

    // Eyebrows (angry expression)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + width/2 - 8, y + 5);
    ctx.lineTo(x + width/2 - 3, y + 7);
    ctx.moveTo(x + width/2 + 3, y + 7);
    ctx.lineTo(x + width/2 + 8, y + 5);
    ctx.stroke();

    // Mouth (stern)
    ctx.beginPath();
    ctx.arc(x + width/2, y + 18, 2, 0, Math.PI);
    ctx.fill();

    // Arms in fighting stance or throwing pose
    ctx.strokeStyle = '#FDBCB4';
    ctx.lineWidth = 4;

    if (player.isThrowing) {
        // Throwing pose - arms extended forward
        const throwDirection = player.facing === 'right' ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x + width/2, y + 35);
        ctx.lineTo(x + width/2 + throwDirection * 30, y + 25);
        ctx.stroke();
        // One arm back
        ctx.beginPath();
        ctx.moveTo(x + width/2, y + 35);
        ctx.lineTo(x + width/2 - throwDirection * 15, y + 40);
        ctx.stroke();
    } else {
        // Normal fighting stance
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 35);
        ctx.lineTo(x - 5, y + 25);
        ctx.moveTo(x + width - 8, y + 35);
        ctx.lineTo(x + width + 5, y + 25);
        ctx.stroke();
    }

    // Hands (fists)
    ctx.fillStyle = '#FDBCB4';
    ctx.fillRect(x - 8, y + 20, 6, 8);
    ctx.fillRect(x + width + 2, y + 20, 6, 8);
}

// Draw throwable object (placeholder)
function drawThrowableObject() {
    if (throwableObject.image) {
        ctx.drawImage(throwableObject.image, throwableObject.x, throwableObject.y, throwableObject.width, throwableObject.height);
    } else {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(throwableObject.x, throwableObject.y, throwableObject.width, throwableObject.height);
    }
}

// Update throwable object physics
function updateThrowableObject() {
    if (throwableObject.thrown) {
        throwableObject.velocityY += 0.5; // Gravity
        throwableObject.y += throwableObject.velocityY;
        throwableObject.x += throwableObject.velocityX;

        // Check if object is off screen
        if (throwableObject.y > CANVAS_HEIGHT + 100) {
            throwableObject = null;
        }
    } else {
        // Keep object positioned with player when not thrown
        throwableObject.x = player.x + player.width / 2 - 25;
        throwableObject.y = player.y - 50;
    }
}

// Throw object
function throwObject() {
    if (!throwableObject || player.isThrowing) return;

    player.isThrowing = true;
    player.throwTimer = 15; // Animation duration in frames

    // Actually throw after a short delay
    setTimeout(() => {
        throwableObject.thrown = true;
        throwableObject.velocityX = player.facing === 'right' ? 5 : -5;
        throwableObject.velocityY = -10; // Initial upward velocity

        // Increment thrown counter
        thrownCount++;
        document.getElementById('thrown-count').textContent = `Thrown: ${thrownCount}`;
    }, 200);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Image upload handling
document.getElementById('image-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                throwableObject = {
                    image: img,
                    x: player.x + player.width / 2 - 25,
                    y: player.y - 50,
                    width: 50,
                    height: 50,
                    velocityX: 0,
                    velocityY: 0,
                    thrown: false
                };
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Start game
gameLoop();
