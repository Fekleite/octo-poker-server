import { Socket } from "socket.io";
import { io } from "../http/server";

interface JoinRequest {
  payload: {
    roomCode: string; 
    username: string
  },
  socket: Socket
}

interface RoomUser {
  id: string;
  username: string;
}

interface Rooms {
  [key: string]: RoomUser[];
}

const rooms: Rooms = {}

export function join({ socket, payload }: JoinRequest) {
  const { roomCode, username } = payload;

  socket.join(roomCode)

  if (!rooms[roomCode]) {
    rooms[roomCode] = []
  }

  rooms[roomCode].push({ id: socket.id, username });

  io.to(roomCode).emit('room-users', rooms[roomCode]);
}