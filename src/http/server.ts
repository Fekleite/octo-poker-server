import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { CloseEventBody, CreateEventBody, JoinEventBody, LeaveEventBody } from '../@types/room';
import { ResetEventBody, RevealEventBody, SendEventBody } from '../@types/vote';

import RoomController from '../controllers/RoomController';
import VoteController from '../controllers/VoteController';

const app = express()
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173']
  }
});

io.on('connection', (socket) => {
  // Room
  socket.on('create-room', (body: CreateEventBody) => {
    RoomController.create({ socket, payload: body })
  })
  socket.on('join-room', (body: JoinEventBody) => {
    RoomController.join({ socket, payload: body })
  })
  socket.on('leave-room', (body: LeaveEventBody) => {
    RoomController.leave({ socket, payload: body })
  })
  socket.on('close-room', (body: CloseEventBody) => {
    RoomController.close({ socket, payload: body })
  })

  // Vote
  socket.on('send-vote', (body: SendEventBody) => {
    VoteController.send({ socket, payload: body })
  })
  socket.on('reveal-votes', (body: RevealEventBody) => {
    VoteController.reveal({ socket, payload: body })
  })
  socket.on('reset-votes', (body: ResetEventBody) => {
    VoteController.reset({ socket, payload: body })
  })
});

server.listen(3333, () => {
  console.log('Server running at http://localhost:3333');
});