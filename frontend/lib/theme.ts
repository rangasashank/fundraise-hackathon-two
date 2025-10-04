import { createTheme } from '@mui/material/styles'

// Convert OKLCH colors to RGB equivalents for Material-UI theme
const colors = {
  // Main colors (converted from OKLCH to RGB)
  background: '#ffffff',      // oklch(1 0 0)
  foreground: '#252525',      // oklch(0.145 0 0)
  card: '#ffffff',            // oklch(1 0 0)
  cardForeground: '#252525',  // oklch(0.145 0 0)
  primary: '#343434',         // oklch(0.205 0 0)
  primaryForeground: '#fafafa', // oklch(0.985 0 0)
  secondary: '#f7f7f7',       // oklch(0.97 0 0)
  secondaryForeground: '#343434', // oklch(0.205 0 0)
  muted: '#f7f7f7',           // oklch(0.97 0 0)
  mutedForeground: '#8e8e8e', // oklch(0.556 0 0)
  accent: '#f7f7f7',          // oklch(0.97 0 0)
  accentForeground: '#343434', // oklch(0.205 0 0)
  destructive: '#dc2626',     // oklch(0.577 0.245 27.325)
  destructiveForeground: '#dc2626',
  border: '#e8e8e8',          // oklch(0.922 0 0)
  input: '#e8e8e8',           // oklch(0.922 0 0)
  ring: '#b5b5b5',            // oklch(0.708 0 0)
  
  // Chart colors
  chart1: '#f59e0b',          // oklch(0.646 0.222 41.116)
  chart2: '#3b82f6',          // oklch(0.6 0.118 184.704)
  chart3: '#6366f1',          // oklch(0.398 0.07 227.392)
  chart4: '#84cc16',          // oklch(0.828 0.189 84.429)
  chart5: '#eab308',          // oklch(0.769 0.188 70.08)
}

// Create Material-UI theme matching the v0 mockup design
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      contrastText: colors.primaryForeground,
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.secondaryForeground,
    },
    background: {
      default: colors.background,
      paper: colors.card,
    },
    text: {
      primary: colors.foreground,
      secondary: colors.mutedForeground,
    },
    divider: colors.border,
    error: {
      main: colors.destructive,
    },
    grey: {
      50: colors.secondary,
      100: colors.muted,
      200: colors.border,
      300: colors.input,
      400: colors.ring,
      500: colors.mutedForeground,
      600: colors.foreground,
      700: colors.primary,
      800: colors.primary,
      900: colors.primary,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 10, // 0.625rem converted to px
  },
  spacing: 8, // 8px base spacing unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 10,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: colors.border,
          '&:hover': {
            borderColor: colors.ring,
            backgroundColor: colors.accent,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.75rem',
          height: 24,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.ring,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
              borderWidth: 1,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
        },
      },
    },
  },
})

// Export colors for use in custom components
export { colors }
