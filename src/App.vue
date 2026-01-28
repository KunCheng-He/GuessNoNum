<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameStore, GameState, Player } from './stores/game'
import SecretInput from './components/SecretInput.vue'
import GameBoard from './components/GameBoard.vue'
import PrivacyCurtain from './components/PrivacyCurtain.vue'
import { audioController } from './utils/audio'
import confetti from 'canvas-confetti'

const gameStore = useGameStore()
const gameState = computed(() => gameStore.gameState)
const history = computed(() => gameStore.history)
const { setSecret, submitGuess, resetGame } = gameStore

const showPrivacyCurtain = ref(true)

// Watch for game finish to play sound and show confetti
watch(gameState, (newState) => {
  if (newState === GameState.FINISHED) {
    audioController.playSuccess()
    fireConfetti()
  }
})

const fireConfetti = () => {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    
    confetti({
      ...defaults, 
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    })
    confetti({
      ...defaults, 
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    })
  }, 250)
}

const privacyMessage = computed(() => {
  if (gameState.value === GameState.SETUP_A) return '请玩家 B 转过头去/闭眼！'
  if (gameState.value === GameState.SETUP_B) return '请玩家 A 转过头去/闭眼！'
  return ''
})

const handleSecretSubmit = (secret: string) => {
  if (gameState.value === GameState.SETUP_A) {
    setSecret(Player.A, secret)
    showPrivacyCurtain.value = true
  } else if (gameState.value === GameState.SETUP_B) {
    setSecret(Player.B, secret)
    showPrivacyCurtain.value = false
  }
}

const handleProfileSubmit = () => {
  // Profile submitted, do nothing here as we wait for secret submission
}

const handleGuess = (guess: string) => {
  submitGuess(guess)
}

</script>

<template>
  <div class="fixed inset-0 bg-gray-100 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
    <div class="w-full h-full sm:h-[85vh] sm:rounded-2xl sm:border sm:border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden transition-all duration-300 max-w-md sm:max-w-4xl mx-auto">
      
      <!-- Privacy Curtain -->
      <PrivacyCurtain
        v-if="showPrivacyCurtain"
        :message="privacyMessage"
        @dismiss="showPrivacyCurtain = false"
      />

      <!-- Game Content -->
      <template v-else>
        <!-- Setup Phase -->
        <SecretInput
          v-if="gameState === GameState.SETUP_A"
          key="setup-a"
          :player="Player.A"
          @profile-submit="handleProfileSubmit"
          @submit="handleSecretSubmit"
        />
        
        <SecretInput
          v-else-if="gameState === GameState.SETUP_B"
          key="setup-b"
          :player="Player.B"
          @profile-submit="handleProfileSubmit"
          @submit="handleSecretSubmit"
        />

        <!-- Battle Phase -->
        <GameBoard
          v-else
          :current-player="gameStore.currentPlayer"
          :history="history"
          @guess="handleGuess"
        />
      </template>

      <!-- Winner Modal -->
      <div v-if="gameState === GameState.FINISHED" class="absolute inset-0 z-40 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full transform transition-all scale-100">
          <div class="text-6xl mb-4">🏆</div>
          <h2 class="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <span>{{ useGameStore().winner === Player.A ? gameStore.playerA.avatar : gameStore.playerB.avatar }}</span>
            <span>{{ useGameStore().winner === Player.A ? gameStore.playerA.name : gameStore.playerB.name }} 获胜!</span>
          </h2>
          <p class="text-gray-500 mb-8">恭喜!</p>
          
          <div class="grid grid-cols-2 gap-4 mb-8 text-left bg-gray-50 p-4 rounded-xl">
            <div>
              <div class="text-xs text-gray-400 uppercase flex items-center gap-1 mb-1">
                <span>{{ gameStore.playerA.avatar }}</span>
                <span class="truncate">{{ gameStore.playerA.name }} 谜底</span>
              </div>
              <div class="text-xl font-mono font-bold">{{ useGameStore().secretA }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 uppercase flex items-center gap-1 mb-1">
                <span>{{ gameStore.playerB.avatar }}</span>
                <span class="truncate">{{ gameStore.playerB.name }} 谜底</span>
              </div>
              <div class="text-xl font-mono font-bold">{{ useGameStore().secretB }}</div>
            </div>
          </div>

          <button
            @click="() => { audioController.playClick(); resetGame(); showPrivacyCurtain = true }"
            class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <span class="text-xl mr-2">🔄</span>
            再来一局
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
