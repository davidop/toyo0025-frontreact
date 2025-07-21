import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Grid, 
  CircularProgress, 
  Alert,
  Card,
  CardMedia,
  useMediaQuery,
  useTheme,
  IconButton,
  Divider
} from '@mui/material'
import { 
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import homeService from '../services/homeService'
import { styled } from '@mui/system'

// Estilos para el input de archivos oculto
const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`

const PreviewImage = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
}))

const Home = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const queryClient = useQueryClient()

  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    descripcion: '',
    imagen: null,
    faq: null,
    imagenUrl: '',
    faqUrl: ''
  })

  // Estado para previsualizaciones
  const [previews, setPreviews] = useState({
    imagen: '',
    faq: ''
  })

  // Estado para guardar el nombre del archivo FAQ original
  const [faqFileName, setFaqFileName] = useState('')

  // Función para obtener el nombre del archivo desde una URL
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    
    // Primero eliminar los parámetros de consulta (todo lo que sigue a '?')
    const urlWithoutQuery = url.split('?')[0];
    
    // Extraer el nombre del archivo de la URL limpia
    const parts = urlWithoutQuery.split('/');
    const fileName = parts[parts.length - 1] || '';
    
    // Decodificar posibles caracteres de URL
    return decodeURIComponent(fileName);
  }

  // Query para obtener los datos actuales del home
  const { data: homeData, isLoading, isError, error } = useQuery({
    queryKey: ['homeContent'],
    queryFn: homeService.getHomeContent,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // UseEffect para cargar los datos cuando estén disponibles
  useEffect(() => {
    if (homeData) {
      setFormData({
        descripcion: homeData.descripcion || '',
        imagen: null,
        faq: null,
        imagenUrl: homeData.url_lectura_segura_imagen || '',
        faqUrl: homeData.url_lectura_segura_faq_doc || ''
      })
      
      // Extraer el nombre del archivo FAQ de la URL
      if (homeData.url_lectura_segura_faq_doc) {
        setFaqFileName(getFileNameFromUrl(homeData.url_lectura_segura_faq_doc));
      }
    }
  }, [homeData])

  // No necesitamos mutaciones separadas para subir archivos

  // Mutación para actualizar el contenido del home
  const updateHomeMutation = useMutation({
    mutationFn: (data) => homeService.updateHomeContent(data),
    onSuccess: (updatedData) => {
      // Actualizar la caché de React Query directamente sin forzar un refetch
      queryClient.setQueryData(['homeContent'], (oldData) => {
        return updatedData || oldData;
      });
      
      // Actualizar el estado local con los datos actualizados
      setFormData(prev => ({
        ...prev,
        imagen: null,
        faq: null,
        // Mantener las URLs actualizadas del servidor si están disponibles
        imagenUrl: updatedData?.url_lectura_segura_imagen || prev.imagenUrl,
        faqUrl: updatedData?.url_lectura_segura_faq_doc || prev.faqUrl
      }));
      
      // Actualizar el nombre del archivo PDF si hay una nueva URL
      if (updatedData?.url_lectura_segura_faq_doc) {
        setFaqFileName(getFileNameFromUrl(updatedData.url_lectura_segura_faq_doc));
      }
      
      // Limpiar las previsualizaciones
      setPreviews({
        imagen: '',
        faq: ''
      });
    }
  })

  // Manejador para cambios en el campo de descripción
  const handleDescriptionChange = (e) => {
    setFormData({
      ...formData,
      descripcion: e.target.value
    })
  }

  // Manejador para cambios en el campo de imagen
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        imagen: file
      })
      
      // Crear URL para previsualizar la imagen
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviews({
          ...previews,
          imagen: fileReader.result
        })
      }
      fileReader.readAsDataURL(file)
    }
  }

  // Manejador para cambios en el campo de PDF
  const handlePdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        faq: file
      })
      
      // Almacenar el nombre del archivo para mostrarlo
      setPreviews({
        ...previews,
        faq: file.name
      })
    }
  }

  // Manejador para limpiar la imagen
  const handleClearImage = () => {
    setFormData({
      ...formData,
      imagen: null,
      imagenUrl: ''
    })
    setPreviews({
      ...previews,
      imagen: ''
    })
  }

  // Manejador para limpiar el PDF
  const handleClearPdf = () => {
    setFormData({
      ...formData,
      faq: null,
      faqUrl: ''
    })
    setPreviews({
      ...previews,
      faq: ''
    })
    setFaqFileName('');
  }

  // Manejador para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Enviamos los archivos directamente al PATCH /Home
    updateHomeMutation.mutate(formData)
  }
  
  // Renderizado de la interfaz
  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
      {/* Título y descripción */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuración de Página de Inicio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personalice el contenido que se mostrará en la página de inicio de la app móvil.
        </Typography>
        <Divider sx={{ mt: 2, mb: 4 }} />
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los datos: {error?.message || 'Ocurrió un error inesperado'}
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Sección de carga de imagen */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{
                  p: { xs: 2, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                elevation={isMobile ? 0 : 2}
              >
                <Typography variant="h6" gutterBottom>
                  Imagen de portada
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Seleccione una imagen que se mostrará en la pantalla de inicio de la app.
                </Typography>

                {/* Botón de carga */}
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2, alignSelf: 'flex-start' }}
                >
                  Seleccionar Imagen
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>

                {/* Previsualización de imagen */}
                {(previews.imagen || formData.imagenUrl) && (
                  <PreviewImage>
                    <CardMedia
                      component="img"
                      image={previews.imagen || formData.imagenUrl}
                      alt="Imagen de portada"
                      sx={{ height: 200, objectFit: 'contain' }}
                    />
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <IconButton 
                        size="small" 
                        onClick={handleClearImage}
                        sx={{ bgcolor: 'rgba(255,255,255,0.7)' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </PreviewImage>
                )}


              </Paper>
            </Grid>

            {/* Sección de PDF de FAQ */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{
                  p: { xs: 2, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                elevation={isMobile ? 0 : 2}
              >
                <Typography variant="h6" gutterBottom>
                  Documento de FAQ / Contacto
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Seleccione un documento PDF con la información de preguntas frecuentes o contacto.
                </Typography>

                {/* Botón de carga */}
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<PdfIcon />}
                  sx={{ mt: 2, alignSelf: 'flex-start' }}
                >
                  Seleccionar PDF
                  <VisuallyHiddenInput
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                  />
                </Button>

                {/* Previsualización o info del PDF */}
                {(previews.faq || formData.faqUrl) && (
                  <Box 
                    sx={{
                      mt: 2,
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      sx={{ 
                        maxWidth: '100%',
                        overflow: 'hidden'
                      }}
                    >
                      <PdfIcon color="primary" sx={{ mr: 1, flexShrink: 0 }} />
                      <Typography 
                        noWrap 
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}
                      >
                        {previews.faq || faqFileName || 'Sin documento'}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClearPdf}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}


              </Paper>
            </Grid>

            {/* Sección de descripción */}
            <Grid item xs={12}>
              <Paper 
                sx={{ p: { xs: 2, md: 3 } }}
                elevation={isMobile ? 0 : 2}
              >
                <Typography variant="h6" gutterBottom>
                  Descripción
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Ingrese un texto descriptivo para la página de inicio.
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={handleDescriptionChange}
                  variant="outlined"
                />
              </Paper>
            </Grid>

            {/* Botón de guardar */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={updateHomeMutation.isPending}
                fullWidth={isMobile}
                size="large"
                sx={{ px: 4, py: 1 }}
              >
                {updateHomeMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Grid>
          </Grid>

          {/* Mensajes de estado */}
          {updateHomeMutation.isError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              Error al actualizar: {updateHomeMutation.error?.message || 'Ocurrió un error inesperado'}
            </Alert>
          )}

          {updateHomeMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Contenido actualizado correctamente.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Home
