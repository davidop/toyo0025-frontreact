import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Divider,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import MicrosoftLoginButton from '../components/auth/MicrosoftLoginButton'

const Login = () => {
  const navigate = useNavigate()
  const { login, error, isLoading } = useAuthStore()
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(credentials)
    if (success) {
      navigate('/dashboard')
    }
  }

  const handleMicrosoftLogin = async () => {
    const success = await login({})
    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            CMS Eventos Toyota
          </Typography>

          <MicrosoftLoginButton
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          />

          <Divider sx={{ my: 2 }}>o</Divider>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              disabled={isLoading}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isLoading}
              InputLabelProps={{
                shrink: true,
              }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
