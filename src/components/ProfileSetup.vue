<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore, Player } from '../stores/game'
import { storeToRefs } from 'pinia'
import { User, Sparkles } from 'lucide-vue-next'

const gameStore = useGameStore()
const { playerA, playerB } = storeToRefs(gameStore)
const { updateProfile } = gameStore

const emojis = ['🦁', '🐯', '🐼', '🐨', '🐷', '🐸', '🐙', '🦄', '🐲', '👽', '🤖', '👻', '🤡', '💩', '🎃', '🎄']

const nameA = ref(playerA.value.name)
const avatarA = ref(playerA.value.avatar)
const nameB = ref(playerB.value.name)
const avatarB = ref(playerB.value.avatar)

const handleStart = () => {
  if (!nameA.value.trim() || !nameB.value.trim()) return
  
  updateProfile(Player.A, nameA.value, avatarA.value)
  updateProfile(Player.B, nameB.value, avatarB.value)
  // finishProfileSetup(Player.A) // Deprecated
}
</script>

<template>
  <div class="flex flex-col h-full bg-gray-50 p-4 overflow-y-auto">
    <div class="max-w-2xl mx-auto w-full space-y-8 py-8">
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <User class="w-8 h-8 text-blue-500" />
          玩家设置
        </h2>
        <p class="text-gray-500">请为两位玩家设置昵称和头像</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Player A Setup -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full text-4xl mb-4 shadow-inner">
              {{ avatarA }}
            </div>
            <h3 class="text-lg font-bold text-blue-600">玩家 A</h3>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">昵称</label>
            <input 
              v-model="nameA"
              type="text" 
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="输入昵称"
              maxlength="10"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">选择头像</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="emoji in emojis"
                :key="emoji"
                @click="avatarA = emoji"
                class="aspect-square flex items-center justify-center text-xl rounded-lg hover:bg-gray-100 transition-colors"
                :class="{ 'bg-blue-100 ring-2 ring-blue-500': avatarA === emoji }"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <!-- Player B Setup -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full text-4xl mb-4 shadow-inner">
              {{ avatarB }}
            </div>
            <h3 class="text-lg font-bold text-red-600">玩家 B</h3>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">昵称</label>
            <input 
              v-model="nameB"
              type="text" 
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="输入昵称"
              maxlength="10"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">选择头像</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="emoji in emojis"
                :key="emoji"
                @click="avatarB = emoji"
                class="aspect-square flex items-center justify-center text-xl rounded-lg hover:bg-gray-100 transition-colors"
                :class="{ 'bg-red-100 ring-2 ring-red-500': avatarB === emoji }"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center pt-4">
        <button
          @click="handleStart"
          :disabled="!nameA.trim() || !nameB.trim()"
          class="px-12 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-2"
        >
          <Sparkles class="w-5 h-5" />
          开始游戏
        </button>
      </div>
    </div>
  </div>
</template>
