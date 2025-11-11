// Shared constants for image selection/upload across the app
// Image handling will be extended in future (compression, EXIF stripping, etc.)

export const MAX_IMAGES = 5
export const MAX_IMAGE_MB = 5

export type TAcceptedImageType = 'image/jpeg' | 'image/png'
export const ACCEPTED_IMAGE_TYPES: readonly TAcceptedImageType[] = [
  'image/jpeg',
  'image/png',
] as const
