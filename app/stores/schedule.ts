import { defineStore } from 'pinia'

export interface Schedule {
  _id?: string
  hospital: string
  arrivalAt: string
  type: '受診' | '退院' | '転院'
  vehicle: '車椅子' | 'ストレッチャー'
  status: '確定' | '仮' | 'キャンセル'
}

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    items: [] as Schedule[],
  }),
  actions: {
    setItems(items: Schedule[]) {
      this.items = items
    },
  },
})
