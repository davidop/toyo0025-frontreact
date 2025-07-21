import React, { useState } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody,
  TableCell,
  TableContainer,
  TableHead, 
  TableRow,
  CircularProgress,
  Button,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Stack,
  useTheme
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EventIcon from '@mui/icons-material/Event'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EditIcon from '@mui/icons-material/Edit'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import eventsService from '../services/eventsService'
import useEventStore from '../stores/eventStore'

const Eventos = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })
  const navigate = useNavigate()
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'))

  const queryClient = useQueryClient()

  // React Query for fetching events
  const { data: eventos = [], isLoading, error } = useQuery({
    queryKey: ['eventos'],
    queryFn: () => eventsService.getEvents(),
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  })
  
  // React Query mutation for deleting an event
  const deleteMutation = useMutation({
    mutationFn: (id) => eventsService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      setNotification({
        open: true,
        message: 'Evento eliminado correctamente',
        severity: 'success'
      })
    },
    onError: (error) => {
      console.error('Error al eliminar el evento:', error)
      setNotification({
        open: true,
        message: 'Error al eliminar el evento',
        severity: 'error'
      })
    },
    onSettled: () => {
      setEventToDelete(null)
    }
  })

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch (e) {
      return '-'
    }
  }

  const handleCreateEvent = () => {
    navigate('/eventos/crear')
  }

  const handleEventClick = (event) => {
    if (event.subeventos) {
      // Navigate to subevents list if the event has subevents
      navigate(`/eventos/${event.id}/subeventos`);
    }
  };

  const handleEditClick = (event, e) => {
    // Stop propagation to prevent triggering the row click
    if (e) e.stopPropagation();
    
    // First get the setEventForEdit function from the store
    const setEventForEdit = useEventStore.getState().setEventForEdit;
    
    eventsService.getEventById(event.id).then((eventDetail) => {
      // Set the data in the store
      setEventForEdit(eventDetail);
      // Navigate to edit page with ID in URL path
      navigate(`/eventos/edit/${event.id}`, { state: { isEditing: true } });
    }).catch(error => {
      console.error(`Error fetching event data for editing:`, error);
      setNotification({
        open: true,
        message: `Error al obtener los datos del evento: ${error.message}`,
        severity: 'error'
      });
    });
  }

  const handleDeleteClick = (event, e) => {
    // Stop propagation to prevent triggering the row click
    if (e) e.stopPropagation();
    
    setEventToDelete(event)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setEventToDelete(null)
  }

  const handleDeleteConfirm = () => {
    if (!eventToDelete) return
    
    setDeleteDialogOpen(false)
    deleteMutation.mutate(eventToDelete.id)
  }

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  // Find the main image URL
  const getMainImageUrl = (item) => {
    // In the new API, just check if we have any images
    return item.imagenes && item.imagenes.length > 0 ? item.imagenes[0].url_lectura_segura : null;
  };

  // Mobile card view of an event with image background
  const EventCard = ({ item }) => {
    const theme = useTheme();
    const mainImageUrl = getMainImageUrl(item);
    
    return (
      <Box
        onClick={() => handleEventClick(item)}
        sx={{
          position: 'relative',
          height: 220,
          mb: 2,
          borderRadius: '4px',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            cursor: item.subeventos ? 'pointer' : 'default',
          }
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: mainImageUrl ? `url(${mainImageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
              zIndex: 1
            }
          }}
        />
        
        {/* If no image, show a colored background */}
        {!mainImageUrl && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'grey.200',
              zIndex: 0
            }}
          />
        )}
        
        {/* Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography 
              variant="h6" 
              component="h2" 
              gutterBottom 
              noWrap
              sx={{ color: mainImageUrl ? 'white' : 'text.primary', fontWeight: 500 }}
            >
              {item.titulo || 'Sin título'}
            </Typography>
          </Box>
          
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <EventIcon fontSize="small" sx={{ color: mainImageUrl ? 'white' : 'primary.main' }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  flex: 1, 
                  color: mainImageUrl ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary'
                }}
              >
                {formatDate(item.fecha_inicio)} - {formatDate(item.fecha_fin)}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ color: mainImageUrl ? 'white' : 'primary.main' }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: mainImageUrl ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary'
                }}
              >
                {item.ubicacion?.lugar || '-'}
              </Typography>
            </Stack>
            
            <Box 
              sx={{ 
                mt: 1.5, 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Chip 
                label={item.estado || 'Sin estado'}
                size="small"
                color={item.estado === 'Publicado' ? 'success' : 'info'}
                variant="outlined"
                sx={{
                  backgroundColor: mainImageUrl ? 'rgba(255, 255, 255, 0.2)' : undefined,
                  color: mainImageUrl ? 'white' : undefined,
                  borderColor: mainImageUrl ? 'rgba(255, 255, 255, 0.5)' : undefined
                }}
              />
              
              <IconButton 
                aria-label="Eliminar evento" 
                size="small" 
                sx={{ 
                  color: mainImageUrl ? 'white' : 'error.main',
                  backgroundColor: mainImageUrl ? 'rgba(255, 255, 255, 0.2)' : undefined,
                  '&:hover': {
                    backgroundColor: mainImageUrl ? 'rgba(255, 255, 255, 0.3)' : undefined
                  }
                }}
                onClick={(e) => handleDeleteClick(item, e)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ lg: { mt: 4}, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 2 
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 0, sm: 1.5 } }}>
          Eventos
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

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!isLoading && error && (
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {!isLoading && !error && (
        <>
          {/* Mobile view with cards */}
          {isMobile && (
            <Box sx={{ m: 0}}>
              {eventos.map((item, index) => (
                <EventCard 
                  key={item.id || `evento-${index}`}
                  item={item} 
                />
              ))}
              
              {eventos.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>No hay eventos disponibles</Typography>
                </Paper>
              )}
            </Box>
          )}
          
          {/* Desktop view with table */}
          {!isMobile && (
            <TableContainer 
              component={Paper} 
              sx={{ 
                // borderRadius: (theme) => theme.shape.borderRadius,
                overflow: 'hidden' 
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="25%">Evento</TableCell>
                    <TableCell>Fecha inicio</TableCell>
                    <TableCell>Fecha fin</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventos.map((item, index) => (
                    <TableRow 
                      key={item.id || `evento-${index}`} 
                      hover
                      onClick={() => handleEventClick(item)}
                      sx={{
                        cursor: item.subeventos ? 'pointer' : 'default'
                      }}
                    >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getMainImageUrl(item) ? (
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '4px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              backgroundColor: 'grey.100'
                            }}
                          >
                            <Box 
                              component="img"
                              src={getMainImageUrl(item)}
                              alt={item.titulo || 'Imagen del evento'}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                              flexShrink: 0
                            }}
                          >
                            <EventIcon color="action" />
                          </Box>
                        )}
                        <Typography variant="body1" noWrap sx={{ fontWeight: 500, maxWidth: 150 }}>
                          {item.titulo || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(item.fecha_inicio)}</TableCell>
                    <TableCell>{formatDate(item.fecha_fin)}</TableCell>
                    <TableCell>{item.ubicacion?.lugar || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.estado || 'Sin estado'}
                        size="small"
                        color={item.estado === 'Publicado' ? 'success' : 'info'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        aria-label="Eliminar evento" 
                        size="small" 
                        color="error"
                        onClick={(e) => handleDeleteClick(item, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {/* Solo mostrar botón de edición si NO es un evento padre (no tiene subeventos) */}
                      {!item.subeventos && (
                        <IconButton 
                          aria-label="Editar evento" 
                          size="small" 
                          color="primary"
                          onClick={(e) => handleEditClick(item, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                    </TableRow>
                  ))}
                  {eventos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay eventos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar el evento "{eventToDelete?.titulo}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default Eventos
