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

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return
  
  if (e.key >= '0' && e.key <= '9') {
    if (!props.maxLengthReached) {
      emit('input', e.key)
    }
  } else if (e.key === 'Backspace') {
    emit('delete')
  } else if (e.key === 'Enter') {
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
  <div class="grid grid-cols-3 gap-2 p-4 bg-gray-100 rounded-t-xl pb-8">
    <button
      v-for="key in keys"
      :key="key"
      @click="() => { audioController.playClick(); emit('input', key) }"
      :disabled="disabled || maxLengthReached"
      class="h-14 text-2xl font-bold bg-white rounded-lg shadow-sm active:bg-gray-50 disabled:opacity-50 touch-manipulation transition-colors hover:bg-gray-50"
    >
      {{ key }}
    </button>
    <button
      @click="() => { audioController.playDelete(); emit('delete') }"
      :disabled="disabled"
      class="h-14 flex items-center justify-center bg-gray-200 rounded-lg shadow-sm active:bg-gray-300 disabled:opacity-50 touch-manipulation transition-colors hover:bg-gray-300"
    >
      <Delete class="w-6 h-6 text-gray-700" />
    </button>
    <button
      @click="() => { audioController.playClick(); emit('input', '0') }"
      :disabled="disabled || maxLengthReached"
      class="h-14 text-2xl font-bold bg-white rounded-lg shadow-sm active:bg-gray-50 disabled:opacity-50 touch-manipulation transition-colors hover:bg-gray-50"
    >
      0
    </button>
    <button
      @click="() => { audioController.playClick(); emit('confirm') }"
      :disabled="disabled"
      class="h-14 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-sm active:bg-blue-700 disabled:bg-gray-400 touch-manipulation transition-colors hover:bg-blue-700"
    >
      <Check class="w-6 h-6" />
    </button>
  </div>
</template>
