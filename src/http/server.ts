import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { join, removeUsers } from '../controllers/RoomController';

const app = express()
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173']
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomCode, username }: { roomCode: string; username: string }) => {
    const payload = { roomCode, username }
    join({ socket, payload })
  })

  socket.on('disconnect', () => {
    removeUsers({ socket })
  })
});

server.listen(3333, () => {
  console.log('Server running at http://localhost:3333');
});