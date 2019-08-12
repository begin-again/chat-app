const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const socketio = require('socket.io');
const Filter = require('bad-words');
const filter = new Filter();
const { generateMessage, generateLocationMessage } = require('./lib/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./lib/user');

const server = http.createServer(app);
const io = socketio(server);

const pubPath = path.join(__dirname, '../public');
app.use(express.static(pubPath));

let connections = 0;

io.on('connection', (socket) => {
  connections += 1;
  console.info(`New WebSocket connection. ${connections} users connected.`);

  socket.on('sendMessage', (message, ack) => {
    const user = getUser(socket.id);

    if (!user) return ack('username is required!');

    io.to(user.room).emit(
      'message',
      generateMessage(filter.clean(message), user.username)
    );
    return ack(null, 'message delivered');
  });

  socket.on('sendLocation', (location, ack) => {
    const user = getUser(socket.id);
    if (!user) return ack('username is required!');

    const { latitude, longitude } = location;
    if (latitude && longitude) {
      io.to(user.room).emit(
        'locationMessage',
        generateLocationMessage(`https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`, user.username)
      );
      return ack(null, 'Location shared');
    }
    ack('coordinates are required!');
  });

  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) return cb(error);

    socket.join(user.room);
    socket.emit(
      'message',
      generateMessage(`Welcome!`)
    );

    socket.broadcast.to(user.room).emit(
      'message',
      generateMessage(`${user.username} has joined`)
    );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    return cb();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage(`${user.username} has left!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
    connections -= 1;
    console.info(`A user has left! There are ${connections} users connected.`);
  });
});

module.exports = {
  app,
  server
};
