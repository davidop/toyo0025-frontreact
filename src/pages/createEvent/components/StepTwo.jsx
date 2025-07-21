import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Autocomplete,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import userTypesService from '../../../services/userTypesService';
import { useQuery } from '@tanstack/react-query';

// Componente estilizado para las imágenes solo lectura
const ImagePreviewReadOnly = styled(Paper)(({ theme }) => ({
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

const StepTwo = ({ formik }) => {
  const theme = useTheme();
  
  // Consulta para obtener tipos de usuario
  const { data: userTypes, isLoading, error } = useQuery({
    queryKey: ['userTypes'],
    queryFn: userTypesService.getUserTypes,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Cuando se cargan los tipos de usuario y no hay tipos seleccionados aún, inicializar como array vacío
  useEffect(() => {
    if (!formik.values.tipos_usuarios) {
      formik.setFieldValue('tipos_usuarios', []);
    }
  }, [userTypes, formik]);

  // Extraer las URL de imágenes existentes para mostrarlas
  const existingImageUrls = formik.values.imagenes
    .filter(img => typeof img === 'object' && img.url_lectura_segura)
    .map(img => img.url_lectura_segura);

  // Crear URLs para archivos de imagen nuevos
  const newImageUrls = formik.values.imagenes
    .filter(img => img instanceof File)
    .map(file => URL.createObjectURL(file));
    
  // Combinar ambas URLs para mostrar
  const allImageUrls = [...existingImageUrls, ...newImageUrls];
  
  // Limpiar URLs creadas al desmontar componente
  useEffect(() => {
    return () => {
      newImageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImageUrls]);

  // Manejar cambio en selección de tipos de usuario
  const handleUserTypesChange = (_event, newValue) => {
    formik.setFieldValue('tipos_usuarios', newValue);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Configuración Adicional
      </Typography>
      
      {/* Mostrar información del paso 1 en modo solo lectura */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Información del Evento (Solo Lectura)
        </Typography>
        
        {/* Título */}
        <TextField
          fullWidth
          label="Título"
          value={formik.values.titulo}
          disabled
          margin="normal"
        />
        
        {/* Descripción */}
        <TextField
          fullWidth
          label="Descripción"
          value={formik.values.descripcion}
          disabled
          margin="normal"
          multiline
          rows={4}
        />
        
        {/* Imágenes solo lectura */}
        {allImageUrls.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Imágenes seleccionadas:
            </Typography>
            <Grid container spacing={2}>
              {allImageUrls.map((url, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <ImagePreviewReadOnly>
                    <img src={url} alt={`Imagen ${index + 1}`} />
                  </ImagePreviewReadOnly>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
      
      {/* Selector de tipos de usuario */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Tipos de Usuario
        </Typography>
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">
            Error al cargar tipos de usuario: {error.message}
          </Typography>
        ) : (
          <Autocomplete
            multiple
            id="tipos_usuarios"
            options={userTypes || []}
            value={formik.values.tipos_usuarios || []}
            onChange={handleUserTypesChange}
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option.nombre}
                  {...getTagProps({ index })}
                  key={option.id}
                  color="primary"
                  variant="outlined"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecciona tipos de usuario"
                placeholder="Tipos de usuario"
                helperText="Selecciona uno o más tipos de usuario que pueden participar en este evento"
                error={formik.touched.tipos_usuarios && Boolean(formik.errors.tipos_usuarios)}
              />
            )}
          />
        )}
      </Box>
    </Box>
  );
};

export default StepTwo;
