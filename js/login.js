	$(document).ready(function(){
		var state = "Login";

		$(document).keypress(function(e) {
            if(e.which == 13)
                login();
        });

		$("#SignUp").click(function(){
			$(this).html("<a href=\"#\" class=\"txt1\">"+state+"</a>");
			if(state === "Login"){
				state = "Sign Up";
				$("#main_title").text("Sign Up");
			} else{
				state = "Login";
				$("#main_title").text("Sign In");
			}
			$("#login-btn").text(state);
		});

		$("#login-btn").click(function(){
            login();
		});

		function login(){
			let email = $("#email").val();
			let pass = $("#password").val();
			console.log(email, pass);
			if(state === "Login"){
			    firebase.database().ref('chess/games/count_games').once('value').then(function(snap){
                    count_games = snap.val();
                    firebase.database().ref('chess/games/'+count_games+'/player1').once('value', function(snapPlayer1){
                        if(snapPlayer1.val() !== email){
                            firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
                                var errorCode = error.code;
                                var errorMessage = error.message;
                                $("#loginMessage").html("<a class=\"txt1\" style=\"color: red\">"+errorMessage+"</a>");
                            });
                        }
                        else
                            $("#loginMessage").html("<a class=\"txt1\" style=\"color: red\">email already signed in.</a>");
                    });
			    });
			} else{
				firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error) {
				    var errorCode = error.code;
				    var errorMessage = error.message;
					$("#loginMessage").html("<a class=\"txt1\" style=\"color: red\">"+errorMessage+"</a>");
				});
			}
		}

		function writeUserToGame(user_email){
	        var game_number;
            firebase.database().ref('chess/games/count_games').once('value').then(function(snapshot){
                game_number = snapshot.val();

                if(game_number === null){
                    firebase.database().ref('chess/games/count_games').set(1);
                    game_number = 1;
                 }



                firebase.database().ref('chess/games/'+game_number).once('value').then(function(snapshot) {
                    if(snapshot.val() === null){
//                        alert("player1, game "+game_number);
                        var startPos = "start"
                        localStorage['user_color'] = "White";
                        firebase.database().ref('chess/games/'+game_number+'/player1').set(user_email);
                        firebase.database().ref('chess/games/'+game_number+'/game_string').set(startPos);
                        firebase.database().ref('chess/games/'+game_number+'/winner').set("None");
                        localStorage['game_number'] = game_number;
                    }
                    else{
//                        alert("player2, game "+game_number);
                        localStorage['user_color'] = "Black";
                        firebase.database().ref('chess/games/'+game_number+'/player2').set(user_email);
                        firebase.database().ref('chess/games/count_games').set(game_number+1);
                        localStorage['game_number'] = game_number;
                    }
                    location.href = "chess.html";
                });
            });
        }

		firebase.auth().onAuthStateChanged(function(user){
			if (user) {
				var uid = user.uid;
				var email = user.email;
				localStorage['user_email'] = email;
				localStorage['user_uid'] = uid;
				localStorage['winner'] = 'None';
				localStorage['game_started'] = 'False';
				writeUserToGame(email);
			}
			else{
			    localStorage['user_email'] = "None";
				localStorage['user_uid'] = "None";
				localStorage['user_color'] = "None";
				localStorage['winner'] = "None";
				localStorage['game_started'] = 'False';
			}
		});
	});