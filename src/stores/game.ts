import { defineStore } from 'pinia'
import { ref } from 'vue'

export enum GameState {
  SETUP_A = 'setup_a',
  SETUP_B = 'setup_b',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export enum Player {
  A = 'A',
  B = 'B'
}

export interface PlayerProfile {
  name: string
  avatar: string
}

export interface GuessResult {
  A: number
  B: number
}

export interface GuessRecord {
  player: Player
  guess: string
  result: string // "xAyB"
  timestamp: number
}

export const useGameStore = defineStore('game', () => {
  const gameState = ref<GameState>(GameState.SETUP_A)
  
  // Player Profiles
  const playerA = ref<PlayerProfile>({ name: '玩家 A', avatar: '🦁' })
  const playerB = ref<PlayerProfile>({ name: '玩家 B', avatar: '🐯' })

  const secretA = ref<string>('')
  const secretB = ref<string>('')
  const history = ref<GuessRecord[]>([])
  const currentPlayer = ref<Player>(Player.A)
  const winner = ref<Player | null>(null)

  const resetGame = () => {
    // If restarting, we might want to keep profiles or go back to setup.
    // Let's go back to setup for now so they can change if they want, 
    // or maybe just restart the round. 
    // Given the request "User submitted...", usually "Restart" means "Play again".
    // I'll reset to SETUP_A (skip profile) but keep profiles.
    // Unless we want to allow changing profiles. Let's stick to SETUP_A to be faster.
    gameState.value = GameState.SETUP_A
    secretA.value = ''
    secretB.value = ''
    history.value = []
    currentPlayer.value = Player.A
    winner.value = null
  }

  const updateProfile = (player: Player, name: string, avatar: string) => {
    if (player === Player.A) {
      playerA.value = { name, avatar }
    } else {
      playerB.value = { name, avatar }
    }
  }

  const setSecret = (player: Player, secret: string) => {
    if (player === Player.A) {
      secretA.value = secret
      gameState.value = GameState.SETUP_B
    } else {
      secretB.value = secret
      gameState.value = GameState.PLAYING
      currentPlayer.value = Player.A // A starts guessing first
    }
  }

  const calculateResult = (secret: string, guess: string): GuessResult => {
    let A = 0
    let B = 0
    const secretArr = secret.split('')
    const guessArr = guess.split('')

    // Calculate A
    for (let i = 0; i < 4; i++) {
      if (secretArr[i] === guessArr[i]) {
        A++
      }
    }

    // Calculate B
    for (let i = 0; i < 4; i++) {
      const g = guessArr[i]
      if (g && secretArr[i] !== g && secretArr.includes(g)) {
        B++
      }
    }

    return { A, B }
  }

  const submitGuess = (guess: string) => {
    if (gameState.value !== GameState.PLAYING) return

    // Who is guessing?
    const player = currentPlayer.value
    // Whose secret are they guessing? The OTHER player's secret.
    const targetSecret = player === Player.A ? secretB.value : secretA.value

    const { A, B } = calculateResult(targetSecret, guess)
    const resultStr = `${A}A${B}B`

    history.value.push({
      player,
      guess,
      result: resultStr,
      timestamp: Date.now()
    })

    if (A === 4) {
      gameState.value = GameState.FINISHED
      winner.value = player
    } else {
      // Switch turn
      currentPlayer.value = player === Player.A ? Player.B : Player.A
    }
  }

  return {
    gameState,
    playerA,
    playerB,
    secretA,
    secretB,
    history,
    currentPlayer,
    winner,
    resetGame,
    updateProfile,
    setSecret,
    submitGuess
  }
})
