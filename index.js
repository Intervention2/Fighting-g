const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/oak_woods_v1.0/background/Fondo.png",
});

const shop = new Sprite({
  position: {
    x: 650,
    y: 183,
  },
  imageSrc: "./img/oak_woods_v1.0/decorations/shop_anim.png",
  scale: 2.7,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/1Player/Sprites/Idle.png",
  framesMax: 8,
  scale: 2.4,
  offset: {
    x: 100,
    y: 142,
  },
  sprites: {
    idle: {
      imageSrc: "./img/1Player/Sprites/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/1Player/Sprites/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/1Player/Sprites/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/1Player/Sprites/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/1Player/Sprites/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/1Player/Sprites/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/1Player/Sprites/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 50,
      y: 50,
    },
    width: 150,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: "blue",
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./img/2Enemy/kenji/Idle.png",
  framesMax: 8,
  scale: 2.4,
  offset: {
    x: 50,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./img/2Enemy/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/2Enemy/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/2Enemy/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/2Enemy/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/2Enemy/kenji/Attack 1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/2Enemy/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/2Enemy/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -110,
      y: 50,
    },
    width: 150,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgba(255, 255, 255, 0.2)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  //player movement

  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }
  //jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }
  //jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;

    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }

  // If player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }
  //this is where our player gets hit

  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }
  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  //end game base on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        player.velocity.y = -20;
        break;
      case " ":
        player.attack();
        break;
    }
  }
  if (!enemy.dead) {
    switch (event.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }
});
window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  // enemy keys

  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
