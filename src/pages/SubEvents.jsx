import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useMediaQuery,
  useTheme,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format } from 'date-fns';
import eventsService from '../services/eventsService';
import ParentEventForm from './subevents/ParentEventForm';

const SubEvents = () => {
  const { id: parentId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  // Estados para diálogos y acciones
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subeventToDelete, setSubeventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch parent event
  const {
    data: parentEvent,
    isLoading: parentLoading,
    error: parentError
  } = useQuery({
    queryKey: ['evento', parentId],
    queryFn: () => eventsService.getEventById(parentId),
    enabled: !!parentId,
    refetchOnWindowFocus: false,
  });

  // Fetch subevents
  const {
    data: subevents = [],
    isLoading: subeventsLoading,
    error: subeventsError
  } = useQuery({
    queryKey: ['subeventos', parentId],
    queryFn: () => eventsService.getSubevents(parentId),
    enabled: !!parentId,
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return '-';
    }
  };

  const handleBack = () => {
    navigate('/eventos');
  };

  // Find the main image URL
  const getMainImageUrl = (item) => {
    return item?.imagenes && item.imagenes.length > 0 ? item.imagenes[0].url_lectura_segura : null;
  };

  // Mobile card view for a subevent
  const SubEventCard = ({ item }) => {
    const mainImageUrl = getMainImageUrl(item);

    return (
      <Box
        onClick={() => handleEditSubevent(item.id)}
        sx={{
          position: 'relative',
          height: 220,
          mb: 2,
          borderRadius: '4px',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
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
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid item>
                <EventIcon fontSize="small" sx={{ color: mainImageUrl ? 'white' : 'primary.main' }} />
              </Grid>
              <Grid item xs>
                <Typography
                  variant="body2"
                  sx={{ color: mainImageUrl ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary' }}
                >
                  {formatDate(item.fecha_inicio)} - {formatDate(item.fecha_fin)}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid item>
                <LocationOnIcon fontSize="small" sx={{ color: mainImageUrl ? 'white' : 'primary.main' }} />
              </Grid>
              <Grid item xs>
                <Typography
                  variant="body2"
                  sx={{ color: mainImageUrl ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary' }}
                >
                  {item.ubicacion?.lugar || '-'}
                </Typography>
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSubevent(item.id);
                  }}
                  sx={{
                    backgroundColor: mainImageUrl ? 'rgba(255, 255, 255, 0.3)' : undefined,
                    color: mainImageUrl ? 'white' : 'primary.main',
                    '&:hover': {
                      backgroundColor: mainImageUrl ? 'rgba(255, 255, 255, 0.5)' : undefined,
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const isLoading = parentLoading || subeventsLoading;
  const hasError = parentError || subeventsError;
  const errorMessage = parentError?.message || subeventsError?.message || 'Error al cargar los datos';

  const handleCreateSubevent = () => {
    navigate(`/eventos/${parentId}/subeventos/crear`);
  };

const handleEditSubevent = (subeventId) => {
  navigate(`/eventos/${parentId}/subeventos/edit/${subeventId}`);
};

// Funciones para eliminar subevento
const handleDeleteClick = (e, id) => {
  e.stopPropagation(); // Evitar que se active la fila completa
  setSubeventToDelete(id);
  setDeleteDialogOpen(true);
};

const handlePublishEvent = async () => {
  if (!parentId) return;
  
  setIsPublishing(true);
  try {
    // Si el evento ya está publicado, pasamos a borrador (estado 0)
    // Si está en borrador, lo pasamos a publicado (estado 1)
    const nuevoEstado = parentEvent?.estado === 'Publicado' ? 0 : 1;
    await eventsService.updateEventStatus(parentId, nuevoEstado);
    // Refrescar los datos del evento principal y subeventos
    queryClient.invalidateQueries(['evento', parentId]);
    queryClient.invalidateQueries(['subeventos', parentId]);
  } catch (error) {
    console.error(`Error al cambiar estado del evento: ${parentEvent?.estado === 'Publicado' ? 'pasar a borrador' : 'publicar'}`, error);
  } finally {
    setIsPublishing(false);
  }
};

const handleDeleteConfirm = async () => {
  if (!subeventToDelete) return;

  setIsDeleting(true);
  try {
    await eventsService.deleteSubevent(subeventToDelete);
    queryClient.invalidateQueries(['subevents', parentId]);
    setDeleteDialogOpen(false);
    setSubeventToDelete(null);
  } catch (error) {
    console.error('Error al eliminar el subevento:', error);
  } finally {
    setIsDeleting(false);
  }
};

const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSubeventToDelete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      {/* Header with back button */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: { xs: 0, sm: 2 } }}
        >
          Volver
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            flexGrow: 1,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          {parentLoading ? 'Cargando...' : parentEvent?.titulo || 'Subeventos'}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateSubevent}
        >
          Crear Subevento
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && hasError && (
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{errorMessage}</Typography>
        </Paper>
      )}

      {!isLoading && !hasError && parentEvent && (
        <>
          {/* Parent Event Form */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                variant="contained"
                color={parentEvent.estado === 'Publicado' ? "warning" : "primary"}
                onClick={handlePublishEvent}
                disabled={isPublishing}
                size="small"
                sx={{ mr: 1 }}
              >
                {isPublishing ? 'Procesando...' : parentEvent.estado === 'Publicado' ? 'Pasar a borrador' : 'Publicar'}
              </Button>
              {/* <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/eventos/edit/${parentId}`)}
                size="small"
              >
                Editar Evento Principal
              </Button> */}
            </Box>
            <ParentEventForm event={parentEvent} />
          </Box>

          {/* Subevents List Section */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Subeventos
          </Typography>

          {/* Mobile view with cards */}
          {isMobile && (
            <Box sx={{ m: 0 }}>
              {subevents.map((item, index) => (
                <Box key={item.id || `subevento-${index}`} sx={{ position: 'relative' }}>
                  <SubEventCard item={item} />
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => handleEditSubevent(item.id)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => handleDeleteClick(e, item.id)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}

              {subevents.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>No hay subeventos disponibles</Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Desktop view with table */}
          {!isMobile && (
            <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="30%">Subevento</TableCell>
                    <TableCell>Fecha inicio</TableCell>
                    <TableCell>Fecha fin</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subevents.map((item, index) => (
                    <TableRow
                      key={item.id || `subevento-${index}`}
                      hover
                      onClick={() => handleEditSubevent(item.id)}
                      sx={{ cursor: 'pointer' }}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={item.estado || 'Sin estado'}
                            size="small"
                            color={item.estado === 'Publicado' ? 'success' : 'info'}
                            variant="outlined"
                          />
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSubevent(item.id);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => handleDeleteClick(e, item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subevents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay subeventos disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Dialog de confirmación para eliminar subevento */}
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
            ¿Estás seguro de que quieres eliminar este subevento? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>Cancelar</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubEvents;
