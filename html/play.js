const urlParams = new URLSearchParams(window.location.search);
const gameid = urlParams.get("game");
const playerid = urlParams.get("player");

let game = {};

let playing = false;

let judging = false;

let answer = "";

let winner = "";

function showQuestion() {

  answer = "";

  $(".cards").hide();
  $("#question").hide();
  $("#answer").hide();
  $("#answers").hide();
  $("#answer").attr("contenteditable","true");
  $("#answer").removeClass("answered");
  $("#players li").removeClass("answered");

  const question = game.current.card.replace("[]","<span class='answer'></span>");
  $("#question").html(question);
  $("#question").show();

  if (game.current.judge != playerid) {

    $("#answer").html("");
    $("#answer").show();
    $("#answer").focus();

  }

}

function judge() {

  winner = "";

//  $(".cards").hide();
  $("#answer").hide();
  $("#answers").removeClass("judging");

  const question = game.current.card.replace("[]","<span class='answer'></span>");
  $("#question").html(question);
  $("#question").show();

  for (player in game.current.answers) {

    console.log(game.current.answers[player].answer);

    $("#answers").append(`<li id="answer-${player}" class="card" krazyplayer="${player}">${game.current.answers[player].answer}</li>`);

  }

  if (game.current.judge == playerid) {

    $("#answers").addClass("judging");

    $("#answers .card").click(function() {

      winner = $(this).attr("krazyplayer");

      judging = false;

      $.ajax({
        url: "/judge/" + gameid + "/" + winner
      }).done((data) => {

      }).fail((data) => {

      }).always((data) => {

      });

    });

  }

  $("#answers").show();
}

function checkStatus() {

  $.ajax({
    url: "/getgame/" + gameid
  }).done((data) => {

    game = data;

    displayPlayers();

    if (game.status == "waiting") {

      playing = false;

      judging = false;

    } else if (game.status == "playing") {

      game = data;

      console.log(playing);

      if (!playing) {

        playing = true;

        judging = false;

        $("#waiting").hide();
        $("#waitinghost").hide();

        $("#answers").html("");
        $("#answers").hide();

        showQuestion();

      }

    } else if (game.status == "judging") {

      game = data;

      if (!judging) {

        playing = false;

        judging = true;

        judge();

      }

    } else {

      console.log("done");
      
      $("#game div").hide();
      $("#game ul").hide();
      $("#players").show();
      $("#done").html(`${game.players[game.winner].name} won!`);
      $("#done").show();
      if (game.host == playerid) {
        $("#new").show();
        $("#new").click(function () {
          window.location = "/";
        })
      }

    }


  }).fail((data) => {

  }).always((data) => {

  });

  if (game.status != "done") {
    setTimeout(checkStatus,1000);
  }

}

function displayPlayers() {

  $("#players").html("");

  for (id in game.players) {

    const player = game.players[id];
    $("#players").append(`<li id="player-${player.id}"><img class="gavel" src="gavel.svg" />${player.name}<span class="score">${player.score}</span>` + ((game.host == playerid && player.id != playerid) ? (`<img class="close" src="close.svg" playerid="${player.id}" />`) : ``) + `</li>`);
    if (game.current.answers.hasOwnProperty(id)) { $("li#player-" + id).addClass("answered"); }

  }

  $("li#player-" + playerid).addClass("me");

  $("#players li").removeClass("judge");
  $("#player-" + game.current.judge).addClass("judge");

  $("#players li img.close").click(function() {
    let removeid = $(this).attr("playerid");
    $.ajax({
      url: "/removeplayer/" + game.id + "/" + removeid
    }).done((data) => {
    }).fail((data) => {
    }).always((data) => {
    });
  });

}

$(document).ready(() => {

  // Join game as new player
  $.ajax({
    url: "/getgame/" + gameid
  }).done((data) => {

    // Save game
    game = data;

    // Display players
    displayPlayers();

    $("#players").show();

    // Display join URL
    if (playerid == game.host) {
      $("#joinurl").html("Invitation URL: " + location.origin + "/join?game=" + game.id);
    }  
    
    if (game.status == "waiting") {

      if (game.host == playerid) {

        $("#waitinghost").show();

        $("#start").click(() => {

          $.ajax({
            url: "/startgame/" + gameid
          }).done((data) => {

          }).fail((data) => {

          }).always((data) => {

          });

        });

      } else {

        $("#waiting").show();

      }

    }

    setTimeout(checkStatus,1000);

  }).fail((data) => {
    // Handle failure
  }).always((data) => {
    // Completion handler
  });

  $("#answer").keyup((e) => {
    if (e.originalEvent.key == "Enter") {
      $("#answer").removeAttr("contenteditable");
      $("#answer").addClass("answered");
      $("li#player-" + playerid).addClass("answered");
      $.ajax({
        url: "/answer/" + gameid + "/" + playerid + "/" + answer
      }).done((data) => {

      }).fail((data) => {

      }).always((data) => {

      });
    } else {
      answer = $("#answer").html();
    }
  })

});