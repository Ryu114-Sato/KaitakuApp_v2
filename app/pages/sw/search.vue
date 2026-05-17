<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

// 検索フォーム
const hospitalName = ref('')
const searchDate = ref('')
const searchTime = ref('')
const vehicles = ref<string[]>([])

// オートコンプリート
const suggestions = ref<any[]>([])
const showSuggest = ref(false)

async function onHospitalInput() {
  if (hospitalName.value.length < 1) { suggestions.value = []; showSuggest.value = false; return }
  const res = await $fetch<{ success: boolean; data: any[] }>(`/api/hospitals?q=${encodeURIComponent(hospitalName.value)}`)
  suggestions.value = res.data ?? []
  showSuggest.value = suggestions.value.length > 0
}

function selectHospital(name: string) {
  hospitalName.value = name
  showSuggest.value = false
}

function toggleVehicle(v: string) {
  const i = vehicles.value.indexOf(v)
  if (i >= 0) vehicles.value.splice(i, 1)
  else vehicles.value.push(v)
}

// 検索結果
const results = ref<any[]>([])
const searched = ref(false)
const loading = ref(false)
const searchMeta = ref('')

async function onSearch() {
  if (!hospitalName.value) return
  loading.value = true
  searched.value = false

  const params = new URLSearchParams({ hospitalName: hospitalName.value })
  if (searchDate.value && searchTime.value) {
    params.set('datetime', `${searchDate.value}T${searchTime.value}:00`)
  }
  if (vehicles.value.length) {
    params.set('vehicles', vehicles.value.join(','))
  }

  try {
    const res = await $fetch<{ success: boolean; data: any[] }>(`/api/schedules?${params}`)
    results.value = res.data ?? []
    searched.value = true
    searchMeta.value = [
      hospitalName.value,
      searchDate.value && searchTime.value ? `${searchDate.value} ${searchTime.value}` : '',
      vehicles.value.map(v => vehicleLabel[v]).filter(Boolean).join('・'),
    ].filter(Boolean).join(' / ')
  } catch (e: any) {
    alert(e?.data?.statusMessage ?? '検索に失敗しました')
  } finally {
    loading.value = false
  }
}

function backToSearch() {
  searched.value = false
  results.value = []
}

const typeLabel: Record<string, string> = {
  consultation: '受診送迎',
  discharge: '退院送迎',
  transfer: '転院送迎',
}

const vehicleLabel: Record<string, string> = {
  wheelchair: '♿ 車椅子',
  stretcher: '🛏 ストレッチャー',
}

