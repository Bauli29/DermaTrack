export interface IImageUploadProps {
  savedImageUrls: string[]
  selectedImages: File[]
  disabled?: boolean
  onPickImages: (files: File[]) => void
  onRemoveSavedImage: (url: string) => void
  onRemoveSelectedImage: (index: number) => void
}
