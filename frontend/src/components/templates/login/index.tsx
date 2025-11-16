'use client'
import { useRouter } from 'next/navigation'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'
import TextArea from '@/components/molecules/TextArea'
import type { TValidationState } from '@/components/molecules/TextArea/types'
import * as SC from './styles'
import { useMemo, useState } from 'react'

const DailyTrackingTemplate = () => {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
    return value.length >= 8 ? 'success' : 'error'
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
          label='E-Mail'
          placeholder='name@example.com'
          value={email}
          singleLine
          onChange={e => {
            const v = (e.target as HTMLTextAreaElement).value
            setEmail(v)
            setEmailValidation(validateEmail(v))
          }}
          onBlur={() => setEmailValidation(validateEmail(email))}
          helperText={
            emailValidation === 'error'
              ? 'Ungültige E‑Mail'
              : `Characters: ${email.length}`
          }
          validation={emailValidation}
          margin='0 0 1rem 0'
        />

        <TextArea
          label='Password'
          placeholder='passWot@452'
          singleLine
          value={password}
          onChange={e => {
            const v = (e.target as HTMLTextAreaElement).value
            setPassword(v)
            setPasswordValidation(validatePassword(v))
          }}
          onBlur={() => setPasswordValidation(validatePassword(password))}
          helperText={
            passwordValidation === 'error'
              ? 'Passwort mind. 8 Zeichen'
              : `Characters: ${password.length}`
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
        <Button variant='ghost' size='md'>
          Forgot Password?
        </Button>
        <SC.SignInPrompt>
          <SC.Label>Already a member?</SC.Label>
          <Button variant='ghost' size='md'>
            Sign In
          </Button>
        </SC.SignInPrompt>
      </SC.Card>
    </SC.LoginPageWrapper>
  )
}

export default DailyTrackingTemplate
