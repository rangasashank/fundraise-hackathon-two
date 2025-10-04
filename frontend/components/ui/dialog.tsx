import React from 'react'
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  IconButton,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Styled components matching v0 mockup design
const StyledDialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 10,
    maxWidth: '600px',
    width: '100%',
    margin: '16px',
  },
}))

const StyledDialogHeader = styled('div')(({ theme }) => ({
  padding: '24px 24px 0 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  position: 'relative',
}))

const StyledDialogTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1.4,
  color: '#252525',
  margin: 0,
  paddingRight: '40px', // Space for close button
}))

const StyledDialogDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: '#8e8e8e',
  margin: 0,
}))

const StyledDialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: '24px',
  '&.MuiDialogContent-root': {
    paddingTop: '24px',
  },
}))

const StyledDialogActions = styled(MuiDialogActions)(({ theme }) => ({
  padding: '0 24px 24px 24px',
  gap: '8px',
  justifyContent: 'flex-end',
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: '8px',
  top: '8px',
  color: '#8e8e8e',
  '&:hover': {
    backgroundColor: '#f7f7f7',
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
    <StyledDialogTitle ref={ref} component="h2" className={cn(className)} {...props}>
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
