<script setup lang="ts">
// 新規登録画面（雛形）
const email = ref('')
const password = ref('')
const role = ref<'sw' | 'taxi'>('sw')

async function onSubmit() {
  // TODO: /api/auth/register.post.ts に POST
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-bold">新規登録</h1>
      <input v-model="email" type="email" placeholder="メールアドレス" class="w-full border rounded px-3 py-2" />
      <input v-model="password" type="password" placeholder="パスワード" class="w-full border rounded px-3 py-2" />
      <select v-model="role" class="w-full border rounded px-3 py-2">
        <option value="sw">病院ソーシャルワーカー</option>
        <option value="taxi">福祉タクシー事業者</option>
      </select>
      <button type="submit" class="w-full bg-blue-600 text-white rounded py-2">登録</button>
    </form>
  </div>
</template>
