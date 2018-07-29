/**
 * 
 */

var wsPort = settings.ws_port;
var serverDomain = settings.server_domain;

var socket;
var sent = 0;
var firstBuzz = 0;
var connectionAccepted = 0;
var connectionsDisabled = 0;
var buzzAudio = [];
var countdownAudio;
var id;
var connectedPlayers = [];

function giveBirthToSocket() {
	socket = new WebSocket("ws:" + serverDomain + ":" + wsPort);

	socket.onopen = function(event) {

	};

	socket.onclose = function(event) {

	};

	// Received a message from the server
	socket.onmessage = function(event) {
		var msg = JSON.parse(event.data);
		switch (msg.label) {
		case 'accepted host connection':
			if (msg.id == id) {
				connectionAccepted = 1;
			} else {
				window.location.href = "connection_refused.html";
			}
			break;
		case 'abort host connection':
			if (msg.id == id) {
				window.location.href = "connection_refused.html";
			}
			break;
		case 'accepted client connection':
			addToConnected(msg.pid);
			break;
		case 'client disconnected':
			removeFromConnected(msg.pid);
			break;
		case 'buzz order':
			var buzzOrder = msg.order;
			setBuzzOrder(buzzOrder);
			break;
		default:
			// Nothing
		}
	};
	setTimeout(function() {
		socket.send(JSON.stringify({
			'id'	: id,
			'label' : 'host connection'
		}));
	}, 500);
}

function addToConnected(pid) {
	connectedPlayers.push(pid);
	refreshConnectedDisplay();
}

function removeFromConnected(pid) {
	var index = connectedPlayers.indexOf(pid);
	if (index > -1) {
		connectedPlayers.splice(index, 1);
	}
	refreshConnectedDisplay();
}

function refreshConnectedDisplay() {
	var content = "<h2>Connected players:</h2>";
	for (var i = 0; i < connectedPlayers.length; i++) {
		content += "<h2>Player "+connectedPlayers[i]+"</h2>";
	}
	$('#players').html(content);
}

function enableBuzz() {
	$('#bstatus').html("<h2 class='enabled'>Buzzers: Enabled</h2>");
	$('#rheader').html("<h1>Buzz order:</h1>");
	$('#order').html("<h2> Waiting for buzzers...</h2>");
	socket.send(JSON.stringify({
		'id'	: id,
		'label' : 'enable buzz'
	}));
}

function disableBuzz() {
	$('#bstatus').html("<h2 class='disabled'>Buzzers: Disabled</h2>");
	socket.send(JSON.stringify({
		'id'	: id,
		'label' : 'disable buzz'
	}));
	
}

function toggleConnections() {
	if (connectionsDisabled) {
		connectionsDisabled = 0;
		$('#togbutt').html("Disable Connections");
	} else {
		connectionsDisabled = 1;
		$('#togbutt').html("Enable Connections");
	}
	socket.send(JSON.stringify({
		'id'	: id,
		'label' : 'toggle connections'
	}));
}

function playBuzzSound(pid) {
	var audioToPlay = 1;
	if (1 <= pid && pid <= 11) {
		audioToPlay = pid;
	}
	buzzAudio[audioToPlay-1].currentTime=0;
	buzzAudio[audioToPlay-1].play();
	window.setTimeout(function() {
		countdownAudio.currentTime=0;
		countdownAudio.play();
	}, 3000)
	/* buzzAudio[audioToPlay-1].onended = function() {
		countdownAudio.currentTime=0;
		countdownAudio.play();
	} */
}

function setBuzzOrder(order) {
	if (order.length == 1) {
		playBuzzSound(order[0]);
	}
	var content = "<h1>";
	for (var i = 0; i < order.length; i++) {
		var p = order[i];
		content += String(p);
		if (i < order.length-1) {
			content += " | "
		}
	}
	content += "</h1>";
	$('#order').html(content);
}

function hguid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return 'h' + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function loadAudioFiles() {
	countdownAudio = new Audio("audio/beeb_countdown_5sec.mp3")
	buzzAudio[0] = new Audio("audio/hupe.mp3");
	buzzAudio[1] = new Audio("audio/rimshot.mp3");
}

$(function() {
	id = hguid();
	loadAudioFiles();
	$('#togbutt').on('click', function() {
		toggleConnections();
	});
	$('#enabutt').on('click', function() {
		enableBuzz();
	});
	$('#disbutt').on('click', function() {
		disableBuzz();
	});
	giveBirthToSocket();
});