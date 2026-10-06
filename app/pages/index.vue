<script setup lang="ts">
const { api } = useGatewayApi()
const email = ref('')
const password = ref('')
const pending = ref(false)
const errorMessage = ref('')

useSeoMeta({ title: 'Sign in · GateWay', description: 'Sign in to manage payments and gated sites.' })

onMounted(async () => {
  try {
    await api('auth/session')
    await navigateTo('/dashboard')
  } catch {
    // A missing session is the normal signed-out state.
  }
})

async function signIn() {
  pending.value = true
  errorMessage.value = ''
  try {
    await api('auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await navigateTo('/dashboard')
  } catch (error: unknown) {
    const failure = error as { data?: { message?: string } }
    errorMessage.value = failure.data?.message || 'Could not sign in. Check your details and try again.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen bg-default lg:grid-cols-[1fr_1fr]">
    <section class="relative hidden overflow-hidden bg-[#071d18] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute -right-36 -top-40 size-[34rem] rounded-full border border-emerald-300/10" />
      <div class="absolute -right-16 -top-20 size-[26rem] rounded-full border border-emerald-300/10" />
      <NuxtLink to="/" class="relative flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-xl bg-emerald-500"><UIcon name="i-lucide-workflow" class="size-5" /></span>
        <span class="text-xl font-semibold">GateWay</span>
      </NuxtLink>
      <div class="relative max-w-xl pb-14">
        <p class="mb-5 flex items-center gap-2 text-sm font-medium text-emerald-300"><span class="size-2 rounded-full bg-emerald-400" />PAYMENTS, CONNECTED</p>
        <h1 class="text-5xl font-semibold leading-[1.1] tracking-tight xl:text-6xl">Your payments.<br>One clear view.</h1>
        <p class="mt-6 max-w-md text-lg leading-8 text-emerald-50/65">Track transactions, manage projects, and keep every connected site in good standing.</p>
      </div>
      <p class="relative text-xs text-emerald-50/40">Secure access to your GateWay workspace</p>
    </section>
    <section class="flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-[420px]">
        <div class="mb-10 flex items-center gap-3 lg:hidden">
          <span class="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white"><UIcon name="i-lucide-workflow" class="size-5" /></span>
          <span class="text-xl font-semibold">GateWay</span>
        </div>
        <h2 class="text-3xl font-semibold tracking-tight text-highlighted">Sign in to GateWay</h2>
        <p class="mt-2 text-sm text-muted">Use the operator account provisioned for your workspace.</p>
        <UAlert v-if="errorMessage" class="mt-6" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorMessage" />
        <form class="mt-8 space-y-5" @submit.prevent="signIn">
          <UFormField label="Email address" name="email">
            <UInput v-model="email" type="email" autocomplete="username" placeholder="you@company.com" size="lg" class="w-full" required />
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput v-model="password" type="password" autocomplete="current-password" placeholder="Enter your password" size="lg" class="w-full" required />
          </UFormField>
          <UButton type="submit" size="lg" class="w-full justify-center" :loading="pending">Sign in <UIcon name="i-lucide-arrow-right" class="ml-1 size-4" /></UButton>
        </form>
        <p class="mt-8 text-center text-xs leading-5 text-dimmed">Access is provisioned by your GateWay owner.<br>There is no public sign-up.</p>
      </div>
    </section>
  </main>
</template>
