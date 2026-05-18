<script setup lang="ts">
export interface HospitalOption {
  _id: string
  name: string
  address: string
  phone: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: '病院名を入力',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'select', hospital: HospitalOption): void
}>()

const suggestions = ref<HospitalOption[]>([])
const showDropdown = ref(false)
const fetching = ref(false)
const fetchError = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)

  if (timer) clearTimeout(timer)
  fetchError.value = ''

  if (!val || val.length < 1) {
    suggestions.value = []
    showDropdown.value = false
    return
  }

  timer = setTimeout(async () => {
    fetching.value = true
    try {
      const res = await $fetch<{ success: boolean; data: HospitalOption[] }>(
        `/api/hospitals?q=${encodeURIComponent(val)}`,
      )
      suggestions.value = res.data ?? []
      showDropdown.value = true
    } catch (err: any) {
      suggestions.value = []
      showDropdown.value = false
      fetchError.value = err?.message ?? '候補の取得に失敗しました'
    } finally {
      fetching.value = false
    }
  }, 300)
}

// mousedown.prevent でblur前に値をセットする
function select(hospital: HospitalOption) {
  emit('update:modelValue', hospital.name)
  emit('select', hospital)
  showDropdown.value = false
  suggestions.value = []
}

function onBlur() {
  setTimeout(() => { showDropdown.value = false }, 150)
}
</script>

<template>
  <div class="relative">
    <!-- 入力欄 -->
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
      class="hospital-input w-full"
      @input="onInput"
      @blur="onBlur"
    />

    <!-- ローディングスピナー -->
    <div v-if="fetching" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <div class="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- エラー表示 -->
    <p v-if="fetchError" class="mt-1 text-[11px] text-red-500">{{ fetchError }}</p>

    <!-- ドロップダウン -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
      >
        <!-- 候補あり -->
        <template v-if="suggestions.length > 0">
          <button
            v-for="s in suggestions"
            :key="s._id"
            type="button"
            class="w-full text-left px-3 py-2.5 hover:bg-teal-50 border-b border-slate-100 last:border-0 flex items-start gap-2 transition-colors"
            @mousedown.prevent="select(s)"
          >
            <span class="text-base mt-0.5 shrink-0">🏥</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ s.name }}</p>
              <p v-if="s.address" class="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
                {{ s.address }}
              </p>
            </div>
          </button>
        </template>

        <!-- 候補なし -->
        <div v-else class="px-3 py-3 text-sm text-slate-400 text-center">
          該当なし
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.hospital-input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  background: white;
}
.hospital-input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,.1);
}
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity .12s, transform .12s; }
.dropdown-enter-from,
.dropdown-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>
