import Button from '@/components/atoms/button'

import * as SC from './styles'
import ThemeButton from './temp-theme-button'

const TestTemplate = () => (
  <SC.TestPageWrapper>
    <h1>Test Template</h1>
    <ThemeButton />
    <SC.ExampleDiv />{' '}
    {/* Please remove example div once there are actual components to display */}
    <Button variant='primary' size='md'>
      Primary Button
    </Button>
    <Button variant='secondary' size='md'>
      Secondary Button
    </Button>
    <SC.ExampleDiv />
    <SC.ExampleDiv />
    <SC.ExampleDiv />
    <SC.ExampleDiv />
  </SC.TestPageWrapper>
)

export default TestTemplate
