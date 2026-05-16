<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
// SW：検索・結果（雛形）
const hospital = ref('')
const datetime = ref('')
const vehicle = ref('')
const results = ref<any[]>([])

async function onSearch() {
  // TODO: /api/schedules?hospital=&datetime=&vehicle= に GET
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">送迎スケジュール検索</h1>
    <form class="space-y-3" @submit.prevent="onSearch">
      <input v-model="hospital" placeholder="病院名" class="w-full border rounded px-3 py-2" />
      <input v-model="datetime" type="datetime-local" class="w-full border rounded px-3 py-2" />
      <input v-model="vehicle" placeholder="車両条件（任意）" class="w-full border rounded px-3 py-2" />
      <button class="bg-blue-600 text-white rounded px-4 py-2">検索</button>
    </form>

    <ul class="space-y-2">
      <li v-for="r in results" :key="r._id" class="border rounded p-3">
        <!-- TODO: 事業者名 / 到着時刻 / 車両 / 電話番号 -->
      </li>
    </ul>
  </div>
</template>
