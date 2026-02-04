<script setup lang="ts">
const props = defineProps<{
  message: string
  actionText?: string
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

const handleDismiss = () => {
  triggerHaptic()
  emit('dismiss')
}
</script>

<template>
  <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black text-white p-6 text-center animate-in fade-in duration-500">
    <div 
      class="text-7xl mb-8 animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
      @click="handleDismiss"
    >🙈</div>
    <h2 class="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300 tracking-wide">{{ message }}</h2>
    <p class="text-white/50 mb-12 max-w-xs mx-auto font-medium tracking-wide">请确保对方无法看到屏幕内容。</p>
    <button
      @click="handleDismiss"
      class="w-full max-w-xs py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl text-xl font-bold shadow-lg shadow-pink-900/20 hover:shadow-pink-600/30 active:scale-95 transition-all tracking-wider"
    >
      {{ actionText || '我已准备好' }}
    </button>
    <p class="text-white/30 text-sm mt-6">点击任意位置继续</p>
  </div>
</template>
