var socket = io();
var keyboard = {};

var players = {};
var numPlayers = 0;
var playerId;
var playerName;

var FPS = 60;



/* Canvas, images and rendering */

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 500;
document.body.appendChild(canvas);

var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
  bgReady = true;
};
bgImage.src = 'images/bg.png';

var playerReady = false;
var playerImage = new Image();
playerImage.onload = function () {
  playerReady = true;
};
playerImage.src = 'images/player.png';

var enemyReady = false;
var enemyImage = new Image();
enemyImage.onload = function () {
  enemyReady = true;
};
enemyImage.src = 'images/enemy.png';

var renderPlayers = function () {
  for (var player in players) {
    if (players[player].id == playerId) {
      ctx.drawImage(playerImage, players[player].x, players[player].y);
    }
    else {
      ctx.drawImage(enemyImage, players[player].x, players[player].y);
    }

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = '14px arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(players[player].name, players[player].x + 24, players[player].y - 18);
  }
}

var renderStats = function () {
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.font = '18px arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Players: ' + numPlayers, 10, 10);
}

var render = function () {
  if (bgReady && playerReady && enemyReady) {
    ctx.drawImage(bgImage, 0, 0);
    renderPlayers();
    renderStats();
  }
};



/* Keyboard events */

addEventListener('keydown', function (event) {
  keyboard[event.keyCode] = true;

  if (event.keyCode == 13 && !playerName) {
    startConnection();
  }
}, false);

addEventListener('keyup', function (event) {
  delete keyboard[event.keyCode];
}, false);



/* Socket events */

socket.on('login', function (data) {
  players = data.players;
  numPlayers = data.numPlayers;
  playerId = data.playerId;
  loop();
});

socket.on('player joined', function (data) {
  players[data.player.id] = data.player;
  numPlayers = data.numPlayers;
});

socket.on('player left', function (data) {
  delete players[data.playerId];
  numPlayers = data.numPlayers;
});

socket.on('update positions', function (data) {
  players = data.players;
});



/* Game loop */

var loop = function () {
  var now = Date.now();
  var delta = now - then;

  if (delta > interval) {
    render();
    socket.emit('update keyboard', keyboard);
  }

  then = now - (delta % interval);
  requestAnimationFrame(loop);
};

var then = Date.now();
var interval = 1000 / FPS;

requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.mozRequestAnimationFrame;



/* Start connection */

var startConnection = function () {
  var startEl = document.getElementById('start');
  var playerEl = document.getElementById('player');
  playerName = playerEl.value;
  if (playerName) {
    document.body.removeChild(startEl);
    socket.emit('add player', playerName);
  }
}