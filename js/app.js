const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
var loopFrame;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var looseRate = 1.66;

function generateUUID() {
  var d = new Date().getTime();
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

window.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

//Pythagoras theorem from getting distance between 2 points
const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.health = 100;
    this.dead = false;
  }

  draw() {
    if (!this.dead) {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

var prjIds = [];
var sPrjIds = [];

class sniperProjectile {
  constructor(color, radius, x, y, targetX, targetY) {
    this.uuid = generateUUID();
    this.color = color;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.radians = Math.atan2(targetY - this.y, targetX - this.x);
  }

  update() {
    this.x += Math.cos(this.radians) * 30;
    this.y += Math.sin(this.radians) * 30;
    if (distance(player.x, player.y, this.x, this.y) <= player.radius) {
      if (!sPrjIds.includes(this.uuid)) {
        for (let p = 0; p < sniperProjectiles.length; p++) {
          if (sniperProjectiles[p].uuid == this.uuid) {
            sniperProjectiles.splice(p, 1);
          }
        }
        player.health -= 20;
        if (player.health <= 0) {
          player.dead = true;
        }
        sPrjIds.push(this.uuid);
      }
    }
  }

  draw(index) {
    this.update();
    ctx.beginPath();
    ctx.shadowBlur = 0;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    this.destroy(index);
  }

  destroy(index) {
    if (this.y <= 0) {
      sniperProjectiles.splice(index, 1);
      sPrjIds.splice(index, 1);
    } else if (this.x <= 0) {
      sniperProjectiles.splice(index, 1);
      sPrjIds.splice(index, 1);
    } else if (this.y >= canvas.height) {
      sniperProjectiles.splice(index, 1);
      sPrjIds.splice(index, 1);
    } else if (this.x >= canvas.width) {
      sniperProjectiles.splice(index, 1);
      sPrjIds.splice(index, 1);
    }
  }
}

class Projectile {
  constructor(color, radius, x, y, targetX, targetY) {
    this.uuid = generateUUID();
    this.color = color;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.radians = Math.atan2(targetY - this.y, targetX - this.x);
  }

  update() {
    this.x += Math.cos(this.radians) * 15;
    this.y += Math.sin(this.radians) * 15;
    for (let i = 0; i < snipers.length; i++) {
      if (
        distance(snipers[i].x, snipers[i].y, this.x, this.y) <=
        snipers[i].radius
      ) {
        if (!prjIds.includes(this.uuid)) {
          for (let p = 0; p < projectiles.length; p++) {
            if (projectiles[p].uuid == this.uuid) {
              projectiles.splice(p, 1);
            }
          }
          snipers[i].health -= 25;
          snipers[i].displayHealth();
          if (snipers[i].health <= 0) {
            snipers[i].destroy();
          }
          prjIds.push(this.uuid);
        }
      }
    }
  }

  draw(index) {
    if (!player.dead) {
      this.update();
      ctx.beginPath();
      ctx.shadowBlur = 0;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      this.destroy(index);
    }
  }

  destroy(index) {
    if (this.y <= 0) {
      projectiles.splice(index, 1);
      prjIds.splice(index, 1);
    } else if (this.x <= 0) {
      projectiles.splice(index, 1);
      prjIds.splice(index, 1);
    } else if (this.y >= canvas.height) {
      projectiles.splice(index, 1);
      prjIds.splice(index, 1);
    } else if (this.x >= canvas.width) {
      projectiles.splice(index, 1);
      prjIds.splice(index, 1);
    }
  }
}
var fasteningPoints = [
  [50, 50], //top left
  [50, canvas.height - 50], // bottom left
  [canvas.width - 50, 50], //top right
  [canvas.width - 50, canvas.height - 50], // bottom right
];

var countSniper = 4;
var occupiedSpawn = [];

class EnemyA {
  constructor(radius, existing) {
    this.uuid = generateUUID();
    this.existing = existing;
    console.log(snipers);
    for (let i = 0; i < this.existing.length; i++) {
      if (this.existing[i].uuid == this.uuid) {
        this.index = i;
      }
    }
    this.health = 100;
    this.x = 10;
    this.y = 10;
    this.spawn = Math.floor(Math.random() * 4);
    switch (this.spawn) {
      case 0:
        this.x = -10;
        this.y = -10;
        break;
      case 1:
        this.x = -10;
        this.y = canvas.height + 30;
        break;
      case 2:
        this.x = canvas.width + 30;
        this.y = -10;
        break;
      case 3:
        this.x = canvas.width + 30;
        this.y = canvas.height + 30;
        break;
    }
    occupiedSpawn.push(this.spawn);
    this.radius = radius;
    this.point = null;
    this.distances = [];
    for (let i = 0; i < fasteningPoints.length; i++) {
      this.distances.push(
        distance(this.x, this.y, fasteningPoints[i][0], fasteningPoints[i][1])
      );
    }
    this.index = this.distances.indexOf(Math.min(...this.distances));
    this.point = fasteningPoints[this.index];
    fasteningPoints.splice(
      this.distances.indexOf(Math.min(...this.distances)),
      1
    );
    this.reached = false;
    this.radians = Math.atan2(this.point[1] - this.y, this.point[0] - this.x);

    this.atan = Math.atan2(this.y - player.y, this.x - player.x);
    this.cos = Math.cos(this.atan);
    this.sin = Math.sin(this.atan);
    this.i = 0;
  }

  shoot() {
    if (!player.dead) {
      sniperProjectiles.push(
        new sniperProjectile("orange", 10, this.x, this.y, player.x, player.y)
      );
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "orange";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "orange";
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.i++;
    if (!this.reached) {
      this.x += Math.cos(this.radians) * 10;
      this.y += Math.sin(this.radians) * 10;
    } else {
      this.atan = Math.atan2(this.y - player.y, this.x - player.x);
      this.cos = Math.cos(this.atan);
      this.sin = Math.sin(this.atan);
    }
    this.draw();
    if (this.spawn == 0) {
      if (this.x >= this.point[0] && this.y >= this.point[1]) {
        this.reached = true;
      }
    } else if (this.spawn == 1) {
      if (this.x >= this.point[0] && this.y <= this.point[1]) {
        this.reached = true;
      }
    } else if (this.spawn == 2) {
      if (this.x <= this.point[0] && this.y >= this.point[1]) {
        this.reached = true;
      }
    } else if (this.spawn == 3) {
      if (this.x <= this.point[0] && this.y <= this.point[1]) {
        this.reached = true;
      }
    }
  }

  destroy() {
    var index;
    for (let i = 0; i < snipers.length; i++) {
      if (snipers[i].uuid == this.uuid) {
        index = i;
      }
    }
    snipers.splice(index, 1);
  }

  displayHealth() {
    if (text.length > 0) {
      text.shift();
    }
    text.push(
      new Text(
        this.x,
        this.y - this.radius + 50,
        "15px Arial",
        "white",
        `${this.health}/100`
      )
    );
  }
}

setInterval(function () {
  for (let i = 0; i < snipers.length; i++) {
    snipers[i].shoot();
  }
}, 2000);

class Text {
  constructor(x, y, font, color, text) {
    this.x = x;
    this.y = y;
    this.font = font;
    this.color = color;
    this.text = text;
    this.index = text.length - 1;
  }

  draw() {
    ctx.beginPath();
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 0;
    ctx.fillText(this.text, this.x, this.y);
    ctx.fill();

    setTimeout(function () {
      text.shift();
    }, 3000);
  }
}

class Bar {
  constructor(width, height, percentage) {
    this.width = width;
    this.height = height;
    this.percentage = percentage;
    this.max = false;
    this.x = canvas.width / 2 - this.width / 2;
  }
  draw() {
    if (!this.max) {
      ctx.beginPath();
      ctx.shadowBlur = 0;
      ctx.fillStyle = `white`;
      ctx.rect(canvas.width / 2 - this.width / 2, 40, this.width, this.height);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `lime`;
      ctx.shadowBlur = 50;
      ctx.shadowColor = "lime";
      ctx.rect(
        canvas.width / 2 - this.width / 2,
        40,
        (this.percentage / 100) * this.width,
        this.height
      );
      ctx.fill();
    }
  }
  update() {
    this.draw();
    if (!this.max) {
      this.percentage += 0.1;
    }
    if (this.percentage >= 100) {
      this.percentage = 100;
      this.max = true;
      this.text();
    }
    if (player.dead) {
      this.percentage -= 0.1;
    }
  }
  text() {
    ctx.beginPath();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "lime";
    ctx.font = "60px font";
    ctx.fillStyle = "white";
    ctx.fillText(
      "Boost Ready! Press Space to Activate!",
      canvas.width / 2 -
        ctx.measureText("Boost Ready! Press Space to Activate!").width / 2,
      55
    );
    ctx.fill();
  }
}

class HealthBar {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.playerHealth = player.health;
    this.color = "white";
  }
  draw() {
    ctx.beginPath();
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.color;
    ctx.rect(bar.x - 300, 40, this.width, this.height);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = `red`;
    ctx.shadowBlur = 50;
    ctx.shadowColor = "red";
    ctx.rect(
      bar.x - 300,
      40,
      (this.playerHealth / 100) * this.width,
      this.height
    );
    ctx.fill();
  }
  update() {
    this.playerHealth = player.health;
    if (player.health <= 0) {
      this.playerHealth = 0;
      this.color = "black";
    }
    this.draw();
  }
}

var text = [];

var keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  boost: false,
};

var projectiles = [];
var sniperProjectiles = [];
var cooldown = false;

function newProjectile(e) {
  var targetX = e.clientX,
    targetY = e.clientY;
  projectiles.push(
    new Projectile("white", 10, player.x, player.y, targetX, targetY)
  );
  cooldown = true;
  setTimeout(function () {
    cooldown = false;
  }, 500);
}

document.addEventListener("click", function (e) {
  if (cooldown) {
    return;
  } else {
    newProjectile(e);
  }
});
window.addEventListener("keydown", function (e) {
  switch (e.keyCode) {
    case 87:
      keys.up = true;
      break;
    case 65:
      keys.left = true;

      break;
    case 68:
      keys.right = true;
      break;
    case 83:
      keys.down = true;
      break;
    case 32:
      if (bar.percentage >= 100) {
        keys.boost = true;
      }
      break;
  }
});

window.addEventListener("keyup", function (e) {
  addedVel = 3;
  switch (e.keyCode) {
    case 87:
      keys.up = false;
      break;
    case 65:
      keys.left = false;

      break;
    case 68:
      keys.right = false;
      break;
    case 83:
      keys.down = false;
      break;
  }
});

const player = new Player(canvas.width / 2 + 10, canvas.height / 2 + 10, 20);
var addedVel = 6;
const bar = new Bar(600, 30, 0);
const health = new HealthBar(200, 30);
var space = false;
var snipers = [];
function spawnSnipers() {
  for (let i = 0; i < 4 - occupiedSpawn.length; i++) {
    snipers.push(new EnemyA(15, snipers));
  }
}

var interval = 5000;

setInterval(function () {
  if (snipers.length < 4) {
    spawnSnipers();
    interval -= 400;
  }
}, interval);

function loop() {
  canvas.width = canvas.width;
  if (keys.boost) {
    keys.boost = false;
    space = true;
    bar.percentage = 0;
    bar.max = false;
  } else if (keys.up && keys.left) {
    if (!space) {
      player.y -= addedVel;
      player.x -= addedVel;
      addedVel += 0.1;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.y -= addedVel;
          player.x -= addedVel;
          addedVel += 0.1;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  } else if (keys.up && keys.right) {
    if (!space) {
      player.y -= addedVel;
      player.x += addedVel;
      addedVel += 0.1;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.y -= addedVel;
          player.x += addedVel;
          addedVel += 0.1;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  } else if (keys.down && keys.left) {
    if (!space) {
      player.y += addedVel;
      player.x -= addedVel;
      addedVel += 0.1;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.y += addedVel;
          player.x -= addedVel;
          addedVel += 0.1;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  } else if (keys.down && keys.right) {
    if (!space) {
      player.y += addedVel;
      player.x += addedVel;
      addedVel += 0.1;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.y += addedVel;
          player.x += addedVel;
          addedVel += 0.1;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  } else if (keys.up) {
    if (!space) {
      player.y -= addedVel;
      addedVel += 0.3;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.y -= addedVel;
          addedVel += 0.3;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  } else if (keys.down) {
    if (!space) {
      player.y += addedVel;
      addedVel += 0.3;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.y += addedVel;
          addedVel += 0.3;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  } else if (keys.right) {
    if (!space) {
      player.x += addedVel;
      addedVel += 0.3;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.x += addedVel;
          addedVel += 0.3;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  } else if (keys.left) {
    if (!space) {
      player.x -= addedVel;
      addedVel += 0.3;
    } else {
      var i = 0;
      var interval = setInterval(function () {
        if (i < 2) {
          player.x -= addedVel;
          addedVel += 0.3;
          i++;
        } else {
          clearInterval(interval);
          space = false;
        }
      }, 100);
    }
  }

  if (player.x <= 0) {
    player.x = canvas.width - 20;
    addedVel /= 2;
  } else if (player.x >= canvas.width) {
    player.x = 0;
    addedVel /= 2;
  } else if (player.y <= 0) {
    player.y = canvas.height - 20;
    addedVel /= 2;
  } else if (player.y >= canvas.height) {
    player.y = 0;
    addedVel /= 2;
  }
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].draw(i);
  }
  for (let i = 0; i < sniperProjectiles.length; i++) {
    sniperProjectiles[i].draw(i);
  }
  player.draw();
  for (let i = 0; i < snipers.length; i++) {
    snipers[i].update();
  }
  for (let i = 0; i < text.length; i++) {
    text[i].draw();
  }
  bar.update();
  health.update();
  if (player.dead) {
    gameOver();
  }
  if (snipers.length == 0) {
    occupiedSpawn = [];
    fasteningPoints = [
      [50, 50],
      [50, canvas.height - 50],
      [canvas.width - 50, 50],
      [canvas.width - 50, canvas.height - 50],
    ];
  }
  loopFrame = requestAnimationFrame(loop);
}

loopFrame = requestAnimationFrame(loop);

window.addEventListener("resize", function (e) {
  canvas.width = window.innerWidth;
});

var i = 0;

function gameOver() {
  if (i == 0) {
    document.getElementById("overlay").style.transition =
      "1.5s all ease-in-out";
    document.getElementById("overlay").style.background = "rgba(0,0,0,0.7)";
    document.getElementById("text").innerHTML = "Game Over!";
    document.getElementById("text").style.color = "rgba(255,255,255,1)";
    setTimeout(function () {
      location.href = "index.html";
    }, 5000);
  }
  i++;
}
