import React from 'react'
import {
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  IconButton,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced styled components with brand colors
const StyledDialog = styled(MuiDialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: 'var(--radius-lg)',
    maxWidth: '600px',
    width: '100%',
    margin: '16px',
    background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)',
    border: '1px solid var(--grey-200)',
    boxShadow: '0 20px 40px rgba(79, 195, 161, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
      zIndex: 1,
    },
  },
}))

const StyledDialogHeader = styled('div')(() => ({
  padding: '24px 24px 0 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-12px',
    left: '24px',
    right: '24px',
    height: '2px',
    background: 'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
    opacity: 0.3,
  },
}))

const StyledDialogTitle = styled(Typography)(() => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1.4,
  color: 'var(--text-primary)',
  margin: 0,
  paddingRight: '40px', // Space for close button
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}))

const StyledDialogDescription = styled(Typography)(() => ({
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
  margin: 0,
}))

const StyledDialogContent = styled(MuiDialogContent)(() => ({
  padding: '24px',
  background: 'transparent',
  '&.MuiDialogContent-root': {
    paddingTop: '24px',
  },
}))

const StyledDialogActions = styled(MuiDialogActions)(() => ({
  padding: '0 24px 24px 24px',
  gap: '12px',
  justifyContent: 'flex-end',
  background: 'transparent',
}))

const CloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: '8px',
  top: '8px',
  color: 'var(--text-tertiary)',
  backgroundColor: 'transparent',
  transition: 'all var(--transition-fast)',
  '&:hover': {
    backgroundColor: 'var(--brand-primary-100)',
    color: 'var(--brand-primary)',
    transform: 'scale(1.1)',
  },
}))

// Dialog component interfaces
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

// Dialog components
const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, children, className, ...props }, ref) => (
    <StyledDialog
      open={open}
      onClose={() => onOpenChange(false)}
      className={cn(className)}
      {...props}
    >
      {children}
    </StyledDialog>
  )
)
Dialog.displayName = 'Dialog'

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  )
)
DialogContent.displayName = 'DialogContent'

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <StyledDialogHeader ref={ref} className={cn(className)} {...props}>
      {children}
    </StyledDialogHeader>
  )
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => (
    <StyledDialogTitle ref={ref} className={cn(className)} {...props}>
      {children}
    </StyledDialogTitle>
  )
)
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <StyledDialogDescription ref={ref} className={cn(className)} {...props}>
      {children}
    </StyledDialogDescription>
  )
)
DialogDescription.displayName = 'DialogDescription'

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, ...props }, ref) => (
    <StyledDialogActions ref={ref} className={cn(className)} {...props}>
      {children}
    </StyledDialogActions>
  )
)
DialogFooter.displayName = 'DialogFooter'

// Dialog close button component
interface DialogCloseProps {
  onClick?: () => void
  className?: string
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, className, ...props }, ref) => (
    <CloseButton ref={ref} onClick={onClick} className={cn(className)} {...props}>
      <X size={16} />
    </CloseButton>
  )
)
DialogClose.displayName = 'DialogClose'

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
}
