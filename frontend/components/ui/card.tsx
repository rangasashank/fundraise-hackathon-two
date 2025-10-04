import React from 'react'
import { Card as MuiCard, CardContent as MuiCardContent, CardActions as MuiCardActions } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Styled components matching v0 mockup design
const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: 10,
  border: '1px solid #e8e8e8',
  boxShadow: 'none',
  backgroundColor: '#ffffff',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderColor: '#b5b5b5',
  },
}))

const StyledCardHeader = styled('div')(({ theme }) => ({
  padding: '24px 24px 0 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}))

const StyledCardTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1.4,
  color: '#252525',
}))

const StyledCardDescription = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: '#8e8e8e',
}))

const StyledCardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: '24px',
  '&:last-child': {
    paddingBottom: '24px',
  },
}))

const StyledCardFooter = styled('div')(({ theme }) => ({
  padding: '0 24px 24px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}))

// Card component interfaces
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

// Card components
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <StyledCard ref={ref} className={cn(className)} {...props} />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <StyledCardHeader ref={ref} className={cn(className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <StyledCardTitle ref={ref} className={cn(className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <StyledCardDescription ref={ref} className={cn(className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <StyledCardContent ref={ref} className={cn(className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <StyledCardFooter ref={ref} className={cn(className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
