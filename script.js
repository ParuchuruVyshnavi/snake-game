
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let bonusFood;
let snake=[];
let dx=20;
let dy=20;
let food;
let score, highScore;
let gameInterval;
let speed = 100;
let paused = false;


let eatSound = new Audio("eating.mp3.mp3");
let gameOverSound = new Audio("over.mp3.mp3");


function resizeCanvas() {
  let size = Math.min(window.innerWidth * 0.9, 400);
  canvas.width = size;
  canvas.height = size;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();


document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });


function init() {
  snake = [{ x: 200, y: 200 }];
  dx = 20;
  dy = 0;
  food = randomFood();
  bonusFood = null;
  score = 0;

  highScore = localStorage.getItem("highScore") || 0;
  updateScore();

  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}


function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / 20)) * 20,
    y: Math.floor(Math.random() * (canvas.height / 20)) * 20
  };
}


document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -20; }
  if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 20; }
  if (e.key === "ArrowLeft" && dx === 0) { dx = -20; dy = 0; }
  if (e.key === "ArrowRight" && dx === 0) { dx = 20; dy = 0; }
});


function move(dir) {
  if (dir === "up" && dy === 0) { dx = 0; dy = -20; }
  if (dir === "down" && dy === 0) { dx = 0; dy = 20; }
  if (dir === "left" && dx === 0) { dx = -20; dy = 0; }
  if (dir === "right" && dx === 0) { dx = 20; dy = 0; }
}


let startX = 0, startY = 0;

canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  let endY = e.changedTouches[0].clientY;

  let dxSwipe = endX - startX;
  let dySwipe = endY - startY;

  if (Math.abs(dxSwipe) > Math.abs(dySwipe)) {
    if (dxSwipe > 30 && dx === 0) { dx = 20; dy = 0; }
    else if (dxSwipe < -30 && dx === 0) { dx = -20; dy = 0; }
  } else {
    if (dySwipe > 30 && dy === 0) { dx = 0; dy = 20; }
    else if (dySwipe < -30 && dy === 0) { dx = 0; dy = -20; }
  }

  if (navigator.vibrate) navigator.vibrate(50);
});


function setDifficulty(level) {
  if (level === "easy") speed = 150;
  if (level === "medium") speed = 100;
  if (level === "hard") speed = 60;
  restartGame();
}


function togglePause() {
  paused = !paused;
}


function draw() {
  if (paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= canvas.width ||
      head.y < 0 || head.y >= canvas.height) return gameOver();

  for (let part of snake) {
    if (part.x === head.x && part.y === head.y) return gameOver();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    eatSound.play();

    if (score % 5 === 0 && speed > 40) {
      speed -= 5;
      clearInterval(gameInterval);
      gameInterval = setInterval(draw, speed);
    }

    if (score % 10 === 0) bonusFood = randomFood();

    food = randomFood();
  } else {
    snake.pop();
  }

  if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
    score += 5;
    bonusFood = null;
  }

  updateScore();

  snake.forEach((p, i) => {
    ctx.fillStyle = `hsl(${i * 20},100%,50%)`;
    ctx.fillRect(p.x, p.y, 20, 20);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 20, 20);

  if (bonusFood) {
    ctx.fillStyle = "gold";
    ctx.fillRect(bonusFood.x, bonusFood.y, 20, 20);
  }
}


function updateScore() {
  document.getElementById("score").innerText = "Score: " + score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  document.getElementById("highScore").innerText = "High Score: " + highScore;
}


function gameOver() {
  clearInterval(gameInterval);
  gameOverSound.play();
  alert("Game Over 😢 Score: " + score);
}


function restartGame() {
  paused = false;
  init();
}


init();

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || {};


  if (!username || !password) {
    alert("Please fill all fields!");
    return;
  }

  
  if (users[username] && users[username] === password) {
    localStorage.setItem("user", username);
    window.location.href = "game.html"; 
  } else {
    alert("Invalid username or password!");
  }
}

function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

 
  if (!username || !password || !confirmPassword) {
    alert("Please fill all fields!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (password.length < 4) {
    alert("Password must be at least 4 characters!");
    return;
  }

  
  let users = JSON.parse(localStorage.getItem("users")) || {};

  
  if (users[username]) {
    alert("User already exists!");
    return;
  }

  // save user
  users[username] = password;
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created successfully! Please login.");
  window.location.href = "index.html";
}

document.querySelectorAll(".difficulty button").forEach(btn => {
  btn.classList.remove("active");
});
event.target.classList.add("active");