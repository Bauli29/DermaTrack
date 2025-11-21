'use client'
import { useRouter } from 'next/navigation'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import TextArea from '@/components/molecules/TextArea'
import type { TValidationState } from '@/components/molecules/TextArea/types'
import { useMemo, useState } from 'react'
import * as SC from './styles'

const RegistrationTemplate = () => {
  const router = useRouter()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation states
  const [emailValidation, setEmailValidation] =
    useState<TValidationState>('none')
  const [passwordValidation, setPasswordValidation] =
    useState<TValidationState>('none')
  const [confirmPasswordValidation, setConfirmPasswordValidation] =
    useState<TValidationState>('none')

  // Validation functions
  const validateEmail = (value: string): TValidationState => {
    const re = /\S+@\S+\.\S+/
    if (value.length === 0) return 'none'
    return re.test(value) ? 'success' : 'error'
  }

  const validatePassword = (value: string): TValidationState => {
    if (value.length === 0) return 'none'
    // Password muss mindestens 8 Zeichen haben und verschiedene Kriterien erfüllen
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

  const getPasswordHelperText = (validation: TValidationState): string => {
    if (validation === 'error') {
      return 'Min. 8 characters, upper/lowercase, number & special character'
    }
    return ''
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
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
      // Registration successful, redirect to login
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

        {/* Optional name fields */}
        <SC.NameRow>
          <TextArea
            label='First Name (optional)'
            placeholder='John'
            value={firstName}
            singleLine
            onChange={e =>
              setFirstName((e.target as HTMLTextAreaElement).value)
            }
            helperText=''
            validation={firstName.length > 0 ? 'success' : 'none'}
            margin='0'
          />
          <TextArea
            label='Last Name (optional)'
            placeholder='Doe'
            value={lastName}
            singleLine
            onChange={e => setLastName((e.target as HTMLTextAreaElement).value)}
            helperText=''
            validation={lastName.length > 0 ? 'success' : 'none'}
            margin='0'
          />
        </SC.NameRow>

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
              placeholder='Your secure password'
              value={password}
              onChange={e => {
                const v = e.target.value
                setPassword(v)
                setPasswordValidation(validatePassword(v))
                // Re-validate confirm password if it exists
                if (confirmPassword) {
                  setConfirmPasswordValidation(
                    validateConfirmPassword(confirmPassword, v)
                  )
                }
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
            {getPasswordHelperText(passwordValidation)}
          </SC.PasswordHelperText>
        </SC.PasswordContainer>

        <SC.PasswordContainer>
          <SC.PasswordLabel>
            <Headline variant='h4' noSpacing>
              Confirm Password
            </Headline>
          </SC.PasswordLabel>
          <SC.PasswordFieldWrapper>
            <SC.PasswordInput
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Repeat your password'
              value={confirmPassword}
              onChange={e => {
                const v = e.target.value
                setConfirmPassword(v)
                setConfirmPasswordValidation(
                  validateConfirmPassword(v, password)
                )
              }}
              onBlur={() =>
                setConfirmPasswordValidation(
                  validateConfirmPassword(confirmPassword, password)
                )
              }
              $validation={confirmPasswordValidation}
            />
            <SC.PasswordToggleIcon
              type='button'
              $visible={confirmPassword.length > 0}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              <Icon
                name={showConfirmPassword ? 'visibility_off' : 'visibility'}
                color='secondary'
                size='sm'
              />
            </SC.PasswordToggleIcon>
            <SC.PasswordStatusIcon
              $visible={confirmPasswordValidation === 'success'}
              $type='success'
            >
              <Icon name='check_circle' color='success' size='md' />
            </SC.PasswordStatusIcon>
            <SC.PasswordStatusIcon
              $visible={confirmPasswordValidation === 'error'}
              $type='error'
            >
              <Icon name='cancel' color='error' size='md' />
            </SC.PasswordStatusIcon>
          </SC.PasswordFieldWrapper>
          <SC.PasswordHelperText $error={confirmPasswordValidation === 'error'}>
            {confirmPasswordValidation === 'error'
              ? 'Passwords do not match'
              : ''}
          </SC.PasswordHelperText>
        </SC.PasswordContainer>

        {/* GDPR Compliance Checkbox */}
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
