import { Socket } from "socket.io";
import { User } from "./user";

export interface Room {
  name: string;
  code: string;
  users: User[];
}

export interface CreateEventBody {
  room: {
    name: string;
    code: string
  },
  user: {
    name: string
  }
}

export interface CreateEvent {
  socket: Socket;
  payload: CreateEventBody
}

export interface JoinEventBody {
  room: {
    code: string
  },
  user: {
    name: string
  }
}

export interface JoinEvent {
  socket: Socket;
  payload: JoinEventBody
}

export interface LeaveEventBody {
  room: {
    code: string
  },
  user: {
    id: string
  }
}

export interface LeaveEvent {
  socket: Socket;
  payload: LeaveEventBody
}

export interface CloseEventBody extends LeaveEventBody {}

export interface CloseEvent extends LeaveEvent {
  payload: CloseEventBody
}
