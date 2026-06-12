import { PublicClientApplication } from '@azure/msal-browser'
import { envConfig } from './envConfig'
import { routeUrls } from './routeUrls'

const MICROSOFT_SCOPES = ['openid', 'profile', 'email']

let microsoftClientPromise

export const getMicrosoftRedirectUri = () => {
  return (
    envConfig.auth.microsoft.redirectUri ||
    `${window.location.origin}${routeUrls.BASE_ROUTE.AUTH(routeUrls.AUTH.LOGIN)}`
  )
}

export const getMicrosoftLoginRequest = () => ({
  scopes: MICROSOFT_SCOPES,
  redirectUri: getMicrosoftRedirectUri(),
  prompt: 'login',
})

export const getMicrosoftClient = async () => {
  if (microsoftClientPromise) return microsoftClientPromise

  microsoftClientPromise = (async () => {
    const client = new PublicClientApplication({
      auth: {
        clientId: envConfig.auth.microsoft.clientId,
        authority: `https://login.microsoftonline.com/${envConfig.auth.microsoft.tenantId}`,
        redirectUri: getMicrosoftRedirectUri(),
      },
      cache: {
        cacheLocation: 'sessionStorage',
      },
    })

    await client.initialize()
    return client
  })()

  return microsoftClientPromise
}
