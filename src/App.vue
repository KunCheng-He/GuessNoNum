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
  <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black flex items-center justify-center p-0 sm:p-4 overflow-hidden">
    <div class="w-full h-full sm:h-[85vh] sm:rounded-3xl sm:border sm:border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 max-w-md sm:max-w-7xl mx-auto ring-1 ring-white/5">
      
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
          class="flex-1 min-h-0 w-full"
          :current-player="gameStore.currentPlayer"
          :history="history"
          @guess="handleGuess"
        />
      </template>

      <!-- Winner Modal -->
      <div v-if="gameState === GameState.FINISHED" class="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-500">
        <div class="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full transform transition-all scale-100 border border-white/10 ring-1 ring-white/5">
          <div class="text-7xl mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🏆</div>
          <h2 class="text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-white">
            <span>{{ useGameStore().winner === Player.A ? gameStore.playerA.avatar : gameStore.playerB.avatar }}</span>
            <span class="bg-gradient-to-r from-violet-200 to-pink-200 bg-clip-text text-transparent">{{ useGameStore().winner === Player.A ? gameStore.playerA.name : gameStore.playerB.name }} 获胜!</span>
          </h2>
          <p class="text-white/50 mb-8 font-medium tracking-wide">恭喜!</p>
          
          <div class="grid grid-cols-2 gap-4 mb-8 text-left bg-black/20 p-4 rounded-2xl border border-white/5">
            <div>
              <div class="text-xs text-white/40 uppercase flex items-center gap-1 mb-1 font-medium tracking-wider">
                <span>{{ gameStore.playerA.avatar }}</span>
                <span class="truncate">{{ gameStore.playerA.name }} 谜底</span>
              </div>
              <div class="text-xl font-mono font-bold text-white/90 tracking-widest">{{ useGameStore().secretA }}</div>
            </div>
            <div>
              <div class="text-xs text-white/40 uppercase flex items-center gap-1 mb-1 font-medium tracking-wider">
                <span>{{ gameStore.playerB.avatar }}</span>
                <span class="truncate">{{ gameStore.playerB.name }} 谜底</span>
              </div>
              <div class="text-xl font-mono font-bold text-white/90 tracking-widest">{{ useGameStore().secretB }}</div>
            </div>
          </div>

          <button
            @click="() => { audioController.playClick(); resetGame(); showPrivacyCurtain = true }"
            class="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-pink-500 active:scale-95 transition-all shadow-lg shadow-pink-900/20 hover:shadow-pink-600/30 tracking-wider"
          >
            <span class="text-xl mr-2">🔄</span>
            再来一局
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
