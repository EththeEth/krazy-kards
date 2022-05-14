let game = {};
let gameid = "";
let playerid = "";

$(document).ready(() => {

  // Initialise new game
  $.ajax({
    url: "/newgame"
  }).done((data) => {

    // Save game
    game = data.game;
    gameid = game.id;
    
    // Get player
    playerid = data.player;

    // Populate game setup page
    $("#invite").attr("href",location.origin + "/join?game=" + game.id);
    $("#invite").html(location.origin + "/join?game=" + game.id);

  }).fail((data) => {
    // Handle failure
  }).always((data) => {
    // Completion handler
  });

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

  $("#start").click(() => {
    window.location = "/play?game=" + game.id + "&player=" + playerid;
  });

});