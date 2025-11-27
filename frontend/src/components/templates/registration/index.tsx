'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'

import Input from '@/components/molecules/Input'

import * as SC from './styles'

import type { TValidationState } from '@/components/molecules/Input/types'

const RegistrationTemplate = () => {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [emailValidation, setEmailValidation] =
    useState<TValidationState>('none')
  const [passwordValidation, setPasswordValidation] =
    useState<TValidationState>('none')
  const [confirmPasswordValidation, setConfirmPasswordValidation] =
    useState<TValidationState>('none')

  const validateEmail = (value: string): TValidationState => {
    if (value.length === 0) return 'none'
    const re = /\S+@\S+\.\S+/
    return re.test(value) ? 'success' : 'error'
  }

  const validatePassword = (value: string): TValidationState => {
    if (value.length === 0) return 'none'
    const hasLength = value.length >= 8
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    const hasSpecial = /[^a-zA-Z0-9]/.test(value)

    return hasLength && hasUpper && hasLower && hasNumber && hasSpecial
      ? 'success'
      : 'error'
  }

  const validateConfirmPassword = (
    value: string,
    original: string
  ): TValidationState => {
    if (value.length === 0) return 'none'
    return value === original ? 'success' : 'error'
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const ev = validateEmail(email)
    const pv = validatePassword(password)
    const cpv = validateConfirmPassword(confirmPassword, password)

    setEmailValidation(ev)
    setPasswordValidation(pv)
    setConfirmPasswordValidation(cpv)

    if (
      ev === 'success' &&
      pv === 'success' &&
      cpv === 'success' &&
      acceptTerms
    ) {
      // TODO: implement registration API call
      router.push('/login')
    }
  }

  const isFormValid = useMemo(
    () =>
      validateEmail(email) === 'success' &&
      validatePassword(password) === 'success' &&
      validateConfirmPassword(confirmPassword, password) === 'success' &&
      acceptTerms,
    [email, password, confirmPassword, acceptTerms]
  )

  return (
    <SC.RegistrationPageWrapper>
      <SC.Card as='form' onSubmit={onSubmit}>
        <Headline variant='h3' color='primary' align='center' noSpacing>
          Registration
        </Headline>

        <SC.NameRow>
          <Input
            label='First Name (optional)'
            type='text'
            placeholder='John'
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            validation={firstName.length > 0 ? 'success' : 'none'}
            margin='1rem 0 0 0'
          />
          <Input
            label='Last Name (optional)'
            type='text'
            placeholder='Doe'
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            validation={lastName.length > 0 ? 'success' : 'none'}
            margin='1rem 0 0 0'
          />
        </SC.NameRow>

        <Input
          label='Email'
          type='email'
          placeholder='name@example.com'
          value={email}
          onChange={e => {
            const v = e.target.value
            setEmail(v)
            setEmailValidation(validateEmail(v))
          }}
          onBlur={() => setEmailValidation(validateEmail(email))}
          helperText={emailValidation === 'error' ? 'Invalid email' : ''}
          validation={emailValidation}
          margin='0 0 1rem 0'
        />

        <Input
          label='Password'
          type='password'
          placeholder='Your secure password'
          value={password}
          onChange={e => {
            const v = e.target.value
            setPassword(v)
            setPasswordValidation(validatePassword(v))
            if (confirmPassword) {
              setConfirmPasswordValidation(
                validateConfirmPassword(confirmPassword, v)
              )
            }
          }}
          onBlur={() => setPasswordValidation(validatePassword(password))}
          helperText={
            passwordValidation === 'error'
              ? 'Min. 8 characters, upper/lowercase, number & special character'
              : ''
          }
          validation={passwordValidation}
          margin='0 0 1rem 0'
        />

        <Input
          label='Confirm Password'
          type='password'
          placeholder='Repeat your password'
          value={confirmPassword}
          onChange={e => {
            const v = e.target.value
            setConfirmPassword(v)
            setConfirmPasswordValidation(validateConfirmPassword(v, password))
          }}
          onBlur={() =>
            setConfirmPasswordValidation(
              validateConfirmPassword(confirmPassword, password)
            )
          }
          helperText={
            confirmPasswordValidation === 'error'
              ? 'Passwords do not match'
              : ''
          }
          validation={confirmPasswordValidation}
          margin='0 0 1rem 0'
        />

        <SC.CheckboxContainer>
          <SC.Checkbox
            type='checkbox'
            id='accept-terms'
            checked={acceptTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAcceptTerms(e.target.checked)
            }
          />
          <SC.CheckboxLabel htmlFor='accept-terms'>
            I agree to the{' '}
            <SC.Link href='/terms' target='_blank'>
              Terms of Service
            </SC.Link>{' '}
            and{' '}
            <SC.Link href='/privacy' target='_blank'>
              Privacy Policy
            </SC.Link>
          </SC.CheckboxLabel>
        </SC.CheckboxContainer>

        <Button
          variant='primary'
          size='md'
          type='submit'
          disabled={!isFormValid}
        >
          Register
        </Button>

        <SC.SignInPrompt>
          <SC.Label>Already have an account?</SC.Label>
          <Button
            variant='ghost'
            size='md'
            type='button'
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </SC.SignInPrompt>
      </SC.Card>
    </SC.RegistrationPageWrapper>
  )
}

export default RegistrationTemplate
