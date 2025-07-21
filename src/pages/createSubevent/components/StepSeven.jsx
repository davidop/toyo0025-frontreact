import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Card,
  CardContent,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/system';
import DraftsIcon from '@mui/icons-material/Drafts';
import PublishIcon from '@mui/icons-material/Publish';

// Styled component for the status card
const StatusCard = styled(Card)(({ theme, selected }) => ({
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  borderWidth: selected ? 2 : 1,
  borderStyle: 'solid',
  boxShadow: selected ? theme.shadows[4] : theme.shadows[1],
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    backgroundColor: theme.palette.action.hover,
  },
}));

const StepSeven = ({ formik }) => {
  // Status options
  const statusOptions = [
    {
      value: 'Borrador',
      label: 'Borrador',
      description: 'El subevento solo será visible para los administradores y no estará disponible para los usuarios.',
      icon: DraftsIcon
    },
    {
      value: 'Publicado',
      label: 'Publicado',
      description: 'El subevento será visible para todos los usuarios con los permisos correspondientes.',
      icon: PublishIcon
    }
  ];

  // Handle status selection
  const handleStatusChange = (event) => {
    formik.setFieldValue('estado', event.target.value);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Estado del Subevento
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Seleccione el estado en el que desea guardar el subevento. Podrá cambiarlo posteriormente.
      </Typography>
      
      <FormControl fullWidth error={formik.touched.estado && Boolean(formik.errors.estado)}>
        <RadioGroup
          name="estado"
          value={formik.values.estado}
          onChange={handleStatusChange}
        >
          <Grid container spacing={2}>
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formik.values.estado === option.value;
              
              return (
                <Grid item xs={12} sm={6} key={option.value}>
                  <FormControlLabel
                    value={option.value}
                    control={<Radio sx={{ display: 'none' }} />}
                    label=""
                    sx={{ width: '100%', m: 0 }}
                  />
                  <StatusCard 
                    selected={isSelected}
                    onClick={() => formik.setFieldValue('estado', option.value)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Icon 
                          color={isSelected ? "primary" : "action"} 
                          sx={{ mr: 1 }}
                        />
                        <Typography 
                          variant="h6" 
                          color={isSelected ? "primary" : "textPrimary"}
                        >
                          {option.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </CardContent>
                  </StatusCard>
                </Grid>
              );
            })}
          </Grid>
        </RadioGroup>
        {formik.touched.estado && formik.errors.estado && (
          <FormHelperText error>{formik.errors.estado}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default StepSeven;
