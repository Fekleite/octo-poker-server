import { RevealEvent, SendEvent, Vote } from "../@types/vote"
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

    const userAlreadyVoted = this.votes[room.code].find(vote => vote.user === socket.id)

    if (userAlreadyVoted) {
      this.votes[room.code].map(vote => {
        if (vote.user === socket.id) {
          return {
            ...vote,
            value,
          }
        }

        return vote;
      })
    } else {
      this.votes[room.code].push({ 
        user: socket.id,
        value,
      })
    }

    io.to(room.code).emit('vote-user', { user: socket.id, value })
  }

  reveal({ socket, payload }: RevealEvent) {
    const { room } = payload

    if (!this.votes[room.code]) {
      socket.emit('error', { error: "There isn't votes in this room!" })
    }

    const roomVotes = this.votes[room.code]
    
    io.to(room.code).emit('votes-room', { votes: roomVotes })
  }
}

export default new VoteController;