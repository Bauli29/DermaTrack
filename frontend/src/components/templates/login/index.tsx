'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'

import Input from '@/components/molecules/Input'

import { usePageTitle } from '@/hooks/use-page-title'

import { validateEmail, validatePassword } from '@/validation/auth'

import * as SC from './styles'

import type { TValidationState } from '@/components/molecules/Input/types'
const LoginTemplate = () => {
  const router = useRouter()

  const { setTitle } = usePageTitle()
  useEffect(() => {
    setTitle('Login')
  }, [setTitle])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [emailValidation, setEmailValidation] =
    useState<TValidationState>('none')
  const [passwordValidation, setPasswordValidation] =
    useState<TValidationState>('none')

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
    <SC.LoginPageWrapper as='form' onSubmit={onSubmit}>
      <Input
        label='Email'
        type='email'
        placeholder='name@example.com'
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const v = e.target.value
          setEmail(v)
          setEmailValidation(validateEmail(v))
        }}
        onBlur={() => setEmailValidation(validateEmail(email))}
        helperText={emailValidation === 'error' ? 'Invalid email' : ''}
        validation={emailValidation}
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

      <Button variant='primary' size='md' type='submit' disabled={!isFormValid}>
        Login
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
