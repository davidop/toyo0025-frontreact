import React from 'react'
import { 
  Container, 
  Box,
  Typography,
  Button,
  useMediaQuery
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'))

  const handleCreateEvent = () => {
    navigate('/eventos/crear')
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h2" gutterBottom sx={{ mb: { xs: 0, sm: 1.5 } }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
          fullWidth={isMobile}
          sx={{ 
            borderRadius: (theme) => theme.shape.borderRadius,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Crear Evento
        </Button>
      </Box>

      
    </Container>
  )
}

export default Dashboard
