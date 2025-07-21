import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  IconButton,
  Button,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip
} from '@mui/material';
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import userTypesService from '../../../services/userTypesService';

// Styled components for image upload
const UploadBox = styled(Box)(({ theme }) => ({
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

// Styled component for the images previewed
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

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}));

// Hidden input for file uploads
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StepOne = ({ formik }) => {
  // Query to fetch user types from the API
  const { data: userTypes = [] } = useQuery({
    queryKey: ['userTypes'],
    queryFn: () => userTypesService.getUserTypes(),
    refetchOnWindowFocus: false,
  });

  // Generate image previews from formik.values.imagenes
  const getImagePreviews = () => {
    if (!formik.values.imagenes || !Array.isArray(formik.values.imagenes)) {
      return [];
    }
    
    // Map all elements of formik.values.imagenes to preview objects
    return formik.values.imagenes.map(img => {
      // If it's an existing image (with url_lectura_segura)
      if (typeof img === 'object' && img.url_lectura_segura) {
        return {
          isExisting: true,
          id: img.id,
          url: img.url_lectura_segura
        };
      }
      // If it's a File object
      else if (img instanceof File) {
        return {
          isExisting: false,
          file: img,
          url: URL.createObjectURL(img)
        };
      }
      return null;
    }).filter(Boolean); // Filter out null values
  };

  // Handle image upload
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Check image limit (maximum 5)
    const currentImages = formik.values.imagenes || [];
    if (currentImages.length + files.length > 5) {
      formik.setFieldError('imagenes', 'No se permiten más de 5 imágenes');
      return;
    }
    
    // Update formik - concatenate new files with existing ones
    const updatedImages = [...currentImages, ...files];
    formik.setFieldValue('imagenes', updatedImages);
  };

  // Remove an image
  const handleRemoveImage = (index) => {
    // Get current previews
    const imagePreviews = getImagePreviews();
    const previewToRemove = imagePreviews[index];
    
    // Get a copy of the current image array
    const updatedImages = [...formik.values.imagenes];
    
    if (!previewToRemove.isExisting) {
      // If it's a new image (File), find it by name and size
      const fileIndex = updatedImages.findIndex(img => img instanceof File && 
        img.name === previewToRemove.file.name && 
        img.size === previewToRemove.file.size
      );
      
      if (fileIndex !== -1) {
        // Release URL object to prevent memory leaks
        URL.revokeObjectURL(previewToRemove.url);
        
        // Remove from array
        updatedImages.splice(fileIndex, 1);
        formik.setFieldValue('imagenes', updatedImages);
      }
    } else {
      // If it's an existing image, find it by ID
      const existingIndex = updatedImages.findIndex(img => 
        typeof img === 'object' && img.id === previewToRemove.id
      );
      
      if (existingIndex !== -1) {
        updatedImages.splice(existingIndex, 1);
        formik.setFieldValue('imagenes', updatedImages);
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Información General del Subevento
      </Typography>
      
      <Grid container spacing={3}>
        {/* Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="titulo"
            name="titulo"
            label="Título"
            value={formik.values.titulo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.titulo && Boolean(formik.errors.titulo)}
            helperText={formik.touched.titulo && formik.errors.titulo}
            variant="outlined"
          />
        </Grid>
        
        {/* Start Date */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de inicio"
              value={formik.values.fecha_inicio ? new Date(formik.values.fecha_inicio) : null}
              onChange={(newValue) => {
                formik.setFieldValue('fecha_inicio', newValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  error: formik.touched.fecha_inicio && Boolean(formik.errors.fecha_inicio),
                  helperText: formik.touched.fecha_inicio && formik.errors.fecha_inicio,
                  onBlur: () => formik.setFieldTouched('fecha_inicio', true)
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        {/* End Date */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de fin"
              value={formik.values.fecha_fin ? new Date(formik.values.fecha_fin) : null}
              onChange={(newValue) => {
                formik.setFieldValue('fecha_fin', newValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  error: formik.touched.fecha_fin && Boolean(formik.errors.fecha_fin),
                  helperText: formik.touched.fecha_fin && formik.errors.fecha_fin,
                  onBlur: () => formik.setFieldTouched('fecha_fin', true)
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="descripcion"
            name="descripcion"
            label="Descripción"
            multiline
            rows={4}
            value={formik.values.descripcion}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
            helperText={formik.touched.descripcion && formik.errors.descripcion}
            variant="outlined"
          />
        </Grid>
        
        {/* User Types */}
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="tipo-usuario-label">Tipos de usuario</InputLabel>
            <Select
              labelId="tipo-usuario-label"
              id="tipo_usuario"
              multiple
              value={formik.values.tipo_usuario}
              onChange={(e) => formik.setFieldValue('tipo_usuario', e.target.value)}
              input={<OutlinedInput label="Tipos de usuario" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    // Check if value is an object or a primitive
                    const valueId = typeof value === 'object' && value !== null ? value.id : value;
                    // Find the user type by ID
                    const userType = userTypes.find(type => type.id === valueId);
                    // Use nombre from userType, or from value object, or stringified value as fallback
                    const displayLabel = userType?.nombre || (typeof value === 'object' && value?.nombre) || String(valueId);
                    return (
                      <Chip key={valueId} label={displayLabel} />
                    );
                  })}
                </Box>
              )}
            >
              {userTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Image Upload */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Imágenes (mínimo 1, máximo 5)
          </Typography>
          
          <UploadBox
            sx={{
              mb: 2,
              borderColor: formik.touched.imagenes && Boolean(formik.errors.imagenes) 
                ? 'error.main' 
                : 'inherit'
            }}
          >
            <Button
              component="label"
              variant="text"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 1 }}
            >
              Seleccionar imágenes
              <VisuallyHiddenInput 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                disabled={formik.values.imagenes.length >= 5}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {formik.values.imagenes.length === 0 
                ? 'Ninguna imagen seleccionada' 
                : `${formik.values.imagenes.length}/5 imágenes seleccionadas`}
            </Typography>
            {formik.touched.imagenes && formik.errors.imagenes && (
              <FormHelperText error>{formik.errors.imagenes}</FormHelperText>
            )}
          </UploadBox>
          
          {/* Image Preview */}
          {getImagePreviews().length > 0 && (
            <Grid container spacing={2}>
              {getImagePreviews().map((preview, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <ImagePreview>
                    <img src={preview.url} alt={`Vista previa ${index + 1}`} />
                    <DeleteButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleRemoveImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </DeleteButton>
                  </ImagePreview>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StepOne;
