import React from 'react';
import {
  TextField,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/system';

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%'
}));

const Description = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const EncuestaStep = ({ formik }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const Container = isMobile ? Box : Card;
  const ContentContainer = isMobile ? Box : CardContent;

  return (
    <Container sx={{ width: '100%' }}>
      <ContentContainer>
        <Typography variant="h5" component="h2" gutterBottom>
          Enlace a Encuesta
        </Typography>
        
        <Description variant="body1" color="textSecondary">
          Proporciona un enlace a la encuesta de Google Forms que deseas asociar a este evento.
          Los asistentes podrán acceder a ella para proporcionar retroalimentación.
        </Description>
        
        <StyledTextField
          id="encuesta-enlace"
          name="encuesta.enlace"
          label="Enlace de la encuesta"
          fullWidth
          value={formik.values.encuesta.enlace || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.encuesta?.enlace && Boolean(formik.errors.encuesta?.enlace)}
          helperText={formik.touched.encuesta?.enlace && formik.errors.encuesta?.enlace}
          placeholder="https://forms.google.com/..."
        />
      </ContentContainer>
    </Container>
  );
};

export default EncuestaStep;
