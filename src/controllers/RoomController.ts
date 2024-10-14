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
  
    io.to(room.code).emit('created', { room: this.rooms[room.code] });
  }

  join({ socket, payload }: JoinEvent) {
    const { room, user } = payload;
  
    socket.join(room.code)
  
    const newUser: User = { 
      id: socket.id, 
      name: user.name,
      role: 'default'
    }
  
    this.rooms[room.code].users.push(newUser);
  
    io.to(room.code).emit('joined', { 
      user: newUser,
      room: this.rooms[room.code]
    });
  }

  leave({ socket, payload }: LeaveEvent) {
    const { room, user } = payload

    const userLeftRoom = this.rooms[room.code].users.find(u => u.id === user.id)
    
    socket.leave(room.code)

    this.rooms[room.code].users.filter(u => u.id !== user.id)

    io.to(room.code).emit('left', { 
      user: userLeftRoom, 
      room: this.rooms[room.code]
    });
  }

  close({ socket, payload }: CloseEvent) {
    const { room } = payload

    const roomThatWillBeClosed = io.sockets.adapter.rooms.get(room.code)

    roomThatWillBeClosed?.forEach((socketId) => {
      const socketToLeave = io.sockets.sockets.get(socketId);

      if (socketToLeave) {
        socketToLeave.leave(room.code)
      }
    })

    delete this.rooms[room.code];

    io.to(room.code).emit('closed');
  }
}

export default new RoomController;