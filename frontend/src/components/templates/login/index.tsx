'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'

import TextArea from '@/components/molecules/TextArea'

import * as SC from './styles'

import type { TValidationState } from '@/components/molecules/TextArea/types'
const DailyTrackingTemplate = () => {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)

  // simple validation state used by the TextArea component
  const [emailValidation, setEmailValidation] =
    useState<TValidationState>('none')
  const [passwordValidation, setPasswordValidation] =
    useState<TValidationState>('none')

  const validateEmail = (value: string): TValidationState => {
    const re = /\S+@\S+\.\S+/
    if (value.length === 0) return 'none'
    return re.test(value) ? 'success' : 'error'
  }

  const validatePassword = (value: string): TValidationState => {
    if (value.length === 0) return 'none'
    // password validation
    const hasLength = value.length >= 8
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    const hasSpecial = /[^a-zA-Z0-9]/.test(value)

    return hasLength && hasUpper && hasLower && hasNumber && hasSpecial
      ? 'success'
      : 'error'
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ev = validateEmail(email)
    const pv = validatePassword(password)
    setEmailValidation(ev)
    setPasswordValidation(pv)

    if (ev === 'success' && pv === 'success') {
      // TODO: implement auth flow
      router.push('/')
    }
  }

  const isFormValid = useMemo(
    () =>
      validateEmail(email) === 'success' &&
      validatePassword(password) === 'success',
    [email, password]
  )

  return (
    <SC.LoginPageWrapper>
      <SC.Card as='form' onSubmit={onSubmit}>
        <Headline variant='h3' color='primary' align='center' noSpacing>
          Login
        </Headline>

        <TextArea
          label='Email'
          placeholder='name@example.com'
          value={email}
          singleLine
          onChange={e => {
            const v = (e.target as HTMLTextAreaElement).value
            setEmail(v)
            setEmailValidation(validateEmail(v))
          }}
          onBlur={() => setEmailValidation(validateEmail(email))}
          helperText={emailValidation === 'error' ? 'Invalid email' : ''}
          validation={emailValidation}
          margin='0 0 1rem 0'
        />

        <SC.PasswordContainer>
          <SC.PasswordLabel>
            <Headline variant='h4' noSpacing>
              Password
            </Headline>
          </SC.PasswordLabel>
          <SC.PasswordFieldWrapper>
            <SC.PasswordInput
              type={showPassword ? 'text' : 'password'}
              placeholder='passWot@452'
              value={password}
              onChange={e => {
                const v = e.target.value
                setPassword(v)
                setPasswordValidation(validatePassword(v))
              }}
              onBlur={() => setPasswordValidation(validatePassword(password))}
              $validation={passwordValidation}
            />
            <SC.PasswordToggleIcon
              type='button'
              $visible={password.length > 0}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon
                name={showPassword ? 'visibility_off' : 'visibility'}
                color='secondary'
                size='sm'
              />
            </SC.PasswordToggleIcon>
            <SC.PasswordStatusIcon
              $visible={passwordValidation === 'success'}
              $type='success'
            >
              <Icon name='check_circle' color='success' size='md' />
            </SC.PasswordStatusIcon>
            <SC.PasswordStatusIcon
              $visible={passwordValidation === 'error'}
              $type='error'
            >
              <Icon name='cancel' color='error' size='md' />
            </SC.PasswordStatusIcon>
          </SC.PasswordFieldWrapper>
          <SC.PasswordHelperText $error={passwordValidation === 'error'}>
            {passwordValidation === 'error'
              ? 'Min. 8 characters, upper/lowercase, number & special character'
              : ''}
          </SC.PasswordHelperText>
        </SC.PasswordContainer>
        <Button
          variant='primary'
          size='md'
          type='submit'
          disabled={!isFormValid}
        >
          Login
        </Button>
        <Button variant='ghost' size='md'>
          Forgot Password?
        </Button>
        <SC.SignInPrompt>
          <SC.Label>Don&apos;t have an account?</SC.Label>
          <Button
            variant='ghost'
            size='md'
            type='button'
            onClick={() => router.push('/register')}
          >
            Register
          </Button>
        </SC.SignInPrompt>
      </SC.Card>
    </SC.LoginPageWrapper>
  )
}

export default DailyTrackingTemplate
