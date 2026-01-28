<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import SoftKeyboard from './SoftKeyboard.vue'
import type { GuessRecord, Player } from '../stores/game'
import { Player as PlayerEnum, useGameStore } from '../stores/game'
import { Flag } from 'lucide-vue-next'


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

const historyContainerA = ref<HTMLElement | null>(null)
const historyContainerB = ref<HTMLElement | null>(null)

watch(() => historyA.value.length, () => {
  nextTick(() => {
    if (historyContainerA.value) {
      historyContainerA.value.scrollTop = historyContainerA.value.scrollHeight
    }
  })
})

watch(() => historyB.value.length, () => {
  nextTick(() => {
    if (historyContainerB.value) {
      historyContainerB.value.scrollTop = historyContainerB.value.scrollHeight
    }
  })
})

const showRules = ref(false)

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
  <div class="flex flex-col h-full bg-gray-50 relative overflow-hidden">
    
    <!-- Rules Float Button -->
    <div 
      class="fixed bottom-6 right-6 z-30 group"
      @mouseenter="showRules = true"
      @mouseleave="showRules = false"
    >
      <button class="w-12 h-12 bg-white text-blue-600 rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-xl hover:bg-gray-50 transition-all hover:scale-110 hover:shadow-xl">
        <span class="font-bold text-lg">?</span>
      </button>
      
      <!-- Rules Tooltip -->
      <div 
        v-if="showRules"
        class="absolute right-0 bottom-16 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 origin-bottom-right"
      >
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span class="text-2xl">📜</span>
          <h3 class="font-bold text-lg text-gray-800">游戏规则</h3>
        </div>
        
        <ul class="text-sm text-gray-600 space-y-3">
          <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
            <span>每位玩家设置一个 <strong class="text-gray-900">4位不重复</strong> 的数字作为秘密数字</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
            <span>轮流猜测对方的秘密数字</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">A</span>
                <span>数字正确且位置正确</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold">B</span>
                <span>数字正确但位置错误</span>
              </div>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
            <span>先猜出 <strong class="text-green-600">4A0B</strong> 的玩家获胜</span>
          </li>
        </ul>
        
        <div class="mt-4 pt-3 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 flex items-center justify-center gap-2">
          <span>💡 示例：秘密 1234，猜 1567 →</span>
          <span class="font-mono font-bold text-gray-700">1A0B</span>
        </div>
      </div>
    </div>

    <!-- Main Layout Grid -->
    <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 h-full overflow-hidden">
      
      <!-- Left Panel: Player A History -->
      <div class="flex flex-col h-full overflow-hidden border-r border-gray-200 bg-white order-2 sm:order-1 relative">
        <div class="p-4 bg-blue-50/50 shadow-sm z-10 flex items-center justify-center gap-3 border-b border-blue-100 relative">
          <div v-if="currentPlayer === PlayerEnum.A" class="absolute left-4 top-1/2 -translate-y-1/2 animate-bounce">
            <Flag class="w-6 h-6 text-red-500 fill-current" />
          </div>
          <span class="text-3xl">{{ playerA.avatar }}</span>
          <div class="flex flex-col items-center">
            <span class="font-bold text-blue-900">{{ playerA.name }}</span>
            <span class="text-xs text-blue-600 font-medium">猜测记录</span>
          </div>
        </div>

        <div ref="historyContainerA" class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
          <div v-if="historyA.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
            <p class="text-sm">暂无记录</p>
          </div>
          <div
            v-for="(record, idx) in historyA"
            :key="idx"
            class="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm border border-blue-100 hover:border-blue-300 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-gray-400 w-6">#{{ idx + 1 }}</span>
              <span class="font-mono text-xl tracking-widest font-medium text-gray-700">{{ record.guess }}</span>
            </div>
            <span class="font-bold text-lg px-2 py-0.5 rounded bg-gray-50" :class="{ 'bg-green-100 text-green-700': record.result === '4A0B' }">
              {{ record.result }}
            </span>
          </div>
        </div>
      </div>

      <!-- Center Panel: Operation Area -->
      <div class="flex flex-col z-20 shadow-xl sm:shadow-none bg-gray-50 order-1 sm:order-2 border-r border-gray-200">
        <div class="flex-1 flex flex-col justify-center p-4">
          <div class="mb-8 text-center">
            <div class="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">当前回合</div>
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300"
              :class="currentPlayer === PlayerEnum.A ? 'ring-2 ring-blue-100' : 'ring-2 ring-red-100'"
            >
              <span class="text-3xl animate-bounce">{{ currentPlayer === PlayerEnum.A ? playerA.avatar : playerB.avatar }}</span>
              <span class="font-bold text-xl text-gray-800">{{ currentPlayer === PlayerEnum.A ? playerA.name : playerB.name }}</span>
            </div>
          </div>

          <!-- Input Display -->
          <div class="flex justify-center gap-3 mb-8">
            <div
              v-for="i in 4"
              :key="i"
              class="w-16 h-20 border-2 rounded-2xl flex items-center justify-center text-4xl font-bold transition-all duration-200 shadow-sm"
              :class="digits[i-1] ? 'border-gray-800 bg-white text-black scale-105 ring-4 ring-gray-100' : 'border-gray-200 bg-white text-gray-300'"
            >
              {{ digits[i-1] || '' }}
            </div>
          </div>

          <!-- Keyboard -->
          <div class="max-w-xs mx-auto w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
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
      <div class="flex flex-col h-full overflow-hidden bg-white order-3 relative">
        <div class="p-4 bg-red-50/50 shadow-sm z-10 flex items-center justify-center gap-3 border-b border-red-100 relative">
          <div v-if="currentPlayer === PlayerEnum.B" class="absolute left-4 top-1/2 -translate-y-1/2 animate-bounce">
            <Flag class="w-6 h-6 text-red-500 fill-current" />
          </div>
          <span class="text-3xl">{{ playerB.avatar }}</span>
          <div class="flex flex-col items-center">
            <span class="font-bold text-red-900">{{ playerB.name }}</span>
            <span class="text-xs text-red-600 font-medium">猜测记录</span>
          </div>
        </div>

        <div ref="historyContainerB" class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
          <div v-if="historyB.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
            <p class="text-sm">暂无记录</p>
          </div>
          <div
            v-for="(record, idx) in historyB"
            :key="idx"
            class="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm border border-red-100 hover:border-red-300 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-gray-400 w-6">#{{ idx + 1 }}</span>
              <span class="font-mono text-xl tracking-widest font-medium text-gray-700">{{ record.guess }}</span>
            </div>
            <span class="font-bold text-lg px-2 py-0.5 rounded bg-gray-50" :class="{ 'bg-green-100 text-green-700': record.result === '4A0B' }">
              {{ record.result }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