function formatTime(dt: string) {
  const d = new Date(dt)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 電話発信モーダル
const modal = reactive({ show: false, name: '', phone: '' })

function openModal(name: string, phone: string) {
  modal.name = name
  modal.phone = phone
  modal.show = true
}

function callPhone() {
  window.location.href = `tel:${modal.phone}`
  modal.show = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-[480px] mx-auto px-5 py-6">

      <!-- 検索フォーム -->
      <template v-if="!searched">
        <h1 class="text-lg font-bold text-slate-900 mb-1">送迎タクシーを探す</h1>
        <p class="text-xs text-slate-400 mb-5">迎え場所と日時を入力してください</p>

        <div class="bg-white border border-slate-200 rounded-xl p-5 mb-4">

          <!-- 病院名 -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">
              迎え場所（病院名）<span class="text-red-500 ml-1">必須</span>
            </label>
            <div class="relative">
              <input
                v-model="hospitalName"
                type="text"
                placeholder="病院名を入力（例：A病院）"
                class="form-input w-full"
                @input="onHospitalInput"
                @blur="setTimeout(() => showSuggest = false, 150)"
              />
              <!-- オートコンプリート -->
              <div
                v-if="showSuggest"
                class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-lg"
              >
                <button
                  v-for="s in suggestions"
                  :key="s._id"
                  type="button"
                  class="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center gap-2"
                  @click="selectHospital(s.name)"
                >
                  🏥 {{ s.name }}
                </button>
              </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">※ 病院名マスタから候補を表示します（表記ゆれ防止）</p>
          </div>

          <!-- 日時 -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-600 mb-1.5">
              迎え希望日時<span class="text-slate-400 font-normal ml-1">任意</span>
            </label>
            <div class="flex gap-2">
              <input v-model="searchDate" type="date" class="form-input flex-1" />
              <input v-model="searchTime" type="time" class="form-input flex-1" />
            </div>
          </div>

          <!-- 車両 -->
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">
              車両条件<span class="text-slate-400 font-normal ml-1">任意</span>
            </label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="v in [{ value: 'wheelchair', label: '♿ 車椅子対応' }, { value: 'stretcher', label: '🛏 ストレッチャー対応' }]"
                :key="v.value"
                type="button"
                :class="['py-2 px-3.5 rounded-lg border text-[13px] font-medium transition-all',
                  vehicles.includes(v.value)
                    ? 'border-teal-600 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50']"
                @click="toggleVehicle(v.value)"
              >{{ v.label }}</button>
            </div>
          </div>
        </div>

        <button
          :disabled="loading || !hospitalName"
          class="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium text-sm py-3 rounded-lg transition-colors"
          @click="onSearch"
        >
          {{ loading ? '検索中...' : '🔍 検索する' }}
        </button>
      </template>

      <!-- 検索結果 -->
      <template v-else>
        <button class="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 mb-4 transition-colors" @click="backToSearch">
          ← 検索画面に戻る
        </button>

        <h1 class="text-lg font-bold text-slate-900 mb-1">検索結果</h1>
        <p class="text-xs text-slate-400 mb-4">{{ searchMeta }}</p>

        <!-- 件数 -->
        <p class="text-xs text-slate-400 pb-3 mb-3 border-b border-slate-200">
          {{ results.length > 0 ? `${results.length}件見つかりました。★ は当該病院への来院予定ありの事業者です。` : '条件に合う事業者が見つかりませんでした。' }}
        </p>

        <!-- Empty -->
        <div v-if="results.length === 0" class="text-center py-10 text-slate-400">
          <div class="text-4xl mb-3">🔍</div>
          <p class="text-sm">検索条件を変えて再度お試しください</p>
        </div>

        <!-- Result cards -->
        <div
          v-for="r in results"
          :key="r._id"
          :class="['bg-white border rounded-[10px] p-4 mb-2.5 transition-shadow hover:shadow-md',
            r.hospitalName === hospitalName ? 'border-teal-500 bg-teal-50/40' : 'border-slate-200']"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2 text-[15px] font-bold text-slate-900">
              {{ r.taxiName }}
              <span v-if="r.hospitalName === hospitalName" class="bg-amber-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                ★ 来院予定あり
              </span>
            </div>
            <div class="text-xs font-semibold text-teal-700 text-right" style="font-family:'DM Sans',sans-serif">
              到着 {{ formatTime(r.arrivalDateTime) }}
            </div>
          </div>

          <div v-if="r.hospitalName === hospitalName" class="inline-block text-[11px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded mb-2">
            {{ r.hospitalName }} {{ formatTime(r.arrivalDateTime) }} {{ typeLabel[r.type] }}の予定があります
          </div>

          <div class="flex flex-wrap gap-1.5 mt-1 mb-3">
            <span
              v-for="v in r.vehicles"
              :key="v"
              class="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800"
            >{{ vehicleLabel[v] ?? v }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-xs text-slate-400">
              {{ r.taxiPhone ? `📞 ${r.taxiPhone}` : '' }}
            </span>
            <button
              class="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
              @click="openModal(r.taxiName, r.taxiPhone)"
            >
              📞 電話をかける
            </button>
          </div>
        </div>
      </template>
    </main>

    <!-- 電話確認モーダル -->
    <Transition name="overlay">
      <div
        v-if="modal.show"
        class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-5"
        @click.self="modal.show = false"
      >
        <div class="bg-white rounded-2xl p-7 max-w-[340px] w-full shadow-2xl text-center">
          <div class="text-3xl mb-3">📞</div>
          <p class="text-base font-bold text-slate-900 mb-1.5">以下の番号に発信します</p>
          <p class="text-sm text-slate-600 mb-0.5">{{ modal.name }}</p>
          <p class="text-xl font-bold text-teal-700 my-3" style="font-family:'DM Sans',sans-serif;letter-spacing:.5px">
            {{ modal.phone }}
          </p>
          <p class="text-[11px] text-slate-400 mb-4">発信後、直接予約の確認をお願いします</p>
          <div class="flex gap-2.5">
            <button
              class="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              @click="modal.show = false"
            >キャンセル</button>
            <button
              class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg transition-colors"
              @click="callPhone"
            >📞 発信する</button>
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
.form-input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,.1);
}
.overlay-enter-active, .overlay-leave-active { transition: opacity .2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
</style>
