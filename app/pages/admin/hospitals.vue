<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const searchQuery = ref('')
const { data, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/hospitals')
const hospitals = computed(() => {
  const list = data.value?.data ?? []
  if (!searchQuery.value) return list
  return list.filter((h: any) => h.name.includes(searchQuery.value))
})

const sourceLabel: Record<string, string> = {
  medical_code: '医療機関コード',
  manual: '手動追加',
}

// 追加モーダル
const addModal = reactive({ show: false, name: '', address: '', phone: '' })
const addLoading = ref(false)
const addError = ref('')

async function addHospital() {
  if (!addModal.name) { addError.value = '病院名を入力してください'; return }
  addLoading.value = true
  addError.value = ''
  try {
    await $fetch('/api/hospitals', {
      method: 'POST',
      body: { name: addModal.name, address: addModal.address, phone: addModal.phone },
    })
    addModal.show = false
    addModal.name = addModal.address = addModal.phone = ''
    await refresh()
  } catch (e: any) {
    addError.value = e?.data?.statusMessage ?? '追加に失敗しました'
  } finally {
    addLoading.value = false
  }
}

// 編集モーダル
const editModal = reactive<{ show: boolean; id: string; name: string; address: string; phone: string }>({
  show: false, id: '', name: '', address: '', phone: '',
})
const editLoading = ref(false)
const editError = ref('')

function openEdit(h: any) {
  editModal.id = h._id
  editModal.name = h.name
  editModal.address = h.address
  editModal.phone = h.phone
  editModal.show = true
  editError.value = ''
}

async function saveEdit() {
  editLoading.value = true
  editError.value = ''
  try {
    await $fetch(`/api/hospitals/${editModal.id}`, {
      method: 'PUT',
      body: { name: editModal.name, address: editModal.address, phone: editModal.phone },
    })
    editModal.show = false
    await refresh()
  } catch (e: any) {
    editError.value = e?.data?.statusMessage ?? '更新に失敗しました'
  } finally {
    editLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Admin header -->
    <header class="bg-white border-b border-slate-200 px-5 h-14 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-2 font-semibold text-[15px] text-slate-700" style="font-family:'DM Sans',sans-serif">
        <div class="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white text-sm">⚙️</div>
        管理画面
      </div>
      <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">管理者</span>
    </header>

    <!-- Topbar warning -->
    <div class="bg-teal-50 border-b border-teal-200 px-5 py-1.5 text-xs text-teal-700 text-center">
      ⚠️ このページは管理者専用です（別URLでアクセス）
    </div>

    <main class="max-w-[640px] mx-auto px-5 py-6">
      <h1 class="text-lg font-bold text-slate-900 mb-1">病院マスタ管理</h1>
      <p class="text-xs text-slate-400 mb-5">オートコンプリートで使用される病院データを管理します</p>

      <!-- Toolbar -->
      <div class="flex gap-2.5 mb-4 flex-wrap">
        <HospitalAutocomplete
          v-model="searchQuery"
          placeholder="病院名で検索..."
          class="flex-1 min-w-[180px]"
        />
        <button
          class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          @click="addModal.show = true"
        >
          ＋ 手動追加
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-50">
              <th class="text-left text-[11px] font-semibold text-slate-400 px-3 py-2.5 border-b border-slate-200">病院名</th>
              <th class="text-left text-[11px] font-semibold text-slate-400 px-3 py-2.5 border-b border-slate-200">住所</th>
              <th class="text-left text-[11px] font-semibold text-slate-400 px-3 py-2.5 border-b border-slate-200">電話番号</th>
              <th class="text-left text-[11px] font-semibold text-slate-400 px-3 py-2.5 border-b border-slate-200">データソース</th>
              <th class="text-left text-[11px] font-semibold text-slate-400 px-3 py-2.5 border-b border-slate-200">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hospitals" :key="h._id" class="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td class="px-3 py-2.5 font-semibold text-slate-900">{{ h.name }}</td>
              <td class="px-3 py-2.5 text-slate-600">{{ h.address || '—' }}</td>
              <td class="px-3 py-2.5 text-slate-600">{{ h.phone || '—' }}</td>
              <td class="px-3 py-2.5">
                <span :class="['text-[11px] px-2 py-0.5 rounded-full font-medium',
                  h.source === 'medical_code' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800']">
                  {{ sourceLabel[h.source] ?? h.source }}
                </span>
              </td>
              <td class="px-3 py-2.5">
                <button
                  class="text-xs border border-slate-200 rounded px-2.5 py-1 hover:bg-slate-100 transition-colors"
                  @click="openEdit(h)"
                >編集</button>
              </td>
            </tr>
            <tr v-if="hospitals.length === 0">
              <td colspan="5" class="text-center text-slate-400 text-sm py-8">データがありません</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-xs text-slate-400 mt-2 text-right">全{{ hospitals.length }}件</p>
    </main>

    <!-- 追加モーダル -->
    <Transition name="overlay">
      <div v-if="addModal.show" class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-5" @click.self="addModal.show = false">
        <div class="bg-white rounded-2xl p-7 max-w-[400px] w-full shadow-2xl">
          <h2 class="text-base font-bold text-slate-900 mb-4">病院を手動追加</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">病院名 <span class="text-red-500">*</span></label>
              <input v-model="addModal.name" type="text" class="form-input w-full" placeholder="病院名" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">住所</label>
              <input v-model="addModal.address" type="text" class="form-input w-full" placeholder="〇〇市〇〇町1-1" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">電話番号</label>
              <input v-model="addModal.phone" type="tel" class="form-input w-full" placeholder="00-0000-0000" />
            </div>
            <p v-if="addError" class="text-xs text-red-500">{{ addError }}</p>
          </div>
          <div class="flex gap-2.5 mt-5">
            <button class="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50" @click="addModal.show = false">キャンセル</button>
            <button :disabled="addLoading" class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors" @click="addHospital">
              {{ addLoading ? '追加中...' : '追加する' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 編集モーダル -->
    <Transition name="overlay">
      <div v-if="editModal.show" class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-5" @click.self="editModal.show = false">
        <div class="bg-white rounded-2xl p-7 max-w-[400px] w-full shadow-2xl">
          <h2 class="text-base font-bold text-slate-900 mb-4">病院情報を編集</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">病院名 <span class="text-red-500">*</span></label>
              <input v-model="editModal.name" type="text" class="form-input w-full" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">住所</label>
              <input v-model="editModal.address" type="text" class="form-input w-full" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">電話番号</label>
              <input v-model="editModal.phone" type="tel" class="form-input w-full" />
            </div>
            <p v-if="editError" class="text-xs text-red-500">{{ editError }}</p>
          </div>
          <div class="flex gap-2.5 mt-5">
            <button class="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50" @click="editModal.show = false">キャンセル</button>
            <button :disabled="editLoading" class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors" @click="saveEdit">
              {{ editLoading ? '保存中...' : '💾 保存する' }}
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
