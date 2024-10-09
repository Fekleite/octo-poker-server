import { ResetEvent, RevealEvent, SendEvent, Vote } from "../@types/vote"
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
            user: vote.user,
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

    io.to(room.code).emit('on-vote-was-send', { user: socket.id })
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