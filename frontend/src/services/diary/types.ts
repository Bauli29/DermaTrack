export type TCreateDiaryEntryResult =
  | ICreateDiaryEntrySuccess
  | ICreateDiaryEntryFailure

export type TDiaryFetch = (
  input: string,
  init?: RequestInit
) => Promise<Response>

export type TGetDiaryEntryResult<T> =
  | IGetDiaryEntrySuccess<T>
  | IGetDiaryEntryFailure

export interface IApiErrorLike {
  error?: string
  message?: string
}

export interface ICreateDiaryEntrySuccess {
  success: true
}

export interface ICreateDiaryEntryFailure {
  success: false
  error: string
}

export interface IGetDiaryEntrySuccess<T> {
  success: true
  data: T | null
}

export interface IGetDiaryEntryFailure {
  success: false
  error: string
}

export interface IGetDiaryEntriesParams {
  fromDate?: string
  toDate?: string
}
