'use client'

import { useEffect, useState } from 'react'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Link from '@/components/atoms/Link'
import Select from '@/components/atoms/Select'
import Slider from '@/components/atoms/Slider'
import Text from '@/components/atoms/Text'

import CompoundRadioButtons from '@/components/molecules/CompoundRadioButtons'
import Input from '@/components/molecules/Input'
import TextArea from '@/components/molecules/TextArea'

import { usePageTitle } from '@/hooks/use-page-title'

import { getHealth } from '@/services/actuator/health'

import * as SC from './styles'

import type { IButtonExample, IIconExample, ILinkExample } from './types'

const BUTTON_EXAMPLES: IButtonExample[] = [
  { label: 'Primary', variant: 'primary', clickable: true },
  { label: 'Primary Outline', variant: 'primary-outline' },
  { label: 'Secondary', variant: 'secondary' },
  { label: 'Secondary Outline', variant: 'secondary-outline' },
  { label: 'Ghost', variant: 'ghost' },
  { label: 'Ghost Outline', variant: 'ghost-outline' },
  { label: 'Danger', variant: 'danger' },
  { label: 'Danger Outline', variant: 'danger-outline' },
]

const ICON_EXAMPLES: IIconExample[] = [
  { name: 'home', size: 'lg', color: 'primary', ariaLabel: 'home button' },
  { name: 'settings', size: 'md', color: 'secondary' },
  { name: 'delete', size: 'sm', color: 'error' },
  { name: 'check_circle', size: 'sm', color: 'error' },
]

const INTERNAL_LINK_EXAMPLES: ILinkExample[] = [
  { href: '/test', label: 'Default Link (Test Page)' },
  { href: '/login', label: 'Primary Link (Login)', variant: 'primary' },
  {
    href: '/register',
    label: 'Secondary Link (Register)',
    variant: 'secondary',
  },
  { href: '/about', label: 'Muted Link (About)', variant: 'muted' },
  { href: '/contact', label: 'Underlined Link (Contact)', underline: true },
  { href: '/disabled', label: 'Disabled Link', disabled: true },
]

const EXTERNAL_LINK_EXAMPLES: ILinkExample[] = [
  {
    href: 'https://github.com',
    label: 'GitHub (with icon)',
    showExternalIcon: true,
  },
  {
    href: 'https://www.dhbw-mannheim.de',
    label: 'DHBW Mannheim (Primary)',
    variant: 'primary',
    showExternalIcon: true,
  },
  {
    href: 'https://nextjs.org',
    label: 'Next.js Documentation (Secondary)',
    variant: 'secondary',
    showExternalIcon: true,
    underline: true,
  },
  { href: 'https://reactjs.org', label: 'React Docs (no icon)' },
  {
    href: 'https://example.com',
    label: 'Disabled External Link',
    disabled: true,
    showExternalIcon: true,
  },
]

