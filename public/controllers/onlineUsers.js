
socket.on('refreshOnlineUsers', function () {
    getOnlineUsers();
});

function addRooms () {
    $('<div id="roomsDiv"> </div>').insertAfter('#usersDiv');
    $.post('/getRooms?username=' + currentUser, function (response) {
        if( response.err ) {
            console.log(response.err);
        } else {
            response.rooms.forEach(function (room) {
                $('<button onclick="openRoom( $(this).html())">  </button>').html(room).insertAfter('#roomsDiv');
            });
        }
    });
}

function addErrorLabels () {
    $( "<label id='users-not-selected' class='error'> Please select at least one user! </label>" ).insertAfter( "#btnCreateRoom" );
    $( "<label id='room-name-blank' class='error'> Please type room name! </label>" ).insertAfter( "#btnCreateRoom" );
    $( "<label id='room-name-used' class='error'> This room name is already in use! </label>" ).insertAfter( "#btnCreateRoom" );
    hideErrorLabels();
}

function hideErrorLabels () {
    $('#room-name-blank').hide();
    $('#users-not-selected').hide();
    $('#room-name-used').hide();
}

function getOnlineUsers() {
    $.get('/getOnlineUsers', function (onlineUsers) {
        clearOnlineUsers();
        var mainDiv = document.getElementById('online-users'),
            newDiv = document.createElement('div');
        newDiv.id = 'usersDiv';
        for (var user in onlineUsers) {
            if ( currentUser !== user ) {
                var chbElement = document.createElement('input');
                chbElement.type = 'checkbox';
                chbElement.id = user;

                var lblElement = document.createElement('label');
                lblElement.htmlFor = user;
                lblElement.appendChild(document.createTextNode(user));

                newDiv.appendChild(chbElement);
                newDiv.appendChild(lblElement);
            }
        }
        mainDiv.appendChild(newDiv);
        addErrorLabels();
        addRooms();
    });
}

function clearOnlineUsers() {
    var onlineUsersDiv = $('#online-users');
    onlineUsersDiv.empty()
        .append($('<div> <button id="btnSelectAllButton" onclick="selectAll()"> Select all </button>  <input type="text" id="inpRoomName" placeholder="Type room name"/> <button id="btnCreateRoom" onclick="createRoom()"> Create room </button>  </div> ' +
            '<div>  </div> <label> Online users: </label>'));
}

function createRoom() {
    hideErrorLabels();
    var roomName = $('#inpRoomName').val(),
        users = getSelectedUsers();
    if( roomName ) {
        if ( users.length > 1 ) {
            socket.emit('createRoom', roomName, users, function (err) {
                if ( err ) {
                    $('#room-name-used').show();
                } else {
                    currentRoom = roomName;
                }
            });
        } else {
            $('#users-not-selected').show();
        }
    } else {
        $('#room-name-blank').show();
    }
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