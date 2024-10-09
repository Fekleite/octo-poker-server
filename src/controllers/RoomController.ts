import { CloseEvent, CreateEvent, JoinEvent, LeaveEvent, Room } from "../@types/room";
import { User } from "../@types/user";
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
  
    io.to(room.code).emit('on-room-was-create', { room: this.rooms[room.code] });
  }

  join({ socket, payload }: JoinEvent) {
    const { room, user } = payload;
  
    socket.join(room.code)
  
    if (!this.rooms[room.code]) {
      socket.emit('error', { error: "This room doesn't exists." })

      return;
    }

    const newUser: User = { 
      id: socket.id, 
      name: user.name,
      role: 'default'
    }
  
    this.rooms[room.code].users.push(newUser);
  
    io.to(room.code).emit('on-user-joined-room', { 
      user: newUser,
      room: this.rooms[room.code]
    });
  }

  leave({ socket, payload }: LeaveEvent) {
    const { room, user } = payload

    const userLeftRoom = this.rooms[room.code].users.find(u => u.id === user.id)

    if (!userLeftRoom) {
      socket.emit('error', { error: "This user isn't in this room!" })

      return;
    }
    
    socket.leave(room.code)

    this.rooms[room.code].users.filter(u => u.id !== user.id)

    io.to(room.code).emit('on-user-left-room', { 
      user: userLeftRoom, 
      room: this.rooms[room.code]
    });
  }

  close({ socket, payload }: CloseEvent) {
    const { room, user } = payload

    const adminUser = this.rooms[room.code].users.find(u => u.id === user.id && u.role === 'admin')

    if (!adminUser) {
      socket.emit('error', { error: "You must be an admin to close a room." })

      return;
    }

    const roomThatWillBeClosed = io.sockets.adapter.rooms.get(room.code)

    if (!roomThatWillBeClosed) {
      socket.emit('error', { error: "This room doesn't exists." })

      return;
    }

    roomThatWillBeClosed?.forEach((socketId) => {
      const socketToLeave = io.sockets.sockets.get(socketId);

      if (socketToLeave) {
        socketToLeave.leave(room.code)
      }
    })

    delete this.rooms[room.code];

    io.to(room.code).emit('on-room-was-close', { 
      user: adminUser,
    });
  }
}

export default new RoomController;