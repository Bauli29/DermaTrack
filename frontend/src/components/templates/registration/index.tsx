'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'
import Link from '@/components/atoms/Link'
import Text from '@/components/atoms/Text'

import Input from '@/components/molecules/Input'

import { useAuth } from '@/hooks/use-auth'
import { usePageTitle } from '@/hooks/use-page-title'

import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/validation/auth'
import {
  CONFIRM_PASSWORD_HELPER_TEXT,
  EMAIL_HELPER_TEXT,
  getValidationHelperText,
  PASSWORD_HELPER_TEXT,
  USERNAME_HELPER_TEXT,
  validateRegistrationForm,
} from '@/validation/auth/form-utils'

import * as SC from './styles'

import type { TValidationState } from '@/components/molecules/Input/types'
const RegistrationTemplate = () => {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()

  const { setTitle } = usePageTitle()
  useEffect(() => {
    setTitle('Registration')
  }, [setTitle])

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [usernameValidation, setUsernameValidation] =
    useState<TValidationState>('none')
  const [emailValidation, setEmailValidation] =
    useState<TValidationState>('none')
  const [passwordValidation, setPasswordValidation] =
    useState<TValidationState>('none')
  const [confirmPasswordValidation, setConfirmPasswordValidation] =
    useState<TValidationState>('none')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const validationResult = validateRegistrationForm({
      username,
      email,
      password,
      confirmPassword,
      acceptTerms,
    })

    setUsernameValidation(validationResult.username)
    setEmailValidation(validationResult.email)
    setPasswordValidation(validationResult.password)
    setConfirmPasswordValidation(validationResult.confirmPassword)

    if (validationResult.isValid) {
      try {
        await register(username, email, password)
        router.push('/login')
      } catch {
        return
      }
    }
  }

  const isFormValid = useMemo(
    () =>
      validateRegistrationForm({
        username,
        email,
        password,
        confirmPassword,
        acceptTerms,
      }).isValid,
    [username, email, password, confirmPassword, acceptTerms]
  )

  return (
    <SC.RegistrationPageWrapper as='form' onSubmit={onSubmit}>
      <Input
        label='Username'
        type='text'
        placeholder='your username'
        value={username}
        onChange={e => {
          const { value } = e.target
          setUsername(value)
          setUsernameValidation(validateUsername(value))
          clearError()
        }}
        onBlur={() => setUsernameValidation(validateUsername(username))}
        helperText={getValidationHelperText(
          usernameValidation,
          USERNAME_HELPER_TEXT
        )}
        validation={usernameValidation}
      />

      <SC.NameRow>
        <Input
          label='First Name (optional)'
          type='text'
          placeholder='John'
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          validation={firstName.length > 0 ? 'success' : 'none'}
        />
        <Input
          label='Last Name (optional)'
          type='text'
          placeholder='Doe'
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          validation={lastName.length > 0 ? 'success' : 'none'}
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
          clearError()
        }}
        onBlur={() => setEmailValidation(validateEmail(email))}
        helperText={getValidationHelperText(emailValidation, EMAIL_HELPER_TEXT)}
        validation={emailValidation}
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
          clearError()
        }}
        onBlur={() => setPasswordValidation(validatePassword(password))}
        helperText={getValidationHelperText(
          passwordValidation,
          PASSWORD_HELPER_TEXT
        )}
        validation={passwordValidation}
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
          clearError()
        }}
        onBlur={() =>
          setConfirmPasswordValidation(
            validateConfirmPassword(confirmPassword, password)
          )
        }
        helperText={getValidationHelperText(
          confirmPasswordValidation,
          CONFIRM_PASSWORD_HELPER_TEXT
        )}
        validation={confirmPasswordValidation}
      />

      {error && (
        <Text as='p' color='error' role='alert' margin='0'>
          {error}
        </Text>
      )}

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
          <Link href='/terms' variant='primary' underline target='_blank'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='/privacy' variant='primary' underline target='_blank'>
            Privacy Policy
          </Link>
        </SC.CheckboxLabel>
      </SC.CheckboxContainer>

      <Button
        variant='primary'
        size='md'
        type='submit'
        fullWidth
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? 'Creating account...' : 'Register'}
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
    </SC.RegistrationPageWrapper>
  )
}

export default RegistrationTemplate
