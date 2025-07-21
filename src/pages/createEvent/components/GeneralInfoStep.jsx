import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { userTypesService } from '../../../services/userTypesService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import {
  Box,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Button,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

const GeneralInfoStep = ({ formik }) => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Query to get user types with React Query
  const { data: userTypesData, isLoading, isError } = useQuery({
    queryKey: ['userTypes'],
    queryFn: userTypesService.getUserTypes,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  // Las mutaciones para subir imágenes se manejan en el componente FormWizard
  
  // Create an array of options for the select from the API data
  const userTypes = userTypesData || [];
  
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
      // Limit to 5 images total
      const totalImages = [...formik.values.generalInfo.images, ...files];
      const allowedFiles = totalImages.slice(0, 5);
      
      formik.setFieldValue('generalInfo.images', allowedFiles);
      
      // Create previews
      const newPreviews = allowedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      
      // Release previous URLs to avoid memory leaks
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      setImagePreviews(newPreviews);
    }
  };
  
  const removeImage = (index) => {
    const preview = imagePreviews[index];
    const newPreviews = [...imagePreviews];
    
    // Eliminar la vista previa del array
    newPreviews.splice(index, 1);
    
    if (preview.isExisting) {
      // Para imágenes existentes (URLs), actualizar el array imageUrls
      const newImageUrls = [...(formik.values.generalInfo.imageUrls || [])];
      const urlIndex = newImageUrls.indexOf(preview.url);
      if (urlIndex !== -1) {
        newImageUrls.splice(urlIndex, 1);
        formik.setFieldValue('generalInfo.imageUrls', newImageUrls);
      }
    } else {
      // Para nuevas imágenes (archivos), liberar la URL y actualizar el array images
      if (preview.file) {
        URL.revokeObjectURL(preview.url);
        
        // Buscar el índice en el array de imágenes original y eliminarlo
        const newImages = [...formik.values.generalInfo.images];
        // Identificamos el archivo por referencia
        const fileIndex = newImages.findIndex(file => file === preview.file);
        if (fileIndex !== -1) {
          newImages.splice(fileIndex, 1);
          formik.setFieldValue('generalInfo.images', newImages);
        }
      }
    }
    
    setImagePreviews(newPreviews);
  };
  
  // Create previews when component mounts
  useEffect(() => {
    // Primero limpiamos cualquier URL para evitar fugas de memoria
    imagePreviews.forEach(preview => {
      if (preview.file) { // Solo para archivos locales, no URLs existentes
        URL.revokeObjectURL(preview.url);
      }
    });
    
    // Inicializamos un array para las nuevas previsualizaciones
    let newPreviews = [];
    
    // Si hay imágenes cargadas desde el sistema de archivos (nuevas imágenes)
    if (formik.values.generalInfo.images?.length > 0) {
      const filePreviews = formik.values.generalInfo.images.map(file => ({
        file,
        url: URL.createObjectURL(file),
        isExisting: false
      }));
      newPreviews = [...newPreviews, ...filePreviews];
    }
    
    // Si hay URLs de imágenes existentes (modo edición)
    if (formik.values.generalInfo.imageUrls?.length > 0) {
      const urlPreviews = formik.values.generalInfo.imageUrls.map(url => ({
        url,
        isExisting: true
      }));
      newPreviews = [...newPreviews, ...urlPreviews];
    }
    
    // Actualizar el estado con todas las previsualizaciones
    setImagePreviews(newPreviews);
    
    // Limpieza al desmontar
    return () => {
      newPreviews.forEach(preview => {
        if (preview.file) { // Solo para archivos locales
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [formik.values.generalInfo.images, formik.values.generalInfo.imageUrls]);
  
  // Renderizar opciones del dropdown de tipos de usuario
  const renderUserTypeOptions = () => {
    if (isLoading) {
      return <MenuItem disabled>Cargando tipos de usuario...</MenuItem>;
    }
    
    if (isError) {
      return <MenuItem disabled>Error al cargar los datos</MenuItem>;
    }
    
    if (userTypes.length === 0) {
      return <MenuItem disabled>No hay tipos de usuario disponibles</MenuItem>;
    }
    
    return userTypes.map((option) => (
      <MenuItem key={option.id} value={option.id.toString()}>
        {option.nombre}
      </MenuItem>
    ));
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Typography variant="h6" gutterBottom>
        Información General
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="generalInfo.title"
            name="generalInfo.title"
            label="Título del Evento"
            value={formik.values.generalInfo.title}
            onChange={formik.handleChange}
            error={formik.touched.generalInfo?.title && Boolean(formik.errors.generalInfo?.title)}
            helperText={formik.touched.generalInfo?.title && formik.errors.generalInfo?.title}
            margin="normal"
          />
        </Grid>
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha de Inicio"
              value={formik.values.generalInfo.startDate ? new Date(formik.values.generalInfo.startDate) : null}
              onChange={(date) => formik.setFieldValue('generalInfo.startDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  error: formik.touched.generalInfo?.startDate && Boolean(formik.errors.generalInfo?.startDate),
                  helperText: formik.touched.generalInfo?.startDate && formik.errors.generalInfo?.startDate
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha de Fin"
              value={formik.values.generalInfo.endDate ? new Date(formik.values.generalInfo.endDate) : null}
              onChange={(date) => formik.setFieldValue('generalInfo.endDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  error: formik.touched.generalInfo?.endDate && Boolean(formik.errors.generalInfo?.endDate),
                  helperText: formik.touched.generalInfo?.endDate && formik.errors.generalInfo?.endDate
                }
              }}
            />
          </Grid>
        </LocalizationProvider>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="generalInfo.description"
            name="generalInfo.description"
            label="Descripción"
            multiline
            rows={4}
            value={formik.values.generalInfo.description}
            onChange={formik.handleChange}
            error={formik.touched.generalInfo?.description && Boolean(formik.errors.generalInfo?.description)}
            helperText={formik.touched.generalInfo?.description && formik.errors.generalInfo?.description}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            id="generalInfo.userType"
            name="generalInfo.userType"
            label="Tipo de Usuario"
            value={formik.values.generalInfo.userType}
            onChange={formik.handleChange}
            error={formik.touched.generalInfo?.userType && Boolean(formik.errors.generalInfo?.userType)}
            helperText={formik.touched.generalInfo?.userType && formik.errors.generalInfo?.userType}
            margin="normal"
            disabled={isLoading}
            SelectProps={{
              multiple: true,
              value: formik.values.generalInfo.userType ? formik.values.generalInfo.userType.split(',').filter(id => id !== '') : [],
              onChange: (e) => {
                const value = e.target.value.join(',');
                formik.setFieldValue('generalInfo.userType', value);
              },
              renderValue: (selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const userType = userTypes.find(type => type.id.toString() === value);
                    return (
                      <Chip 
                        key={value} 
                        label={userType ? userType.nombre : value} 
                        size="small" 
                      />
                    );
                  })}
                </Box>
              ),
            }}
          >
            {renderUserTypeOptions()}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Imágenes del Evento ({imagePreviews.length}/5)
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: theme.spacing(1)
          }}>
            <Button
              variant="contained"
              component="label"
              fullWidth={isMobile}
              disabled={formik.values.generalInfo.images.length >= 5}
            >
              Seleccionar Imágenes
              <input
                hidden
                accept="image/*"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>
          {formik.touched.generalInfo?.images && formik.errors.generalInfo?.images && 
            // Solo mostrar el error si no hay imágenes preexistentes
            !(formik.values.generalInfo.imageUrls && formik.values.generalInfo.imageUrls.length > 0) && (
            <Typography color="error" variant="caption" display="block">
              {formik.errors.generalInfo.images}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {imagePreviews.map((preview, index) => (
              <Box
                key={`image-preview-${index}-${preview.isExisting ? preview.url : preview.file.name}`}
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  '&:hover .actionIcons': {
                    opacity: 1,
                  },
                }}
              >
                <img
                  src={preview.url}
                  alt={`Preview ${index}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <Box 
                  className="actionIcons"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    display: 'flex',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => removeImage(index)}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

GeneralInfoStep.propTypes = {
  formik: PropTypes.shape({
    values: PropTypes.shape({
      generalInfo: PropTypes.shape({
        title: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        description: PropTypes.string,
        images: PropTypes.array,
        userType: PropTypes.string
      })
    }),
    touched: PropTypes.shape({
      generalInfo: PropTypes.shape({
        title: PropTypes.bool,
        startDate: PropTypes.bool,
        endDate: PropTypes.bool,
        description: PropTypes.bool,
        images: PropTypes.bool,
        userType: PropTypes.bool
      })
    }),
    errors: PropTypes.shape({
      generalInfo: PropTypes.shape({
        title: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        description: PropTypes.string,
        images: PropTypes.string,
        userType: PropTypes.string
      })
    }),
    handleChange: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired
  }).isRequired
};

export default GeneralInfoStep;
