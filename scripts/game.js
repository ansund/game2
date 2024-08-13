const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fit window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player object
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: "#3498db",
};

// Generate initial food
generateFood();

// Function to grow player
function growPlayer() {
  player.radius += 0.5;
  if (food.length < foodCount / 2) {
    generateFood();
  }
}

// Game loop
function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw food and check for collisions
  for (let i = food.length - 1; i >= 0; i--) {
    const foodItem = food[i];
    if (checkCollision(player, foodItem)) {
      food.splice(i, 1);
      growPlayer();
    } else {
      ctx.beginPath();
      ctx.arc(foodItem.x, foodItem.y, foodItem.radius, 0, Math.PI * 2);
      ctx.fillStyle = foodItem.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  // Draw player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();

  // Request next frame
  requestAnimationFrame(gameLoop);
}

// Move player towards mouse
canvas.addEventListener("mousemove", (e) => {
  player.x = e.clientX;
  player.y = e.clientY;
});

// Start the game loop
gameLoop();
