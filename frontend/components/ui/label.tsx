import React from 'react'
import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Styled label component matching v0 mockup design
const StyledLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
  color: '#252525',
  marginBottom: '8px',
  display: 'block',
}))

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string
  children: React.ReactNode
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <StyledLabel
        ref={ref}
        component="label"
        className={cn(className)}
        {...props}
      >
        {children}
      </StyledLabel>
    )
  }
)

Label.displayName = 'Label'

export { Label }
