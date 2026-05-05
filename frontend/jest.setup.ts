const globalWithActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

globalWithActEnvironment.IS_REACT_ACT_ENVIRONMENT = true
