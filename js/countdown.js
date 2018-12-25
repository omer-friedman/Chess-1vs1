var x;

function startTimer(){

    $("#logout").append("<p id=\"timer\"></p>");
    var seconds = 60;
    clearInterval(x);
    x = setInterval(function() {

      if(seconds == 10)
            $("#timer").toggleClass("red");
      document.getElementById("timer").innerHTML =  "&nbsp"+seconds;
      seconds = seconds - 1;

      if (seconds == 0) {
        clearInterval(x);
        alert("Time's up. you lose.");
        logout();
      }
    }, 1000);

    return x;
}


function stopTimer(){

    document.getElementById("timer").innerHTML = "";
    clearInterval(x);
}