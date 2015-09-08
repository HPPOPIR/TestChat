// socket.io specific code
var currentUser = '';

socket.on('nicknames', function (nicknames) {
    if( socket.ids ) {
        loadOnlineUsers();
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

function hideLoginErrorLabels  () {
    $('#nickname-blank').hide();
    $('#nickname-err').hide();
    $('#password-blank').hide();
    $('#password-err').hide();
}

function login() {
    hideLoginErrorLabels();
    currentUser = $('#nick').val();
    var password = $('#password').val();
    if( !currentUser ) {
        $('#nickname-blank').show();
    } else if ( !password ) {
        $('#password-blank').show();
    } else {
        $.post('/login?username=' + currentUser + '&password=' + password, function (response) {
            if ( response == true ) {
                socket.emit('nickname', currentUser, function (set) {
                    if (set) {
                        $('#nickname-err').show();
                    }
                });
            } else if ( response == false ) {
                $('#password-err').show();
            } else if ( response === 'missing username' ) {
                $('#nickname-missing').show();
            } else {
                console.log(response);
            }
        });
    }
}

function loadRegisterPage () {
    $( '#content' ).load( 'loadRegisterPage');
}

function loadOnlineUsers () {
    $( '#content' ).load( 'onlineUsers', function () {
        getOnlineUsers();
    });
}
