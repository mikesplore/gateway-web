<script setup lang="ts">
import type { Payment, PaymentSummary } from '~/composables/useGatewayApi'
import { dateTime, money } from '~/composables/useGatewayApi'

definePageMeta({ layout: 'dashboard' })
const { api } = useGatewayApi()
const summary = ref<PaymentSummary | null>(null)
const payments = ref<Payment[]>([])
const loading = ref(true)
const errorMessage = ref('')
const primaryCurrency = computed(() => Object.keys(summary.value?.succeededAmountsByCurrency || {})[0] || 'KES')

onMounted(async () => {
  try {
    const [totals, recent] = await Promise.all([
      api<PaymentSummary>('payments/summary'),
      api<Payment[]>('payments?limit=6')
    ])
    summary.value = totals
    payments.value = recent
  } catch {
    errorMessage.value = 'Could not load your workspace data. Refresh to try again.'
  } finally {
    loading.value = false
  }
})

const cards = computed(() => [
  { label: 'Successful payments', value: summary.value?.succeeded ?? 0, helper: 'Completed transactions', icon: 'i-lucide-circle-check', tone: 'emerald' },
  { label: 'Awaiting payment', value: summary.value?.pending ?? 0, helper: 'Currently pending', icon: 'i-lucide-clock-3', tone: 'amber' },
  { label: 'Successful volume', value: money(summary.value?.succeededAmountsByCurrency?.[primaryCurrency.value] || '0', primaryCurrency.value), helper: 'Settled · ' + primaryCurrency.value, icon: 'i-lucide-chart-no-axes-combined', tone: 'blue' },
  { label: 'Needs attention', value: (summary.value?.failed ?? 0) + (summary.value?.reversed ?? 0), helper: 'Failed or reversed', icon: 'i-lucide-triangle-alert', tone: 'rose' }
])
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p class="text-sm text-muted">Here’s how your payments and sites are doing.</p></div>
      <UButton to="/payments" icon="i-lucide-arrow-up-right" trailing>View payments</UButton>
    </div>
    <UAlert v-if="errorMessage" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorMessage" />
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><USkeleton v-for="n in 4" :key="n" class="h-32 rounded-xl" /></div>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UCard v-for="card in cards" :key="card.label" class="border border-default shadow-sm">
        <div class="flex items-start justify-between"><p class="text-sm font-medium text-muted">{{ card.label }}</p><span class="grid size-9 place-items-center rounded-lg bg-elevated text-muted"><UIcon :name="card.icon" class="size-4" /></span></div>
        <p class="mt-4 text-3xl font-semibold tracking-tight">{{ card.value }}</p><p class="mt-1 text-xs text-dimmed">{{ card.helper }}</p>
      </UCard>
    </div>
    <div class="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <UCard class="border border-default shadow-sm">
        <template #header><div class="flex items-center justify-between"><div><h2 class="font-semibold">Recent payments</h2><p class="mt-1 text-xs text-muted">Latest transactions across your workspace</p></div><UButton to="/payments" color="neutral" variant="ghost" trailing-icon="i-lucide-arrow-right" size="sm">All payments</UButton></div></template>
        <div v-if="payments.length" class="divide-y divide-slate-100">
          <div v-for="payment in payments" :key="payment.id" class="flex items-center gap-3 py-4 first:pt-1 last:pb-1">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><UIcon :name="payment.provider === 'mpesa' ? 'i-lucide-smartphone' : 'i-lucide-credit-card'" class="size-4" /></span>
            <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">{{ payment.reference }}</p><p class="mt-1 text-xs text-muted">{{ payment.provider }} · {{ payment.status }}</p></div>
            <p class="text-right text-sm font-semibold">{{ money(payment.amount, payment.currency) }}</p>
          </div>
        </div>
        <div v-else class="py-12 text-center"><UIcon name="i-lucide-receipt-text" class="mx-auto size-8 text-dimmed" /><p class="mt-3 text-sm font-medium">No payments yet</p><p class="mt-1 text-xs text-muted">Transactions will appear here when they come in.</p></div>
      </UCard>
      <UCard class="border border-default shadow-sm">
        <template #header><h2 class="font-semibold">Quick links</h2><p class="mt-1 text-xs text-muted">Manage your payment setup</p></template>
        <div class="space-y-2">
          <NuxtLink v-for="item in [{to:'/projects',label:'Manage projects',icon:'i-lucide-boxes',text:'Group related sites'}, {to:'/sites',label:'Managed sites',icon:'i-lucide-globe-2',text:'Entitlements and apply status'}, {to:'/operations',label:'Operations',icon:'i-lucide-activity',text:'Events and infrastructure'}]" :key="item.to" :to="item.to" class="flex items-center gap-3 rounded-xl border border-default p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
            <span class="grid size-9 place-items-center rounded-lg bg-elevated text-muted"><UIcon :name="item.icon" class="size-4" /></span><span class="min-w-0 flex-1"><span class="block text-sm font-semibold">{{ item.label }}</span><span class="mt-0.5 block text-xs text-muted">{{ item.text }}</span></span><UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed" />
          </NuxtLink>
        </div>
      </UCard>
    </div>
    <p class="text-right text-xs text-dimmed">Updated {{ dateTime(new Date().toISOString()) }}</p>
  </div>
</template>
