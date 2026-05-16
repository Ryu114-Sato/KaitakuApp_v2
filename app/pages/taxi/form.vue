<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
// スケジュール登録・編集（雛形）
const form = reactive({
  hospital: '',
  arrivalAt: '',
  type: '受診' as '受診' | '退院' | '転院',
  vehicle: '車椅子' as '車椅子' | 'ストレッチャー',
  status: '確定' as '確定' | '仮' | 'キャンセル',
})

async function onSubmit() {
  // TODO: /api/schedules に POST
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto space-y-4">
    <h1 class="text-2xl font-bold">スケジュール登録</h1>
    <form class="space-y-3" @submit.prevent="onSubmit">
      <input v-model="form.hospital" placeholder="病院・施設名" class="w-full border rounded px-3 py-2" />
      <input v-model="form.arrivalAt" type="datetime-local" class="w-full border rounded px-3 py-2" />
      <select v-model="form.type" class="w-full border rounded px-3 py-2">
        <option>受診</option><option>退院</option><option>転院</option>
      </select>
      <select v-model="form.vehicle" class="w-full border rounded px-3 py-2">
        <option>車椅子</option><option>ストレッチャー</option>
      </select>
      <select v-model="form.status" class="w-full border rounded px-3 py-2">
        <option>確定</option><option>仮</option><option>キャンセル</option>
      </select>
      <button class="bg-blue-600 text-white rounded px-4 py-2">保存</button>
    </form>
  </div>
</template>
