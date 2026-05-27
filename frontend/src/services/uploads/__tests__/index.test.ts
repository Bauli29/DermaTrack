/// <reference types="jest" />

import assert from 'node:assert'

import { deleteImage, uploadImage } from '../'

const createMockFile = (
  name: string,
  type: string,
  sizeInBytes: number
): File => ({ name, type, size: sizeInBytes }) as File

const createJsonResponse = (body: unknown, status: number): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as Response

const createEmptyResponse = (status: number): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: () => null,
    },
    json: async () => null,
    text: async () => '',
  }) as Response

const createTextResponse = (body: string, status: number): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: () => 'text/plain',
    },
    json: async () => null,
    text: async () => body,
  }) as Response

const createInvalidJsonResponse = (status: number): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: async () => {
      throw new Error('Invalid JSON')
    },
    text: async () => '',
  }) as Response

describe('uploads service', () => {
  it('uploads an image through the frontend API route', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createJsonResponse(
        {
          url: '/api/uploads/images/photo.png',
          fileName: 'photo.png',
          contentType: 'image/png',
          size: 1024,
        },
        201
      )
    )

    const result = await uploadImage(
      createMockFile('photo.png', 'image/png', 1024),
      fetchImpl
    )

    assert.deepStrictEqual(result, {
      success: true,
      data: {
        url: '/api/uploads/images/photo.png',
        fileName: 'photo.png',
        contentType: 'image/png',
        size: 1024,
      },
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/uploads/images',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )
  })

  it('deletes only local uploaded images', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(createEmptyResponse(204))

    assert.deepStrictEqual(
      await deleteImage('/api/uploads/images/photo.png', fetchImpl),
      { success: true }
    )

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/uploads/images/photo.png',
      expect.objectContaining({
        method: 'DELETE',
      })
    )

    fetchImpl.mockClear()

    assert.deepStrictEqual(
      await deleteImage('https://example.com/photo.png', fetchImpl),
      { success: true }
    )
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('returns API error messages for failed uploads and deletes', async () => {
    const uploadFetch = jest.fn().mockResolvedValue(
      createJsonResponse(
        {
          message: 'File type is not supported',
        },
        415
      )
    )
    const deleteFetch = jest
      .fn()
      .mockResolvedValue(createTextResponse('Image not found', 404))

    await expect(
      uploadImage(createMockFile('photo.gif', 'image/gif', 2048), uploadFetch)
    ).resolves.toEqual({
      success: false,
      error: 'File type is not supported',
    })
    await expect(
      deleteImage('/api/uploads/images/missing.png', deleteFetch)
    ).resolves.toEqual({
      success: false,
      error: 'Image not found',
    })
  })

  it('falls back to runtime and default error messages', async () => {
    await expect(
      uploadImage(
        createMockFile('photo.png', 'image/png', 1024),
        jest.fn().mockRejectedValue(new Error('Network offline'))
      )
    ).resolves.toEqual({
      success: false,
      error: 'Network offline',
    })

    await expect(
      deleteImage(
        '/api/uploads/images/photo.png',
        jest.fn().mockRejectedValue('unknown failure')
      )
    ).resolves.toEqual({
      success: false,
      error: 'Image request failed. Please try again.',
    })

    await expect(
      uploadImage(
        createMockFile('photo.png', 'image/png', 1024),
        jest.fn().mockResolvedValue(createInvalidJsonResponse(400))
      )
    ).resolves.toEqual({
      success: false,
      error: 'Failed to upload image.',
    })
  })
})
