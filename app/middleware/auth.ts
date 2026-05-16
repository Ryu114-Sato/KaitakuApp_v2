import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated && to.path !== '/' && to.path !== '/register') {
    return navigateTo('/')
  }
})
