import * as SC from './styles'
import ThemeButton from './temp-theme-button'

const TestTemplate = () => (
  <SC.TestPageWrapper>
    <h1>Test Template</h1>
    <ThemeButton />
    <SC.ExampleDiv />{' '}
    {/* Please remove example div once there are actual components to display */}
    <SC.ExampleDiv />
    <SC.ExampleDiv />
    <SC.ExampleDiv />
    <SC.ExampleDiv />
    <SC.ExampleDiv />
  </SC.TestPageWrapper>
)

export default TestTemplate
