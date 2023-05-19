import { Server } from 'socket.io';
import express from 'express';
import { createServer } from 'http';
import admin from 'firebase-admin';


const app = express();
const http = createServer(app);
const io = new Server(http);
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add your Firebase database URL
  databaseURL: 'https://chatappmercor.firebaseio.com',
});

// Get a reference to the Firebase Realtime Database
const db = admin.database();
const messagesRef = db.ref('messages');

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.on('user_join', function(data) {
    this.username = data;
    socket.broadcast.emit('user_join', data);
  });

  socket.on('chat_message', function(data) {
    const message = {
      username: this.username,
      text: data.text,
      timestamp: Date.now(),
    };

    messagesRef.push(message); // Store the message in Firebase

    socket.broadcast.emit('chat_message', message);
  });

  socket.on('disconnect', function(data) {
    socket.broadcast.emit('user_leave', this.username);
  });
});

http.listen(port, function() {
  console.log('Listening on *:' + port);
});
