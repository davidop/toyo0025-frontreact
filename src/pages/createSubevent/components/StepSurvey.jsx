import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  InputAdornment
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

const StepSurvey = ({ formik }) => {
  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom component="div">
        Enlace a Encuesta
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Proporciona un enlace a una encuesta externa que desees asociar con este evento.
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          id="enlace_encuesta"
          name="enlace_encuesta"
          label="Enlace a Encuesta"
          placeholder="https://example.com/mi-encuesta"
          value={formik.values.enlace_encuesta || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.enlace_encuesta && Boolean(formik.errors.enlace_encuesta)}
          helperText={formik.touched.enlace_encuesta && formik.errors.enlace_encuesta}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          Este enlace permitirá a los usuarios acceder a una encuesta externa relacionada con el evento.
        </Typography>
      </Box>
    </Paper>
  );
};

export default StepSurvey;
