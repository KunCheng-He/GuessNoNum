<script setup lang="ts">
defineProps<{
  message: string
  actionText?: string
}>()

defineEmits<{
  (e: 'dismiss'): void
}>()
</script>

<template>
  <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 text-white p-6 text-center animate-in fade-in duration-300">
    <div class="text-6xl mb-8">🙈</div>
    <h2 class="text-2xl font-bold mb-4">{{ message }}</h2>
    <p class="text-zinc-400 mb-12 max-w-xs mx-auto">请确保对方无法看到屏幕内容。</p>
    <button
      @click="$emit('dismiss')"
      class="w-full max-w-xs py-4 bg-blue-600 rounded-xl text-xl font-bold shadow-lg active:scale-95 transition-transform"
    >
      {{ actionText || '我已准备好' }}
    </button>
  </div>
</template>
