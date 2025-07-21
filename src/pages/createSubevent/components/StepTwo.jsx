import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  IconButton,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import dressCodeService from '../../../services/dressCodeService';

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

const StepTwo = ({ formik }) => {
  // Query to fetch dress codes from the API
  const { data: dressCodes = [] } = useQuery({
    queryKey: ['dressCodes'],
    queryFn: () => dressCodeService.getDressCodes(),
    refetchOnWindowFocus: false,
  });

  // Generate image previews from formik.values.imagenesDressCode
  const getImagePreviews = () => {
    if (!formik.values.imagenesDressCode || !Array.isArray(formik.values.imagenesDressCode)) {
      return [];
    }
    
    return formik.values.imagenesDressCode.map(img => {
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

  // Handle dress code image upload
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Check image limit (maximum 5)
    const currentImages = formik.values.imagenesDressCode || [];
    if (currentImages.length + files.length > 5) {
      formik.setFieldError('imagenesDressCode', 'No se permiten más de 5 imágenes');
      return;
    }
    
    // Update formik - concatenate new files with existing ones
    const updatedImages = [...currentImages, ...files];
    formik.setFieldValue('imagenesDressCode', updatedImages);
  };

  // Remove a dress code image
  const handleRemoveImage = (index) => {
    // Get current previews
    const imagePreviews = getImagePreviews();
    const previewToRemove = imagePreviews[index];
    
    // Get a copy of the current image array
    const updatedImages = [...formik.values.imagenesDressCode];
    
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
        formik.setFieldValue('imagenesDressCode', updatedImages);
      }
    } else {
      // If it's an existing image, find it by ID
      const existingIndex = updatedImages.findIndex(img => 
        typeof img === 'object' && img.id === previewToRemove.id
      );
      
      if (existingIndex !== -1) {
        updatedImages.splice(existingIndex, 1);
        formik.setFieldValue('imagenesDressCode', updatedImages);
      }
    }
  };

  // Handle dress code selection
  const handleDressCodeChange = (event) => {
    const selectedId = event.target.value;
    const selectedDressCode = dressCodes.find(code => code.id === selectedId) || { id: selectedId, nombre: '' };
    formik.setFieldValue('dressCode', selectedDressCode);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Dress Code
      </Typography>
      
      <Grid container spacing={3}>
        {/* Dress Code Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="dress-code-label">Tipo de Dress Code</InputLabel>
            <Select
              labelId="dress-code-label"
              id="dressCode"
              value={formik.values.dressCode.id}
              onChange={handleDressCodeChange}
              label="Tipo de Dress Code"
            >
              {dressCodes.map((code) => (
                <MenuItem key={code.id} value={code.id}>
                  {code.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Dress Code Image Upload */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Imágenes de Dress Code (máximo 5)
          </Typography>
          
          <UploadBox
            sx={{
              mb: 2,
              borderColor: formik.touched.imagenesDressCode && Boolean(formik.errors.imagenesDressCode) 
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
                disabled={formik.values?.imagenesDressCode?.length >= 5}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {formik.values?.imagenesDressCode?.length === 0 
                ? 'Ninguna imagen seleccionada' 
                : `${formik.values?.imagenesDressCode?.length}/5 imágenes seleccionadas`}
            </Typography>
            {formik.touched.imagenesDressCode && formik.errors.imagenesDressCode && (
              <FormHelperText error>{formik.errors.imagenesDressCode}</FormHelperText>
            )}
          </UploadBox>
          
          {/* Dress Code Image Preview */}
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

export default StepTwo;
