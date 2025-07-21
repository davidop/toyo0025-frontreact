import { createTheme } from '@mui/material/styles'
import { getThemePalette } from './palette'
import '../assets/styles/fonts.css'

export const createAppTheme = (mode) => {
  const palette = getThemePalette(mode)

  return createTheme({
    palette,
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily:
        '"Toyota Type", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 300,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase', // Tipografía expresiva - mayúsculas
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 300,
        letterSpacing: '-0.01em',
        textTransform: 'uppercase', // Tipografía expresiva - mayúsculas
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 400,
        letterSpacing: '0.02em', // Espaciado abierto
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 400,
        letterSpacing: '0.01em', // Espaciado abierto
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 400,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle1: {
        fontWeight: 400,
        fontSize: '1rem',
        letterSpacing: '0.01em', // Espaciado abierto
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.875rem',
      },
      button: {
        textTransform: 'uppercase', // Tipografía expresiva - mayúsculas
        fontWeight: 500,
        fontSize: '0.875rem',
        letterSpacing: '0.05em', // Espaciado abierto para botones
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.secondary.dark,
            transition: 'background-color 0.3s ease',
            background:
              mode === 'dark'
                ? `linear-gradient(135deg, 
                  ${palette.background.default} 0%,
                  ${palette.background.paper} 100%)`
                : palette.background.default,
          },
          'input:-webkit-autofill': {
            WebkitBoxShadow:
              mode === 'dark' ? '0 0 0 30px #2b2b2b inset !important' : 'none',
            WebkitTextFillColor:
              mode === 'dark' ? '#fff !important' : 'inherit',
          },
          'input:-webkit-autofill:hover': {
            WebkitBoxShadow:
              mode === 'dark' ? '0 0 0 30px #2b2b2b inset !important' : 'none',
          },
          'input:-webkit-autofill:focus': {
            WebkitBoxShadow:
              mode === 'dark' ? '0 0 0 30px #2b2b2b inset !important' : 'none',
          },
          'input:-webkit-autofill:active': {
            WebkitBoxShadow:
              mode === 'dark' ? '0 0 0 30px #2b2b2b inset !important' : 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background:
              mode === 'dark'
                ? `linear-gradient(120deg,
                  ${palette.background.paper} 0%,
                  rgba(40, 40, 40, 1) 100%)`
                : `linear-gradient(120deg,
                  ${palette.background.paper} 0%,
                  rgba(250, 250, 250, 1) 100%)`,
            borderRadius: 16,
            boxShadow:
              mode === 'dark'
                ? '0 4px 20px 0 rgba(0,0,0,0.4)'
                : '0 4px 20px 0 rgba(0,0,0,0.05)',
            border:
              mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
            transition: 'all 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiCardContent-root': {
              position: 'relative',
              zIndex: 1,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            '&.dashboard-card, &.event-list-card': {
              background:
                mode === 'dark'
                  ? `linear-gradient(120deg,
                    ${palette.background.paper} 0%,
                    rgba(40, 40, 40, 1) 100%)`
                  : `linear-gradient(120deg,
                    ${palette.background.paper} 0%,
                    rgba(250, 250, 250, 1) 100%)`,
              borderRadius: 16,
              boxShadow:
                mode === 'dark'
                  ? '0 4px 20px 0 rgba(0,0,0,0.4)'
                  : '0 4px 20px 0 rgba(0,0,0,0.05)',
              border:
                mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.05)'
                  : 'none',
              transition: 'all 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 24px',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow:
                mode === 'dark'
                  ? '0 2px 8px 0 rgba(255,255,255,0.1)'
                  : '0 2px 8px 0 rgba(0,0,0,0.1)',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor:
                mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              '&.Mui-focused': {
                backgroundColor:
                  mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: palette.primary.main,
                  borderWidth: 2,
                },
              },
              '&:hover': {
                backgroundColor:
                  mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.3)'
                      : palette.primary.main,
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor:
                  mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.23)',
              },
            },
            '& .MuiInputLabel-root': {
              color:
                mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(0, 0, 0, 0.6)',
              '&.Mui-focused': {
                color: palette.primary.main,
              },
            },
            '& .MuiInputBase-input': {
              '&::placeholder': {
                color:
                  mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.4)',
                opacity: 1,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'transparent',
            },
            '& .MuiSelect-select': {
              '&.MuiInputBase-input': {
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor:
                mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover': {
              backgroundColor:
                mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor:
                  mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.3)'
                    : palette.primary.main,
              },
            },
            '&.Mui-focused': {
              backgroundColor:
                mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: palette.primary.main,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor:
                mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor:
                  mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.12)',
              },
            },
            '&:hover': {
              backgroundColor:
                mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#2c2c2c' : '#ffffff',
            backgroundImage: 'none',
            boxShadow:
              mode === 'dark'
                ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              mode === 'dark'
                ? `linear-gradient(105deg, #121212 0%, #121212 70%, ${palette.primary.main} 100%)`
                : `linear-gradient(105deg, ${palette.secondary.dark} 0%, ${palette.secondary.dark} 70%, ${palette.primary.main} 100%)`,
            boxShadow: 'none',
            borderBottom: `1px solid ${palette.divider}`,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '30%',
              height: '3px',
              background: palette.redAccent.bar,
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.primary.main,
            color: '#fff',
            fontWeight: 500,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.MuiChip-colorPrimary': {
              backgroundColor: palette.primary.main + '14',
              color:
                mode === 'dark' ? palette.primary.light : palette.primary.main,
              '&:hover': {
                backgroundColor: palette.primary.main + '20',
              },
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 4,
            '&:hover': {
              backgroundColor: palette.action.hover,
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            '&.section-title': {
              marginBottom: '1.5rem',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              color: mode === 'dark' ? '#E8E8E8' : '#1A1A1A',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-0.5rem',
                left: 0,
                width: '3rem',
                height: '2px',
                background:
                  mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.1)',
                transition: 'all 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
          },
        },
      },
    },
  })
}
