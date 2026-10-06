import { getRequestURL, proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const requestUrl = getRequestURL(event)
  const apiPath = requestUrl.pathname.replace(/^\/api\/gateway\/?/, '')
  const target = new URL(config.gatewayApiBase)
  target.pathname = target.pathname.replace(/\/$/, '') + '/api/' + apiPath
  target.search = requestUrl.search
  return proxyRequest(event, target.toString())
})
