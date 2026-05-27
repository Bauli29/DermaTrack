'use client'

import React, { useEffect, useId, useState } from 'react'

import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_MB,
  MAX_IMAGES,
} from '@/constants/uploads'

import * as SC from './styles'

import type { IImageUploadProps } from './types'

const ImageUpload = ({
  savedImageUrls,
  selectedImages,
  disabled = false,
  onPickImages,
  onRemoveSavedImage,
  onRemoveSelectedImage,
}: IImageUploadProps) => {
  const inputId = useId()
  const [selectedImagePreviewUrls, setSelectedImagePreviewUrls] = useState<
    string[]
  >([])
  const imageCount = savedImageUrls.length + selectedImages.length
  const isAtLimit = imageCount >= MAX_IMAGES
  const inputDisabled = disabled || isAtLimit

  useEffect(() => {
    const previewUrls = selectedImages.map(file => URL.createObjectURL(file))
    setSelectedImagePreviewUrls(previewUrls)

    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [selectedImages])

  const handleFileChange: React.ChangeEventHandler<
    HTMLInputElement
  > = event => {
    const files = Array.from(event.target.files ?? [])

    if (files.length > 0) {
      onPickImages(files)
    }

    event.target.value = ''
  }

  return (
    <SC.ImageUploadRoot>
      <SC.ImageUploadToolbar>
        <SC.FileInputLabel htmlFor={inputId} $disabled={inputDisabled}>
          <Icon name='upload' color='inherit' size='sm' />
          Choose images
          <input
            id={inputId}
            type='file'
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            multiple
            disabled={inputDisabled}
            onChange={handleFileChange}
          />
        </SC.FileInputLabel>
        <SC.UploadMeta>
          {imageCount}/{MAX_IMAGES} images
        </SC.UploadMeta>
      </SC.ImageUploadToolbar>

      <SC.HelperText>
        JPEG/PNG only, max {MAX_IMAGE_MB}MB each. Images are saved with this
        diary entry.
      </SC.HelperText>

      <SC.ImagePreviewGrid>
        {imageCount === 0 && <SC.EmptyState>No images selected</SC.EmptyState>}

        {savedImageUrls.map((url, index) => (
          <SC.ImagePreviewItem key={url}>
            <SC.PreviewImage
              src={url}
              alt={`Saved tracking image ${index + 1}`}
            />
            <SC.PreviewOverlay>
              <SC.ImageName>Saved image</SC.ImageName>
              <Button
                size='sm'
                variant='danger-outline'
                disabled={disabled}
                onClick={() => onRemoveSavedImage(url)}
              >
                Remove
              </Button>
            </SC.PreviewOverlay>
          </SC.ImagePreviewItem>
        ))}

        {selectedImages.map((file, index) => (
          <SC.ImagePreviewItem key={`${file.name}-${file.size}-${index}`}>
            <SC.PreviewImage
              src={selectedImagePreviewUrls[index]}
              alt={`Selected tracking image ${index + 1}`}
            />
            <SC.PreviewOverlay>
              <SC.ImageName>{file.name}</SC.ImageName>
              <Button
                size='sm'
                variant='danger-outline'
                disabled={disabled}
                onClick={() => onRemoveSelectedImage(index)}
              >
                Remove
              </Button>
            </SC.PreviewOverlay>
          </SC.ImagePreviewItem>
        ))}
      </SC.ImagePreviewGrid>
    </SC.ImageUploadRoot>
  )
}

export default ImageUpload
