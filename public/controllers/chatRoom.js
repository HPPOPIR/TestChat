socket.on('user message', message);

//socket.on('announcement', function (msg) {
  //$('#lines').append($('<p>').append($('<em>').text(msg)));
//});
var currentRoom = '';

socket.on('calledToRoom', function (users, roomName) {
  currentRoom = roomName;
  showChat(users);
  createRoomWindow(roomName);
});

function message (msg, room) {
  $('#lines' + room).append($('<p>').append($('<b>').text(msg.time + '  ' + msg.username + ': '), msg.text));
}

function switchMessageBox(room) {
  $('div.lines').each(function (key, div) {
    if ( div.id !== ('lines' + room) ) {
      div.style.display = 'none';
    } else {
      div.style.display = 'initial';
    }
  });
}

function changeCurrentRoom(newCurrentRoom) {
  currentRoom = newCurrentRoom ? newCurrentRoom : currentRoom;
  currentRoom = currentRoom.trim();

  $('button.selected').removeClass('selected').addClass('unselected');
  $('.unselected').each(function (key, btn) {
    if ( $(btn).html().trim() === currentRoom ) {
      $(btn).removeClass('unselected').addClass('selected');
    }
  });
  switchMessageBox(currentRoom);
}

function getRooms() {
  $('#room').empty();
  socket.emit('getRooms', function (rooms) {
    rooms.forEach(function (room) {
      $('#room').append('<button id="btnRoom' + room + '" class="unselected" onclick="changeCurrentRoom($(this).html())"> ' + room + ' </button> ')
    });
    changeCurrentRoom();
  });
}

function showChat(users) {
  $('#rooms').show();
  $('#chat').addClass('users-selected');
  addUserNamesToChat(users);
  getRooms();
}

function createRoomWindow(room) {
  $('<div id="lines' + room + '" class="lines"> </div>').insertBefore('#send-message');
  switchMessageBox(room);
}

function addUserNamesToChat(nicknames) {
  $('#nicknames').empty().append($('<span>Online: </span>'));
  for (var i in nicknames) {
    $('#nicknames').append($('<b>').text(nicknames[i]));
  }
}

function selectAll() {
  $('#online-users input[type="checkbox"]').each( function (key, val) { $(this).prop('checked', true); } );
}

$('#send-message').submit(function () {
    socket.emit('user message', $('#message').val(), currentRoom, currentUser);
    clear();
    $('#lines' + currentRoom).get(0).scrollTop = 10000000;
    return false;
});






