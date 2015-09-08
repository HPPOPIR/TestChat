socket.on('user message', message);

socket.on('announcement', function (msg) {
  $('#lines').append($('<p>').append($('<em>').text(msg)));
});
var currentRoom = '';

socket.on('calledToRoom', function (users, roomName) {
  currentRoom = roomName;
  if( confirm("You are added to room: " + roomName + ", do you want to open it?") ) {
    showChat(users);
  }
});

function openRoom (roomName) {
    $.get('/openRoom?roomName=' + roomName, function (response) {
        currentRoom = roomName;
        socket.emit('joinInRoom', roomName);
        showChat( response.users );
    });
}

function message (msg, room) {
  $('#lines' + room).append($('<p>').append($('<b>').text(msg.time + '  ' + msg.username + ': '), msg.text));
}

function switchMessageBox(room) {
    $.post('/getChatRoomContent?room=' + room, function (roomContent) {
        insertRoomMessages(roomContent);
        $('div.lines').each(function (key, div) {
            if ( div.id !== ('lines' + room) ) {
                div.style.display = 'none';
            } else {
                div.style.display = 'initial';
            }
        });
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
  $('#content').load('chatRoom', function () {
      addUserNamesToChat(users);
      getRooms();
//      insertRoomMessages(currentRoom);
  });
}

function insertRoomMessages(room) {
  $('div.lines').empty();
  $('<div id="lines' + room.roomName + '" class="lines"> </div>').insertBefore('#send-message');
  room.messages.forEach(function (msg) {
    message(msg, room.roomName);
  });
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

function sendMessage() {
    socket.emit('user message', $('#message').val(), currentRoom, currentUser);
    clear();
    $('#lines' + currentRoom).get(0).scrollTop = 10000000;
    return false;
}






