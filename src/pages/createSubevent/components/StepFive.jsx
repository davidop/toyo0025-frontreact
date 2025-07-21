import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// Styled component for the upload box
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

const StepFive = ({ formik }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempDocument, setTempDocument] = useState({
    nombre: '',
    descripcion: '',
    requiere_firma: false,
    archivo: null,
    archivo_firmado: null
  });
  // Get file icon based on mime type
  const getFileIcon = (file) => {
    if (!file) return <InsertDriveFileIcon />;
    
    if (typeof file === 'string') {
      // URL to file, try to guess from extension
      const extension = file.split('.').pop().toLowerCase();
      if (['pdf'].includes(extension)) return <PictureAsPdfIcon />;
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) return <ImageIcon />;
      if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return <ArticleIcon />;
      return <InsertDriveFileIcon />;
    }
    
    if (file instanceof File) {
      const type = file.type;
      if (type.includes('pdf')) return <PictureAsPdfIcon />;
      if (type.includes('image')) return <ImageIcon />;
      if (type.includes('word') || type.includes('text')) return <ArticleIcon />;
    }
    
    return <InsertDriveFileIcon />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file name from File object or URL
  const getFileName = (file) => {
    if (!file) return '';
    
    if (typeof file === 'string') {
      // Extract filename from URL
      return file.split('/').pop().split('?')[0];
    }
    
    if (file instanceof File) {
      return file.name;
    }
    
    return '';
  };

  // Handle document dialog open
  const handleOpenDialog = (index = -1) => {
    setEditingIndex(index);
    if (index === -1) {
      // Adding new document
      setTempDocument({
        id: '',
        nombre: '',
        descripcion: '',
        requiere_firma: false,
        archivo: null,
        archivo_firmado: null
      });
    } else {
      // Editing existing document
      const existingDoc = formik.values.documentos[index];
      setTempDocument({
        id: existingDoc.id || '',
        nombre: existingDoc.nombre || '',
        descripcion: existingDoc.descripcion || '',
        requiere_firma: existingDoc.requiere_firma || false,
        archivo: existingDoc.archivo || null,
        archivo_firmado: existingDoc.archivo_firmado || null
      });
    }
    
    setOpenDialog(true);
  };

  // Close document dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle file selection
  const handleFileChange = (field) => (event) => {
    if (event.target.files && event.target.files[0]) {
      setTempDocument({
        ...tempDocument,
        [field]: event.target.files[0]
      });
    }
  };

  // Save document from dialog
  const handleSaveDocument = () => {
    const updatedDocuments = [...formik.values.documentos];
    const newDocument = {
      id: tempDocument.id || '',
      nombre: tempDocument.nombre,
      descripcion: tempDocument.descripcion,
      requiere_firma: tempDocument.requiere_firma,
      archivo: tempDocument.archivo,
      archivo_firmado: tempDocument.archivo_firmado
    };
    
    if (editingIndex >= 0) {
      updatedDocuments[editingIndex] = newDocument;
    } else {
      updatedDocuments.push(newDocument);
    }
    formik.setFieldValue('documentos', updatedDocuments);
    handleCloseDialog();
  };

  // Delete document
  const handleDeleteDocument = (index) => {
    const updatedDocuments = [...formik.values.documentos];
    updatedDocuments.splice(index, 1);
    formik.setFieldValue('documentos', updatedDocuments);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Documentos
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<CloudUploadIcon />}
          onClick={() => handleOpenDialog()}
        >
          Añadir Documento
        </Button>
      </Box>
      
      {/* Documents List */}
      <Grid container spacing={2}>
        {formik.values.documentos.map((document, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardHeader
                avatar={getFileIcon(document.archivo)}
                title={document.nombre}
                titleTypographyProps={{ variant: 'subtitle1' }}
                subheader={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {document.archivo instanceof File ? (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          {getFileName(document.archivo)} ({formatFileSize(document.archivo.size)})
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {getFileName(document.archivo)}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  {document.descripcion}
                </Typography>
                
                {document.requiere_firma && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="primary">
                      Requiere firma
                    </Typography>
                    {document.archivo_firmado && (
                      <Typography variant="caption" sx={{ ml: 'auto' }}>
                        Documento firmado disponible
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenDialog(index)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteDocument(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {formik.values.documentos.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                No hay documentos añadidos. Haga clic en "Añadir Documento" para subir uno.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Document Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'Editar Documento' : 'Añadir Documento'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del documento"
                value={tempDocument.nombre}
                onChange={(e) => setTempDocument({ ...tempDocument, nombre: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={tempDocument.descripcion}
                onChange={(e) => setTempDocument({ ...tempDocument, descripcion: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Archivo
              </Typography>
              
              {tempDocument.archivo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getFileIcon(tempDocument.archivo)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {getFileName(tempDocument.archivo)}
                    </Typography>
                    {tempDocument.archivo instanceof File && (
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(tempDocument.archivo.size)}
                      </Typography>
                    )}
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => setTempDocument({ ...tempDocument, archivo: null })}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <UploadBox>
                  <Button
                    component="label"
                    variant="text"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 1 }}
                  >
                    Seleccionar archivo
                    <VisuallyHiddenInput 
                      type="file" 
                      onChange={handleFileChange('archivo')}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Ningún archivo seleccionado
                  </Typography>
                </UploadBox>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempDocument.requiere_firma}
                    onChange={(e) => setTempDocument({ ...tempDocument, requiere_firma: e.target.checked })}
                  />
                }
                label="Requiere firma"
              />
            </Grid>
            
    
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveDocument} 
            variant="contained"
            disabled={!tempDocument.nombre || !tempDocument.archivo}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepFive;
