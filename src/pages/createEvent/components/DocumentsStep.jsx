import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Checkbox, 
  FormControlLabel,
  Paper,
  Divider,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleIcon from '@mui/icons-material/Article';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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

const DocumentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const DocumentItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper
}));

const InfoAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

const DocumentsStep = ({ formik }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleFileChange = (event) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const currentFiles = formik.values.documents.files || [];
      
      // Add new files to existing ones
      formik.setFieldValue('documents.files', [...currentFiles, ...newFiles]);
    }
  };
  
  const handleRemoveFile = (index) => {
    const updatedFiles = [...formik.values.documents.files];
    updatedFiles.splice(index, 1);
    formik.setFieldValue('documents.files', updatedFiles);
    
    // Also remove signature requirement if any
    const updatedSignatureReqs = [...formik.values.documents.requiresSignature];
    updatedSignatureReqs.splice(index, 1);
    formik.setFieldValue('documents.requiresSignature', updatedSignatureReqs);
  };
  
  const handleToggleSignature = (index) => {
    const updatedSignatureReqs = [...formik.values.documents.requiresSignature];
    updatedSignatureReqs[index] = !updatedSignatureReqs[index];
    formik.setFieldValue('documents.requiresSignature', updatedSignatureReqs);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Documentos del evento
      </Typography>
      
      <InfoAlert severity="info" icon={<InfoOutlinedIcon />}>
        Los asistentes podrán visualizar y descargar estos documentos. Si seleccionas que requieren firma, 
        podrás rastrear qué invitados han firmado cada documento.
      </InfoAlert>
      
      <DocumentPaper elevation={isMobile ? 0 : 1}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          sx={{ mb: 2 }}
          fullWidth
        >
          Subir documentos
          <VisuallyHiddenInput 
            type="file" 
            multiple 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />
        </Button>
        
        {formik.values.documents.files.length > 0 ? (
          <List sx={{ width: '100%', p: 0 }}>
            {formik.values.documents.files.map((file, index) => (
              <DocumentItem key={index}>
                <ArticleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText 
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(0)} KB`}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 'medium',
                    noWrap: true
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption'
                  }}
                  sx={{ mr: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formik.values.documents.requiresSignature[index] || false}
                      onChange={() => handleToggleSignature(index)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Requiere firma
                    </Typography>
                  }
                  sx={{ mr: 1 }}
                />
                <IconButton 
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveFile(index)}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </DocumentItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            No hay documentos adjuntos
          </Typography>
        )}
      </DocumentPaper>
    </Box>
  );
};

export default DocumentsStep;
