declare module 'swagger-ui-dist/swagger-ui-es-bundle' {
  interface ISwaggerUIOptions {
    dom_id: string
    urls?: { url: string; name: string }[]
    deepLinking?: boolean
    docExpansion?: 'none' | 'list' | 'full'
    presets?: unknown[]
  }

  const SwaggerUI: {
    (options: ISwaggerUIOptions): unknown
    presets: { apis: unknown }
  }

  export default SwaggerUI
}

declare module 'swagger-ui-dist/swagger-ui-standalone-preset' {
  const SwaggerUIStandalonePreset: unknown
  export default SwaggerUIStandalonePreset
}
