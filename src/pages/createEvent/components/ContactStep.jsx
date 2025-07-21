import React from 'react';
import {
  Box, 
  TextField,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/system';

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const FieldContainer = styled(Box)(({ theme, isMobile }) => ({
  marginBottom: theme.spacing(3),
  width: isMobile ? '100%' : '60%',
}));

const ContactStep = ({ formik }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Información de contacto (opcional)
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Proporcione información de contacto para el evento.
      </Typography>

      <FormSection>
        <FieldContainer isMobile={isMobile}>
          <TextField
            fullWidth
            label="Nombre completo"
            name="contact.nombre_completo"
            value={formik.values.contact?.nombre_completo || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contact?.nombre_completo && Boolean(formik.errors.contact?.nombre_completo)}
            helperText={formik.touched.contact?.nombre_completo && formik.errors.contact?.nombre_completo}
            margin="normal"
            variant="outlined"
          />
        </FieldContainer>

        <FieldContainer isMobile={isMobile}>
          <TextField
            fullWidth
            label="Email"
            name="contact.email"
            type="email"
            value={formik.values.contact?.email || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contact?.email && Boolean(formik.errors.contact?.email)}
            helperText={formik.touched.contact?.email && formik.errors.contact?.email}
            margin="normal"
            variant="outlined"
          />
        </FieldContainer>

        <FieldContainer isMobile={isMobile}>
          <TextField
            fullWidth
            label="Teléfono"
            name="contact.telefono"
            value={formik.values.contact?.telefono || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contact?.telefono && Boolean(formik.errors.contact?.telefono)}
            helperText={formik.touched.contact?.telefono && formik.errors.contact?.telefono}
            margin="normal"
            variant="outlined"
          />
        </FieldContainer>
      </FormSection>
    </>
  );
};

export default ContactStep;
