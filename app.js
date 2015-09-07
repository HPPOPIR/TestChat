/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , sio = require('socket.io'),
    _ = require('underscore');

/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */

app.configure(function () {
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname);
  app.set('view engine', 'jade');

  function compile (str, path) {
    return stylus(str)
      .set('filename', path)
      .use(nib());
  }
});

/**
 * App listen.
 */

app.listen(process.env.PORT|| 9999, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

/**
 * Socket.IO server (single process only)
 */

var io = sio.listen(app)
  , nicknames = {},
    rooms = [];



io.sockets.on('connection', function (socket) {

    function generateMessage (username, msgText) {
        return {username: username, text: msgText, time: getTime()} ;
    }

    function createRoom (roomName, users) {
        return {roomName: roomName, users: users, messages: [] } ;
    }

    function getTime() {
        var now = new Date();
        return (now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
    }

    function addUsersToRoom(users, room) {
        users.forEach(function (user) {
            io.sockets.sockets.every(function (s) {
                if( s.nickname === user) {
                    s.join(room);
                    s.emit('calledToRoom', users, room);
                        s.broadcast.emit('announcement', s.nickname + ' connected');
                    return false;
                } else {
                    return true;
                }
            });
        });
    }

  socket.on('getRooms', function (callback) {
      callback(socket.rooms.slice(1));
  });

  socket.on('user message', function (msg, roomName, user) {
      var tmpMessage = generateMessage(user, msg);
      _.find(rooms, function (room) {
          if( room.roomName === roomName ) {
              room.messages.push( tmpMessage );
          }
      });
      io.sockets.in(roomName).emit('user message', tmpMessage, roomName);
  });

  socket.on('createRoom', function (roomName, users, callback) {
      addUsersToRoom(users, roomName);
      rooms.push( createRoom(roomName, users) );
      callback();
  });

  socket.on('nickname', function (nick, fn) {
      if ( nick ) {
          if (nicknames[nick]) {
              fn(true);
          } else {
              fn(false);
              nicknames[nick] = socket.nickname = nick;
              io.sockets.emit('nicknames', nicknames);
          }
      } else {
          io.sockets.emit('emptyNickname');
      }
  });

  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
  });
}, function (err) {
    console.log(err);
});

/**
 * App routes.
 */

app.get('/', function (req, res) {
    res.render('index', { layout: false });
});

app.get('/getOnlineUsers', function (req, res) {
    return res.json(nicknames);
});
