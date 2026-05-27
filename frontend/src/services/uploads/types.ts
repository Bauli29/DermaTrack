export interface IUploadedImage {
  url: string
  fileName: string
  contentType: string
  size: number
}

export interface IUploadImageSuccess {
  success: true
  data: IUploadedImage
}

export interface IUploadImageFailure {
  success: false
  error: string
}

export type TUploadImageResult = IUploadImageSuccess | IUploadImageFailure

export interface IDeleteImageSuccess {
  success: true
}

export interface IDeleteImageFailure {
  success: false
  error: string
}

export type TDeleteImageResult = IDeleteImageSuccess | IDeleteImageFailure

export type TUploadFetch = (
  input: string,
  init?: RequestInit
) => Promise<Response>
