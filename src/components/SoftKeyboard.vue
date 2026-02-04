<script setup lang="ts">
import { Delete, Check } from 'lucide-vue-next'
import { onMounted, onUnmounted } from 'vue'
import { audioController } from '../utils/audio'

const props = defineProps<{
  disabled?: boolean
  maxLengthReached?: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: string): void
  (e: 'delete'): void
  (e: 'confirm'): void
}>()

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return
  
  if (e.key >= '0' && e.key <= '9') {
    if (!props.maxLengthReached) {
      triggerHaptic()
      emit('input', e.key)
    }
  } else if (e.key === 'Backspace') {
    triggerHaptic()
    emit('delete')
  } else if (e.key === 'Enter') {
    triggerHaptic()
    emit('confirm')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="grid grid-cols-3 gap-3 p-4 bg-transparent rounded-t-3xl pb-8">
    <button
      v-for="key in keys"
      :key="key"
      @click="() => { triggerHaptic(); audioController.playClick(); emit('input', key) }"
      :disabled="disabled || maxLengthReached"
      class="h-16 text-2xl font-bold bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 text-white active:scale-95 disabled:opacity-30 touch-manipulation transition-all duration-200 hover:bg-white/20 hover:border-white/30 hover:shadow-xl hover:shadow-white/5"
    >
      {{ key }}
    </button>
    <button
      @click="() => { triggerHaptic(); audioController.playDelete(); emit('delete') }"
      :disabled="disabled"
      class="h-16 flex items-center justify-center bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 text-white/60 active:scale-95 disabled:opacity-30 touch-manipulation transition-all duration-200 hover:bg-white/15 hover:text-white/90 hover:border-white/20"
    >
      <Delete class="w-6 h-6" />
    </button>
    <button
      @click="() => { triggerHaptic(); audioController.playClick(); emit('input', '0') }"
      :disabled="disabled || maxLengthReached"
      class="h-16 text-2xl font-bold bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 text-white active:scale-95 disabled:opacity-30 touch-manipulation transition-all duration-200 hover:bg-white/20 hover:border-white/30 hover:shadow-xl hover:shadow-white/5"
    >
      0
    </button>
    <button
      @click="() => { triggerHaptic(); audioController.playClick(); emit('confirm') }"
      :disabled="disabled"
      class="h-16 flex items-center justify-center bg-gradient-to-r from-violet-600 to-pink-600 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 text-white active:scale-95 disabled:opacity-30 disabled:grayscale touch-manipulation transition-all duration-200 hover:from-violet-500 hover:to-pink-500 hover:shadow-xl hover:shadow-pink-500/20"
    >
      <Check class="w-6 h-6" />
    </button>
  </div>
</template>
