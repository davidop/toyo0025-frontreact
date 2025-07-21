// Toyota Brand Colors
const lightPalette = {
  primary: {
    main: '#E60012', // Toyota Signature Red
    light: '#ff4d4d',
    dark: '#b30000',
    contrastText: '#fff',
  },
  secondary: {
    main: '#4A4A4A', // Toyota Signature Grey
    light: '#9e9e9e',
    dark: '#333333',
    contrastText: '#fff',
  },
  redAccent: {
    bar: '#E60012', // Toyota Red Bar
    gradient: 'linear-gradient(135deg, rgba(230, 0, 18, 0.8) 0%, rgba(230, 0, 18, 0.6) 100%)', // Toyota Red Gradient
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
    gradient: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  },
  action: {
    active: '#E60012',
    hover: 'rgba(230, 0, 18, 0.08)',
    selected: 'rgba(230, 0, 18, 0.16)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
  text: {
    primary: '#2C2C2C',
    secondary: '#666666',
    disabled: '#9E9E9E',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
}

const darkPalette = {
  primary: {
    main: '#E60012',
    light: '#ff4d4d',
    dark: '#b30000',
    contrastText: '#fff',
  },
  secondary: {
    main: '#4A4A4A',
    light: '#9e9e9e',
    dark: '#333333',
    contrastText: '#fff',
  },
  redAccent: {
    bar: '#E60012', // Toyota Red Bar
    gradient: 'linear-gradient(135deg, rgba(230, 0, 18, 0.8) 0%, rgba(230, 0, 18, 0.6) 100%)', // Toyota Red Gradient
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    gradient: 'linear-gradient(145deg, #1e1e1e 0%, #121212 100%)',
  },
  action: {
    active: '#E60012',
    hover: 'rgba(230, 0, 18, 0.12)',
    selected: 'rgba(230, 0, 18, 0.20)',
    disabled: 'rgba(255, 255, 255, 0.26)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    disabled: '#666666',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
  },
}

export const getThemePalette = (mode) => {
  return mode === 'dark' ? darkPalette : lightPalette
}
