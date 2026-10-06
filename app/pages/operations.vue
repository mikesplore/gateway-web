<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const { api } = useGatewayApi()
interface EventRecord { id: string, provider: string, eventType: string, reference?: string | null, status: string, receivedAt: string, processingError?: string | null }
const events = ref<EventRecord[]>([])
const loading = ref(true)
const errorMessage = ref('')
const busy = ref('')

async function load() {
  loading.value = true
  try { events.value = await api<EventRecord[]>('ops/payment-events?limit=100') } catch { errorMessage.value = 'Could not load payment events. Operations access may be required.' } finally { loading.value = false }
}
onMounted(load)

async function replay(event: EventRecord) {
  busy.value = event.id
  errorMessage.value = ''
  try { await api('ops/payment-events/' + event.id + '/replay', { method: 'POST' }); await load() } catch { errorMessage.value = 'This event could not be replayed.' } finally { busy.value = '' }
}

async function reconcile() {
  busy.value = 'nginx'
  try { await api('ops/nginx/reconcile', { method: 'POST' }); await load() } catch { errorMessage.value = 'Infrastructure reconciliation failed.' } finally { busy.value = '' }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-sm text-muted">Inspect payment callbacks and recover failed processing.</p></div><div class="flex gap-2"><UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" :loading="loading" @click="load">Refresh</UButton><UButton icon="i-lucide-wrench" :loading="busy === 'nginx'" @click="reconcile">Reconcile Nginx</UButton></div></div>
    <UAlert v-if="errorMessage" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorMessage" />
    <UAlert color="primary" variant="subtle" icon="i-lucide-shield-check" description="Provider callbacks are verified and deduplicated before they update payment state." />
    <UCard class="border border-default shadow-sm">
      <template #header><h2 class="font-semibold">Payment events</h2><p class="mt-1 text-xs text-muted">Failed events can be replayed through their provider adapter.</p></template>
      <div v-if="loading" class="space-y-3"><USkeleton v-for="n in 5" :key="n" class="h-14 rounded-lg" /></div>
      <div v-else-if="events.length" class="divide-y divide-slate-100">
        <div v-for="event in events" :key="event.id" class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg" :class="event.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-elevated text-muted'"><UIcon :name="event.status === 'failed' ? 'i-lucide-circle-alert' : 'i-lucide-webhook'" class="size-4" /></span>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">{{ event.eventType }} <span class="font-normal text-dimmed">· {{ event.provider }}</span></p><p class="mt-1 truncate text-xs text-muted">{{ event.reference || event.id }} · {{ event.processingError || event.receivedAt }}</p></div>
          <UBadge :color="event.status === 'failed' ? 'error' : event.status === 'processed' ? 'success' : 'warning'" variant="subtle" class="capitalize">{{ event.status }}</UBadge>
          <UButton v-if="event.status === 'failed'" size="xs" color="neutral" variant="outline" :loading="busy === event.id" @click="replay(event)">Replay</UButton>
        </div>
      </div>
      <div v-else class="py-12 text-center text-sm text-muted">No payment events recorded yet.</div>
    </UCard>
  </div>
</template>
