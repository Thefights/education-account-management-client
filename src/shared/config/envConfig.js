export const getEnv = (key, defaultValue = '') => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key]
  }

  return import.meta.env[key] || defaultValue
}

export const envConfig = {
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL'),
  },
  auth: {
    googleClientId: getEnv('VITE_GOOGLE_CLIENT_ID'),
    microsoft: {
      clientId: getEnv('VITE_MICROSOFT_CLIENT_ID', 'f5ed2c11-1958-4102-b3c3-5c2c14fc7995'),
      tenantId: getEnv('VITE_MICROSOFT_TENANT_ID', 'common'),
      redirectUri: getEnv('VITE_MICROSOFT_REDIRECT_URI'),
    },
    facebook: {
      appId: getEnv('VITE_FACEBOOK_APP_ID'),
      graphVersion: getEnv('VITE_FACEBOOK_GRAPH_VERSION'),
    },
  },
  imageCloudUrl: getEnv('VITE_IMAGE_CLOUD_URL'),
}
