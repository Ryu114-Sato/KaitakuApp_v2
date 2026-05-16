<script setup lang="ts">
// 病院マスタ管理（雛形）
const hospitals = ref<any[]>([])
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-4">
    <h1 class="text-2xl font-bold">病院マスタ管理</h1>
    <ul class="space-y-2">
      <li v-for="h in hospitals" :key="h._id" class="border rounded p-3">
        <!-- TODO: 病院名 / 編集・削除 -->
      </li>
    </ul>
  </div>
</template>
