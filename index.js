const express = require('express');
const uuid = require('uuid');
const path = require("path");
const fs = require('fs');

const INFO = 3;
const WARN = 2;
const ERROR = 1;
const MANDATORY = 0;

const winscore = 5;

let games = {}; // Object to hold all live games

let cardlist = fs.readFileSync(path.join(__dirname,"cards.txt"));
let cards = cardlist.toString().replace(/\r\n/g,'\n'). split('\n');

let app = express();
const webport = parseInt(process.env.PORT) || 80;

let logLevel = MANDATORY; // Default to error-only logging

function log(message,level = MANDATORY) {

  if (level <= logLevel) { console.log (message); }

}

function initGame() {

  const game = uuid.v4();
  const host = uuid.v4();

  games[game] = {
    id: game,
    host: host,
    status: "waiting",
    players: {
    },
    current: {
      card: null,
      cardIndex: null,
      judge: null,
      answers: {

      }
    }
  };

  games[game].players[host] = {
    id: host,
    name: "",
    score: 0
  };

  return { player: host, game: games[game] };

}

function newPlayer(game) {

  const player = uuid.v4();

  games[game].players[player] = {
    id: player,
    name: "",
    score: 0
  };

  return { player: player, game: games[game] };

}

app.use(express.static(__dirname + 'html'));
app.use(require('body-parser').json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'html/index.html'));
});

app.get('/join', function (req, res) {
  res.sendFile(path.join(__dirname,'html/join.html'))
});

app.get('/play', function (req, res) {
  res.sendFile(path.join(__dirname,'html/play.html'))
});

app.get('/fontawesome/(*)', function (req, res) {
  const file = req.params[0];
  res.sendFile(path.join(__dirname,'node_modules/@fortawesome/fontawesome-free',file));
});

app.get('/jquery.js', function (req, res) {
  res.sendFile(path.join(__dirname,'node_modules/jquery/dist/jquery.min.js'));
});

app.get('/(*\.js)', function (req, res) {
  res.sendFile(path.join(__dirname,'html',req.url));
});

app.get('/(*\.css)', function (req, res) {
  res.sendFile(path.join(__dirname,'html',req.url));
});

app.get('/(*\.png)', function (req, res) {
  res.sendFile(path.join(__dirname,'html',req.url));
});

app.get('/(*\.svg)', function (req, res) {
  res.sendFile(path.join(__dirname,'html',req.url));
});

app.get('/favicon.ico', function (req, res) {
  res.sendFile(path.join(__dirname,'html/favicon.ico'));
});

app.get('/newgame', function (req, res) {
  res.send(initGame());
});

app.get('/newplayer/(*)', function (req, res) {
  const gameid = req.params[0];
  res.send(newPlayer(gameid));
});

app.get('/removeplayer/(*)/(*)', function (req, res) {
  const gameid = req.params[0];
  const playerid = req.params[1];
  delete games[gameid].players[playerid];
});

app.get('/playername/(*)/(*)/(*)', function (req, res) {
  const gameid = req.params[0];
  const playerid = req.params[1];
  const playername = decodeURIComponent(req.params[2]);
  games[gameid].players[playerid].name = playername;
  res.send({ player: playerid, game: games[gameid] });
});

app.get('/getgame/(*)', function (req, res) {
  const gameid = req.params[0];
  res.send(games[gameid]);
});

app.get('/startgame/(*)', function (req, res) {
  const gameid = req.params[0];
  games[gameid].status = "playing";
  games[gameid].current.cardIndex = Math.floor(Math.random() * cards.length);
  games[gameid].current.card = cards[games[gameid].current.cardIndex];
  const players = Object.keys(games[gameid].players);
  games[gameid].current.judge = players[Math.floor(Math.random() * players.length)];
  res.send(games[gameid]);
});

app.get('/answer/(*)/(*)/(*)', function (req, res) {
  const gameid = req.params[0];
  const playerid = req.params[1];
  const answer = decodeURIComponent(req.params[2]);
  games[gameid].current.answers[playerid] = { answer: answer };
  if (Object.keys(games[gameid].current.answers).length == (Object.keys(games[gameid].players).length - 1)) {
    games[gameid].status = "judging";
  }
  res.send(games[gameid]);
});

app.get('/judge/(*)/(*)', function (req, res) {
  const gameid = req.params[0];
  const winner = req.params[1];
  games[gameid].players[winner].score++;
  cards.splice(games[gameid].current.cardIndex,1);
  if (games[gameid].players[winner].score < winscore) {
    const players = Object.keys(games[gameid].players);
    let next = players.indexOf(games[gameid].current.judge) + 1;
    if (next == players.length) next = 0;
    games[gameid].current.judge = players[next];
    games[gameid].current.cardIndex = Math.floor(Math.random() * cards.length);
    games[gameid].current.card = cards[games[gameid].current.cardIndex];
    games[gameid].current.answers = {};
    games[gameid].status = "playing";
  } else {
    games[gameid].status = "done";
    games[gameid].winner = winner;
  }
  res.send(games[gameid]);
});

app.listen(webport, () => log(`Krazy Kards listening on port ${webport}!`,MANDATORY))
