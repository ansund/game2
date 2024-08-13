// Food array
const food = [];
const foodCount = 500; // Number of food particles

// Function to generate food
function generateFood() {
  for (let i = 0; i < foodCount; i++) {
    food.push({
      x: Math.random() * worldWidth,
      y: Math.random() * worldHeight,
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

// Modify the checkCollision function to be more generic
function checkCollision(blob1, blob2) {
  const dx = blob1.x - blob2.x;
  const dy = blob1.y - blob2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < blob1.radius + blob2.radius;
}
