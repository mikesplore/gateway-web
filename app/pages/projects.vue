<script setup lang="ts">
import type { Project } from '~/composables/useGatewayApi'
import { dateTime } from '~/composables/useGatewayApi'

definePageMeta({ layout: 'dashboard' })
const { api } = useGatewayApi()
const projects = ref<Project[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const name = ref('')
const billingReference = ref('')

async function load() {
  loading.value = true
  try { projects.value = await api<Project[]>('projects') } catch { errorMessage.value = 'Unable to load projects.' } finally { loading.value = false }
}
onMounted(load)

async function createProject() {
  saving.value = true
  errorMessage.value = ''
  try {
    await api('projects', { method: 'POST', body: { name: name.value, billingReference: billingReference.value || null } })
    name.value = ''
    billingReference.value = ''
    showForm.value = false
    await load()
  } catch (error: unknown) {
    const failure = error as { data?: { message?: string } }
    errorMessage.value = failure.data?.message || 'Could not create project.'
  } finally { saving.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-sm text-muted">Group sites under a billing reference for simpler management.</p></div><UButton icon="i-lucide-plus" @click="showForm = !showForm">New project</UButton></div>
    <UAlert v-if="errorMessage" color="error" variant="subtle" :description="errorMessage" />
    <UCard v-if="showForm" class="border border-emerald-200 shadow-sm">
      <template #header><h2 class="font-semibold">Create project</h2><p class="mt-1 text-xs text-muted">Projects can group multiple managed sites.</p></template>
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="createProject"><UFormField label="Project name"><UInput v-model="name" placeholder="Production apps" class="w-full" required /></UFormField><UFormField label="Billing reference" hint="Optional identifier for your records"><UInput v-model="billingReference" placeholder="customer-123" class="w-full" /></UFormField><div class="flex justify-end gap-2 md:col-span-2"><UButton type="button" color="neutral" variant="ghost" @click="showForm = false">Cancel</UButton><UButton type="submit" :loading="saving">Create project</UButton></div></form>
    </UCard>
    <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><USkeleton v-for="n in 3" :key="n" class="h-40 rounded-xl" /></div>
    <div v-else-if="projects.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="project in projects" :key="project.id" class="border border-default shadow-sm"><span class="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><UIcon name="i-lucide-boxes" class="size-5" /></span><h2 class="mt-4 font-semibold">{{ project.name }}</h2><p class="mt-1 text-xs text-muted">{{ project.billingReference || 'No billing reference' }}</p><div class="mt-5 flex items-center justify-between border-t border-default pt-4"><span class="truncate pr-3 text-[11px] text-dimmed">{{ project.id }}</span><span class="shrink-0 text-xs text-muted">{{ dateTime(project.createdAt) }}</span></div></UCard>
    </div>
    <UCard v-else-if="!loading" class="border border-dashed border-default py-10 text-center"><UIcon name="i-lucide-boxes" class="mx-auto size-9 text-dimmed" /><h2 class="mt-4 font-semibold">No projects yet</h2><p class="mt-1 text-sm text-muted">Create a project to group related sites.</p><UButton class="mt-5" icon="i-lucide-plus" @click="showForm = true">Create project</UButton></UCard>
  </div>
</template>
