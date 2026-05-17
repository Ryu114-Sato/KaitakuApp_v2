<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const roleLabel = computed(() => {
  switch (auth.user?.role) {
    case 'sw': return 'SW'
    case 'taxi': return '事業者'
    case 'admin': return '管理者'
    default: return ''
  }
})

const roleClass = computed(() => {
  switch (auth.user?.role) {
    case 'sw': return 'bg-blue-100 text-blue-800'
    case 'taxi': return 'bg-emerald-100 text-emerald-800'
    case 'admin': return 'bg-amber-100 text-amber-800'
    default: return ''
  }
})

async function handleLogout() {
  await auth.logout()
}
</script>

<template>
  <header class="bg-white border-b border-slate-200 px-5 h-14 flex items-center justify-between sticky top-0 z-50">
    <div class="flex items-center gap-2 font-semibold text-[15px] text-teal-800" style="font-family:'DM Sans',sans-serif">
      <div class="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm">🚐</div>
      {{ auth.user?.name ?? '福祉タクシー マッチング' }}
    </div>
    <div class="flex items-center gap-3">
      <span :class="['text-[11px] font-semibold px-2 py-0.5 rounded', roleClass]">{{ roleLabel }}</span>
      <NuxtLink to="/user/edit" class="text-xs text-slate-500 border border-slate-200 rounded px-2 py-1 hover:bg-slate-50 transition-colors">
        設定
      </NuxtLink>
      <button
        class="text-xs text-red-500 border border-red-200 bg-red-50 rounded px-2.5 py-1 hover:bg-red-100 transition-colors"
        @click="handleLogout"
      >
        ログアウト
      </button>
    </div>
  </header>
</template>
