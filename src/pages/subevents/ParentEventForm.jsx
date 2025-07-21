import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import eventsService from '../../services/eventsService';

// Styled component for the image preview area
const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 150,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginBottom: theme.spacing(1),
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const ParentEventForm = ({ event }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  
  // Estado para las nuevas imágenes seleccionadas
  const [selectedImages, setSelectedImages] = useState([]);
  // Estado para las alertas
  const [alertState, setAlertState] = useState({ show: false, message: '', type: 'success' });
  // Estado para detectar si hay cambios en el formulario
  const [hasChanges, setHasChanges] = useState(false);
  
  // Valores del formulario
  const [formValues, setFormValues] = useState({
    titulo: event?.titulo || '',
    descripcion: event?.descripcion || '',
    imagenes: [...(event?.imagenes || [])]
  });
  
  // Efecto para detectar cambios en el formulario
  useEffect(() => {
    // Comparar valores actuales con valores originales
    const tituloDiferente = formValues.titulo !== event?.titulo;
    const descripcionDiferente = formValues.descripcion !== event?.descripcion;
    const imagenesDiferentes = formValues.imagenes.length !== (event?.imagenes?.length || 0);
    const hayImagenesNuevas = selectedImages.length > 0;
    
    setHasChanges(tituloDiferente || descripcionDiferente || imagenesDiferentes || hayImagenesNuevas);
  }, [formValues, selectedImages, event]);
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return '-';
    }
  };
  
  // Get images to display
  const getEventImages = () => {
    if (!event?.imagenes || !Array.isArray(event.imagenes)) {
      return [];
    }
    
    // Map to image preview objects
    return event.imagenes.map(img => ({
      id: img.id,
      url: img.url_lectura_segura
    }));
  };

  const images = getEventImages();
  
  // Mutation para actualizar evento padre
  const updateMutation = useMutation({
    mutationFn: (data) => eventsService.updateParentEvent(event.id, data),
    onSuccess: () => {
      // Invalidar consultas para refrescar datos
      queryClient.invalidateQueries(['event', event.id]);
      setSelectedImages([]);
      setHasChanges(false);
      setAlertState({ show: true, message: 'Evento actualizado correctamente', type: 'success' });
      
      // Ocultar alerta después de 5 segundos
      setTimeout(() => {
        setAlertState(prev => ({ ...prev, show: false }));
      }, 5000);
    },
    onError: (error) => {
      console.error('Error al actualizar el evento:', error);
      setAlertState({ 
        show: true, 
        message: `Error al actualizar el evento: ${error?.message || 'Ocurrió un error inesperado'}`, 
        type: 'error' 
      });
      
      // Ocultar alerta después de 5 segundos
      setTimeout(() => {
        setAlertState(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  });
  
  // Manejador para cambiar valores del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejador para subir imágenes
  const handleImageUpload = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
    }
  };
  
  // Manejador para eliminar imágenes nuevas seleccionadas
  const handleRemoveSelectedImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };
  
  // Manejador para eliminar imágenes existentes
  const handleRemoveExistingImage = (index) => {
    const newImages = [...formValues.imagenes];
    newImages.splice(index, 1);
    setFormValues(prev => ({ ...prev, imagenes: newImages }));
  };
  
  // Restablecer el formulario a los valores originales
  const resetForm = () => {
    setFormValues({
      titulo: event?.titulo || '',
      descripcion: event?.descripcion || '',
      imagenes: [...(event?.imagenes || [])]
    });
    setSelectedImages([]);
    setHasChanges(false);
  };
  
  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar datos para enviar
    const updateData = {
      titulo: formValues.titulo,
      descripcion: formValues.descripcion,
      imagenes: formValues.imagenes,
      imagenesUpload: selectedImages
    };
    
    updateMutation.mutate(updateData);
  };
  
  return (
    <Card>
      <CardHeader 
        title="Información del evento principal"
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 1.5
        }}
      />
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Alertas de éxito o error */}
        {alertState.show && (
          <Alert severity={alertState.type} sx={{ mb: 2 }}>
            {alertState.message}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Info Section */}
            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                {/* Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    name="titulo"
                    value={formValues.titulo}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                
                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="descripcion"
                    value={formValues.descripcion}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Grid>
              
              {/* Dates */}
              {/* <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha inicio"
                  value={formatDate(event?.fecha_inicio)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid> */}
              
              {/* <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha fin"
                  value={formatDate(event?.fecha_fin)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid> */}
              
                {/* Status */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Estado
                  </Typography>
                  <Chip 
                    label={event?.estado || 'Sin estado'}
                    size="small"
                    color={event?.estado === 'Publicado' ? 'success' : 'info'}
                  />
                </Grid>
                
                {/* Botón guardar (visible solo cuando hay cambios) */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {hasChanges && (
                      <Button
                        onClick={resetForm}
                        variant="outlined"
                        color="secondary"
                        disabled={updateMutation.isLoading}
                      >
                        Cancelar
                      </Button>
                    )}
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={updateMutation.isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={!hasChanges || updateMutation.isLoading}
                    >
                      {updateMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Box>
                </Grid>
              
              {/* Location */}
              {/* <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  value={event?.ubicacion?.lugar || '-'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid> */}
            </Grid>
          </Grid>
          
            {/* Images Section */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Imágenes
                </Typography>
                <Button
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  size="small"
                  disabled={updateMutation.isLoading}
                >
                  Añadir imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>
              
              {/* Imágenes existentes */}
              {formValues.imagenes.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {formValues.imagenes.map((image, index) => {
                    const imageUrl = typeof image.url_lectura_segura === 'string' 
                      ? image.url_lectura_segura 
                      : (image.url_lectura_segura?.url || image.url);
                    return (
                      <Grid item xs={6} key={image.id || index}>
                        <Box sx={{ position: 'relative' }}>
                          <ImagePreview>
                            <img src={imageUrl} alt={`Imagen ${index + 1}`} />
                          </ImagePreview>
                          <IconButton 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4,
                              bgcolor: 'rgba(255,255,255,0.7)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
                            }}
                            onClick={() => handleRemoveExistingImage(index)}
                            disabled={updateMutation.isLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
              
              {/* Nuevas imágenes seleccionadas */}
              {selectedImages.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Nuevas imágenes seleccionadas
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedImages.map((file, index) => (
                      <Grid item xs={6} key={`new-${index}`}>
                        <Box sx={{ position: 'relative' }}>
                          <ImagePreview>
                            <img src={URL.createObjectURL(file)} alt={`Nueva imagen ${index + 1}`} />
                          </ImagePreview>
                          <IconButton 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4,
                              bgcolor: 'rgba(255,255,255,0.7)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
                            }}
                            onClick={() => handleRemoveSelectedImage(index)}
                            disabled={updateMutation.isLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              
              {/* Mensaje cuando no hay imágenes */}
              {formValues.imagenes.length === 0 && selectedImages.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hay imágenes disponibles
                </Typography>
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default ParentEventForm;
