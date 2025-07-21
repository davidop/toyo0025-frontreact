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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import { stringAvatar } from '../../../utils/stringAvatar';

const StepSix = ({ formik }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempContact, setTempContact] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    cargo: ''
  });

  // Handle contact dialog open
  const handleOpenDialog = (index = -1) => {
    setEditingIndex(index);
    
    if (index === -1) {
      // Adding new contact
      setTempContact({
        id: '',
        nombre_completo: '',
        email: '',
        telefono: '',
        cargo: ''
      });
    } else {
      // Editing existing contact
      const existingContact = formik.values.contactos[index];
      setTempContact({
        id: existingContact.id || '',
        nombre_completo: existingContact.nombre_completo || '',
        email: existingContact.email || '',
        telefono: existingContact.telefono || '',
        cargo: existingContact.cargo || ''
      });
    }
    
    setOpenDialog(true);
  };

  // Close contact dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Save contact from dialog
  const handleSaveContact = () => {
    const updatedContacts = [...formik.values.contactos];
    const newContact = {
      id: tempContact.id || '',
      nombre_completo: tempContact.nombre_completo,
      email: tempContact.email,
      telefono: tempContact.telefono,
      cargo: tempContact.cargo
    };
    
    if (editingIndex >= 0) {
      updatedContacts[editingIndex] = newContact;
    } else {
      updatedContacts.push(newContact);
    }
    
    formik.setFieldValue('contactos', updatedContacts);
    handleCloseDialog();
  };

  // Delete contact
  const handleDeleteContact = (index) => {
    const updatedContacts = [...formik.values.contactos];
    updatedContacts.splice(index, 1);
    formik.setFieldValue('contactos', updatedContacts);
  };

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Contactos
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Añadir Contacto
        </Button>
      </Box>
      
      {/* Contacts List */}
      <Grid container spacing={2}>
        {formik.values.contactos.map((contact, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card variant="outlined">
              <CardHeader
                avatar={
                  <Avatar {...stringAvatar(contact.nombre_completo || 'Contacto')} />
                }
                title={contact.nombre_completo}
                subheader={contact.cargo}
                titleTypographyProps={{ variant: 'subtitle1' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {contact.email || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {contact.telefono || 'N/A'}
                  </Typography>
                </Box>
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
                  onClick={() => handleDeleteContact(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {formik.values.contactos.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                No hay contactos añadidos. Haga clic en "Añadir Contacto" para crear uno.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Contact Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'Editar Contacto' : 'Añadir Contacto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={tempContact.nombre_completo}
                onChange={(e) => setTempContact({ ...tempContact, nombre_completo: e.target.value })}
                InputProps={{
                  startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={tempContact.email}
                onChange={(e) => setTempContact({ ...tempContact, email: e.target.value })}
                error={tempContact.email && !isValidEmail(tempContact.email)}
                helperText={tempContact.email && !isValidEmail(tempContact.email) ? "Email inválido" : ""}
                InputProps={{
                  startAdornment: <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={tempContact.telefono}
                onChange={(e) => setTempContact({ ...tempContact, telefono: e.target.value })}
                InputProps={{
                  startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cargo"
                value={tempContact.cargo}
                onChange={(e) => setTempContact({ ...tempContact, cargo: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveContact} 
            variant="contained"
            disabled={
              !tempContact.nombre_completo || 
              (tempContact.email && !isValidEmail(tempContact.email))
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepSix;
