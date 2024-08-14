let aiBlobs = [];
const aiCount = 100;

function createAIBlob() {
  return {
    x: Math.random() * worldWidth,
    y: Math.random() * worldHeight,
    radius: 20,
    color: getRandomColor(),
    speed: 3,
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 - 1,
    foodEaten: 0,
    score: 0,
    name: `AI ${Math.floor(Math.random() * 1000)}`,
  };
}

function generateAIBlobs() {
  for (let i = 0; i < aiCount; i++) {
    aiBlobs.push(createAIBlob());
  }
}

function updateAIBlobs() {
  aiBlobs.forEach((blob) => {
    // Move the blob
    let newX = blob.x + blob.dx * blob.speed;
    let newY = blob.y + blob.dy * blob.speed;

    // Bounce off world boundaries
    if (newX - blob.radius < 0 || newX + blob.radius > worldWidth) {
      blob.dx *= -1;
      newX = blob.x;
    }
    if (newY - blob.radius < 0 || newY + blob.radius > worldHeight) {
      blob.dy *= -1;
      newY = blob.y;
    }

    // Update blob position
    blob.x = newX;
    blob.y = newY;

    // Occasionally change direction
    if (Math.random() < 0.02) {
      blob.dx = Math.random() * 2 - 1;
      blob.dy = Math.random() * 2 - 1;
    }

    // Check for food collision
    for (let i = food.length - 1; i >= 0; i--) {
      if (checkCollision(blob, food[i])) {
        food.splice(i, 1);
        growAIBlob(blob);
        // Spawn new food
        food.push({
          x: Math.random() * worldWidth,
          y: Math.random() * worldHeight,
          radius: 5,
          color: getRandomColor(),
        });
      }
    }

    // Update blob speed based on size
    blob.speed = 3 * (20 / blob.radius);
    blob.score = calculateScore(blob);
  });
}

function growAIBlob(blob) {
  blob.radius += 0.5;
  blob.foodEaten++;
  blob.score = calculateScore(blob);
}

function generateNewAIBlob() {
  aiBlobs.push(createAIBlob());
}
