import React from 'react'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Styled scroll area component matching v0 mockup design
const StyledScrollArea = styled('div')(({ theme }) => ({
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f7f7f7',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#b5b5b5',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#8e8e8e',
    },
  },
}))

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <StyledScrollArea
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
      </StyledScrollArea>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }
