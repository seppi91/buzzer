/**
 * 
 */

var wsPort = settings.ws_port;
var serverDomain = settings.server_domain;

var socket;
var pid;
var id;

function giveBirthToSocket() 
{	socket = new WebSocket("ws:" + serverDomain + ":" + wsPort);

	socket.onopen = function(event) {

	};

	socket.onclose = function(event) {

	};

	// Received a message from the server
	socket.onmessage = function(event) {
		var msg = JSON.parse(event.data);
		switch (msg.label) {
		case 'accepted client connection':
			if (msg.id == id) {
				pid = msg.pid;
				$('#player').html("<h1>Player " + pid + "</h1>");
			}
			break;
		case 'abort player connection':
			if (msg.id == id) {
				window.location.href = "connection_refused.html";
			}
			break;
		case 'enable buzz':
			enableBuzz();
			break;
		case 'disable buzz':
			disableBuzz();
			break;
		case 'opponent buzzed':
			if (msg.pid != pid) {
				opponentBuzzed();
			}
			break;
		default:
			// Nothing
		}
	}
	setTimeout(function() {
		socket.send(JSON.stringify({
			'label' : 'client connection',
			'id'	: id
		}));
	}, 500);
}


function opponentBuzzed() {
	$("#buzzbutt").attr("src", "img/Buzzer_off.png");
	$("input").prop('disabled', true);
}

function enableBuzz() {
	$("#buzzbutt").attr("src", "img/Buzzer_green_off.png");
	$("input").prop('disabled', false);
}

function disableBuzz() {
	$("#buzzbutt").attr("src", "img/Buzzer_off.png");
	$("input").prop('disabled', true);
}

function showCountdown(bullets) {
	var bullets = 4;
	$("#countdown").css("visibility", "visible");
	setTimeout(function(){
		var cdinterval = setInterval(function() {
			if (bullets == -1) {
				$("#countdown").css("visibility", "hidden");
				$("#countdownimg").attr("src", "img/CountDown_Bullet_5.png");
				clearInterval(cdinterval);
				return;
			}
	
			$("#countdownimg").attr("src", "img/CountDown_Bullet_" + bullets + ".png");
	
			bullets -= 1;
	
		 }, 1000)
	}, 2000)
}

function sendBuzz() {
	setTimeout(function(){
		$("#buzzbutt").attr("src", "img/Buzzer_green_off.png");
	}, 1000);
	$("#buzzbutt").attr("src", "img/Buzzer_green_on.png");
	socket.send(JSON.stringify({
		'label' : 'buzz',
		'pid' : pid
	}));
	$("input").prop('disabled', true);

	showCountdown();
}

function cguid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return 'c' + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

$(function() {
	pid = -1;
	id = cguid();
	$('#buzzbutt').on('click', function() {
		sendBuzz();
	});
	giveBirthToSocket();
});