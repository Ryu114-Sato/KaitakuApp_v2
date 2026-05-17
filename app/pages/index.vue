<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=DM+Sans:wght@400;500;600&display=swap' },
  ],
})

const auth = useAuthStore()
const router = useRouter()

const role = ref<'sw' | 'taxi'>('sw')
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const user = await auth.login(email.value, password.value)
    await router.push(auth.getHomePath())
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage ?? 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-bg min-h-screen flex items-center justify-center p-5">
    <div class="auth-card w-full max-w-[400px] bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_4px_24px_rgba(0,0,0,.06)]">

      <!-- Logo -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-teal-600 rounded-[14px] text-2xl mb-2.5">
          🚐
        </div>
        <h1 class="text-base font-bold text-slate-900">福祉タクシー 送迎マッチング</h1>
        <p class="text-[11px] text-slate-400 mt-0.5">ソーシャルワーカー・事業者向けシステム</p>
      </div>

      <!-- Role -->
      <div class="mb-4">
        <label class="block text-xs font-medium text-slate-600 mb-1.5">ロール選択</label>
        <div class="flex gap-2 flex-wrap">
          <button
            type="button"
            :class="['flex-1 py-2 px-3.5 rounded-lg border text-[13px] transition-all duration-150 font-medium',
              role === 'sw'
                ? 'border-teal-600 bg-teal-50 text-teal-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
            @click="role = 'sw'"
          >ソーシャルワーカー（SW）</button>
          <button
            type="button"
            :class="['flex-1 py-2 px-3.5 rounded-lg border text-[13px] transition-all duration-150 font-medium',
              role === 'taxi'
                ? 'border-teal-600 bg-teal-50 text-teal-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
            @click="role = 'taxi'"
          >タクシー事業者</button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit">
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1.5">メールアドレス</label>
          <input
            v-model="email"
            type="email"
            placeholder="example@hospital.jp"
            required
            class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-teal-600 focus:shadow-[0_0_0_3px_rgba(13,148,136,.1)]"
          />
        </div>
        <div class="mb-5">
          <label class="block text-xs font-medium text-slate-600 mb-1.5">パスワード</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-teal-600 focus:shadow-[0_0_0_3px_rgba(13,148,136,.1)]"
          />
        </div>

        <!-- Error -->
        <p v-if="errorMsg" class="text-xs text-red-500 mb-3 text-center">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium text-sm py-3 rounded-lg transition-colors duration-150"
        >
          {{ loading ? 'ログイン中...' : 'ログインする' }}
        </button>
      </form>

      <p class="text-center text-xs text-slate-400 mt-4">
        アカウントをお持ちでない方は
        <NuxtLink to="/register" class="text-teal-600 font-medium hover:underline">新規登録</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-bg {
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 60%);
}
</style>
