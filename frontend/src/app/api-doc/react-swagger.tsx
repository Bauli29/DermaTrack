'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

interface IProps {
  spec: { [key: string]: unknown }
}

const ReactSwagger = ({ spec }: IProps) => <SwaggerUI spec={spec} />

export default ReactSwagger
