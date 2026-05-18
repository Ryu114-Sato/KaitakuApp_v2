<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const route = useRoute()

// 編集モードかどうか
const editId = computed(() => route.query.id as string | undefined)
const isEdit = computed(() => !!editId.value)

const form = reactive({
  hospitalName: '',
  hospitalId: '',   // オートコンプリートで選択した場合にセット
  arrivalDate: '',
  arrivalTime: '',
  type: 'consultation' as 'consultation' | 'discharge' | 'transfer',
  vehicles: [] as string[],
  status: 'confirmed' as 'confirmed' | 'tentative' | 'cancelled',
  notes: '',
})

const loading = ref(false)
const errorMsg = ref('')

// 編集時：既存データを読み込む
if (isEdit.value) {
  const { data } = await useFetch<{ success: boolean; data: any[] }>('/api/schedules')
  const existing = data.value?.data?.find((s: any) => s._id === editId.value)
  if (existing) {
    const dt = new Date(existing.arrivalDateTime)
    form.hospitalName = existing.hospitalName
    form.arrivalDate = dt.toISOString().slice(0, 10)
    form.arrivalTime = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
    form.type = existing.type
    form.vehicles = [...existing.vehicles]
    form.status = existing.status
    form.notes = existing.notes ?? ''
  }
}

function toggleVehicle(v: string) {
  const idx = form.vehicles.indexOf(v)
  if (idx >= 0) form.vehicles.splice(idx, 1)
  else form.vehicles.push(v)
}

async function onSubmit() {
  if (!form.hospitalName || !form.arrivalDate || !form.arrivalTime || !form.vehicles.length) {
    errorMsg.value = '必須項目を入力してください'
    return
  }
  errorMsg.value = ''
  loading.value = true

  const payload = {
    hospitalName: form.hospitalName,
    arrivalDateTime: `${form.arrivalDate}T${form.arrivalTime}:00`,
    type: form.type,
    vehicles: form.vehicles,
    status: form.status,
    notes: form.notes,
  }

  try {
    if (isEdit.value) {
      await $fetch(`/api/schedules/${editId.value}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/schedules', { method: 'POST', body: payload })
    }
    await router.push('/taxi')
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage ?? '保存に失敗しました'
  } finally {
    loading.value = false
  }
}

const typeOptions: { value: string; label: string }[] = [
  { value: 'consultation', label: '受診' },
  { value: 'discharge', label: '退院' },
  { value: 'transfer', label: '転院' },
]

const statusOptions: { value: string; label: string }[] = [
  { value: 'confirmed', label: '確定' },
  { value: 'tentative', label: '仮' },
  { value: 'cancelled', label: 'キャンセル' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-[480px] mx-auto px-5 py-6">
      <button class="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 mb-4 transition-colors" @click="router.push('/taxi')">
        ← スケジュール一覧に戻る
      </button>

      <h1 class="text-lg font-bold text-slate-900 mb-5">{{ isEdit ? 'スケジュール編集' : 'スケジュール登録' }}</h1>

      <form class="bg-white border border-slate-200 rounded-xl p-6 space-y-4" @submit.prevent="onSubmit">

        <!-- 病院名 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            病院・施設名 <span class="text-red-500">*</span>
          </label>
          <HospitalAutocomplete
            v-model="form.hospitalName"
            placeholder="病院名を入力"
            @select="(h) => { form.hospitalId = h._id }"
          />
        </div>

        <!-- 到着日時 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            到着予定日時 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input v-model="form.arrivalDate" type="date" required class="form-input flex-1" />
            <input v-model="form.arrivalTime" type="time" required class="form-input flex-1" />
          </div>
        </div>

        <!-- 種別 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            種別 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              type="button"
              :class="['py-2 px-4 rounded-lg border text-[13px] font-medium transition-all duration-150',
                form.type === opt.value
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
              @click="form.type = opt.value as any"
            >{{ opt.label }}</button>
          </div>
        </div>

        <!-- 対応車両 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            対応車両 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="v in [{ value: 'wheelchair', label: '♿ 車椅子' }, { value: 'stretcher', label: '🛏 ストレッチャー' }]"
              :key="v.value"
              type="button"
              :class="['py-2 px-4 rounded-lg border text-[13px] font-medium transition-all duration-150',
                form.vehicles.includes(v.value)
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
              @click="toggleVehicle(v.value)"
            >{{ v.label }}</button>
          </div>
        </div>

        <!-- ステータス -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            ステータス <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              type="button"
              :class="['py-2 px-4 rounded-lg border text-[13px] font-medium transition-all duration-150',
                form.status === opt.value
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
              @click="form.status = opt.value as any"
            >{{ opt.label }}</button>
          </div>
        </div>

        <!-- 備考 -->
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1.5">
            備考 <span class="text-slate-400 font-normal ml-1">任意</span>
          </label>
          <textarea
            v-model="form.notes"
            placeholder="例：車内でのサポートが必要など"
            rows="3"
            class="form-input w-full resize-y"
          />
          <p class="text-[11px] text-slate-400 mt-1">※ 入力した場合のみ、検索結果一覧に表示されます</p>
        </div>

        <!-- Error -->
        <p v-if="errorMsg" class="text-xs text-red-500">{{ errorMsg }}</p>

      </form>

      <!-- Button row -->
      <div class="flex gap-2.5 mt-4">
        <button
          type="button"
          class="flex-1 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          @click="router.push('/taxi')"
        >キャンセル</button>
        <button
          type="button"
          :disabled="loading"
          class="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg transition-colors"
          @click="onSubmit"
        >
          {{ loading ? '保存中...' : '💾 保存する' }}
        </button>
      </div>
    </main>
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
.form-input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,.1);
}
</style>