const TestTemplate = () => {
  const { setTitle } = usePageTitle()
  const [basicSliderValue, setBasicSliderValue] = useState(50)
  const [temperatureValue, setTemperatureValue] = useState(20)
  const [selectedTrackingCategory, setSelectedTrackingCategory] = useState('')
  const [selectedContactFactor, setSelectedContactFactor] =
    useState('animal-contact')
  const [animalContactDetails, setAnimalContactDetails] = useState('')

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
    setTitle('Test Page')
  }, [setTitle])

  useEffect(() => {
    getHealth().then(result => {
      if (result.ok && result.body?.status) {
        setHealthStatus(result.body.status)
      } else {
        setHealthStatus(`Error: ${result.error ?? 'Unknown'}`)
      }
    })
  }, [])

  const handlePrimaryButtonClick = () => {
    window.alert('Primary button clicked!')
  }

  const renderLinkExample = (example: ILinkExample) => (
    <Link
      key={`${example.href}-${example.label}`}
      href={example.href}
      variant={example.variant}
      showExternalIcon={example.showExternalIcon}
      underline={example.underline}
      disabled={example.disabled}
    >
      {example.label}
    </Link>
  )

  return (
    <SC.TestPageWrapper>
      <Headline variant='h2' color='critical' align='center'>
        Backend Health: {healthStatus}
      </Headline>

      <Headline variant='h3' color='secondary' align='left' noSpacing>
        Compound Radio Buttons
      </Headline>
      <Text size='small' color='textMuted' margin='0 0 1rem 0'>
        Reusable molecule for radio choices that can reveal one follow-up text
        field on the second level.
      </Text>

      <CompoundRadioButtons
        name='contact-factors-demo'
        legend='Contact Factors'
        helperText='Select one option. Some options can open an extra text field for more detail.'
        value={selectedContactFactor}
        onChange={setSelectedContactFactor}
        margin='0 0 1.5rem 0'
        options={[
          {
            value: 'shower',
            label: 'Shower',
          },
          {
            value: 'clothing',
            label: 'Clothing',
          },
          {
            value: 'animal-contact',
            label: 'Animal Contact',
            detailInput: {
              placeholder: 'Text field ...',
              label: 'Additional Detail',
              value: animalContactDetails,
              onChange: setAnimalContactDetails,
              helperText: 'Example for the requested second-level text input.',
            },
          },
        ]}
      />

      <Headline variant='h3' color='secondary' align='left' noSpacing>
        Selects
      </Headline>
      <Text size='small' color='textMuted' margin='0 0 1rem 0'>
        Atom for native dropdown selections with project-aligned styling.
      </Text>

      <Select
        aria-label='Tracking category'
        placeholder='Choose a tracking category'
        value={selectedTrackingCategory}
        onChange={event => setSelectedTrackingCategory(event.target.value)}
        maxWidth='320px'
        margin='0 0 1.5rem 0'
        options={[
          { value: 'contact-factors', label: 'Contact Factors' },
          { value: 'symptoms', label: 'Symptoms' },
          { value: 'medication', label: 'Medication' },
        ]}
      />

      <Headline variant='h3' color='secondary' align='left' noSpacing>
        Buttons
      </Headline>
      <SC.ButtonGrid>
        {BUTTON_EXAMPLES.map(({ label, variant, clickable }) => (
          <Button
            key={variant}
            variant={variant}
            size='md'
            onClick={clickable ? handlePrimaryButtonClick : undefined}
          >
            {label}
          </Button>
        ))}
      </SC.ButtonGrid>

      <Headline variant='h3' color='secondary' align='left' noSpacing>
        Icons
      </Headline>
      <SC.IconRow>
        {ICON_EXAMPLES.map(({ name, size, color, ariaLabel }) => (
          <Icon
            key={`${name}-${size}-${color}`}
            name={name}
            size={size}
            color={color}
            aria-label={ariaLabel}
          />
        ))}
      </SC.IconRow>

      <Headline variant='h3' color='secondary' align='left' noSpacing>
        Links
      </Headline>
      <Text size='small' color='textMuted' margin='0 0 1rem 0'>
        Navigation links with automatic internal/external detection
      </Text>

      <SC.ShowcaseGroup>
        <SC.ShowcaseColumn $maxWidth='400px'>
          <Text size='small' color='textSecondary' weight={600}>
            Internal Links:
          </Text>
          <SC.ShowcaseStack>
            {INTERNAL_LINK_EXAMPLES.map(renderLinkExample)}
          </SC.ShowcaseStack>
        </SC.ShowcaseColumn>

        <SC.ShowcaseColumn $maxWidth='400px'>
          <Text size='small' color='textSecondary' weight={600}>
            External Links:
          </Text>
          <SC.ShowcaseStack>
            {EXTERNAL_LINK_EXAMPLES.map(renderLinkExample)}
          </SC.ShowcaseStack>
        </SC.ShowcaseColumn>

        <SC.ShowcaseColumn $maxWidth='600px'>
          <Text size='medium' color='text'>
            You can also use links inline within text, like this{' '}
            <Link href='/test' variant='primary'>
              internal link
            </Link>{' '}
            or this{' '}
            <Link href='https://example.com' variant='primary' showExternalIcon>
              external link
            </Link>
            . They inherit the font size and blend naturally.
          </Text>
        </SC.ShowcaseColumn>
      </SC.ShowcaseGroup>

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
        Temperature Slider (-10 deg C to 40 deg C): {temperatureValue} deg C
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
      <SC.ConstrainedTextBlock $maxWidth='200px'>
        <Text size='small' color='text' truncate>
          This is a very long line that will be truncated with an ellipsis when
          it exceeds the container width.
        </Text>
      </SC.ConstrainedTextBlock>
      <SC.ConstrainedTextBlock $maxWidth='220px'>
        <Text size='small' color='text' maxLines={2}>
          This is a longer paragraph that will be clamped to two lines. If the
          text exceeds two lines, it will be gracefully truncated while
          maintaining readability across different screen sizes.
        </Text>
      </SC.ConstrainedTextBlock>
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

      <Input
        label='Full Name'
        type='text'
        placeholder='Enter your name'
        value={name}
        onChange={e => setName(e.target.value)}
        helperText='First and last name'
        margin='0 0 1rem 0'
      />
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
      <Input
        label='Password'
        type='password'
        placeholder='Enter password'
        value={password}
        onChange={e => setPassword(e.target.value)}
        validation='error'
        helperText='Password must be at least 12 characters'
        margin='0 0 1rem 0'
      />
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

      <TextArea
        label='Description'
        placeholder='Describe your symptoms in detail...'
        value={description}
        onChange={e => setDescription(e.target.value)}
        helperText={`${description.length} characters`}
        margin='0 0 1rem 0'
        rows={4}
      />
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
      <TextArea
        label='Read-only Information'
        value='This field is disabled and cannot be edited. It contains important information that should not be modified.'
        disabled
        rows={3}
      />
    </SC.TestPageWrapper>
  )
}

export default TestTemplate
