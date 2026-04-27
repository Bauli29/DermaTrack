'use client'

import Text from '@/components/atoms/Text'
import Input from '@/components/molecules/Input'

import * as SC from './styles'

import type { ICompoundCheckboxesProps } from './types'

const CompoundCheckboxes = ({
  name,
  options,
  values = [],
  onChange,
  legend,
  helperText,
  margin,
  disabled = false,
}: ICompoundCheckboxesProps) => {
  const handleCheckboxChange = (optionValue: string, isChecked: boolean) => {
    if (isChecked) {
      onChange([...values, optionValue])
    } else {
      onChange(values.filter(v => v !== optionValue))
    }
  }

  return (
    <SC.Container $margin={margin}>
      <SC.Fieldset>
        {legend && (
          <Text as='legend' size='small' color='text' margin='0 0 0.5rem 0'>
            {legend}
          </Text>
        )}

        {helperText && (
          <Text size='small' color='textMuted' margin='0 0 0.75rem 0'>
            {helperText}
          </Text>
        )}

        <SC.Options>
          {options.map(option => {
            const isSelected = values.includes(option.value)
            const detailInputId = `${name}-${option.value}-detail`

            return (
              <SC.OptionCard
                key={option.value}
                $selected={isSelected}
                $disabled={disabled}
              >
                <SC.OptionRow>
                  <SC.StyledCheckbox
                    type='checkbox'
                    id={`${name}-${option.value}`}
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={e =>
                      handleCheckboxChange(option.value, e.target.checked)
                    }
                    aria-controls={
                      option.detailInput ? detailInputId : undefined
                    }
                    aria-expanded={option.detailInput ? isSelected : undefined}
                  />
                  <SC.LabelContainer>
                    <SC.OptionLabel htmlFor={`${name}-${option.value}`}>
                      {option.label}
                    </SC.OptionLabel>
                    {option.helperText && (
                      <SC.HelperText>{option.helperText}</SC.HelperText>
                    )}
                  </SC.LabelContainer>
                </SC.OptionRow>

                {isSelected && option.detailInput && (
                  <SC.DetailInputContainer id={detailInputId}>
                    <Input
                      label={option.detailInput.label}
                      type={option.detailInput.type ?? 'text'}
                      placeholder={option.detailInput.placeholder}
                      value={option.detailInput.value}
                      onChange={event =>
                        option.detailInput?.onChange(event.target.value)
                      }
                      helperText={option.detailInput.helperText}
                      validation={option.detailInput.validation}
                      disabled={option.detailInput.disabled ?? disabled}
                      autoComplete={option.detailInput.autoComplete}
                      maxLength={option.detailInput.maxLength}
                    />
                  </SC.DetailInputContainer>
                )}
              </SC.OptionCard>
            )
          })}
        </SC.Options>
      </SC.Fieldset>
    </SC.Container>
  )
}

export default CompoundCheckboxes
