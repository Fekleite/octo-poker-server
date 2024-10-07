import { Socket } from "socket.io"
import { io } from "../http/server"

interface SendVoteRequest {
  payload: {
    vote: string
    roomCode: string
  },
  socket: Socket
}

export function sendVote({ socket, payload }: SendVoteRequest) {
  const { roomCode, vote} = payload

  io.to(roomCode).emit('message', { user: socket.id, vote })
}