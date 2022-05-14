const urlParams = new URLSearchParams(window.location.search);
const gameid = urlParams.get("game");
let playerid = urlParams.get("player");
console.log(playerid);

let game = {};

$(document).ready(() => {

  if (playerid == null) {

    // Join game as new player
    $.ajax({
      url: "/newplayer/" + gameid
    }).done((data) => {

      // Save game
      game = data.game;

      // Get player
      playerid = data.player;

      window.location = "/join?game=" + gameid + "&player=" + playerid;

    }).fail((data) => {
      // Handle failure
    }).always((data) => {
      // Completion handler
    });

  } else {

    $.ajax({
      url: "/getgame/" + gameid
    }).done((data) => {

      // Save game
      game = data;

    }).fail((data) => {
      // Handle failure
    }).always((data) => {
      // Completion handler
    });

  }

  $("#myname").keyup(() => {
    const name = $("#myname").val();
    $.ajax({
      url: "/playername/" + gameid + "/" + playerid + "/" + encodeURIComponent(name)
    }).done((data) => {
      // Save game
      game = data.game;
    }).fail((data) => {

    }).always((data) => {

    });
  });

  $("#play").click(() => {
    window.location = "/play?game=" + game.id + "&player=" + playerid;
  });

});