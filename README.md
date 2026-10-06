# GateWay Web

Nuxt 4 + Nuxt UI dashboard for the GateWay Ktor API. It includes operator sign-in, payment overview and filtering/reconciliation, project and site management, and payment-event operations.

## Run locally

```bash
npm install
NUXT_GATEWAY_API_BASE=http://localhost:8080 npm run dev
```

Open the URL printed by Nuxt. For production, set `NUXT_GATEWAY_API_BASE` to the private/reachable GateWay API URL before running `npm run build` and `npm run preview` (or the generated Node server). The browser calls Nuxt's same-origin `/api/gateway/*` proxy; the backend session cookie is forwarded without exposing merchant keys or `GATEWAY_OPS_TOKEN` to client code.

## First sign-in

GateWay does not have public registration. Configure `GATEWAY_BOOTSTRAP_OWNER_EMAIL` and `GATEWAY_BOOTSTRAP_OWNER_PASSWORD` on the backend for its one-time first-owner bootstrap, then sign in here. In local plain-HTTP development, set `AUTH_COOKIE_SECURE=false` on GateWay; keep secure cookies enabled behind HTTPS.

Owners can create operator invites through GateWay's authenticated `POST /api/ops/users` endpoint. The invitee sets a password via `POST /api/auth/accept-invite`.

## Production notes

- Serve the dashboard and its `/api/gateway/*` proxy over HTTPS.
- Keep `NUXT_GATEWAY_API_BASE` server-only. Do not rename it with the `NUXT_PUBLIC_` prefix.
- Set the GateWay session cookie as Secure in deployed environments.
- The operations page uses owner/operator permissions and will show an access error for users without those permissions.
