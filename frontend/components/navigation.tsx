import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AppBar, Toolbar, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced navigation components with sophisticated color palette
const StyledAppBar = styled(AppBar)(() => ({
  background: 'linear-gradient(135deg, var(--surface) 0%, var(--brand-primary-50) 30%, var(--brand-accent-50) 100%)',
  borderBottom: '1px solid var(--brand-primary-200)',
  boxShadow: '0 4px 20px rgba(79, 195, 161, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
  position: 'static',
  backdropFilter: 'blur(12px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-accent) 50%, var(--brand-primary) 100%)',
    opacity: 0.8,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 20% 20%, var(--brand-primary-100) 1px, transparent 1px), radial-gradient(circle at 80% 80%, var(--brand-accent-100) 1px, transparent 1px)',
    backgroundSize: '40px 40px, 60px 60px',
    opacity: 0.3,
    pointerEvents: 'none',
  },
}))

const StyledToolbar = styled(Toolbar)(() => ({
  height: 64,
  paddingLeft: 32,
  paddingRight: 32,
  gap: 12,
  minHeight: '64px !important',
  position: 'relative',
  zIndex: 1,
  '@media (max-width: 768px)': {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 8,
  },
}))

const NavLink = styled(Link)(() => ({
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'all var(--transition-normal)',
  color: 'var(--text-primary)',
  padding: 'var(--space-3) var(--space-5)',
  borderRadius: 'var(--radius-lg)',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 195, 161, 0.2)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(79, 195, 161, 0.3), transparent)',
    transition: 'left var(--transition-normal)',
  },
  '&:hover': {
    color: 'var(--brand-primary-700)',
    backgroundColor: 'rgba(79, 195, 161, 0.15)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(79, 195, 161, 0.25), 0 3px 10px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--brand-primary-300)',
    '&::before': {
      left: '100%',
    },
  },
  '&.active': {
    color: 'white',
    background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-600) 100%)',
    fontWeight: 600,
    boxShadow: '0 8px 25px rgba(79, 195, 161, 0.4), 0 3px 10px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--brand-primary-400)',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-3px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '30px',
      height: '3px',
      background: 'linear-gradient(90deg, var(--brand-accent) 0%, var(--brand-primary-300) 100%)',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 2px 8px rgba(75, 163, 195, 0.5)',
    },
    '&::before': {
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    },
    '&:hover': {
      background: 'linear-gradient(135deg, var(--brand-primary-600) 0%, var(--brand-primary-700) 100%)',
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 30px rgba(79, 195, 161, 0.5), 0 5px 15px rgba(0, 0, 0, 0.2)',
    },
  },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: '0 0 0 3px var(--brand-primary-200), 0 8px 25px rgba(79, 195, 161, 0.25)',
  }
}))



export function Navigation() {
  const router = useRouter()
  const pathname = router.pathname

  const navItems = [
    { href: '/meetings', label: 'Meetings', icon: Calendar },
    { href: '/tasks', label: 'Tasks', icon: Zap },
  ]

  return (
    <StyledAppBar>
      <StyledToolbar>
        {/* Navigation Links */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          flex: 1,
          justifyContent: 'flex-start',
          '@media (max-width: 768px)': {
            gap: 1,
            justifyContent: 'center',
          }
        }}>
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <NavLink
                key={item.href}
                href={item.href}
                className={cn(
                  pathname === item.href && 'active'
                )}
              >
                <IconComponent size={16} style={{ marginRight: '8px' }} />
                <Box component="span" sx={{
                  '@media (max-width: 480px)': {
                    display: 'none'
                  }
                }}>
                  {item.label}
                </Box>
              </NavLink>
            )
          })}
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  )
}
