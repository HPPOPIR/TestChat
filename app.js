/**
 * Module dependencies.
 */

var express = require('express'),
    session = require('express-session'),
    stylus = require('stylus'),
    nib = require('nib'),
    sio = require('socket.io'),
    _ = require('underscore'),
    crypto = require('crypto'),
    mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/chatDB');
var db = mongoose.connection;

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
  app.set('views', __dirname + '/public/views');
  app.set('view engine', 'jade');
    app.set("view options", { layout: false });
    app.use(session({secret: 'secret'}));

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

    function checkRoomName (roomName) {
        var result = true;
        _.each(rooms, function (room) {
            if( room.roomName === roomName ) {
                result = false;
            }
        });

        return result;
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
      if ( checkRoomName(roomName) ) {
          addUsersToRoom(users, roomName);
          rooms.push( createRoom(roomName, users) );
          callback();
      } else {
          callback(true); // When returning true, frontend will show error message.
      }
  });

  socket.on('nickname', function (nick, fn) {
      if( nick ) {
          if ( checkUsername(nick) ) {
              nicknames[nick] = socket.nickname = nick;
              io.sockets.emit('nicknames', nicknames);
              fn(false);
          } else {
              fn(true);
          }
      } else {
          io.sockets.emit('emptyNickname');
      }
  });

  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
//    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
  });
}, function (err) {
    console.log(err);
});

function checkUsername (nick) {
    if (nicknames[nick]) {
        return false;
    } else {
        return true;
    }
}

/**
 * App routes.
 */

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/getOnlineUsers', function (req, res) {
    return res.json(nicknames);
});

app.post('/login', function (req, res) {
    var username = req.param('username');
    if ( checkUsername(username) ) {
        req.session.currentUser = username;
        return res.json('home');
    } else {
        return res.json(true);
    }
});

app.get('/login', function (req, res) {
    res.render('login' );
});

app.get('/rooms', function (req, res) {
    res.render('rooms');
});
app.get('/onlineUsers', function (req, res) {
    res.render('onlineUsers');
});




// Registration logic

function getNextID () {
    ItemModel.findOne().max('_id').exec(function(err, item) {
        // item.itemId is the max value
    });
}


function insertUser (user) {
    var newUser = mongoose.model('Users', { _id: getNextID(), name: user.name, password: user.password, salt: user.salt});

    User.save('Users', newUser);
}









