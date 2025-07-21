import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import dressCodeService from '../../../services/dressCodeService';

const DressCodeStep = ({ formik }) => {
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Consulta para obtener los dress codes disponibles
  const { data: dressCodes, isLoading, isError } = useQuery({
    queryKey: ['dressCodes'],
    queryFn: dressCodeService.getAllDressCodes
  });
  
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
      // Limit to 5 images total
      const totalImages = [...formik.values.dressCode.images, ...files];
      const allowedFiles = totalImages.slice(0, 5);
      
      formik.setFieldValue('dressCode.images', allowedFiles);
      
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
    const newImages = [...formik.values.dressCode.images];
    const newPreviews = [...imagePreviews];
    
    // Release URL
    URL.revokeObjectURL(newPreviews[index].url);
    
    // Remove the image
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    formik.setFieldValue('dressCode.images', newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dress Code
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.dressCode?.dressCodeId && Boolean(formik.errors.dressCode?.dressCodeId)} margin="normal">
            <InputLabel id="dressCode-select-label">Tipo de Dress Code</InputLabel>
            {/* Extraer lógica de renderizado condicional para simplificar */}
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Cargando opciones...</Typography>
              </Box>
            )}
            {isError && (
              <Typography color="error">Error al cargar los dress codes</Typography>
            )}
            {!isLoading && !isError && (
              <Select
                labelId="dressCode-select-label"
                id="dressCode.dressCodeId"
                name="dressCode.dressCodeId"
                value={formik.values.dressCode.dressCodeId || ''}
                label="Tipo de Dress Code"
                onChange={(e) => {
                  formik.setFieldValue('dressCode.dressCodeId', e.target.value);
                  // Encontrar y establecer también el nombre para compatibilidad
                  const selected = dressCodes?.find(code => code.id === e.target.value);
                  formik.setFieldValue('dressCode.name', selected ? selected.nombre : '');
                }}
              >
                {dressCodes?.map((code) => (
                  <MenuItem key={code.id} value={code.id}>
                    {code.nombre}
                  </MenuItem>
                ))}
              </Select>
            )}
            {formik.touched.dressCode?.dressCodeId && formik.errors.dressCode?.dressCodeId && (
              <FormHelperText>{formik.errors.dressCode.dressCodeId}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Imágenes del Dress Code ({imagePreviews.length}/5)
          </Typography>
          <Button
            variant="contained"
            component="label"
            disabled={formik.values.dressCode.images.length >= 5}
          >
            Subir Imágenes
            {/* Input para subir imágenes */}
            <input
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
          </Button>
          {formik.touched.dressCode?.images && formik.errors.dressCode?.images && (
            <Typography color="error" variant="caption" display="block">
              {formik.errors.dressCode.images}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {imagePreviews.map((preview, index) => (
              <Box
                key={`image-preview-${index}-${preview.file.name}`}
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  '&:hover .deleteIcon': {
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
                <IconButton
                  className="deleteIcon"
                  size="small"
                  onClick={() => removeImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

DressCodeStep.propTypes = {
  formik: PropTypes.shape({
    values: PropTypes.shape({
      dressCode: PropTypes.shape({
        name: PropTypes.string,
        dressCodeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        images: PropTypes.array
      })
    }),
    touched: PropTypes.shape({
      dressCode: PropTypes.shape({
        name: PropTypes.bool,
        dressCodeId: PropTypes.bool,
        images: PropTypes.bool
      })
    }),
    errors: PropTypes.shape({
      dressCode: PropTypes.shape({
        name: PropTypes.string,
        dressCodeId: PropTypes.string,
        images: PropTypes.string
      })
    }),
    handleChange: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired
  }).isRequired
};

export default DressCodeStep;
