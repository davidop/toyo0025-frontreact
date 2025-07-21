import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const Notificaciones = () => {
  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Notificaciones
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          Esta página de notificaciones está en desarrollo. Pronto podrás
          recibir actualizaciones sobre eventos y otras actividades importantes.
        </Typography>
      </Paper>
    </Box>
  )
}

export default Notificaciones
