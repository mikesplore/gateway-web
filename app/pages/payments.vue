<script setup lang="ts">
import type { Payment } from '~/composables/useGatewayApi'
import { dateTime, money } from '~/composables/useGatewayApi'

definePageMeta({ layout: 'dashboard' })
const { api } = useGatewayApi()
const payments = ref<Payment[]>([])
const status = ref('')
const provider = ref('')
const loading = ref(true)
const errorMessage = ref('')
const busyReference = ref('')
const reconcileMessage = ref('')
const statuses = [{ label: 'All statuses', value: '' }, ...['pending', 'succeeded', 'failed', 'reversed'].map(value => ({ label: value[0].toUpperCase() + value.slice(1), value }))]
const providers = [{ label: 'All providers', value: '' }, { label: 'Paystack', value: 'paystack' }, { label: 'M-Pesa', value: 'mpesa' }]

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const query = new URLSearchParams()
    if (status.value) query.set('status', status.value)
    if (provider.value) query.set('provider', provider.value)
    query.set('limit', '100')
    payments.value = await api<Payment[]>('payments?' + query.toString())
  } catch {
    errorMessage.value = 'Unable to load payments.'
  } finally {
    loading.value = false
  }
}
watch([status, provider], load)
onMounted(load)

async function reconcile(payment: Payment) {
  busyReference.value = payment.reference
  reconcileMessage.value = ''
  try {
    const result = await api<{ status: string }>('payments/' + encodeURIComponent(payment.reference) + '/reconcile', { method: 'POST' })
    reconcileMessage.value = 'Reconciliation result: ' + result.status.replaceAll('_', ' ')
    await load()
  } catch {
    reconcileMessage.value = 'Could not reconcile this payment right now.'
  } finally {
    busyReference.value = ''
  }
}

function badgeColor(state: string) {
  return state === 'succeeded' ? 'success' : state === 'pending' ? 'warning' : state === 'failed' || state === 'reversed' ? 'error' : 'neutral'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-sm text-muted">Review activity and reconcile payments still pending with a provider.</p></div><UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" :loading="loading" @click="load">Refresh</UButton></div>
    <UAlert v-if="errorMessage" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorMessage" />
    <UAlert v-if="reconcileMessage" color="primary" variant="subtle" :description="reconcileMessage" />
    <UCard class="border border-default shadow-sm">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row">
        <select
          v-model="provider"
          aria-label="Filter by provider"
          class="w-full rounded-lg border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none focus:border-emerald-500 sm:max-w-52"
        >
          <option v-for="option in providers" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <select
          v-model="status"
          aria-label="Filter by status"
          class="w-full rounded-lg border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none focus:border-emerald-500 sm:max-w-52"
        >
          <option v-for="option in statuses" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <div class="sm:ml-auto self-center text-xs text-muted">{{ payments.length }} records</div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead><tr class="border-b border-default text-xs uppercase tracking-wider text-dimmed"><th class="pb-3 font-medium">Reference</th><th class="pb-3 font-medium">Provider</th><th class="pb-3 font-medium">Status</th><th class="pb-3 font-medium">Amount</th><th class="pb-3 font-medium">Project</th><th class="pb-3 text-right font-medium">Action</th></tr></thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id" class="border-b border-default last:border-0">
              <td class="py-4"><p class="font-semibold">{{ payment.reference }}</p><p class="mt-1 text-xs text-dimmed">{{ dateTime(payment.createdAt) }}</p></td>
              <td class="py-4"><span class="inline-flex items-center gap-2 capitalize"><UIcon :name="payment.provider === 'mpesa' ? 'i-lucide-smartphone' : 'i-lucide-credit-card'" class="size-4 text-dimmed" />{{ payment.provider }}</span></td>
              <td class="py-4"><UBadge :color="badgeColor(payment.status)" variant="subtle" class="capitalize">{{ payment.status }}</UBadge></td>
              <td class="py-4 font-semibold">{{ money(payment.amount, payment.currency) }}</td>
              <td class="py-4 text-muted">{{ payment.projectId ? payment.projectId.slice(0, 8) : '—' }}</td>
              <td class="py-4 text-right"><UButton v-if="payment.status === 'pending'" size="xs" color="neutral" variant="outline" :loading="busyReference === payment.reference" @click="reconcile(payment)">Reconcile</UButton><span v-else class="text-xs text-dimmed">—</span></td>
            </tr>
            <tr v-if="!loading && payments.length === 0"><td colspan="6" class="py-16 text-center text-sm text-muted">No payments match these filters.</td></tr>
            <tr v-if="loading"><td colspan="6" class="py-12 text-center text-sm text-dimmed">Loading payments…</td></tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
