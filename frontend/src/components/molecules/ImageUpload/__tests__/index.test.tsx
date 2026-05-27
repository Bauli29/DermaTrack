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

    const buttons = Array.from(container.querySelectorAll('button'))

    act(() => {
      buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
      buttons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onRemoveSavedImage).toHaveBeenCalledWith(
      '/api/uploads/images/saved.png'
    )
    expect(onRemoveSelectedImage).toHaveBeenCalledWith(0)
  })
})
