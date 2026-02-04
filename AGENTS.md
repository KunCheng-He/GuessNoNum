# GuessNoNum 代码库智能体指南

本文档为在 GuessNoNum 代码库中工作的 AI 智能体提供指导方针。

## 项目概述

GuessNoNum 是一个本地双人 Bulls and Cows (猜数字) 游戏，使用 Vue 3 + TypeScript + Vite 构建。玩家轮流设置秘密4位数并猜测对方的数字。第一个猜中 (4A0B) 的玩家获胜。

## 构建、Lint 和测试命令

### 开发环境
```bash
npm run dev          # 启动开发服务器 http://localhost:5173
npm run preview      # 本地预览生产构建
```

### 构建
```bash
npm run build        # 构建并执行类型检查 (vue-tsc -b && vite build)
```

构建时通过 `vue-tsc` 强制执行类型检查。所有 TypeScript 错误必须在提交前解决。

### 暂无测试套件
本项目目前没有测试套件。如需添加测试，请使用 Vitest 和 Vue Test Utils。

## 代码风格指南

### TypeScript
- 始终使用严格模式（在 `tsconfig.app.json` 中启用）
- 启用 `noUnusedLocals`、`noUnusedParameters` 和 `noFallthroughCasesInSwitch`
- 为函数参数和返回值定义显式类型
- 使用接口定义对象形状，枚举用于固定值集合
- 避免使用 `any` 类型；类型不确定时使用 `unknown`

### Vue 3 组合式 API
- 所有组件使用 `<script setup lang="ts">` 语法
- 使用 TypeScript 泛型的 `defineProps<{}>()` 和 `defineEmits<{}>()`
- 原始值使用 `ref()`，对象使用 `reactive()`
- 使用 `computed()` 计算派生状态
- 使用 `watch()` 或 `watchEffect()` 处理副作用
- 在 `<script setup>` 中解构 ref 时访问 `.value`

### Pinia 状态管理
- 使用组合式 API 模式：`defineStore('name', () => { ... })`
- 从 store 函数返回响应式状态和方法
- 使用 `ref()` 定义状态，普通函数定义操作
- 为 store 状态结构定义 TypeScript 接口

### 枚举和类型定义示例
```typescript
export enum GameState {
  SETUP_A = 'setup_a',
  SETUP_B = 'setup_b',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export interface GuessRecord {
  player: Player
  guess: string
  result: string // "xAyB" 格式
  timestamp: number
}
```

### 导入顺序
1. Vue 核心导入（`ref`、`computed`、`watch` 等）
2. Vue 生态系统（`vue`、`pinia`、`vue-router`）
3. 第三方库（`lucide-vue-next`、`canvas-confetti`）
4. 本地相对导入（`./components`、`./stores`、`./utils`）

```typescript
import { ref, computed, watch } from 'vue'
import { useGameStore, GameState, Player } from './stores/game'
import SecretInput from './components/SecretInput.vue'
import { audioController } from './utils/audio'
import confetti from 'canvas-confetti'
```

### 命名约定
- **组件**：PascalCase（例如 `GameBoard.vue`、`SecretInput.vue`）
- **文件**：工具类用 kebab-case，状态管理用 camelCase（例如 `audio.ts`、`game.ts`）
- **变量/函数**：camelCase（例如 `gameState`、`calculateResult`）
- **常量**：配置值用 SCREAMING_SNAKE_CASE，其他用 camelCase
- **枚举**：枚举名用 PascalCase，成员用 UPPER_SNAKE_CASE（或与 API 值一致）

### 组件结构
```vue
<script setup lang="ts">
// 1. 导入
// 2. 类型/接口
// 3. Props/Emits
// 4. Store/composable 调用
// 5. 响应式状态
// 6. 计算属性
// 7. 监听器
// 8. 函数
// 9. 生命周期钩子
</script>

<template>
<!-- 模板内容 -->
</template>
```

### Tailwind CSS
- 直接在模板中使用工具类
- 响应式类：小屏幕用 `sm:` 前缀，中等屏幕用 `md:` 前缀
- 谨慎使用任意值（例如 `bg-[#0f172a]`）
- 使用 `backdrop-blur`、`bg-white/X` 模式实现玻璃态效果
- 使用 `group` 和 `group-hover` 实现悬停状态

### 错误处理
- 使用守卫子句尽早验证输入
- 无效状态时提前返回而非嵌套
- 缩小联合类型时使用类型守卫
- 在游戏逻辑中显式处理边界情况

### 文件组织结构
```
src/
├── assets/          # 静态资源（图片、字体）
├── components/      # 可复用 Vue 组件
├── composables/     # Vue 组合式函数（如有）
├── stores/          # Pinia 状态管理（game.ts）
├── utils/           # 工具函数（audio.ts）
├── App.vue          # 根组件
├── main.ts          # 入口文件
└── style.css        # 全局样式（Tailwind 导入）
```

### 额外准则
- 不添加注释，除非解释复杂业务逻辑
- 保持组件职责单一
- 将可复用逻辑提取到 composables 或工具函数中
- 严格使用 TypeScript，不使用隐式 `any`
- 移动端优先响应式设计（使用 `sm:` 断点）
- 用户界面文本使用中文（游戏已本地化为中文）
