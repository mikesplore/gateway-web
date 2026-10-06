export function useGatewayApi() {
  function api<T>(path: string, options: Record<string, unknown> = {}) {
    return $fetch<T>('/api/gateway/' + path.replace(/^\//, ''), {
      credentials: 'include',
      ...options
    })
  }

  return { api }
}

export interface GatewayUser {
  id: string
  email: string
  displayName: string
  role: 'owner' | 'operator'
  accountId: string
}

export interface SessionResponse {
  user: GatewayUser
  expiresAt: string
}

export interface Payment {
  id: string
  provider: string
  reference: string
  amount: string
  currency: string
  status: string
  createdAt?: string
  checkoutUrl?: string | null
  projectId?: string | null
}

export interface PaymentSummary {
  count: number
  succeeded: number
  pending: number
  failed: number
  reversed: number
  amountsByCurrency: Record<string, string>
  succeededAmountsByCurrency: Record<string, string>
}

export interface Site {
  id: string
  hostname: string
  upstreamUrl?: string | null
  projectId?: string | null
  entitlementState: string
  applyStatus: string
  lastApplyError?: string | null
}

export interface Project {
  id: string
  name: string
  billingReference?: string | null
  siteId?: string | null
  createdAt: string
}

export function money(value: string | number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(Number(value))
}

export function dateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
}
