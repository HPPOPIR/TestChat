socket.on('user message', message);

//socket.on('announcement', function (msg) {
  //$('#lines').append($('<p>').append($('<em>').text(msg)));
//});

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

function createRoom() {
  var roomName = $('#inpRoomName').val(),
      users = getSelectedUsers();
  if( roomName ) {
    socket.emit('createRoom', roomName, users, function () {
      currentRoom = roomName;
    });
  }
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

function getSelectedUsers() {
var users = [];
  $('#online-users input[type="checkbox"]').each( function (key, val) {
    if( $(this).is(":checked") ) {
      users.push($(this).prop('id'));
    }
  });
  users.push(currentUser);
  return users;
}

function clearOnlineUsers() {
  var onlineUsersDiv = $('#online-users');
    onlineUsersDiv.empty()
                  .append($('<div> <button id="btnSelectAllButton" onclick="selectAll()"> Select all </button>  <input type="text" id="inpRoomName" placeholder="Type room name"/> <button id="btnCreateRoom" onclick="createRoom()"> Create room </button>  </div> ' +
                    '<div>  </div> <label> Online users: </label>'));
}

function getOnlineUsers() {
  $.get('/getOnlineUsers', function (onlineUsers) {
    clearOnlineUsers();
    var onlineUsersDiv = document.getElementById('online-users');
    for (var user in onlineUsers) {
      if ( currentUser !== user ) {
        var chbElement = document.createElement('input');
        chbElement.type = 'checkbox';
        chbElement.id = user;

        var lblElement = document.createElement('label');
        lblElement.htmlFor = user;
        lblElement.appendChild(document.createTextNode(user));

        onlineUsersDiv.appendChild(chbElement);
        onlineUsersDiv.appendChild(lblElement);
      }
    }
  });
}
