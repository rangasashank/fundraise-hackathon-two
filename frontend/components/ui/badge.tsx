import React from 'react'
import { Chip, ChipProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Define badge variants to match v0 mockup
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface CustomBadgeProps extends Omit<ChipProps, 'variant'> {
  variant?: BadgeVariant
}

// Styled badge component with custom variants
const StyledBadge = styled(Chip)<CustomBadgeProps>(({ theme, variant: customVariant }) => {
  const baseStyles = {
    borderRadius: 6,
    fontSize: '0.75rem',
    height: 24,
    fontWeight: 500,
    border: 'none',
    '& .MuiChip-label': {
      padding: '0 8px',
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
    secondary: {
      backgroundColor: '#f7f7f7',
      color: '#343434',
      '&:hover': {
        backgroundColor: '#e8e8e8',
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
      },
    },
  }

  return {
    ...baseStyles,
    ...variantStyles[customVariant || 'default'],
  }
})

export interface BadgeProps extends CustomBadgeProps {
  className?: string
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <StyledBadge
        ref={ref}
        variant={variant}
        label={children}
        className={cn(className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
