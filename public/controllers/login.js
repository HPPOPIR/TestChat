// socket.io specific code
var currentUser = '',
    currentRoom = '';

socket.on('nicknames', function (nicknames) {
  getOnlineUsers();
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


// dom manipulation
$(function () {
  $('#set-nickname').submit(function (ev) {
    $('#nickname-blank').css('visibility', 'hidden');
    $('#nickname-err').css('visibility', 'hidden');
    currentUser = $('#nick').val();
    socket.emit('nickname', currentUser, function (set) {
      if (!set) {
        clear();
        getOnlineUsers();
        $('#nickname').hide();
        $('#rooms').hide();
        $('#online-users').show();

      }
      $('#nickname-err').css('visibility', 'visible');
    });
    return false;
  });

  $('#send-message').submit(function () {
    socket.emit('user message', $('#message').val(), currentRoom, currentUser);
    clear();
    $('#lines' + currentRoom).get(0).scrollTop = 10000000;
    return false;
  });

  function clear () {
    $('#message').val('').focus();
  };
});
