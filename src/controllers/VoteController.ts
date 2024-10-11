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

    io.to(room.code).emit('on-vote-was-send', { user: socket.id })
  }

  remove({ socket, payload }: RemoveEvent) {
    const { room } = payload

    if (!this.votes[room.code]) {
      socket.emit('error', { error: "This room doesn't exists!" })

      return;
    }

    const otherVotes = this.votes[room.code].filter(vote => vote.user !== socket.id)
    this.votes[room.code] = [...otherVotes]

    io.to(room.code).emit('on-vote-was-remove', { user: socket.id })
  }

  reveal({ socket, payload }: RevealEvent) {
    const { room } = payload

    if (!this.votes[room.code]) {
      socket.emit('error', { error: "There isn't votes in this room!" })

      return;
    }

    const roomVotes = this.votes[room.code]
    
    io.to(room.code).emit('on-votes-were-reveal', { votes: roomVotes })
  }

  reset({ socket, payload }: ResetEvent) {
    const { room } = payload

    if (!this.votes[room.code]) {
      socket.emit('error', { error: "This room doesn't exists!" })

      return;
    }

    this.votes[room.code] = []

    io.to(room.code).emit('on-votes-were-reset', { votes: [] })
  }
}

export default new VoteController;