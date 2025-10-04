import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AppBar, Toolbar, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/lib/utils'

// Styled navigation components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e8e8e8',
  boxShadow: 'none',
  position: 'static',
}))

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  height: 56, // 14 * 4 = 56px (h-14 in Tailwind)
  paddingLeft: 24,
  paddingRight: 24,
  gap: 24,
}))

const NavLink = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  color: '#8e8e8e',
  '&:hover': {
    color: '#252525',
  },
  '&.active': {
    color: '#252525',
  },
}))

export function Navigation() {
  const router = useRouter()
  const pathname = router.pathname

  const navItems = [
    { href: '', label: 'Meetings' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/notetaker', label: 'Notetaker' },
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
