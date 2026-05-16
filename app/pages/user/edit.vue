<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
// ユーザー情報編集（雛形）
const form = reactive({
  name: '',
  phone: '',
})

async function onSubmit() {
  // TODO: /api/users/[id].put.ts に PUT
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto space-y-4">
    <h1 class="text-2xl font-bold">ユーザー情報編集</h1>
    <form class="space-y-3" @submit.prevent="onSubmit">
      <input v-model="form.name" placeholder="名称" class="w-full border rounded px-3 py-2" />
      <input v-model="form.phone" placeholder="電話番号" class="w-full border rounded px-3 py-2" />
      <button class="bg-blue-600 text-white rounded px-4 py-2">保存</button>
    </form>
  </div>
</template>
