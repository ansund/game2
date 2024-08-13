const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Debug mode toggle
const DEBUG_MODE = true;

// Resize canvas to fit window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game world size (fixed playable area)
const worldWidth = 3000;
const worldHeight = 3000;

// Player object
const player = {
  x: worldWidth / 2,
  y: worldHeight / 2,
  radius: 20,
  color: "#3498db",
  speed: 3,
  dx: 0,
  dy: 0,
  foodEaten: 0, // Add this line to track food eaten
  score: 0,
  name: "Player",
};

// Leaderboard settings
const leaderboardSize = 5;
let leaderboard = [];

// Camera position
const camera = {
  x: 0,
  y: 0,
};

// Generate initial food and AI blobs
generateFood();
generateAIBlobs();

// Function to grow player and spawn new food
function growPlayer() {
  player.radius += 0.5;
  player.foodEaten++; // Increment the food eaten counter
  player.score = calculateScore(player);
  updateLeaderboard();

  // Spawn a new food item
  food.push({
    x: Math.random() * worldWidth,
    y: Math.random() * worldHeight,
    radius: 5,
    color: getRandomColor(),
  });
}

// Function to calculate score
function calculateScore(blob) {
  return Math.floor(blob.radius * 10 + blob.foodEaten * 5);
}

// Function to update leaderboard
function updateLeaderboard() {
  leaderboard = [player, ...aiBlobs]
    .sort((a, b) => b.score - a.score)
    .slice(0, leaderboardSize);
}

// Function to draw leaderboard
function drawLeaderboard() {
  const padding = 10;
  const width = 200;
  const height = 30 + leaderboardSize * 25;

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(canvas.width - width - padding, padding, width, height);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Leaderboard", canvas.width - width + 10, padding + 25);

  ctx.font = "16px Arial";
  leaderboard.forEach((blob, index) => {
    ctx.fillText(
      `${index + 1}. ${blob.name}: ${blob.score}`,
      canvas.width - width + 10,
      padding + 50 + index * 25
    );
  });
}

// Function to update player position
function updatePlayer() {
  // Calculate new position
  let newX = player.x + player.dx;
  let newY = player.y + player.dy;

  // Check for collision with world boundaries
  if (newX - player.radius < 0) {
    newX = player.radius;
    player.dx = 0;
  } else if (newX + player.radius > worldWidth) {
    newX = worldWidth - player.radius;
    player.dx = 0;
  }

  if (newY - player.radius < 0) {
    newY = player.radius;
    player.dy = 0;
  } else if (newY + player.radius > worldHeight) {
    newY = worldHeight - player.radius;
    player.dy = 0;
  }

  // Update player position
  player.x = newX;
  player.y = newY;

  // Update camera to keep player centered
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
}

// Function to convert world coordinates to screen coordinates
function worldToScreen(x, y) {
  return {
    x: x - camera.x,
    y: y - camera.y,
  };
}

// Function to draw world border
function drawWorldBorder() {
  const borderStart = worldToScreen(0, 0);
  const borderEnd = worldToScreen(worldWidth, worldHeight);

  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.rect(
    borderStart.x,
    borderStart.y,
    borderEnd.x - borderStart.x,
    borderEnd.y - borderStart.y
  );
  ctx.stroke();
}

// Function to display debug information
function displayDebugInfo() {
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText(`Food Eaten: ${player.foodEaten}`, 10, 20);
}

// Function to check blob collisions
function checkBlobCollisions() {
  // Check player collision with AI blobs
  for (let i = aiBlobs.length - 1; i >= 0; i--) {
    if (checkCollision(player, aiBlobs[i])) {
      if (player.radius > aiBlobs[i].radius * 1.1) {
        // Player eats AI blob
        player.radius += aiBlobs[i].radius * 0.1;
        aiBlobs.splice(i, 1);
        generateNewAIBlob();
      } else if (aiBlobs[i].radius > player.radius * 1.1) {
        // AI blob eats player
        gameOver();
        return;
      }
    }
  }

  // Check AI blob collisions with each other
  for (let i = 0; i < aiBlobs.length; i++) {
    for (let j = i + 1; j < aiBlobs.length; j++) {
      if (checkCollision(aiBlobs[i], aiBlobs[j])) {
        if (aiBlobs[i].radius > aiBlobs[j].radius * 1.1) {
          // Larger blob eats smaller blob
          aiBlobs[i].radius += aiBlobs[j].radius * 0.1;
          aiBlobs.splice(j, 1);
          generateNewAIBlob();
          j--;
        } else if (aiBlobs[j].radius > aiBlobs[i].radius * 1.1) {
          // Larger blob eats smaller blob
          aiBlobs[j].radius += aiBlobs[i].radius * 0.1;
          aiBlobs.splice(i, 1);
          generateNewAIBlob();
          i--;
          break;
        }
      }
    }
  }
}

// Function to handle game over
function gameOver() {
  alert("Game Over! You were eaten by a larger blob.");
  // Reset the game or implement your preferred game over behavior
  location.reload();
}

// Game loop
function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update player position
  updatePlayer();

  // Update AI blobs
  updateAIBlobs();

  // Check blob collisions
  checkBlobCollisions();

  // Draw background grid
  drawGrid();

  // Draw world border if in debug mode
  if (DEBUG_MODE) {
    drawWorldBorder();
  }

  // Draw food and check for collisions
  for (let i = food.length - 1; i >= 0; i--) {
    const foodItem = food[i];
    if (checkCollision(player, foodItem)) {
      food.splice(i, 1);
      growPlayer();
    } else {
      const screenPos = worldToScreen(foodItem.x, foodItem.y);
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, foodItem.radius, 0, Math.PI * 2);
      ctx.fillStyle = foodItem.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  // Draw AI blobs
  aiBlobs.forEach((blob) => {
    const screenPos = worldToScreen(blob.x, blob.y);
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, blob.radius, 0, Math.PI * 2);
    ctx.fillStyle = blob.color;
    ctx.fill();
    ctx.closePath();
  });

  // Draw player (always at the center of the screen)
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();

  // Display debug information if in debug mode
  if (DEBUG_MODE) {
    displayDebugInfo();
  }

  // Update leaderboard
  updateLeaderboard();

  // Draw leaderboard
  drawLeaderboard();

  // Request next frame
  requestAnimationFrame(gameLoop);
}

// Function to handle mouse movement
function handleMouseMove(e) {
  const dx = e.clientX - canvas.width / 2;
  const dy = e.clientY - canvas.height / 2;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance !== 0) {
    player.dx = (dx / distance) * player.speed;
    player.dy = (dy / distance) * player.speed;
  }
}

// Function to handle touch movement
function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  handleMouseMove(touch);
}

// Add event listeners for mouse and touch input
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

// Function to draw background grid
function drawGrid() {
  const gridSize = 50;
  const offsetX = camera.x % gridSize;
  const offsetY = camera.y % gridSize;

  ctx.beginPath();
  ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
  ctx.lineWidth = 1;

  for (let x = -offsetX; x < canvas.width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }

  for (let y = -offsetY; y < canvas.height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }

  ctx.stroke();
}

// Start the game loop
gameLoop();
