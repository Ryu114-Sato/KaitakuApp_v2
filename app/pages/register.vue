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
const name = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.register({
      role: role.value,
      name: name.value,
      email: email.value,
      password: password.value,
      phone: role.value === 'taxi' ? phone.value : undefined,
    })
    await router.push(auth.getHomePath())
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage ?? '登録に失敗しました'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-bg min-h-screen flex items-center justify-center p-5">
    <div class="w-full max-w-[400px] bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_4px_24px_rgba(0,0,0,.06)]">

      <!-- Logo -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-teal-600 rounded-[14px] text-2xl mb-2.5">
          🚐
        </div>
        <h1 class="text-base font-bold text-slate-900">新規登録</h1>
        <p class="text-[11px] text-slate-400 mt-0.5">アカウントを作成してください</p>
      </div>

      <form @submit.prevent="onSubmit">
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

        <!-- Name -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            {{ role === 'sw' ? '所属病院名' : '事業者名' }}
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            :placeholder="role === 'sw' ? '〇〇病院' : '〇〇福祉タクシー'"
            required
            class="form-input w-full"
          />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            メールアドレス <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="example@hospital.jp"
            required
            class="form-input w-full"
          />
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            パスワード <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="8文字以上"
            required
            minlength="8"
            class="form-input w-full"
          />
        </div>

        <!-- Phone (taxi only) -->
        <Transition name="fade">
          <div v-if="role === 'taxi'" class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">
              電話番号 <span class="text-red-500 ml-1">*</span>
            </label>
            <input
              v-model="phone"
              type="tel"
              placeholder="090-0000-0000"
              :required="role === 'taxi'"
              class="form-input w-full"
            />
            <p class="mt-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-md leading-relaxed">
              ⚠️ この番号がSWからの発信先として一覧に表示されます。必ず受付可能な番号を入力してください。
            </p>
          </div>
        </Transition>

        <!-- Error -->
        <p v-if="errorMsg" class="text-xs text-red-500 mb-3 text-center">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium text-sm py-3 rounded-lg transition-colors duration-150"
        >
          {{ loading ? '登録中...' : '登録する' }}
        </button>
      </form>

      <p class="text-center text-xs text-slate-400 mt-4">
        すでにアカウントをお持ちの方は
        <NuxtLink to="/" class="text-teal-600 font-medium hover:underline">ログイン</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-bg {
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 60%);
}
.form-input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.form-input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,.1);
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s, transform .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
