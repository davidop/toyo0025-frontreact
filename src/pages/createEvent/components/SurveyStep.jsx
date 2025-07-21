import React from 'react';
import {
  Box,
  TextField,
  Typography,
  FormHelperText,
  InputAdornment,
  Link,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

const SurveyStep = ({ formik }) => {
  const handleChange = (e) => {
    formik.setFieldValue('survey.link', e.target.value);
  };

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Encuesta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Añade un enlace a una encuesta de Google Forms para recopilar retroalimentación de los participantes (opcional).
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="survey-link"
              name="survey.link"
              label="Enlace a la encuesta"
              placeholder="https://forms.google.com/..."
              variant="outlined"
              value={formik.values.survey?.link || ''}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.survey?.link && Boolean(formik.errors.survey?.link)}
              helperText={formik.touched.survey?.link && formik.errors.survey?.link}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormHelperText>
              Inserta la URL completa de tu formulario de Google Forms. 
              <Link 
                href="https://docs.google.com/forms/" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ ml: 1 }}
              >
                Crear un nuevo formulario
              </Link>
            </FormHelperText>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SurveyStep;
