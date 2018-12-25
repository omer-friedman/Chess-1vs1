$(document).ready(function(){
        var player1_name;
        var player2_name;
        var position = 'start';
        firebase.database().ref('chess/games/'+localStorage.game_number).on('value', function(snap){
            game = snap.val();
            player1_name = game.player1;
            player2_name = game.player2;
            $('#player_1').html(player1_name);
            if(player2_name === undefined)
                $('#player_2').html("Waiting for the other player.");
            else
            {
                $('#player_2').html(player2_name);
                localStorage['game_started'] = "true";
            }

            firebase.database().ref('chess/games/'+localStorage.game_number+'/game_string').on('value', function(snap){
                position = snap.val();
                init();
            });
        });


        var init = function() {

            var gameTimer;
            $('#logout').html("<p style=\"float:left;\">Logout</p>");

            var board, game = new Chess(position === 'start' ? undefined : position);
            // do not pick up pieces if the game is over
            // only pick up pieces for the side to move
            var onDragStart = function(source, piece, position, orientation) {
                if (game.game_over() === true || (player1_name === undefined) || (player2_name === undefined) ||
                  (localStorage.user_color === "White" && piece.search(/^w/)) ||
                  (localStorage.user_color === "Black" && piece.search(/^b/))) {
                    return false;
                }
            };

            var onDrop = function(source, target) {
                // see if the move is legal
                var move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q' // NOTE: always promote to a queen for example simplicity
                });
                // illegal move
                if (move === null) return 'snapback';

                stopTimer();

                updateStatus();

                firebase.database().ref('chess/games/'+localStorage.game_number+'/game_string').set(game.fen());

                $("audio")[0].play();
            };

            // update the board position after the piece snap
            // for castling, en passant, pawn promotion
            var onSnapEnd = function() {
              board.position(game.fen());
            };

            var updateStatus = function() {
                if(localStorage.game_started === "true"){
                    var status = '';
                    var moveColor;

                     if (game.turn() === 'w')
                        moveColor = 'White';
                     else
                        moveColor = 'Black';

                    firebase.database().ref('/chess/games/'+localStorage.game_number+'/winner').on('value',function(snap){
                        var playerLeft = snap.val()
                        // some player left?
                        if(playerLeft === 'None'){
                               // checkmate?
                              if (game.in_checkmate() === true) {
                                if(localStorage.user_color == moveColor){
                                    status = "Game over, Opponent won :(";
                                    localStorage['winner'] = player2_name;
                                }
                                else{
                                    status = "Game over, you won!!!";
                                    localStorage['winner'] = player1_name;
                                    new Audio("sounds/yahoo.mp3").play();
                                }
                              }

                              // draw?
                              else if (game.in_draw() === true) {
                                status = 'Game over, drawn position';
                                localStorage['winner'] = "draw";
                              }

                              // game still on
                              else {

                                if(moveColor === localStorage.user_color)
                                    startTimer();

                                if(moveColor === "White")
                                        status = "<img src=\"images/left-arrow.png\">";
                                else
                                        status = "<img src=\"images/right-arrow.png\">";


                                // check?
                                if (game.in_check() === true)
                                  status += moveColor + ' is in check';

                              }
                        }
                        else{
                            status = "Opponent left. You WON!";
                            new Audio("sounds/yahoo.mp3").play();
                        }

                        $("#result").html(status);
                    });
                }
            };

            var cfg = {
              draggable: true,
              position: position,
              onDragStart: onDragStart,
              onDrop: onDrop,
              onSnapEnd: onSnapEnd
            };

            board = ChessBoard('board', cfg);

            updateStatus();
        }; // end init()
});