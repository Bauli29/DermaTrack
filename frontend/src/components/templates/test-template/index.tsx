'use client'

import { useState } from 'react'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Slider from '@/components/atoms/Slider'

import * as SC from './styles'
import ThemeButton from './temp-theme-button'

const TestTemplate = () => {
  const [basicSliderValue, setBasicSliderValue] = useState(50)
  const [temperatureValue, setTemperatureValue] = useState(20)

  return (
    <SC.TestPageWrapper>
      <Headline variant='h1' color='text' align='center'>
        Test Template
      </Headline>
      <ThemeButton />
      <>
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
        <p style={{ marginBottom: '10px', fontSize: '14px' }}>
          Basic Slider (0-100): {basicSliderValue}
        </p>
        <Slider
          min={0}
          max={100}
          value={basicSliderValue}
          step={1}
          onChange={setBasicSliderValue}
          maxWidth='300px'
          margin='0 0 2rem 0'
        />

        <p style={{ marginBottom: '10px', fontSize: '14px' }}>
          Temperature Slider (-10°C to 40°C): {temperatureValue}°C
        </p>
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
      </>
    </SC.TestPageWrapper>
  )
}

export default TestTemplate
