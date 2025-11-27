'use client'

import { useEffect, useState } from 'react'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Slider from '@/components/atoms/Slider'
import Text from '@/components/atoms/Text'

import Input from '@/components/molecules/Input'
import TextArea from '@/components/molecules/TextArea'

import { getHealth } from '@/services/actuator/health'

import * as SC from './styles'
import ThemeButton from './temp-theme-button'

const TestTemplate = () => {
  const [basicSliderValue, setBasicSliderValue] = useState(50)
  const [temperatureValue, setTemperatureValue] = useState(20)

  // Single-line inputs (Input component)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('')

  // Multi-line inputs (TextArea component)
  const [description, setDescription] = useState('')
  const [feedback, setFeedback] = useState('This component works great!')
  const [errorText, setErrorText] = useState('This field has an error')

  const [healthStatus, setHealthStatus] = useState<string>('Loading...')

  useEffect(() => {
    getHealth().then(result => {
      if (result.ok && result.body?.status) {
        setHealthStatus(result.body.status)
      } else {
        setHealthStatus(`Error: ${result.error ?? 'Unknown'}`)
      }
    })
  }, [])

  return (
    <SC.TestPageWrapper>
      <Headline variant='h1' color='text' align='center'>
        Test Template
      </Headline>
      <ThemeButton />
      <>
        <Headline variant='h2' color='critical' align='center'>
          Backend Health: {healthStatus}
        </Headline>
        <Headline variant='h2' color='primary' align='left'>
          Primary Section
        </Headline>
        <Headline variant='h3' color='secondary' align='left' noSpacing>
          Buttons
        </Headline>
        <Button
          variant='primary'
          size='md'
          onClick={() => alert('Primary button clicked!')}
        >
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

        <Headline variant='h3' color='secondary' align='left' noSpacing>
          Icons
        </Headline>
        <Icon name='home' size='lg' color='primary' aria-label='home button' />
        <Icon name='settings' size='md' color='secondary' />
        <Icon name='delete' size='sm' color='error' />
        <Icon name='check_circle' size='sm' color='error' />

        <Headline variant='h3' color='secondary' align='left' noSpacing>
          Sliders
        </Headline>
        <Text size='small' color='textSecondary' noSpacing>
          Basic Slider (0-100): {basicSliderValue}
        </Text>
        <Slider
          min={0}
          max={100}
          value={basicSliderValue}
          step={1}
          onChange={setBasicSliderValue}
          maxWidth='300px'
          margin='0 0 2rem 0'
        />

        <Text size='small' color='textSecondary' noSpacing>
          Temperature Slider (-10°C to 40°C): {temperatureValue}°C
        </Text>
        <Slider
          min={-10}
          max={40}
          value={temperatureValue}
          step={0.5}
          color='secondary'
          onChange={setTemperatureValue}
          width='250px'
          margin='0 0 1rem 0'
        />

        <Headline variant='h3' color='secondary' align='left' noSpacing>
          Text
        </Headline>
        <Text size='small' color='textMuted'>
          Small muted text for helper captions or descriptions.
        </Text>
        <Text size='medium' color='text'>
          Medium default body text. This should be the go-to size on mobile for
          readability.
        </Text>
        <Text size='large' color='text' weight={500}>
          Large text with semi-bold weight for emphasis while remaining
          body-style.
        </Text>
        <Text size='medium' color='primary' align='center'>
          Center-aligned primary colored text.
        </Text>
        <Text size='medium' color='secondary' align='right'>
          Right-aligned secondary colored text.
        </Text>
        <Text size='small' color='text' truncate style={{ maxWidth: '200px' }}>
          This is a very long line that will be truncated with an ellipsis when
          it exceeds the container width.
        </Text>
        <Text
          size='small'
          color='text'
          maxLines={2}
          style={{ maxWidth: '220px' }}
        >
          This is a longer paragraph that will be clamped to two lines. If the
          text exceeds two lines, it will be gracefully truncated while
          maintaining readability across different screen sizes.
        </Text>
        <Text size='medium' color='textMuted' noWrap>
          No-wrap text: will not break into multiple lines even if the container
          is narrow.
        </Text>

        <Headline variant='h3' color='secondary' align='left' noSpacing>
          Input Fields (Single-Line)
        </Headline>
        <Text size='small' color='textMuted' margin='0 0 1rem 0'>
          For single-line data: names, emails, passwords, URLs, etc.
        </Text>

        {/* Input: Name */}
        <Input
          label='Full Name'
          type='text'
          placeholder='Enter your name'
          value={name}
          onChange={e => setName(e.target.value)}
          helperText='First and last name'
          margin='0 0 1rem 0'
        />

        {/* Input: Email with success */}
        <Input
          label='Email Address'
          type='email'
          placeholder='you@example.com'
          value={email}
          onChange={e => setEmail(e.target.value)}
          validation='success'
          helperText='Valid email format'
          margin='0 0 1rem 0'
        />

        {/* Input: Password with error */}
        <Input
          label='Password'
          type='password'
          placeholder='Enter password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          validation='error'
          helperText='Password must be at least 8 characters'
          margin='0 0 1rem 0'
        />

        {/* Input: Disabled */}
        <Input
          label='Username'
          type='text'
          value='john_doe'
          disabled
          helperText='Cannot be changed'
          margin='0 0 1rem 0'
        />

        <Headline variant='h3' color='secondary' align='left' noSpacing>
          Text Areas (Multi-Line)
        </Headline>
        <Text size='small' color='textMuted' margin='0 0 1rem 0'>
          For longer content: descriptions, notes, comments, feedback
        </Text>

        {/* TextArea: Default with character count */}
        <TextArea
          label='Description'
          placeholder='Describe your symptoms in detail...'
          value={description}
          onChange={e => setDescription(e.target.value)}
          helperText={`${description.length} characters`}
          margin='0 0 1rem 0'
          rows={4}
        />

        {/* TextArea: Success state */}
        <TextArea
          label='Feedback'
          placeholder='Share your thoughts...'
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          validation='success'
          helperText='Thank you for your feedback!'
          margin='0 0 1rem 0'
          rows={3}
        />

        {/* TextArea: Error state with character limit */}
        <TextArea
          label='Additional Notes'
          placeholder='Add any additional information...'
          value={errorText}
          onChange={e => setErrorText(e.target.value)}
          validation='error'
          helperText='This field is required (min 20 characters)'
          margin='0 0 1rem 0'
          rows={5}
        />

        {/* TextArea: Disabled */}
        <TextArea
          label='Read-only Information'
          value='This field is disabled and cannot be edited. It contains important information that should not be modified.'
          disabled
          rows={3}
        />
      </>
    </SC.TestPageWrapper>
  )
}

export default TestTemplate
