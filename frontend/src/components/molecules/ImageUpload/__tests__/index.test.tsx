import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import ImageUpload from '..'

import { lightTheme } from '@/lib/themes'

const createMockFile = (
  name: string,
  type: string,
  sizeInBytes: number
): File => ({ name, type, size: sizeInBytes }) as File

describe('ImageUpload', () => {
  let container: HTMLDivElement
  let root: Root
  let createObjectUrlSpy: jest.SpyInstance
  let revokeObjectUrlSpy: jest.SpyInstance

  const renderWithTheme = (element: ReactNode) => {
    act(() => {
      root.render(<ThemeProvider theme={lightTheme}>{element}</ThemeProvider>)
    })
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    if (!URL.createObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        value: jest.fn(),
      })
    }

    if (!URL.revokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        value: jest.fn(),
      })
    }

    createObjectUrlSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(file => `blob:${(file as File).name}`)
    revokeObjectUrlSpy = jest
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    createObjectUrlSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
  })

  it('renders saved and local image previews', () => {
    renderWithTheme(
      <ImageUpload
        savedImageUrls={['/api/uploads/images/saved.png']}
        selectedImages={[createMockFile('local.png', 'image/png', 1024)]}
        onPickImages={jest.fn()}
        onRemoveSavedImage={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
      />
    )

    const images = Array.from(container.querySelectorAll('img'))

    expect(images).toHaveLength(2)
    expect(images[0].getAttribute('src')).toBe('/api/uploads/images/saved.png')
    expect(images[1].getAttribute('src')).toBe('blob:local.png')
    expect(container.textContent).toContain('2/5 images')
  })

  it('calls removal handlers for saved and selected images', () => {
    const onRemoveSavedImage = jest.fn()
    const onRemoveSelectedImage = jest.fn()

    renderWithTheme(
      <ImageUpload
        savedImageUrls={['/api/uploads/images/saved.png']}
        selectedImages={[createMockFile('local.png', 'image/png', 1024)]}
        onPickImages={jest.fn()}
        onRemoveSavedImage={onRemoveSavedImage}
        onRemoveSelectedImage={onRemoveSelectedImage}
      />
    )

    const buttons = Array.from(container.querySelectorAll('button')).filter(
      button => button.textContent?.includes('Remove')
    )

    act(() => {
      buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
      buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onRemoveSavedImage).toHaveBeenCalledWith(
      '/api/uploads/images/saved.png'
    )
    expect(onRemoveSelectedImage).toHaveBeenCalledWith(0)
  })

  it('opens and closes a full image preview', () => {
    renderWithTheme(
      <ImageUpload
        savedImageUrls={['/api/uploads/images/saved.png']}
        selectedImages={[]}
        onPickImages={jest.fn()}
        onRemoveSavedImage={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
      />
    )

    const previewButton = container.querySelector(
      'button[aria-label="View saved tracking image 1"]'
    )

    act(() => {
      previewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()

    const closeButton = container.querySelector(
      'button[aria-label="Close image preview"]'
    )

    act(() => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('closes the full image preview with Escape and backdrop clicks', () => {
    renderWithTheme(
      <ImageUpload
        savedImageUrls={[]}
        selectedImages={[createMockFile('local.png', 'image/png', 1024)]}
        onPickImages={jest.fn()}
        onRemoveSavedImage={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
      />
    )

    const previewButton = container.querySelector(
      'button[aria-label="View selected tracking image 1"]'
    )

    act(() => {
      previewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      previewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const backdrop = container.querySelector('[role="presentation"]')

    act(() => {
      backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('keeps the preview open when clicking inside the dialog', () => {
    renderWithTheme(
      <ImageUpload
        savedImageUrls={['/api/uploads/images/saved.png']}
        selectedImages={[]}
        onPickImages={jest.fn()}
        onRemoveSavedImage={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
      />
    )

    const previewButton = container.querySelector(
      'button[aria-label="View saved tracking image 1"]'
    )

    act(() => {
      previewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const dialog = container.querySelector('[role="dialog"]')

    act(() => {
      dialog?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('handles empty, disabled, and limit states', () => {
    renderWithTheme(
      <ImageUpload
        savedImageUrls={[
          '/api/uploads/images/1.png',
          '/api/uploads/images/2.png',
          '/api/uploads/images/3.png',
          '/api/uploads/images/4.png',
          '/api/uploads/images/5.png',
        ]}
        selectedImages={[]}
        disabled
        onPickImages={jest.fn()}
        onRemoveSavedImage={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
      />
    )

    const input = container.querySelector('input[type="file"]')
    const removeButtons = Array.from(
      container.querySelectorAll('button')
    ).filter(button => button.textContent?.includes('Remove'))

    expect((input as HTMLInputElement | null)?.disabled).toBe(true)
    expect(removeButtons.every(button => button.disabled)).toBe(true)
    expect(container.textContent).toContain('5/5 images')
  })

  it('shows an empty state and calls onPickImages only when files are selected', () => {
    const onPickImages = jest.fn()

    renderWithTheme(
      <ImageUpload
        savedImageUrls={[]}
        selectedImages={[]}
        onPickImages={onPickImages}
        onRemoveSavedImage={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
      />
    )

    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!

    expect(container.textContent).toContain('No images selected')
    expect(input.disabled).toBe(false)

    act(() => {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onPickImages).not.toHaveBeenCalled()

    const file = createMockFile('picked.png', 'image/png', 2048)
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    })

    act(() => {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onPickImages).toHaveBeenCalledWith([file])
    expect(input.value).toBe('')
  })
})
