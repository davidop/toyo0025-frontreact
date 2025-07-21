import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';

const MainEventStep = ({ formik }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Crear Evento Principal
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="mainEvent.title"
          name="mainEvent.title"
          label="Título del Evento"
          value={formik.values.mainEvent.title}
          onChange={formik.handleChange}
          error={formik.touched.mainEvent?.title && Boolean(formik.errors.mainEvent?.title)}
          helperText={formik.touched.mainEvent?.title && formik.errors.mainEvent?.title}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              id="mainEvent.hasSubevents"
              name="mainEvent.hasSubevents"
              checked={formik.values.mainEvent.hasSubevents}
              onChange={formik.handleChange}
            />
          }
          label="Este evento tiene subeventos"
        />
      </Grid>
    </Grid>
  </Box>
);

MainEventStep.propTypes = {
  formik: PropTypes.shape({
    values: PropTypes.shape({
      mainEvent: PropTypes.shape({
        title: PropTypes.string,
        hasSubevents: PropTypes.bool
      })
    }),
    touched: PropTypes.shape({
      mainEvent: PropTypes.shape({
        title: PropTypes.bool,
        hasSubevents: PropTypes.bool
      })
    }),
    errors: PropTypes.shape({
      mainEvent: PropTypes.shape({
        title: PropTypes.string,
        hasSubevents: PropTypes.string
      })
    }),
    handleChange: PropTypes.func.isRequired
  }).isRequired
};

export default MainEventStep;
