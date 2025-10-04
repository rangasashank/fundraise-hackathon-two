import React from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Define button variants to match v0 mockup
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

interface CustomButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

// Styled button component with custom variants
const StyledButton = styled(MuiButton)<CustomButtonProps>(({ theme, variant: customVariant, size: customSize }) => {
  const baseStyles = {
    textTransform: 'none' as const,
    fontWeight: 500,
    borderRadius: 10,
    boxShadow: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: 'none',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }

  // Size styles
  const sizeStyles = {
    default: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      height: 40,
    },
    sm: {
      padding: '6px 12px',
      fontSize: '0.75rem',
      height: 32,
    },
    lg: {
      padding: '12px 24px',
      fontSize: '1rem',
      height: 48,
    },
    icon: {
      padding: '8px',
      minWidth: 40,
      width: 40,
      height: 40,
    },
  }

  // Variant styles
  const variantStyles = {
    default: {
      backgroundColor: '#343434',
      color: '#fafafa',
      '&:hover': {
        backgroundColor: '#252525',
      },
    },
    destructive: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#b91c1c',
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#343434',
      border: '1px solid #e8e8e8',
      '&:hover': {
        backgroundColor: '#f7f7f7',
        borderColor: '#b5b5b5',
      },
    },
    secondary: {
      backgroundColor: '#f7f7f7',
      color: '#343434',
      '&:hover': {
        backgroundColor: '#e8e8e8',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#343434',
      '&:hover': {
        backgroundColor: '#f7f7f7',
      },
    },
    link: {
      backgroundColor: 'transparent',
      color: '#343434',
      textDecoration: 'underline',
      padding: 0,
      minWidth: 'auto',
      height: 'auto',
      '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'underline',
      },
    },
  }

  return {
    ...baseStyles,
    ...sizeStyles[customSize || 'default'],
    ...variantStyles[customVariant || 'default'],
  }
})

export interface ButtonProps extends CustomButtonProps {
  className?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        className={cn(className)}
        {...props}
      >
        {children}
      </StyledButton>
    )
  }
)

Button.displayName = 'Button'

export { Button }
