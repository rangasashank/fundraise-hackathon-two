import React from 'react'
import { TextField, TextFieldProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Styled input component matching v0 mockup design
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: '#e8e8e8',
    },
    '&:hover fieldset': {
      borderColor: '#b5b5b5',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#343434',
      borderWidth: 1,
    },
    '& input': {
      padding: '12px 14px',
      '&::placeholder': {
        color: '#8e8e8e',
        opacity: 1,
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#8e8e8e',
    '&.Mui-focused': {
      color: '#343434',
    },
  },
}))

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  className?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <StyledTextField
        inputRef={ref}
        type={type}
        variant="outlined"
        fullWidth
        className={cn(className)}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
