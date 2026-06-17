import { envConfig } from '@/shared/config/envConfig'

let facebookSdkPromise

export const getFacebookLoginRequest = () => ({
  scope: 'email',
})

export const getFacebookSdk = () => {
  if (window.FB) return Promise.resolve(window.FB)
  if (facebookSdkPromise) return facebookSdkPromise

  facebookSdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: envConfig.auth.facebook.appId,
        cookie: true,
        xfbml: false,
        version: envConfig.auth.facebook.graphVersion,
      })
      resolve(window.FB)
    }

    const existingScript = document.getElementById('facebook-jssdk')
    if (existingScript) return

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Facebook SDK failed to load'))
    document.body.appendChild(script)
  })

  return facebookSdkPromise
}
