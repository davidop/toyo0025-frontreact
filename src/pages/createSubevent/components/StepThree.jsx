import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AttractionsIcon from '@mui/icons-material/Attractions';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import iconoService from "../../../services/iconoService";

// Styled component for icon selection
const IconSelectionGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

// Styled component for the icon option
const IconOption = styled(Box)(({ theme, selected }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid #ddd',
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& img': {
    maxWidth: '80%',
    maxHeight: '80%',
  }
}));

// Styled components for image upload
const UploadBox = styled(Box)(({ theme }) => ({
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  minHeight: 150,
}));

// Styled component for image preview
const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 100,
  height: 100,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

// Hidden input for file uploads
const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clipPath: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

// Location component - main section and related items (directions, parking, points of interest)
const StepThree = ({ formik }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempItem, setTempItem] = useState({
    id: '',
    nombre: '',
    indicaciones: '',
    direccion: '',
    descripcion: '',
    enlace_maps: '',
    id_icono: 0,
  });

  // Initialize ubicacion.imagenes array if it doesn't exist
  if (!formik.values.ubicacion.imagenes) {
    formik.setFieldValue('ubicacion.imagenes', []);
  }

  // Initialize ubicacion.imagenesUpload array if it doesn't exist
  if (!formik.values.UbicacionImagenesUpload) {
    formik.setFieldValue('UbicacionImagenesUpload', []);
  }

  // Query to fetch icons
  const { data: icons = [] } = useQuery({
    queryKey: ['icons'],
    queryFn: () => iconoService.getIcons(),
    refetchOnWindowFocus: false,
  });

  // Handle main location icon selection
  const handleMainIconSelect = (iconId) => {
    formik.setFieldValue('ubicacion.idIcono', iconId);
  };

  // Get icon URL by ID
  const getIconUrl = (iconId) => {
    const icon = icons.find(i => i.id === iconId);
    return icon ? icon.url_lectura_segura : '';
  };

  // Open dialog for adding/editing items
  const handleOpenDialog = (type, index = -1) => {
    setDialogType(type);
    setEditingIndex(index);
    
    if (index === -1) {
      // Adding new item
      setTempItem({
        id: '',
        nombre: '',
        indicaciones: '',
        direccion: '',
        descripcion: '',
        enlace_maps: '',
        id_icono: 0,
      });
    } else {
      // Editing existing item
      let existingItem;
      switch (type) {
        case 'como-llegar':
          existingItem = formik.values.ubicacion.comoLlegar[index];
          setTempItem({
            id: existingItem.id || '',
            nombre: existingItem.nombre || '',
            indicaciones: existingItem.indicaciones || '',
            id_icono: existingItem.id_icono || 0,
          });
          break;
        case 'aparcamiento':
          existingItem = formik.values.ubicacion.aparcamientos[index];
          setTempItem({
            id: existingItem.id || '',
            nombre: existingItem.nombre || '',
            direccion: existingItem.direccion || '',
            enlace_maps: existingItem.enlace_maps || '',
            id_icono: existingItem.id_icono || 0,
          });
          break;
        case 'lugar-interes':
          existingItem = formik.values.ubicacion.lugaresInteres[index];
          setTempItem({
            id: existingItem.id || '',
            nombre: existingItem.nombre || '',
            descripcion: existingItem.descripcion || '',
            enlace_maps: existingItem.enlace_maps || '',
            id_icono: existingItem.id_icono || 0,
          });
          break;
        default:
          break;
      }
    }
    
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTempItem({});
  };

  // Save item from dialog
  const handleSaveItem = () => {
    switch (dialogType) {
      case 'como-llegar': {
        const updatedItems = [...formik.values.ubicacion.comoLlegar];
        const newItem = {
          id: tempItem.id,
          id_ubicacion: formik.values.ubicacion.id || '',
          nombre: tempItem.nombre,
          indicaciones: tempItem.indicaciones,
          id_icono: tempItem.id_icono,
          icono: icons.find(i => i.id === tempItem.id_icono) || null
        };
        
        if (editingIndex >= 0) {
          updatedItems[editingIndex] = newItem;
        } else {
          updatedItems.push(newItem);
        }
        
        formik.setFieldValue('ubicacion.comoLlegar', updatedItems);
        break;
      }
      case 'aparcamiento': {
        const updatedItems = [...formik.values.ubicacion.aparcamientos];
        const newItem = {
          id: tempItem.id,
          id_ubicacion: formik.values.ubicacion.id || '',
          nombre: tempItem.nombre,
          direccion: tempItem.direccion,
          enlace_maps: tempItem.enlace_maps,
          id_icono: tempItem.id_icono,
          icono: icons.find(i => i.id === tempItem.id_icono) || null
        };
        
        if (editingIndex >= 0) {
          updatedItems[editingIndex] = newItem;
        } else {
          updatedItems.push(newItem);
        }
        
        formik.setFieldValue('ubicacion.aparcamientos', updatedItems);
        break;
      }
      case 'lugar-interes': {
        const updatedItems = [...formik.values.ubicacion.lugaresInteres];
        const newItem = {
          id: tempItem.id,
          id_ubicacion: formik.values.ubicacion.id || '',
          nombre: tempItem.nombre,
          descripcion: tempItem.descripcion,
          enlace_maps: tempItem.enlace_maps,
          id_icono: tempItem.id_icono,
          icono: icons.find(i => i.id === tempItem.id_icono) || null
        };
        
        if (editingIndex >= 0) {
          updatedItems[editingIndex] = newItem;
        } else {
          updatedItems.push(newItem);
        }
        
        formik.setFieldValue('ubicacion.lugaresInteres', updatedItems);
        break;
      }
      default:
        break;
    }
    
    handleCloseDialog();
  };

  // Delete an item
  const handleDeleteItem = (type, index) => {
    switch (type) {
      case 'como-llegar': {
        const updatedItems = [...formik.values.ubicacion.comoLlegar];
        updatedItems.splice(index, 1);
        formik.setFieldValue('ubicacion.comoLlegar', updatedItems);
        break;
      }
      case 'aparcamiento': {
        const updatedItems = [...formik.values.ubicacion.aparcamientos];
        updatedItems.splice(index, 1);
        formik.setFieldValue('ubicacion.aparcamientos', updatedItems);
        break;
      }
      case 'lugar-interes': {
        const updatedItems = [...formik.values.ubicacion.lugaresInteres];
        updatedItems.splice(index, 1);
        formik.setFieldValue('ubicacion.lugaresInteres', updatedItems);
        break;
      }
      default:
        break;
    }
  };

  // Render icon selection in dialog
  const renderIconSelection = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Seleccionar icono
      </Typography>
      <IconSelectionGrid container>
        {icons.map((icon) => (
          <IconOption 
            key={icon.id} 
            selected={tempItem.id_icono === icon.id}
            onClick={() => setTempItem({ ...tempItem, id_icono: icon.id })}
          >
            <img src={icon.url_lectura_segura} alt={icon.nombre} />
          </IconOption>
        ))}
      </IconSelectionGrid>
    </Box>
  );

  // Render dialog content based on type
  const renderDialogContent = () => {
    switch (dialogType) {
      case 'como-llegar':
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Nombre"
              value={tempItem.nombre}
              onChange={(e) => setTempItem({ ...tempItem, nombre: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Indicaciones"
              multiline
              rows={3}
              value={tempItem.indicaciones}
              onChange={(e) => setTempItem({ ...tempItem, indicaciones: e.target.value })}
            />
            {renderIconSelection()}
          </>
        );
      case 'aparcamiento':
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Nombre"
              value={tempItem.nombre}
              onChange={(e) => setTempItem({ ...tempItem, nombre: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Dirección"
              value={tempItem.direccion}
              onChange={(e) => setTempItem({ ...tempItem, direccion: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Enlace Google Maps"
              value={tempItem.enlace_maps}
              onChange={(e) => setTempItem({ ...tempItem, enlace_maps: e.target.value })}
            />
            {renderIconSelection()}
          </>
        );
      case 'lugar-interes':
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Nombre"
              value={tempItem.nombre}
              onChange={(e) => setTempItem({ ...tempItem, nombre: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Descripción"
              multiline
              rows={3}
              value={tempItem.descripcion}
              onChange={(e) => setTempItem({ ...tempItem, descripcion: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Enlace Google Maps"
              value={tempItem.enlace_maps}
              onChange={(e) => setTempItem({ ...tempItem, enlace_maps: e.target.value })}
            />
            {renderIconSelection()}
          </>
        );
      default:
        return null;
    }
  };

  // Handle location image upload
  const handleLocationImageUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      formik.setFieldValue('UbicacionImagenesUpload', [
        ...formik.values.UbicacionImagenesUpload,
        ...newFiles
      ]);
    }
    // Reset the input
    event.target.value = '';
  };

  // Handle location image delete (uploaded file)
  const handleLocationImageDelete = (index) => {
    const updatedImages = [...formik.values.UbicacionImagenesUpload];
    updatedImages.splice(index, 1);
    formik.setFieldValue('UbicacionImagenesUpload', updatedImages);
  };

  // Handle existing location image delete
  const handleExistingLocationImageDelete = (index) => {
    const updatedImages = [...formik.values.ubicacion.imagenes];
    updatedImages.splice(index, 1);
    formik.setFieldValue('ubicacion.imagenes', updatedImages);
  };

  // Get dialog title based on type
  const getDialogTitle = () => {
    const action = editingIndex >= 0 ? 'Editar' : 'Añadir';
    switch (dialogType) {
      case 'como-llegar':
        return `${action} indicaciones para llegar`;
      case 'aparcamiento':
        return `${action} aparcamiento`;
      case 'lugar-interes':
        return `${action} lugar de interés`;
      default:
        return '';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Ubicación
      </Typography>
      
      <Grid container spacing={3}>
        {/* Main location section */}
        <Grid item xs={12}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Información principal
            </Typography>
            
            <Grid container spacing={2}>
              {/* Location name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="ubicacion.lugar"
                  name="ubicacion.lugar"
                  label="Lugar"
                  value={formik.values.ubicacion.lugar}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.ubicacion?.lugar && Boolean(formik.errors.ubicacion?.lugar)}
                  helperText={formik.touched.ubicacion?.lugar && formik.errors.ubicacion?.lugar}
                  variant="outlined"
                />
              </Grid>
              
              {/* Location address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="ubicacion.direccion"
                  name="ubicacion.direccion"
                  label="Dirección"
                  value={formik.values.ubicacion.direccion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.ubicacion?.direccion && Boolean(formik.errors.ubicacion?.direccion)}
                  helperText={formik.touched.ubicacion?.direccion && formik.errors.ubicacion?.direccion}
                  variant="outlined"
                />
              </Grid>
              
              {/* Maps link */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="ubicacion.enlaceMaps"
                  name="ubicacion.enlaceMaps"
                  label="Enlace Google Maps"
                  value={formik.values.ubicacion.enlaceMaps}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.ubicacion?.enlaceMaps && Boolean(formik.errors.ubicacion?.enlaceMaps)}
                  helperText={formik.touched.ubicacion?.enlaceMaps && formik.errors.ubicacion?.enlaceMaps}
                  variant="outlined"
                />
              </Grid>
              
              {/* Icon selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Icono de ubicación
                </Typography>
                <IconSelectionGrid container>
                  {icons.map((icon) => (
                    <IconOption 
                      key={icon.id} 
                      selected={formik.values.ubicacion.idIcono === icon.id}
                      onClick={() => handleMainIconSelect(icon.id)}
                    >
                      <img src={icon.url_lectura_segura} alt={icon.nombre} />
                    </IconOption>
                  ))}
                </IconSelectionGrid>
              </Grid>
              
              {/* Location Images */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Imágenes de la ubicación
                </Typography>
                
                {/* Existing images */}
                {formik.values.ubicacion.imagenes && formik.values.ubicacion.imagenes.length > 0 && (
                  <ImagePreviewContainer>
                    {formik.values.ubicacion.imagenes.map((image, idx) => (
                      <ImagePreview key={`existing-${idx}`}>
                        <img 
                          src={image.url_lectura_segura} 
                          alt={`Ubicación ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton 
                          size="small" 
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                          }}
                          onClick={() => handleExistingLocationImageDelete(idx)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ImagePreview>
                    ))}
                  </ImagePreviewContainer>
                )}
                
                {/* Newly uploaded images */}
                {formik.values.UbicacionImagenesUpload && formik.values.UbicacionImagenesUpload.length > 0 && (
                  <ImagePreviewContainer>
                    {formik.values.UbicacionImagenesUpload.map((file, idx) => (
                      <ImagePreview 
                        key={`upload-${idx}`} 
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Upload ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <ImageIcon sx={{ fontSize: 40 }} />
                        )}
                        <IconButton 
                          size="small" 
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                          }}
                          onClick={() => handleLocationImageDelete(idx)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ImagePreview>
                    ))}
                  </ImagePreviewContainer>
                )}
                
                {/* Upload button */}
                <UploadBox>
                  <VisuallyHiddenInput
                    id="location-images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleLocationImageUpload}
                  />
                  <label htmlFor="location-images-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Subir imágenes
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Haz clic para subir imágenes de la ubicación
                  </Typography>
                </UploadBox>
              </Grid>
              
            </Grid>
          </Box>
        </Grid>
        
        {/* How to get there section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsIcon sx={{ mr: 1 }} /> Cómo llegar
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('como-llegar')}
              >
                Añadir
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {formik.values.ubicacion.comoLlegar.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardHeader
                      avatar={
                        item.id_icono ? (
                          <Box sx={{ width: 24, height: 24 }}>
                            <img 
                              src={getIconUrl(item.id_icono)} 
                              alt={item.nombre}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                        ) : <DirectionsIcon />
                      }
                      title={item.nombre}
                      titleTypographyProps={{ variant: 'subtitle2' }}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.indicaciones}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog('como-llegar', index)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteItem('como-llegar', index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              {formik.values.ubicacion.comoLlegar.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay indicaciones añadidas
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
        
        {/* Parking section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalParkingIcon sx={{ mr: 1 }} /> Aparcamientos
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('aparcamiento')}
              >
                Añadir
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {formik.values.ubicacion.aparcamientos.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardHeader
                      avatar={
                        item.id_icono ? (
                          <Box sx={{ width: 24, height: 24 }}>
                            <img 
                              src={getIconUrl(item.id_icono)} 
                              alt={item.nombre}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                        ) : <LocalParkingIcon />
                      }
                      title={item.nombre}
                      titleTypographyProps={{ variant: 'subtitle2' }}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.direccion}
                      </Typography>
                      {item.enlace_maps && (
                        <Button 
                          size="small" 
                          href={item.enlace_maps} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ mt: 1, fontSize: '0.75rem' }}
                        >
                          Ver en Google Maps
                        </Button>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog('aparcamiento', index)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteItem('aparcamiento', index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              {formik.values.ubicacion.aparcamientos.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay aparcamientos añadidos
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
        
        {/* Points of interest section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <AttractionsIcon sx={{ mr: 1 }} /> Lugares de interés
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('lugar-interes')}
              >
                Añadir
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {formik.values.ubicacion.lugaresInteres.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardHeader
                      avatar={
                        item.id_icono ? (
                          <Box sx={{ width: 24, height: 24 }}>
                            <img 
                              src={getIconUrl(item.id_icono)} 
                              alt={item.nombre}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                        ) : <AttractionsIcon />
                      }
                      title={item.nombre}
                      titleTypographyProps={{ variant: 'subtitle2' }}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.descripcion}
                      </Typography>
                      {item.enlace_maps && (
                        <Button 
                          size="small" 
                          href={item.enlace_maps} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ mt: 1, fontSize: '0.75rem' }}
                        >
                          Ver en Google Maps
                        </Button>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog('lugar-interes', index)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteItem('lugar-interes', index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              {formik.values.ubicacion.lugaresInteres.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay lugares de interés añadidos
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>
      
      {/* Dialog for adding/editing items */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained"
            disabled={!tempItem.nombre}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepThree;
