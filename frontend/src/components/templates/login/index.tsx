'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'
import Text from '@/components/atoms/Text'

import Input from '@/components/molecules/Input'

import { useAuth } from '@/hooks/use-auth'
import { usePageTitle } from '@/hooks/use-page-title'

import { validatePassword, validateUsername } from '@/validation/auth'
import {
  getValidationHelperText,
  PASSWORD_HELPER_TEXT,
  USERNAME_HELPER_TEXT,
  validateLoginForm,
} from '@/validation/auth/form-utils'

import * as SC from './styles'

import type { TValidationState } from '@/components/molecules/Input/types'
const LoginTemplate = () => {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()

  const { setTitle } = usePageTitle()
  useEffect(() => {
    setTitle('Login')
  }, [setTitle])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [usernameValidation, setUsernameValidation] =
    useState<TValidationState>('none')
  const [passwordValidation, setPasswordValidation] =
    useState<TValidationState>('none')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const validationResult = validateLoginForm(username, password)
    setUsernameValidation(validationResult.username)
    setPasswordValidation(validationResult.password)

    if (validationResult.isValid) {
      try {
        await login(username, password)
        const nextPath = new URLSearchParams(window.location.search).get('next')
        router.push(nextPath ?? '/')
      } catch {
        return
      }
    }
  }

  const isFormValid = useMemo(
    () => validateLoginForm(username, password).isValid,
    [username, password]
  )

  return (
    <SC.LoginPageWrapper as='form' onSubmit={onSubmit}>
      <Input
        label='Username'
        type='text'
        placeholder='your_username'
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const v = e.target.value
          setUsername(v)
          setUsernameValidation(validateUsername(v))
          clearError()
        }}
        onBlur={() => setUsernameValidation(validateUsername(username))}
        helperText={getValidationHelperText(
          usernameValidation,
          USERNAME_HELPER_TEXT
        )}
        validation={usernameValidation}
      />

      <Input
        label='Password'
        type='password'
        placeholder='Enter your password'
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const v = e.target.value
          setPassword(v)
          setPasswordValidation(validatePassword(v))
          clearError()
        }}
        onBlur={() => setPasswordValidation(validatePassword(password))}
        helperText={getValidationHelperText(
          passwordValidation,
          PASSWORD_HELPER_TEXT
        )}
        validation={passwordValidation}
      />

      {error && (
        <Text as='p' color='error' role='alert' margin='0'>
          {error}
        </Text>
      )}

      <Button
        variant='primary'
        size='md'
        type='submit'
        fullWidth
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>

      <Button variant='ghost' size='md' type='button' fullWidth>
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
    </SC.LoginPageWrapper>
  )
}

export default LoginTemplate
