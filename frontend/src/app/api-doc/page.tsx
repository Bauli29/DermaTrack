import { getApiDocs } from '@/lib/swagger'
import ReactSwagger from './react-swagger'

export default async function IndexPage() {
  const spec = (await getApiDocs()) as { [key: string]: unknown }
  return (
    <section className='container'>
      <ReactSwagger spec={spec} />
    </section>
  )
}
