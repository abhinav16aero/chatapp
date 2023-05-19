const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add your Firebase database URL
  databaseURL: 'https://chatappmercor.firebaseio.com',
});

app.use(express.static('public'));

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      socket.userEmail = decodedToken.email;
      next();
    })
    .catch((error) => {
      console.error('Error verifying Firebase ID token:', error);
      next(new Error('Unauthorized'));
    });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.userEmail);

  socket.on('chat message', (msg) => {
    console.log('Message:', msg);
    io.emit('chat message', { message: msg, sender: socket.userEmail });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.userEmail);
  });
});

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
