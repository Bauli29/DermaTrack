'use client'

import Text from '@/components/atoms/Text'
import Radio from '@/components/atoms/Radio'

import Input from '@/components/molecules/Input'

import * as SC from './styles'

import type { ICompoundRadioButtonsProps } from './types'

const CompoundRadioButtons = ({
  name,
  options,
  value,
  onChange,
  legend,
  helperText,
  margin,
  disabled = false,
}: ICompoundRadioButtonsProps) => (
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
          const isSelected = option.value === value
          const detailInputId = `${name}-${option.value}-detail`

          return (
            <SC.OptionCard
              key={option.value}
              $selected={isSelected}
              $disabled={disabled}
            >
              <Radio
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                label={option.label}
                aria-controls={option.detailInput ? detailInputId : undefined}
                aria-expanded={option.detailInput ? isSelected : undefined}
              />

              {option.helperText && (
                <SC.OptionHelper>
                  <Text size='small' color='textMuted' noSpacing>
                    {option.helperText}
                  </Text>
                </SC.OptionHelper>
              )}

              {isSelected && option.detailInput && (
                <SC.DetailPanel id={detailInputId}>
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
                </SC.DetailPanel>
              )}
            </SC.OptionCard>
          )
        })}
      </SC.Options>
    </SC.Fieldset>
  </SC.Container>
)

export default CompoundRadioButtons
