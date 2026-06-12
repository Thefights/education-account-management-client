let accessToken

export const getAccessToken = () => accessToken

export const setAccessToken = (token) => {
  accessToken = token || undefined
}

export const clearAccessToken = () => {
  accessToken = undefined
}
