// Import necessary global variables
import { canvas, worldWidth, worldHeight } from "./global.js";

// Player object
const player = {
  x: worldWidth / 2,
  y: worldHeight / 2,
  radius: 20,
  color: "#3498db",
  speed: 3,
  dx: 0,
  dy: 0,
  foodEaten: 0,
};

function growPlayer() {
  player.radius += 0.5;
  player.foodEaten++;
}

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
}

function handleMouseMove(e) {
  const dx = e.clientX - canvas.width / 2;
  const dy = e.clientY - canvas.height / 2;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance !== 0) {
    player.dx = (dx / distance) * player.speed;
    player.dy = (dy / distance) * player.speed;
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  handleMouseMove(touch);
}

export { player, growPlayer, updatePlayer, handleMouseMove, handleTouchMove };
