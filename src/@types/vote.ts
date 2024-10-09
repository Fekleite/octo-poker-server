import { Socket } from "socket.io";

export interface Vote {
  value: string | number;
  user: string;
}

export interface SendEventBody {
  room: {
    code: string
  },
  value: string | number
}

export interface SendEvent {
  socket: Socket;
  payload: SendEventBody
}

export interface RevealEventBody {
  room: {
    code: string
  }
}

export interface RevealEvent {
  socket: Socket;
  payload: RevealEventBody
}

export interface ResetEventBody extends RevealEventBody {}

export interface ResetEvent extends RevealEvent{
  payload: ResetEventBody
}