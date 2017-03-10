var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('sever running...');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
  //CONNECT
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  //Disconnect
  socket.on('disconnect', function(data){
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //SEND MESSAGE
  socket.on('send message', function(data){

    var checkChat = data;
    var idsave = this.id;
    var found = false;

    //NICK CHANGE
    if (checkChat.match("/nick")){
      newUsername = checkChat.slice(6);
      newUsername.replace(/\s+/g, '');

        for (var i = 0; i < users.length && !found; i++) {
          if (users[i] === newUsername) {
            found = true;
          }
      }

      if(found == true){
          alertShow(idsave);
      }
      else{
        users.splice(users.indexOf(socket.username), 1);
        socket.username = newUsername;
        users.push(socket.username);
        updateUsernames();
      }
    }

    // SEND MESSAGE
    socket.emit('my message', {msg: data, user: socket.username});
    socket.broadcast.emit('new message', {msg: data, user: socket.username});
  });

  //ADD NEW USER
  socket.on('new user', function(data, callback){
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  //UPDATE NAME
  function updateUsernames(){
    io.sockets.emit('get users', users);
  }

  //ERROR MESSAGE
  function alertShow(data){
    var idid = data;
    io.sockets.connected[idid].emit('show alert', data);
  }
});
