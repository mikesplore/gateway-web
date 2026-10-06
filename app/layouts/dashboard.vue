<script setup lang="ts">
import type { SessionResponse } from '~/composables/useGatewayApi'

const { api } = useGatewayApi()
const router = useRouter()
const currentPath = computed(() => router.currentRoute.value.path)
const user = ref<SessionResponse['user'] | null>(null)
const loading = ref(true)
const links = [
  { label: 'Overview', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Payments', to: '/payments', icon: 'i-lucide-arrow-left-right' },
  { label: 'Projects', to: '/projects', icon: 'i-lucide-boxes' },
  { label: 'Sites', to: '/sites', icon: 'i-lucide-globe-2' },
  { label: 'Operations', to: '/operations', icon: 'i-lucide-activity' }
]

onMounted(async () => {
  try {
    const session = await api<SessionResponse>('auth/session')
    user.value = session.user
  } catch {
    await navigateTo('/')
  } finally {
    loading.value = false
  }
})

async function logout() {
  await api('auth/logout', { method: 'POST' }).catch(() => undefined)
  await navigateTo('/')
}
</script>

<template>
  <div class="gateway-app-surface min-h-screen text-highlighted">
    <div v-if="loading" class="grid min-h-screen place-items-center">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-primary" />
    </div>
    <div v-else-if="user" class="flex min-h-screen">
      <aside class="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-default bg-default lg:flex">
        <NuxtLink to="/dashboard" class="flex h-20 items-center gap-3 border-b border-default px-6">
          <span class="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white"><UIcon name="i-lucide-workflow" class="size-5" /></span>
          <span class="text-lg font-semibold tracking-tight">GateWay</span>
        </NuxtLink>
        <div class="px-4 pt-7">
          <p class="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-dimmed">Workspace</p>
          <nav class="space-y-1">
            <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition" :class="currentPath === link.to ? 'bg-emerald-50 text-emerald-700' : 'text-muted hover:bg-elevated hover:text-highlighted'">
              <UIcon :name="link.icon" class="size-4" />
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
        <div class="mt-auto border-t border-default p-4">
          <div class="flex items-center gap-3 rounded-xl bg-elevated p-3">
            <UAvatar :alt="user.displayName" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold">{{ user.displayName }}</p>
              <p class="truncate text-xs text-muted">{{ user.role }} · {{ user.email }}</p>
            </div>
          </div>
          <UButton class="mt-3 w-full justify-start" color="neutral" variant="ghost" icon="i-lucide-log-out" @click="logout">Sign out</UButton>
        </div>
      </aside>
      <main class="min-w-0 flex-1 lg:pl-64">
        <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-default bg-default/90 px-5 backdrop-blur lg:px-10">
          <div class="flex items-center gap-3">
            <span class="grid size-8 place-items-center rounded-lg bg-emerald-600 text-white lg:hidden"><UIcon name="i-lucide-workflow" class="size-4" /></span>
            <p class="text-sm font-medium text-muted">GateWay <span class="px-1 text-dimmed">/</span> <span class="text-highlighted">{{ links.find(link => link.to === currentPath)?.label || 'Overview' }}</span></p>
          </div>
          <div class="flex items-center gap-3">
            <span class="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline-flex"><span class="mr-2 mt-1 size-1.5 rounded-full bg-emerald-500" />System online</span>
            <UColorModeButton />
            <UButton class="lg:hidden" color="neutral" variant="ghost" icon="i-lucide-log-out" aria-label="Sign out" @click="logout" />
          </div>
        </header>
        <div class="border-b border-default bg-default px-4 py-2 lg:hidden">
          <nav class="flex gap-1 overflow-x-auto">
            <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium" :class="currentPath === link.to ? 'bg-emerald-50 text-emerald-700' : 'text-muted'">{{ link.label }}</NuxtLink>
          </nav>
        </div>
        <div class="mx-auto max-w-[1440px] p-5 lg:p-10">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
