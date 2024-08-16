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

const ZOOM_RATE = 0.002; // Adjust this value to change the zoom-out speed
let currentZoom = 1;

// Player object
const player = {
  x: worldWidth / 2,
  y: worldHeight / 2,
  color: "#3498db",
  speed: 3,
  dx: 0,
  dy: 0,
  foodEaten: 0, // Add this line to track food eaten
  score: 0,
  areaPoints: 1200,
  radius: Math.sqrt(1200 / Math.PI),
  name: "Player",
  finalCameraX: 0, // Add this line to store the final camera X position
  finalCameraY: 0, // Add this line to store the final camera Y position
};

// Leaderboard settings
const leaderboardSize = 5;
let leaderboard = [];

// Camera position
const camera = {
  x: 0,
  y: 0,
};

// Add event listener for the view map button
document
  .getElementById("viewMapButton")
  .addEventListener("click", toggleMapView);

let isMapView = false;
let originalCameraX, originalCameraY;

function toggleMapView() {
  if (isMapView) {
    // Return to normal view
    camera.x = originalCameraX;
    camera.y = originalCameraY;
    isMapView = false;
  } else {
    // Switch to map view
    originalCameraX = camera.x;
    originalCameraY = camera.y;
    camera.x = 0;
    camera.y = 0;
    isMapView = true;
  }
}

// Generate initial food and AI blobs
generateFood();
generateAIBlobs();

// Function to grow player and spawn new food
function growPlayer(areaGain) {
  player.areaPoints += areaGain;
  player.radius = Math.sqrt(player.areaPoints / Math.PI);
  player.foodEaten++;
  player.score = calculateScore(player);
  updateLeaderboard();

  // Update zoom level
  currentZoom = Math.max(0.2, 1 - (player.radius - 20) * ZOOM_RATE);

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
  if (isGameOver || isMapView) return; // Don't update player position if game is over or in map view

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
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2 / currentZoom;
  ctx.strokeRect(0, 0, worldWidth, worldHeight);
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
        growPlayer(aiBlobs[i].areaPoints / 3);
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
          growAIBlob(aiBlobs[i], aiBlobs[j].areaPoints / 3);
          aiBlobs.splice(j, 1);
          generateNewAIBlob();
          j--;
        } else if (aiBlobs[j].radius > aiBlobs[i].radius * 1.1) {
          // Larger blob eats smaller blob
          growAIBlob(aiBlobs[j], aiBlobs[i].areaPoints / 3);
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
let isGameOver = false;

function gameOver() {
  isGameOver = true;
  player.radius = 0; // Set player radius to 0 to make it disappear
  // Store the final camera position
  player.finalCameraX = camera.x;
  player.finalCameraY = camera.y;
}

// Function to draw game over menu
function drawGameOverMenu() {
  // Semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw menu box
  const menuWidth = 400;
  const menuHeight = 350;
  const menuX = (canvas.width - menuWidth) / 2;
  const menuY = (canvas.height - menuHeight) / 2;

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(menuX, menuY, menuWidth, menuHeight);

  // Draw text
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas.width / 2, menuY + 50);

  ctx.font = "20px Arial";
  ctx.fillText(`Final Score: ${player.score}`, canvas.width / 2, menuY + 90);
  ctx.fillText(
    `Food Eaten: ${player.foodEaten}`,
    canvas.width / 2,
    menuY + 120
  );
  ctx.fillText(
    `Final Size: ${Math.round(player.radius)}`,
    canvas.width / 2,
    menuY + 150
  );

  // Draw New Game button
  ctx.fillStyle = "#3498db";
  ctx.fillRect(menuX + 100, menuY + 200, 200, 60);
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("New Game", canvas.width / 2, menuY + 240);

  // Draw Continue Game button
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(menuX + 100, menuY + 270, 200, 60);
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Continue Game", canvas.width / 2, menuY + 310);
}

// Game loop
let animationFrameId;

