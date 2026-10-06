<script setup lang="ts">
import type { Site } from '~/composables/useGatewayApi'

definePageMeta({ layout: 'dashboard' })
const { api } = useGatewayApi()
const sites = ref<Site[]>([])
const loading = ref(true)
const errorMessage = ref('')
const showForm = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ hostname: '', upstreamUrl: '', tlsRef: '', projectId: '' })

async function load() {
  loading.value = true
  try {
    sites.value = await api<Site[]>('sites')
  } catch {
    errorMessage.value = 'Unable to load managed sites.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function createSite() {
  saving.value = true
  formError.value = ''
  try {
    await api('sites', { method: 'POST', body: { hostname: form.hostname, upstreamUrl: form.upstreamUrl || null, tlsRef: form.tlsRef || null, projectId: form.projectId || null } })
    showForm.value = false
    Object.assign(form, { hostname: '', upstreamUrl: '', tlsRef: '', projectId: '' })
    await load()
  } catch (error: unknown) {
    const failure = error as { data?: { message?: string } }
    formError.value = failure.data?.message || 'Could not add this site.'
  } finally {
    saving.value = false
  }
}

function stateColor(state: string) {
  return state === 'active' ? 'success' : state === 'grace' ? 'warning' : 'neutral'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-sm text-muted">Connect hostnames to upstream applications and monitor enforcement status.</p></div><UButton icon="i-lucide-plus" @click="showForm = !showForm">Add site</UButton></div>
    <UAlert v-if="errorMessage" color="error" variant="subtle" :description="errorMessage" />
    <UCard v-if="showForm" class="border border-emerald-200 shadow-sm">
      <template #header><h2 class="font-semibold">Connect a site</h2><p class="mt-1 text-xs text-muted">Enter the public hostname and the upstream address your proxy should reach.</p></template>
      <UAlert v-if="formError" color="error" variant="subtle" class="mb-4" :description="formError" />
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="createSite">
        <UFormField label="Hostname" hint="Example: app.example.com"><UInput v-model="form.hostname" placeholder="app.example.com" class="w-full" required /></UFormField>
        <UFormField label="Upstream URL" hint="Example: http://127.0.0.1:5173"><UInput v-model="form.upstreamUrl" placeholder="http://127.0.0.1:5173" class="w-full" /></UFormField>
        <UFormField label="TLS reference" hint="Optional certificate name"><UInput v-model="form.tlsRef" placeholder="app.example.com" class="w-full" /></UFormField>
        <UFormField label="Project ID" hint="Optional project UUID"><UInput v-model="form.projectId" placeholder="Project ID" class="w-full" /></UFormField>
        <div class="flex justify-end gap-2 md:col-span-2"><UButton type="button" color="neutral" variant="ghost" @click="showForm = false">Cancel</UButton><UButton type="submit" :loading="saving">Save site</UButton></div>
      </form>
    </UCard>
    <div v-if="loading" class="grid gap-4 xl:grid-cols-2"><USkeleton v-for="n in 4" :key="n" class="h-40 rounded-xl" /></div>
    <div v-else-if="sites.length" class="grid gap-4 xl:grid-cols-2">
      <UCard v-for="site in sites" :key="site.id" class="border border-default shadow-sm">
        <div class="flex items-start justify-between gap-4"><div class="flex min-w-0 items-center gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-elevated text-muted"><UIcon name="i-lucide-globe-2" class="size-5" /></span><div class="min-w-0"><h2 class="truncate font-semibold">{{ site.hostname }}</h2><p class="mt-1 truncate text-xs text-muted">{{ site.upstreamUrl || 'No upstream configured' }}</p></div></div><UBadge :color="stateColor(site.entitlementState)" variant="subtle" class="capitalize">{{ site.entitlementState.replaceAll('_', ' ') }}</UBadge></div>
        <div class="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-elevated p-4"><div><p class="text-[11px] font-medium uppercase tracking-wider text-dimmed">Proxy apply</p><p class="mt-1 text-sm font-semibold capitalize">{{ site.applyStatus.replaceAll('_', ' ') }}</p></div><div><p class="text-[11px] font-medium uppercase tracking-wider text-dimmed">Site ID</p><p class="mt-1 truncate text-sm font-medium text-muted">{{ site.id }}</p></div></div>
        <p v-if="site.lastApplyError" class="mt-3 text-xs text-rose-600">{{ site.lastApplyError }}</p>
      </UCard>
    </div>
    <UCard v-else-if="!loading" class="border border-dashed border-default py-10 text-center"><UIcon name="i-lucide-globe-2" class="mx-auto size-9 text-dimmed" /><h2 class="mt-4 font-semibold">No sites connected</h2><p class="mx-auto mt-1 max-w-sm text-sm text-muted">Add a hostname and upstream to start managing its payment entitlement.</p><UButton class="mt-5" icon="i-lucide-plus" @click="showForm = true">Connect your first site</UButton></UCard>
  </div>
</template>
