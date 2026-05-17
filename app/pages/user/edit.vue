<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  name: auth.user?.name ?? '',
  email: auth.user?.email ?? '',
  phone: auth.user?.phone ?? '',
  serviceArea: auth.user?.serviceArea ?? '',
  vehicles: [...(auth.user?.vehicles ?? [])],
  password: '',
  passwordConfirm: '',
})

const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

function toggleVehicle(v: string) {
  const i = form.vehicles.indexOf(v)
  if (i >= 0) form.vehicles.splice(i, 1)
  else form.vehicles.push(v)
}

async function onSave() {
  errorMsg.value = ''
  successMsg.value = ''

  if (form.password && form.password !== form.passwordConfirm) {
    errorMsg.value = 'パスワードが一致しません'
    return
  }

  loading.value = true
  try {
    const body: Record<string, any> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      serviceArea: form.serviceArea,
      vehicles: form.vehicles,
    }
    if (form.password) body.password = form.password

    const res = await $fetch<{ success: boolean; data: any }>(`/api/users/${auth.user!.id}`, {
      method: 'PUT',
      body,
    })
    // Piniaを更新
    auth.user = { ...auth.user!, ...res.data }
    successMsg.value = '保存しました'
    form.password = ''
    form.passwordConfirm = ''
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage ?? '保存に失敗しました'
  } finally {
    loading.value = false
  }
}

// アカウント削除モーダル
const deleteModal = ref(false)
const deleteLoading = ref(false)

async function deleteAccount() {
  deleteLoading.value = true
  try {
    await $fetch(`/api/users/${auth.user!.id}`, { method: 'DELETE' })
    auth.user = null
    auth.token = ''
    await router.push('/')
  } catch (e: any) {
    alert(e?.data?.statusMessage ?? '削除に失敗しました')
  } finally {
    deleteLoading.value = false
    deleteModal.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-[480px] mx-auto px-5 py-6">
      <button class="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 mb-4 transition-colors" @click="router.back()">
        ← 戻る
      </button>
      <h1 class="text-lg font-bold text-slate-900 mb-5">ユーザー情報編集</h1>

      <!-- 共通情報 -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">共通情報</p>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">メールアドレス</label>
            <input v-model="form.email" type="email" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">パスワード変更</label>
            <input v-model="form.password" type="password" placeholder="新しいパスワード（8文字以上）" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">パスワード確認</label>
            <input v-model="form.passwordConfirm" type="password" placeholder="再入力" class="form-input w-full" />
          </div>
        </div>
      </div>

      <!-- 事業者情報（taxiのみ） -->
      <div v-if="auth.isTaxi" class="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">事業者情報</p>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">事業者名</label>
            <input v-model="form.name" type="text" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">電話番号</label>
            <input v-model="form.phone" type="tel" class="form-input w-full" />
            <p class="mt-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-md">
              ⚠️ この番号がSWからの発信先として一覧に表示されます。
            </p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">対応エリア</label>
            <input v-model="form.serviceArea" type="text" placeholder="〇〇市内" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">対応車両</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="v in [{ value: 'wheelchair', label: '♿ 車椅子' }, { value: 'stretcher', label: '🛏 ストレッチャー' }]"
                :key="v.value"
                type="button"
                :class="['py-2 px-3.5 rounded-lg border text-[13px] font-medium transition-all',
                  form.vehicles.includes(v.value)
                    ? 'border-teal-600 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
                @click="toggleVehicle(v.value)"
              >{{ v.label }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- SW の名前欄 -->
      <div v-if="auth.isSw" class="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">所属情報</p>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1.5">所属病院名</label>
          <input v-model="form.name" type="text" class="form-input w-full" />
        </div>
      </div>

      <!-- Messages -->
      <p v-if="successMsg" class="text-xs text-teal-600 mb-3 text-center">✅ {{ successMsg }}</p>
      <p v-if="errorMsg" class="text-xs text-red-500 mb-3 text-center">{{ errorMsg }}</p>

      <!-- Save buttons -->
      <div class="flex gap-2.5 mb-8">
        <button
          class="flex-1 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          @click="router.back()"
        >キャンセル</button>
        <button
          :disabled="loading"
          class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg transition-colors"
          @click="onSave"
        >
          {{ loading ? '保存中...' : '💾 保存する' }}
        </button>
      </div>

      <!-- 危険な操作 -->
      <div class="border border-red-200 rounded-xl p-5">
        <p class="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">危険な操作</p>
        <p class="text-xs text-slate-500 mb-3">アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。</p>
        <button
          class="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          @click="deleteModal = true"
        >
          アカウントを削除する
        </button>
      </div>
    </main>

    <!-- 削除確認モーダル -->
    <Transition name="overlay">
      <div v-if="deleteModal" class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-5" @click.self="deleteModal = false">
        <div class="bg-white rounded-2xl p-7 max-w-[340px] w-full shadow-2xl text-center">
          <div class="text-3xl mb-3">⚠️</div>
          <p class="text-base font-bold text-slate-900 mb-2">アカウントを削除しますか？</p>
          <p class="text-sm text-slate-500 mb-4">この操作は取り消せません。すべてのデータが削除されます。</p>
          <div class="flex gap-2.5">
            <button class="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50" @click="deleteModal = false">キャンセル</button>
            <button
              :disabled="deleteLoading"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              @click="deleteAccount"
            >
              {{ deleteLoading ? '削除中...' : '削除する' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.form-input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  background: white;
}
.form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,.1); }
.overlay-enter-active, .overlay-leave-active { transition: opacity .2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
</style>
