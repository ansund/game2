// Food array
const food = [];
const foodCount = 50; // Number of food particles

// Function to generate food
function generateFood() {
  for (let i = 0; i < foodCount; i++) {
    food.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 5,
      color: getRandomColor(),
    });
  }
}

// Function to get random color
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function checkCollision(player, foodItem) {
  const dx = player.x - foodItem.x;
  const dy = player.y - foodItem.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < player.radius + foodItem.radius;
}
