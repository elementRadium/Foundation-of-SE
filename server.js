var http = require('http');
var express = require('express');
var app = express();
var redis = require('redis');
var redisClient = redis.createClient();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var users =[];

app.use('/', express.static(__dirname + '/kuojo')); // Here I use express module
server.listen(8080);

io.on('connection', function(client){

  client.on('login', function(nickname) {
    if (users.indexOf(nickname) > -1) {
      client.emit('nickExisted');
    } else {
      // notifications
      client.userIndex = users.length;
      client.nickname = nickname;
      users.push(nickname);
      client.emit('loginSuccess');
      io.sockets.emit('system', nickname, users.length, 'login');
      // load historyMsg
      // redisClient.lrange('msgs', 0, -1, fucntion(err, messages){
      //   var msg_list = messages.reverse();
      //   msg_list.forEach(function(single_msg){
      //     client.emit('loadHistory', nickname);
      //   });
      // });

      redisClient.lrange('messages',0,-1,function(err, messages){
        var msg_list = messages.reverse();
        msg_list.forEach(function(single_msg){
          console.log(single_msg);
          single_msg = JSON.parse(single_msg);
          client.emit('loadHistory', single_msg.name, single_msg.data);
        });
      });
    };
  });

  client.on('disconnect', function() {
    users.splice(client.userIndex, 1);
    client.broadcast.emit('system', client.nickname, users.length, 'logout');
  });

  client.on('postMsg', function(msg) {
    // show message onto the screen
    client.broadcast.emit('newMsg', client.nickname, msg);
    var username = client.nickname;
    var redisMsg = JSON.stringify({
      name:username,
      data:msg});

    // push messages into redis
    redisClient.lpush('messages', redisMsg, function(err, reply){
      console.log('There is/are ' + reply + ' msg in redis.'); // this code is for test
      redisClient.ltrim('messages', 0,4); // just keep the lastest five msgs
    });
  });

});

console.log('server started')
