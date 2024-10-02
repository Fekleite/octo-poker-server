import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express()
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173']
  }
});

io.on('connection', (socket) => {
  console.log('Connected user', socket.id);
});

server.listen(3333, () => {
  console.log('Server running at http://localhost:3333');
});