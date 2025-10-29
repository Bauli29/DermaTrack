import Button from '@/components/atoms/button'

import * as SC from './styles'
import ThemeButton from './temp-theme-button'

const TestTemplate = () => (
  <SC.TestPageWrapper>
    <h1>Test Template</h1>
    <ThemeButton />
    <>
      <Button variant='primary' size='md'>
        Primary
      </Button>
      <Button variant='primary-outline' size='md'>
        Primary Outline
      </Button>
      <Button variant='secondary' size='md'>
        Secondary
      </Button>
      <Button variant='secondary-outline' size='md'>
        Secondary Outline
      </Button>
      <Button variant='ghost' size='md'>
        Ghost
      </Button>
      <Button variant='ghost-outline' size='md'>
        Ghost Outline
      </Button>
      <Button variant='danger' size='md'>
        Danger
      </Button>
      <Button variant='danger-outline' size='md'>
        Danger Outline
      </Button>
    </>
  </SC.TestPageWrapper>
)

export default TestTemplate
