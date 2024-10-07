import { Socket } from "socket.io";
import { io } from "../http/server";

interface JoinRequest {
  payload: {
    roomCode: string; 
    username: string
  },
  socket: Socket
}

interface RemoveUsersRequest {
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

export function removeUsers({ socket }: RemoveUsersRequest) {
  for (const roomCode in rooms) {
    rooms[roomCode] = rooms[roomCode].filter((user) => user.id !== socket.id);

    io.to(roomCode).emit('room-users', rooms[roomCode]);
  }
}