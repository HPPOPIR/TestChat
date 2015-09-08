// socket.io specific code
var currentUser = '';

socket.on('nicknames', function (nicknames) {
    if( socket.ids ) {
        $( '#content' ).load( 'onlineUsers', function () {
            getOnlineUsers(nicknames);
        });
    }
});

socket.on('emptyNickname', function () {
  $('#nickname-blank').css('visibility', 'visible');
});

socket.on('reconnect', function () {
  $('#lines').remove();
  message('System', 'Reconnected to the server');
});

socket.on('reconnecting', function () {
  message('System', 'Attempting to re-connect to the server');
});

socket.on('error', function (e) {
  message('System', e ? e : 'A unknown error occurred');
});

function login() {
    $('#nickname-blank').css('visibility', 'hidden');
    $('#nickname-err').css('visibility', 'hidden');
    currentUser = $('#nick').val();
    $.post('/login?username=' + currentUser, function (response) {
        socket.emit('nickname', currentUser, function (set) {
            if (!set) {
//                clear();
            } else {
                $('#nickname-err').css('visibility', 'visible');
            }
        });
    });
}

function clear () {
    $('#message').val('').focus();
}
