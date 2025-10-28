const enemies = [];
const enemyCount = 20;

function createEnemy() {
  return {
    x: Math.random() * worldWidth,
    y: Math.random() * worldHeight,
    radius: 30,
    color: "red",
    speed: 2,
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 - 1,
    rotation: 0,
    rotationSpeed: 0.05,
    areaPoints: 400,
  };
}

function generateEnemies() {
  for (let i = 0; i < enemyCount; i++) {
    enemies.push(createEnemy());
  }
}

function updateEnemies() {
  enemies.forEach((enemy) => {
    // Update rotation
    enemy.rotation += enemy.rotationSpeed;

    // Calculate distance to player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Define distance thresholds and corresponding probabilities
    const closeDistance = 100;
    const farDistance = 500;
    const closeProb = 0.9;
    const mediumProb = 0.5;
    const farProb = 0.1;

    let moveTowardsPlayerProb;

    if (distance <= closeDistance) {
      moveTowardsPlayerProb = closeProb;
    } else if (distance >= farDistance) {
      moveTowardsPlayerProb = farProb;
    } else {
      // Linear interpolation between medium and far probabilities
      const t = (distance - closeDistance) / (farDistance - closeDistance);
      moveTowardsPlayerProb = mediumProb + t * (farProb - mediumProb);
    }
    //Only move towards player if not far away from the player
    if (moveTowardsPlayerProb != farProb) {
      if (Math.random() < moveTowardsPlayerProb) {
        // Move towards the player
        enemy.dx = (dx / distance) * enemy.speed;
        enemy.dy = (dy / distance) * enemy.speed;
      } else {
        // Move randomly if not far away from the player
        enemy.dx = (Math.random() * 2 - 1) * enemy.speed;
        enemy.dy = (Math.random() * 2 - 1) * enemy.speed;
      }
    }
    // Calculate new position
    let newX = enemy.x + enemy.dx;
    let newY = enemy.y + enemy.dy;

    // Keep enemy within world boundaries
    if (newX - enemy.radius < 0) {
      newX = enemy.radius;
      enemy.dx *= -1;
    } else if (newX + enemy.radius > worldWidth) {
      newX = worldWidth - enemy.radius;
      enemy.dx *= -1;
    }

    if (newY - enemy.radius < 0) {
      newY = enemy.radius;
      enemy.dy *= -1;
    } else if (newY + enemy.radius > worldHeight) {
      newY = worldHeight - enemy.radius;
      enemy.dy *= -1;
    }

    // Update enemy position
    enemy.x = newX;
    enemy.y = newY;
  });
}

// function handleEnemyBulletCollisions() {
//   for (let i = enemies.length - 1; i >= 0; i--) {
//     const enemy = enemies[i];
//     for (let j = bullets.length - 1; j >= 0; j--) {
//       const bullet = bullets[j];
//       if (checkCollision(enemy, bullet)) {
//         // Remove the bullet
//         bullets.splice(j, 1);

//         // Reduce enemy size
//         enemy.areaPoints -= bullet.areaPoints;

//         enemy.radius = Math.sqrt(enemy.areaPoints / Math.PI);

//         // Remove enemy if too small or if areaPoints is zero or negative
//         if (enemy.areaPoints <= 0) {
//           enemies.splice(i, 1);
//           break;
//         }
//       }
//     }
//   }
// }

function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation);
    ctx.fillStyle = enemy.color;
    ctx.fillRect(
      -enemy.radius / 2,
      -enemy.radius / 2,
      enemy.radius,
      enemy.radius
    );
    ctx.restore();
  });
}
