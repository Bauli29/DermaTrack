'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'

import Input from '@/components/molecules/Input'

import { useAuth } from '@/hooks/use-auth'
import { usePageTitle } from '@/hooks/use-page-title'

import { validatePassword, validateUsername } from '@/validation/auth'

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

    const uv = validateUsername(username)
    const pv = validatePassword(password)
    setUsernameValidation(uv)
    setPasswordValidation(pv)

    if (uv === 'success' && pv === 'success') {
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
    () =>
      validateUsername(username) === 'success' &&
      validatePassword(password) === 'success',
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
        helperText={
          usernameValidation === 'error'
            ? '3-50 chars; letters, numbers, _ and - only'
            : ''
        }
        validation={usernameValidation}
        margin='1rem 0 1rem 0'
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
        helperText={
          passwordValidation === 'error'
            ? 'Min. 8 characters, upper/lowercase, number & special character'
            : ''
        }
        validation={passwordValidation}
        margin='0 0 1rem 0'
      />

      {error && <p role='alert'>{error}</p>}

      <Button
        variant='primary'
        size='md'
        type='submit'
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>

      <Button variant='ghost' size='md' type='button'>
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
