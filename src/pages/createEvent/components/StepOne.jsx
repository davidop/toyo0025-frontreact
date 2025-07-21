import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  FormHelperText,
  Button,
  Grid,
  IconButton
} from '@mui/material';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

// Componente estilizado para la carga de imágenes
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

// Componente estilizado para las imágenes previsualizadas
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

// Input oculto para la carga de archivos
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

const StepOne = ({ formik, isEditing }) => {
  // No usaremos más un estado local separado para las previews
  // sino que las generaremos directamente desde formik.values.imagenes
  
  // Generar previsualizaciones a partir de formik.values.imagenes
  const getImagePreviews = () => {
    if (!formik.values.imagenes || !Array.isArray(formik.values.imagenes)) {
      return [];
    }
    
    // Mapear todos los elementos de formik.values.imagenes a objetos de previsualización
    return formik.values.imagenes.map(img => {
      // Si es una imagen existente (con url_lectura_segura)
      if (typeof img === 'object' && img.url_lectura_segura) {
        return {
          isExisting: true,
          id: img.id,
          url: img.url_lectura_segura
        };
      }
      // Si es un archivo de File API
      else if (img instanceof File) {
        return {
          isExisting: false,
          file: img,
          url: URL.createObjectURL(img)
        };
      }
      return null;
    }).filter(Boolean); // Filtrar valores nulos
  };

  // Manejar la carga de imágenes nuevas
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Verificar el límite de imágenes (máximo 5)
    const currentImages = formik.values.imagenes || [];
    if (currentImages.length + files.length > 5) {
      formik.setFieldError('imagenes', 'No se permiten más de 5 imágenes');
      return;
    }
    
    // Actualizar formik - concatenamos los archivos nuevos con los existentes
    const updatedImages = [...currentImages, ...files];
    formik.setFieldValue('imagenes', updatedImages);
  };

  // Eliminar una imagen
  const handleRemoveImage = (index) => {
    // Obtenemos los previews actuales
    const imagePreviews = getImagePreviews();
    const previewToRemove = imagePreviews[index];
    
    // Obtenemos una copia del array de imágenes actual
    const updatedImages = [...formik.values.imagenes];
    
    if (!previewToRemove.isExisting) {
      // Si es una imagen nueva (File), la encontramos por nombre y tamaño
      const fileIndex = updatedImages.findIndex(img => img instanceof File && 
        img.name === previewToRemove.file.name && 
        img.size === previewToRemove.file.size
      );
      
      if (fileIndex !== -1) {
        // Liberar URL de objeto para evitar pérdidas de memoria
        URL.revokeObjectURL(previewToRemove.url);
        
        // Eliminar del array
        updatedImages.splice(fileIndex, 1);
        formik.setFieldValue('imagenes', updatedImages);
      }
    } else {
      // Si es una imagen existente, encontrarla por ID
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
        Información del Evento
      </Typography>
      
      {/* Título */}
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
        margin="normal"
      />
      
      {/* Descripción */}
      <TextField
        fullWidth
        id="descripcion"
        name="descripcion"
        label="Descripción"
        value={formik.values.descripcion}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
        helperText={formik.touched.descripcion && formik.errors.descripcion}
        margin="normal"
        multiline
        rows={4}
      />
      
      {/* Carga de imágenes */}
      <Box sx={{ mt: 3, mb: 2 }}>
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
        
        {/* Vista previa de imágenes */}
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
      </Box>
      
      {/* Opción de subeventos */}
      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Switch
              name="subeventos"
              checked={formik.values.subeventos}
              onChange={formik.handleChange}
            />
          }
          label="Este evento tendrá subeventos"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Si activas esta opción, el evento se creará inmediatamente como un evento principal 
          al que podrás agregar subeventos posteriormente. Si no, continuarás con la configuración de este evento.
        </Typography>
      </Box>
    </Box>
  );
};

export default StepOne;
