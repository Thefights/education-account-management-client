import { envConfig } from '@/shared/config/envConfig'

export const getImageFromCloud = (imagePath) => {
  const cloudUrl = envConfig.imageCloudUrl
  if (!cloudUrl || !imagePath) return '/placeholder-image.png'
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${cloudUrl}/${imagePath}`
}
