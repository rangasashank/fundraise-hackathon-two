import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AppBar, Toolbar, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Modern styled navigation components
const StyledAppBar = styled(AppBar)(() => ({
  backgroundColor: 'var(--surface)',
  borderBottom: '1px solid var(--grey-200)',
  boxShadow: 'var(--shadow-sm)',
  position: 'static',
  backdropFilter: 'blur(8px)',
}))

const StyledToolbar = styled(Toolbar)(() => ({
  height: 64,
  paddingLeft: 32,
  paddingRight: 32,
  gap: 8,
  minHeight: '64px !important',
}))

const NavLink = styled(Link)(() => ({
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'all var(--transition-fast)',
  color: 'var(--text-secondary)',
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  '&:hover': {
    color: 'var(--brand-primary)',
    backgroundColor: 'var(--brand-primary-100)',
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 8px rgba(79, 195, 161, 0.3)',
  },
  '&.active': {
    color: 'var(--brand-primary)',
    backgroundColor: 'var(--brand-primary-200)',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(79, 195, 161, 0.3)',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-2px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '20px',
      height: '2px',
      backgroundColor: 'var(--brand-primary)',
      borderRadius: 'var(--radius-full)',
    }
  },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: '0 0 0 3px var(--brand-primary-100)',
  }
}))

export function Navigation() {
  const router = useRouter()
  const pathname = router.pathname

  const navItems = [
    { href: '/meetings', label: 'Meetings' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/insights', label: 'Insights' },
  ]

  return (
    <StyledAppBar>
      <StyledToolbar>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className={cn(
                pathname === item.href && 'active'
              )}
            >
              {item.label}
            </NavLink>
          ))}
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  )
}
