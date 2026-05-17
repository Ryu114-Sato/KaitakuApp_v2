import { useAuthStore } from '~/stores/auth'

const PUBLIC_ROUTES = ['/', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // 初回アクセス時はCookieからセッション復元を試みる
  if (!auth.initialized) {
    await auth.fetchMe()
  }

  const isPublic = PUBLIC_ROUTES.includes(to.path)

  // 未認証 → ログイン画面へ
  if (!auth.isAuthenticated) {
    if (!isPublic) return navigateTo('/')
    return
  }

  // 認証済みでパブリックページ → ロール別ホームへ
  if (isPublic) {
    return navigateTo(auth.getHomePath())
  }

  // ロール別アクセス制御
  const path = to.path
  if (path.startsWith('/sw/') && !auth.isSw) {
    return navigateTo(auth.getHomePath())
  }
  if (path.startsWith('/taxi') && !auth.isTaxi) {
    return navigateTo(auth.getHomePath())
  }
  if (path.startsWith('/admin/') && !auth.isAdmin) {
    return navigateTo(auth.getHomePath())
  }
  if (path.startsWith('/user/') && !(auth.isSw || auth.isTaxi)) {
    return navigateTo(auth.getHomePath())
  }
})
