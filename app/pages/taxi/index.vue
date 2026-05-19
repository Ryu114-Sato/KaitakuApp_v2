<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const router = useRouter()

// スケジュール取得
const { data, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/schedules')
const schedules = computed(() => data.value?.data ?? [])

// 日付ごとにグループ化
const grouped = computed(() => {
  const map = new Map<string, any[]>()
  for (const s of schedules.value) {
    const dateKey = formatDate(s.arrivalDateTime)
    if (!map.has(dateKey)) map.set(dateKey, [])
    map.get(dateKey)!.push(s)
  }
  return map
})

// UTC → JST(+9h) に変換（サーバー/ブラウザ両環境で一貫）
function toJST(dt: string) {
  return new Date(new Date(dt).getTime() + 9 * 60 * 60 * 1000)
}

function formatDate(dt: string) {
  const d = toJST(dt)
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`
}

function formatTime(dt: string) {
  const d = toJST(dt)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

const typeLabel: Record<string, string> = {
  consultation: '受診送迎',
  discharge: '退院送迎',
  transfer: '転院送迎',
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  confirmed:  { label: '確定', cls: 'bg-emerald-100 text-emerald-800' },
  tentative:  { label: '仮', cls: 'bg-amber-100 text-amber-800' },
  cancelled:  { label: 'キャンセル', cls: 'bg-red-100 text-red-800' },
}

const vehicleLabel: Record<string, string> = {
  wheelchair: '♿ 車椅子',
  stretcher: '🛏 ストレッチャー',
}

// 削除
const deleting = ref<string | null>(null)

async function deleteSchedule(id: string) {
  if (!confirm('このスケジュールを削除しますか？')) return
  deleting.value = id
  try {
    await $fetch(`/api/schedules/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage ?? '削除に失敗しました')
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-[480px] mx-auto px-5 py-6">
      <h1 class="text-lg font-bold text-slate-900 mb-1">スケジュール管理</h1>
      <p class="text-xs text-slate-400 mb-5">送迎予定の登録・確認ができます</p>

      <!-- Empty state -->
      <div v-if="schedules.length === 0" class="text-center py-12 text-slate-400">
        <div class="text-4xl mb-3">📋</div>
        <p class="text-sm">スケジュールがありません<br>右下の ＋ ボタンから登録してください</p>
      </div>

      <!-- Grouped list -->
      <template v-for="[dateLabel, items] in grouped" :key="dateLabel">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 mt-5 first:mt-0">
          {{ dateLabel }}
        </p>
        <div
          v-for="s in items"
          :key="s._id"
          class="bg-white border border-slate-200 rounded-[10px] px-4 py-3.5 mb-2.5 relative"
        >
          <p class="text-[11px] font-semibold text-teal-700 mb-1" style="font-family:'DM Sans',sans-serif">
            {{ formatTime(s.arrivalDateTime) }} 到着予定
          </p>
          <p class="text-[15px] font-bold text-slate-900 pr-24">{{ s.hospitalName }}</p>
          <div class="flex flex-wrap gap-1.5 mt-1.5">
            <span class="text-[11px] px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-800">
              {{ typeLabel[s.type] ?? s.type }}
            </span>
            <span
              v-for="v in s.vehicles"
              :key="v"
              class="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800"
            >
              {{ vehicleLabel[v] ?? v }}
            </span>
            <span :class="['text-[11px] px-2 py-0.5 rounded-full font-medium', statusConfig[s.status]?.cls]">
              {{ statusConfig[s.status]?.label ?? s.status }}
            </span>
          </div>

          <!-- Actions -->
          <div class="absolute top-3 right-3 flex gap-1.5">
            <button
              class="text-xs text-slate-500 border border-slate-200 bg-white rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors"
              @click="router.push({ path: '/taxi/form', query: { id: s._id } })"
            >
              編集
            </button>
            <button
              :disabled="deleting === s._id"
              class="text-xs text-red-700 bg-red-50 border-0 rounded-md px-3 py-1.5 hover:bg-red-100 transition-colors disabled:opacity-50"
              @click="deleteSchedule(s._id)"
            >
              削除
            </button>
          </div>
        </div>
      </template>
    </main>

    <!-- FAB -->
    <NuxtLink
      to="/taxi/form"
      class="fixed bottom-6 right-6 w-13 h-13 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white text-2xl shadow-[0_4px_16px_rgba(13,148,136,.4)] transition-all hover:scale-105 z-50 w-[52px] h-[52px]"
    >
      ＋
    </NuxtLink>
  </div>
</template>
