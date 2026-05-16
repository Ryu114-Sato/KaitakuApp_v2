<script setup lang="ts">
// ログイン画面（雛形）
const email = ref('')
const password = ref('')

async function onSubmit() {
  // TODO: /api/auth/login.post.ts に POST
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-bold">ログイン</h1>
      <input v-model="email" type="email" placeholder="メールアドレス" class="w-full border rounded px-3 py-2" />
      <input v-model="password" type="password" placeholder="パスワード" class="w-full border rounded px-3 py-2" />
      <button type="submit" class="w-full bg-blue-600 text-white rounded py-2">ログイン</button>
      <NuxtLink to="/register" class="block text-center text-sm text-blue-600">新規登録はこちら</NuxtLink>
    </form>
  </div>
</template>
