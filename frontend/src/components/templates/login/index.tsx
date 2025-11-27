'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'

import Input from '@/components/molecules/Input'

import * as SC from './styles'

import type { TValidationState } from '@/components/molecules/Input/types'

const LoginTemplate = () => {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [emailValidation, setEmailValidation] =
    useState<TValidationState>('none')
  const [passwordValidation, setPasswordValidation] =
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
          margin='1rem 0 1rem 0'
        />

        <Input
          label='Password'
          type='password'
          placeholder='passWot@452'
          value={password}
          onChange={e => {
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

        <Button
          variant='primary'
          size='md'
          type='submit'
          disabled={!isFormValid}
        >
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
      </SC.Card>
    </SC.LoginPageWrapper>
  )
}

export default LoginTemplate
