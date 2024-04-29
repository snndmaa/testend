const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const drivers = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle driver registration
  socket.on('registerDriver', (driverId) => {
    drivers[driverId] = socket.id;
    console.log(`Driver ${driverId} registered`);
  });

  // Simulate a driver's movement
  setInterval(() => {
    Object.keys(drivers).forEach((driverId) => {
      const location = {
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
      };

      // Send the location update to the specific driver's channel
      io.to(drivers[driverId]).emit('locationUpdate', location);
    });
  }, 2000);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    
    // Remove driver from the list upon disconnection
    const driverId = Object.keys(drivers).find((key) => drivers[key] === socket.id);
    if (driverId) {
      delete drivers[driverId];
      console.log(`Driver ${driverId} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
