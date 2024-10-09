import { CloseEvent, CreateEvent, JoinEvent, LeaveEvent, Room } from "../@types/room";
import { io } from "../http/server";

interface RoomsByCode {
  [key: string]: Room;
}
class RoomController {
  rooms: RoomsByCode = {}

  create({ socket, payload }: CreateEvent) {
    const { room, user } = payload;
  
    socket.join(room.code)
  
    if (!this.rooms[room.code]) {
      this.rooms[room.code] = {
        name: room.name,
        code: room.code,
        users: []
      }
    }
  
    this.rooms[room.code].users.push({ 
      id: socket.id,
      name: user.name,
      role: 'admin'
    })
  
    io.to(room.code).emit('room-users', this.rooms[room.code]);
  }

  join({ socket, payload }: JoinEvent) {
    const { room, user } = payload;
  
    socket.join(room.code)
  
    if (!this.rooms[room.code]) {
      socket.emit('error', { error: "This room doesn't exists." })
    }
  
    this.rooms[room.code].users.push({ 
      id: socket.id, 
      name: user.name,
      role: 'default'
    });
  
    io.to(room.code).emit('room-users', this.rooms[room.code]);
  }

  leave({ socket, payload }: LeaveEvent) {
    const { room, user } = payload

    socket.leave(room.code)

    this.rooms[room.code].users.filter(u => u.id !== user.id)

    io.to(room.code).emit('room-users', this.rooms[room.code]);
  }

  close({ socket, payload }: CloseEvent) {
    const { room, user } = payload

    const isAdminUser = this.rooms[room.code].users.find(u => u.id === user.id && u.role === 'admin')

    if (!isAdminUser) {
      socket.emit('error', { error: "You must be an admin to close a room." })
    }

    const roomThatWillBeClosed = io.sockets.adapter.rooms.get(room.code)

    if (!roomThatWillBeClosed) {
      socket.emit('error', { error: "This room doesn't exists." })
    }

    roomThatWillBeClosed?.forEach((socketId) => {
      const socketToLeave = io.sockets.sockets.get(socketId);

      if (socketToLeave) {
        socketToLeave.leave(room.code)
      }
    })

    delete this.rooms[room.code];
  }
}

export default new RoomController;