function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isMapView) {
    // Calculate the scale factor to fit the entire world
    const scaleX = canvas.width / worldWidth;
    const scaleY = canvas.height / worldHeight;
    const scale = Math.min(scaleX, scaleY);

    // Save the current context state
    ctx.save();

    // Scale the context
    ctx.scale(scale, scale);

    // Draw the world border
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);

    // Draw food
    food.forEach((foodItem) => {
      ctx.beginPath();
      ctx.arc(foodItem.x, foodItem.y, foodItem.radius / scale, 0, Math.PI * 2);
      ctx.fillStyle = foodItem.color;
      ctx.fill();
      ctx.closePath();
    });

    // Draw AI blobs
    aiBlobs.forEach((blob) => {
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius / scale, 0, Math.PI * 2);
      ctx.fillStyle = blob.color;
      ctx.fill();
      ctx.closePath();
    });

    // Draw player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius / scale, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Restore the context state
    ctx.restore();
  } else {
    // Normal view code with zoom effect
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(currentZoom, currentZoom);
    ctx.translate(-player.x, -player.y);

    // Draw background grid
    // drawGrid();

    // Draw world border
    drawWorldBorder();

    // Draw food and check for collisions
    for (let i = food.length - 1; i >= 0; i--) {
      const foodItem = food[i];
      if (checkCollision(player, foodItem)) {
        food.splice(i, 1);
        growPlayer(Math.PI * foodItem.radius * foodItem.radius);
      } else {
        ctx.beginPath();
        ctx.arc(foodItem.x, foodItem.y, foodItem.radius, 0, Math.PI * 2);
        ctx.fillStyle = foodItem.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    // Draw AI blobs
    aiBlobs.forEach((blob) => {
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fillStyle = blob.color;
      ctx.fill();
      ctx.closePath();
    });

    // Draw player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }

  // Update game logic
  if (!isMapView) {
    updatePlayer();
    updateAIBlobs();
    checkBlobCollisions();
  }

  // Update leaderboard
  updateLeaderboard();

  // Draw leaderboard
  drawLeaderboard();

  // Draw game over menu if the game is over
  if (isGameOver) {
    drawGameOverMenu();
  }

  // Request next frame
  animationFrameId = requestAnimationFrame(gameLoop);
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

canvas.addEventListener("click", handleClick);

function handleClick(e) {
  if (isGameOver) {
    const menuWidth = 400;
    const menuHeight = 350;
    const menuX = (canvas.width - menuWidth) / 2;
    const menuY = (canvas.height - menuHeight) / 2;

    if (
      e.clientX >= menuX + 100 &&
      e.clientX <= menuX + 300 &&
      e.clientY >= menuY + 200 &&
      e.clientY <= menuY + 260
    ) {
      restartGame(true);
    } else if (
      e.clientX >= menuX + 100 &&
      e.clientX <= menuX + 300 &&
      e.clientY >= menuY + 270 &&
      e.clientY <= menuY + 330
    ) {
      restartGame(false);
    }
  }
}

function restartGame(newGame) {
  // Cancel the previous game loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  if (newGame) {
    // Reset game state
    player.x = worldWidth / 2;
    player.y = worldHeight / 2;
    player.radius = 20;
    player.foodEaten = 0;
    player.score = 0;
    player.speed = 3; // Reset player speed

    // Clear and regenerate food and AI blobs
    food.length = 0;
    aiBlobs.length = 0;
    generateFood();
    generateAIBlobs();
  } else {
    // Spawn player at a random position
    player.x = Math.random() * worldWidth;
    player.y = Math.random() * worldHeight;
    player.radius = 20;
    player.foodEaten = 0;
    player.score = 0;
    player.speed = 3; // Reset player speed

    // Remove AI blobs that are too close to the new player spawn point
    const safeDistance = 100;
    aiBlobs = aiBlobs.filter((blob) => {
      const dx = blob.x - player.x;
      const dy = blob.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance > safeDistance;
    });

    // Reset AI blob speeds
    aiBlobs.forEach((blob) => {
      blob.speed = 3;
    });
  }

  // Reset camera position
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  // Reset game over state
  isGameOver = false;

  // Restart game loop
  gameLoop();
}
