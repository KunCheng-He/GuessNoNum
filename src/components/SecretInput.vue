<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Player as PlayerType } from'../stores/game'
import { useGameStore } from '../stores/game'
import SoftKeyboard from './SoftKeyboard.vue'

const props = defineProps<{
  player: PlayerType
  isProfileSetup?: boolean
}>()

const emit = defineEmits<{
  (e: 'profileSubmit'): void
  (e: 'submit', secret: string): void
}>()

const gameStore = useGameStore()
const { updateProfile } = gameStore

const step = ref<'profile' | 'secret'>('profile')
const name = ref('')
const avatar = ref('')
const digits = ref<string[]>([])

const emojis = ['🦁', '🐯', '🐼', '🐨', '🦊', '🐱', '🐶', '🐰', '🐸', '🐵', '🐲', '🦄', '🐙', '🦋', '🐢', '🦀', '🐳', '🦈', '🦅', '🦉']

const handleInput = (val: string) => {
  if (digits.value.length < 4 && !digits.value.includes(val)) {
    digits.value.push(val)
  }
}

const handleDelete = () => {
  digits.value.pop()
}

const handleConfirmProfile = () => {
  if (name.value.trim() && avatar.value) {
    updateProfile(props.player, name.value.trim(), avatar.value)
    emit('profileSubmit')
    step.value = 'secret'
  }
}

const handleConfirmSecret = () => {
  if (digits.value.length === 4) {
    emit('submit', digits.value.join(''))
  }
}

onMounted(() => {
  const profile = props.player === 'A' ? gameStore.playerA : gameStore.playerB
  name.value = profile.name
  avatar.value = profile.avatar
})
</script>

<template>
  <div class="flex flex flex-col h-full bg-white overflow-y-auto">
    
    <!-- Profile Setup -->
    <div v-if="step === 'profile'" class="flex-1 flex flex-col items-center justify-center p-4">
      <div class="text-6xl mb-4">👋</div>
      <h2 class="text-2xl font-bold mb-2">你好，玩家 {{ player }}!</h2>
      <p class="text-gray-500 mb-8">请设置你的昵称和头像</p>
      
      <!-- Avatar Selection -->
      <div class="mb-6">
        <div class="text-sm font-medium text-gray-600 mb-3 text-center">选择头像</div>
        <div class="grid grid-cols-5 gap-3 max-w-xs">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            @click="avatar = emoji"
            class="text-3xl p-2 rounded-lg transition-all hover:bg-gray-100"
            :class="avatar === emoji ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : ''"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Name Input -->
      <div class="w-full max-w-xs mb-8">
        <div class="text-sm font-medium text-gray-600 mb-2">输入昵称</div>
        <input
          v-model="name"
          type="text"
          maxlength="10"
          placeholder="请输入昵称"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      <button
        @click="handleConfirmProfile"
        :disabled="!name.trim() || !avatar"
        class="w-full max-w-xs py-3 bg-blue-600 text-white rounded-xl font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all"
      >
        {{ isProfileSetup && player === 'A' ? '开始游戏' : '下一步' }}
      </button>
    </div>

    <!-- Secret Number Setup -->
    <div v-else class="flex-1 flex flex-col items-center justify-center p-4">
      <div class="text-6xl mb-4">{{ avatar }}</div>
      <h2 class="text-2xl font-bold mb-2">{{ name }}</h2>
      <p class="text-gray-500 mb-8">请设置你的 4 位秘密数字</p>
      
      <div class="flex gap-4 mb-8">
        <div
          v-for="i in 4"
          :key="i"
          class="w-14 h-20 border-b-2 flex items-center justify-center text-4xl font-bold transition-colors"
          :class="digits[i-1] ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'"
        >
          {{ digits[i-1] || '•' }}
        </div>
      </div>
      
      <p class="text-sm text-red-500 h-6 transition-opacity" :class="{ 'opacity-0': digits.length < 4 }">
        {{ digits.length === 4 ? '点击勾号确认提交' : '' }}
      </p>

      <div class="mt-4">
        <button
          @click="step = 'profile'"
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← 返回修改资料
        </button>
      </div>
    </div>

    <!-- Keyboard (only show in secret step) -->
    <SoftKeyboard
      v-if="step === 'secret'"
      :max-length-reached="digits.length >= 4"
      @input="handleInput"
      @delete="handleDelete"
      @confirm="handleConfirmSecret"
    />
  </div>
</template>
