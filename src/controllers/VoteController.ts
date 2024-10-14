import { RemoveEvent, ResetEvent, RevealEvent, SendEvent, Vote } from "../@types/vote"
import { io } from "../http/server"

interface VotesByRoom {
  [key: string]: Vote[];
}

class VoteController {
  votes: VotesByRoom = {}

  send({ socket, payload }: SendEvent) {
    const { room, value } = payload

    if (!this.votes[room.code]) {
      this.votes[room.code] = []
    }

    this.votes[room.code].push({ 
      user: socket.id,
      value,
    })

    io.to(room.code).emit('vote-sent', { user: socket.id, value })
  }

  remove({ socket, payload }: RemoveEvent) {
    const { room } = payload

    const otherVotes = this.votes[room.code].filter(vote => vote.user !== socket.id)
    this.votes[room.code] = [...otherVotes]

    io.to(room.code).emit('vote-remove')
  }

  reveal({ socket, payload }: RevealEvent) {
    const { room } = payload
    
    io.to(room.code).emit('revealed-votes')
  }

  reset({ socket, payload }: ResetEvent) {
    const { room } = payload

    this.votes[room.code] = []

    io.to(room.code).emit('reset-votes')
  }
}

export default new VoteController;