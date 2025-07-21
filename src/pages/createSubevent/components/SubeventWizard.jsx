import React, { useState } from 'react';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';

// Import the step components
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import StepFive from './StepFive';
import StepSix from './StepSix';
import StepSurvey from './StepSurvey';
import StepSeven from './StepSeven';

const steps = [
  'Información General',
  'Dress Code',
  'Ubicación',
  'Programa',
  'Documentos',
  'Contactos',
  'Encuesta',
  'Estado'
];

// Styled component for the wizard footer
const WizardFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  }
}));

// Styled component for button container
const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'space-between',
  }
}));

const SubeventWizard = ({ formik, parentId, onSaveAndExit, isSubmitting, isEditing = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  // Step validation for each step
  const validateStep = () => {
    // Si estamos en modo edición, siempre permitir navegar entre pasos
    if (isEditing) {
      return true;
    }

    let isValid = true;

    switch (activeStep) {
      case 0: // General Info
        formik.validateField('titulo');
        formik.validateField('descripcion');
        formik.validateField('fecha_inicio');
        formik.validateField('fecha_fin');
        formik.validateField('imagenes');
        isValid = !(
          Boolean(formik.errors.titulo) ||
          Boolean(formik.errors.descripcion) ||
          Boolean(formik.errors.fecha_inicio) ||
          Boolean(formik.errors.fecha_fin) ||
          Boolean(formik.errors.imagenes)
        );
        break;

      case 1: // Dress Code
        // No required validations for dress code
        break;

      case 2: // Location
        formik.validateField('ubicacion.lugar');
        isValid = !Boolean(formik.errors.ubicacion?.lugar);
        break;

      case 3: // Program
        // Programas are optional, but if added they need validation
        isValid = !(formik.values.programas.some(
          program => !program.fecha_inicio || !program.fecha_fin
        ));
        break;

      case 4: // Documents
        // No required validations for documents
        break;

      case 5: // Contacts
        // Contacts are optional, but if added they need validation
        isValid = !(formik.values.contactos.some(
          contact => !contact.nombre_completo || !contact.email
        ));
        break;
        
      case 6: // Survey
        // No required validations for survey link
        break;

      case 7: // Status
        formik.validateField('estado');
        isValid = !Boolean(formik.errors.estado);
        break;

      default:
        break;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        // Submit the form if on the last step
        formik.handleSubmit();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Render the appropriate step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <StepOne formik={formik} />;
      case 1:
        return <StepTwo formik={formik} />;
      case 2:
        return <StepThree formik={formik} />;
      case 3:
        return <StepFour formik={formik} />;
      case 4:
        return <StepFive formik={formik} />;
      case 5:
        return <StepSix formik={formik} />;
      case 6:
        return <StepSurvey formik={formik} />;
      case 7:
        return <StepSeven formik={formik} />;
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Box>
      {/* Steps indicator */}
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          mb: 4,
          overflowX: 'auto',
          '& .MuiStepLabel-label': {
            mt: 1,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step content */}
      <Box>
        {getStepContent(activeStep)}

        {/* Navigation buttons */}
        <WizardFooter>
          <Button
            variant="outlined"
            color="primary"
            onClick={onSaveAndExit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Guardar y Salir'}
          </Button>

          <ButtonsContainer>
            <Button
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              variant="outlined"
            >
              Anterior
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {activeStep === steps.length - 1 ?
                (isSubmitting ?
                  <CircularProgress size={24} /> :
                  (isEditing ? 'Actualizar' : 'Crear')
                ) :
                'Siguiente'
              }
            </Button>
          </ButtonsContainer>
        </WizardFooter>
      </Box>
    </Box>
  );
};

export default SubeventWizard;
