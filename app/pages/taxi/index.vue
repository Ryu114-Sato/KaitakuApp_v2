<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
// タクシー事業者：スケジュール一覧（雛形）
const schedules = ref<any[]>([])
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">スケジュール一覧</h1>
      <NuxtLink to="/taxi/form" class="bg-blue-600 text-white rounded px-4 py-2">新規登録</NuxtLink>
    </div>
    <ul class="space-y-2">
      <li v-for="s in schedules" :key="s._id" class="border rounded p-3">
        <!-- TODO: 病院 / 到着予定 / 種別 / 車両 / ステータス / 編集・削除 -->
      </li>
    </ul>
  </div>
</template>
