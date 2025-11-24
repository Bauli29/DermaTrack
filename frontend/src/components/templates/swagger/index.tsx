'use client'
import { useEffect } from 'react'
import 'swagger-ui-dist/swagger-ui.css'
import SwaggerUI from 'swagger-ui-dist/swagger-ui-es-bundle'
import SwaggerUIStandalonePreset from 'swagger-ui-dist/swagger-ui-standalone-preset'
import { SwaggerUIBundle } from 'swagger-ui-dist'

export default function ReactSwagger() {
  useEffect(() => {
    const urls = [
      { url: '/api/docs', name: 'Frontend API' },
      { url: '/api/docs/backend', name: 'Backend API' },
    ]

    SwaggerUIBundle({
      dom_id: '#swagger-ui',
      urls,
      layout: 'StandaloneLayout',
      deepLinking: true,
      docExpansion: 'none',
      presets: [SwaggerUI.presets.apis, SwaggerUIStandalonePreset],
    })
  }, [])

  return <div id='swagger-ui' />
}
