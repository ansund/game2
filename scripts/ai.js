let aiBlobs = [];
const aiCount = 50;

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
    areaPoints: 400,
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
    // Find the nearest food
    let nearestFood = null;
    let minDistance = Infinity;

    food.forEach((foodItem) => {
      const dx = foodItem.x - blob.x;
      const dy = foodItem.y - blob.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearestFood = foodItem;
      }
    });

    // 80% chance to move towards the nearest food, 20% chance to move randomly
    if (Math.random() < 0.8 && nearestFood) {
      const dx = nearestFood.x - blob.x;
      const dy = nearestFood.y - blob.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      blob.dx = (dx / distance) * blob.speed;
      blob.dy = (dy / distance) * blob.speed;
    } else {
      // Move randomly
      blob.dx = (Math.random() * 2 - 1) * blob.speed;
      blob.dy = (Math.random() * 2 - 1) * blob.speed;
    }

    // Move the blob
    let newX = blob.x + blob.dx;
    let newY = blob.y + blob.dy;

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

    // Check for food collision
    for (let i = food.length - 1; i >= 0; i--) {
      if (checkCollision(blob, food[i])) {
        const foodArea = Math.PI * food[i].radius * food[i].radius;
        food.splice(i, 1);
        growAIBlob(blob, foodArea);
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

function growAIBlob(blob, areaGain) {
  blob.areaPoints += areaGain;
  blob.radius = Math.sqrt(blob.areaPoints / Math.PI);
  blob.foodEaten++;
  blob.score = calculateScore(blob);
}

function generateNewAIBlob() {
  aiBlobs.push(createAIBlob());
}
