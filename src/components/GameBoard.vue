<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import SoftKeyboard from './SoftKeyboard.vue'
import type { GuessRecord, Player } from '../stores/game'
import { Player as PlayerEnum, useGameStore } from '../stores/game'
import { Flag, History, X } from 'lucide-vue-next'


const props = defineProps<{
  currentPlayer: Player
  history: GuessRecord[]
}>()

const gameStore = useGameStore()
const { playerA, playerB } = gameStore

const emit = defineEmits<{
  (e: 'guess', val: string): void
}>()

const digits = ref<string[]>([])
const historyA = computed(() => props.history.filter(r => r.player === PlayerEnum.A))
const historyB = computed(() => props.history.filter(r => r.player === PlayerEnum.B))

const bottomRefA = ref<HTMLElement | null>(null)
const bottomRefB = ref<HTMLElement | null>(null)

// Auto-scroll logic for history containers
const scrollToBottom = (element: HTMLElement | null) => {
  if (element) {
    nextTick(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }
}

watch(() => historyA.value.length, () => {
  scrollToBottom(bottomRefA.value)
})

watch(() => historyB.value.length, () => {
  scrollToBottom(bottomRefB.value)
})

const showRules = ref(false)
const showMobileHistory = ref(false)
const mobileHistoryTab = ref<PlayerEnum>(PlayerEnum.A)

const toggleRules = () => {
  // Only toggle on mobile via click. On desktop, hover handles it.
  // But we can support click toggle for desktop too if desired, 
  // currently focusing on mobile support.
  if (window.innerWidth < 640) {
    showRules.value = !showRules.value
  }
}

const handleInput = (val: string) => {
  if (digits.value.length < 4 && !digits.value.includes(val)) {
    digits.value.push(val)
  }
}

const handleDelete = () => {
  digits.value.pop()
}

const handleConfirm = () => {
  if (digits.value.length === 4) {
    emit('guess', digits.value.join(''))
    digits.value = []
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-transparent relative overflow-hidden">
    
    <!-- Mobile History Button -->
    <div class="fixed top-6 right-6 z-30 sm:hidden">
      <button 
        @click="showMobileHistory = true"
        class="w-12 h-12 bg-white/10 backdrop-blur-xl text-white rounded-2xl shadow-lg border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
      >
        <History class="w-6 h-6" />
      </button>
    </div>

    <!-- Rules Float Button -->
    <div 
      class="fixed bottom-6 right-6 z-30 group"
      @mouseenter="showRules = true"
      @mouseleave="showRules = false"
      @click="toggleRules"
    >
      <button class="w-14 h-14 bg-white/20 backdrop-blur-xl text-white rounded-full shadow-lg border border-white/30 flex items-center justify-center text-xl hover:bg-white/30 transition-all hover:scale-110 hover:shadow-xl">
        <span class="font-bold text-lg">?</span>
      </button>
      
      <!-- Rules Tooltip / Modal -->
      <div 
        v-if="showRules"
        class="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:bottom-16 z-40 sm:z-auto flex items-center justify-center sm:block p-4 sm:p-0 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none animate-in fade-in duration-200"
        @click.stop="showRules = false"
      >
        <div 
          class="w-full max-w-sm bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/20 animate-in zoom-in-95 sm:animate-none sm:w-80 sm:bg-slate-900/90 sm:backdrop-blur-xl sm:border-white/30"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📜</span>
              <h3 class="font-bold text-lg text-white">游戏规则</h3>
            </div>
            <button @click="showRules = false" class="sm:hidden text-white/50 hover:text-white p-1">
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <ul class="text-sm text-white/80 space-y-3">
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-5 h-5 bg-white/20 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <span>每位玩家设置一个 <strong class="text-white">4位不重复</strong> 的数字作为秘密数字</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-5 h-5 bg-white/20 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <span>轮流猜测对方的秘密数字</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-5 h-5 bg-white/20 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-1.5 py-0.5 bg-green-500/30 text-green-400 rounded text-xs font-bold">A</span>
                  <span>数字正确且位置正确</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-1.5 py-0.5 bg-orange-500/30 text-orange-400 rounded text-xs font-bold">B</span>
                  <span>数字正确但位置错误</span>
                </div>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-5 h-5 bg-white/20 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
              <span>先猜出 <strong class="text-green-400">4A0B</strong> 的玩家获胜</span>
            </li>
          </ul>
          
          <div class="mt-4 pt-3 bg-white/10 rounded-lg p-3 text-xs text-white/70 flex items-center justify-center gap-2">
            <span>💡 示例：秘密 1234，猜 1567 →</span>
            <span class="font-mono font-bold text-white">1A0B</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile History Modal -->
    <div 
      v-if="showMobileHistory"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:hidden animate-in fade-in duration-300"
      @click="showMobileHistory = false"
    >
      <div 
        class="w-full h-[80vh] bg-[#0f172a] rounded-t-3xl border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-300"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-white/10">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <History class="w-5 h-5 text-blue-400" />
            <span>历史记录</span>
          </h3>
          <button @click="showMobileHistory = false" class="p-2 text-white/50 hover:text-white bg-white/5 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex p-2 gap-2 bg-black/20">
          <button 
            @click="mobileHistoryTab = PlayerEnum.A"
            class="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold"
            :class="mobileHistoryTab === PlayerEnum.A ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white/5 text-white/50 hover:bg-white/10'"
          >
            <span>{{ playerA.avatar }}</span>
            <span>{{ playerA.name }}</span>
          </button>
          <button 
            @click="mobileHistoryTab = PlayerEnum.B"
            class="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold"
            :class="mobileHistoryTab === PlayerEnum.B ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50' : 'bg-white/5 text-white/50 hover:bg-white/10'"
          >
            <span>{{ playerB.avatar }}</span>
            <span>{{ playerB.name }}</span>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="(mobileHistoryTab === PlayerEnum.A ? historyA : historyB).length === 0" class="flex flex-col items-center justify-center h-full text-white/30">
            <p class="text-sm font-medium tracking-widest">暂无记录</p>
          </div>
          <div
            v-for="(record, idx) in (mobileHistoryTab === PlayerEnum.A ? historyA : historyB)"
            :key="idx"
            class="flex items-center justify-between p-4 mb-3 rounded-xl bg-white/5 border border-white/5"
          >
            <div class="flex items-center gap-4">
              <span class="text-sm font-bold text-white/30 w-8">#{{ idx + 1 }}</span>
              <span class="font-mono text-2xl tracking-widest font-bold text-white/90">{{ record.guess }}</span>
            </div>
            <span class="font-bold text-lg px-3 py-1 rounded-lg" :class="{ 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]': record.result === '4A0B', 'text-white/60 bg-white/5': record.result !== '4A0B' }">
              {{ record.result }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout Grid -->
    <div class="flex-1 grid grid-cols-1 sm:grid-cols-[320px_1fr_320px] h-full overflow-hidden min-h-0">
      
      <!-- Left Panel: Player A History -->
      <div class="flex flex-col h-full overflow-hidden border-r border-white/10 bg-white/5 order-2 sm:order-1 relative sm:flex hidden min-h-0">
        <div class="p-4 bg-gradient-to-r from-blue-500/20 to-transparent shadow-sm z-10 flex items-center justify-center gap-3 border-b border-white/10 relative shrink-0">
          <div v-if="currentPlayer === PlayerEnum.A" class="absolute left-4 top-1/2 -translate-y-1/2 animate-bounce">
            <Flag class="w-6 h-6 text-blue-400 fill-current drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
          </div>
          <span class="text-3xl drop-shadow-md">{{ playerA.avatar }}</span>
          <div class="flex flex-col items-center">
            <span class="font-bold text-white tracking-wide">{{ playerA.name }}</span>
            <span class="text-xs text-blue-300/80 font-medium uppercase tracking-wider">猜测记录</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth min-h-0 pb-20">
          <div v-if="historyA.length === 0" class="flex flex-col items-center justify-center h-full text-white/30">
            <p class="text-sm font-medium tracking-widest">暂无记录</p>
          </div>
          <div
            v-for="(record, idx) in historyA"
            :key="idx"
            class="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm shadow-sm border border-white/5 hover:border-blue-400/50 transition-all hover:bg-white/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] group shrink-0"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-white/30 w-6 group-hover:text-blue-400/70 transition-colors">#{{ idx + 1 }}</span>
              <span class="font-mono text-xl tracking-widest font-bold text-white/90">{{ record.guess }}</span>
            </div>
            <span class="font-bold text-lg px-2 py-0.5 rounded-lg" :class="{ 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]': record.result === '4A0B', 'text-white/60 bg-white/5': record.result !== '4A0B' }">
              {{ record.result }}
            </span>
          </div>
          <div ref="bottomRefA"></div>
        </div>
      </div>

      <!-- Center Panel: Operation Area -->
      <div class="flex flex-col z-20 shadow-xl sm:shadow-none bg-transparent order-1 sm:order-2 h-full overflow-hidden min-h-0">
        <div class="flex-1 flex flex-col justify-center p-4 overflow-y-auto min-h-0">
          <div class="mb-8 text-center shrink-0">
            <div class="text-sm text-white/50 mb-3 uppercase tracking-widest font-medium">当前回合</div>
            <div class="inline-flex items-center gap-4 px-8 py-5 bg-white/10 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/20 transition-all duration-500"
              :class="currentPlayer === PlayerEnum.A ? 'shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-400/30' : 'shadow-[0_0_30px_rgba(236,72,153,0.3)] border-pink-400/30'"
            >
              <span class="text-5xl animate-bounce drop-shadow-md">{{ currentPlayer === PlayerEnum.A ? playerA.avatar : playerB.avatar }}</span>
              <div class="flex flex-col items-start">
                <span class="text-xs text-white/50 uppercase tracking-wider font-bold mb-0.5">Player</span>
                <span class="font-bold text-3xl text-white tracking-wide" :class="currentPlayer === PlayerEnum.A ? 'text-blue-100' : 'text-pink-100'">
                  {{ currentPlayer === PlayerEnum.A ? playerA.name : playerB.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Input Display -->
          <div class="flex justify-center gap-3 mb-8 shrink-0">
            <div
              v-for="i in 4"
              :key="i"
              class="w-16 h-24 border-b-4 flex items-center justify-center text-5xl font-bold transition-all duration-300"
              :class="digits[i-1] ? (currentPlayer === PlayerEnum.A ? 'border-blue-400 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'border-pink-400 text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]') : 'border-white/10 text-white/10'"
            >
              {{ digits[i-1] || '•' }}
            </div>
          </div>

          <!-- Keyboard -->
          <div class="max-w-xs mx-auto w-full shrink-0">
            <SoftKeyboard
              :max-length-reached="digits.length >= 4"
              @input="handleInput"
              @delete="handleDelete"
              @confirm="handleConfirm"
            />
          </div>
        </div>
      </div>

      <!-- Right Panel: Player B History -->
      <div class="flex flex-col h-full overflow-hidden bg-white/5 order-3 relative sm:flex hidden border-l border-white/10 min-h-0">
        <div class="p-4 bg-gradient-to-l from-pink-500/20 to-transparent shadow-sm z-10 flex items-center justify-center gap-3 border-b border-white/10 relative shrink-0">
          <div v-if="currentPlayer === PlayerEnum.B" class="absolute left-4 top-1/2 -translate-y-1/2 animate-bounce">
            <Flag class="w-6 h-6 text-pink-400 fill-current drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" />
          </div>
          <span class="text-3xl drop-shadow-md">{{ playerB.avatar }}</span>
          <div class="flex flex-col items-center">
            <span class="font-bold text-white tracking-wide">{{ playerB.name }}</span>
            <span class="text-xs text-pink-300/80 font-medium uppercase tracking-wider">猜测记录</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth min-h-0 pb-20">
          <div v-if="historyB.length === 0" class="flex flex-col items-center justify-center h-full text-white/30">
            <p class="text-sm font-medium tracking-widest">暂无记录</p>
          </div>
          <div
            v-for="(record, idx) in historyB"
            :key="idx"
            class="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm shadow-sm border border-white/5 hover:border-pink-400/50 transition-all hover:bg-white/10 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)] group shrink-0"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-white/30 w-6 group-hover:text-pink-400/70 transition-colors">#{{ idx + 1 }}</span>
              <span class="font-mono text-xl tracking-widest font-bold text-white/90">{{ record.guess }}</span>
            </div>
            <span class="font-bold text-lg px-2 py-0.5 rounded-lg" :class="{ 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]': record.result === '4A0B', 'text-white/60 bg-white/5': record.result !== '4A0B' }">
              {{ record.result }}
            </span>
          </div>
          <div ref="bottomRefB"></div>
        </div>
      </div>
    </div>
  </div>
</template>
