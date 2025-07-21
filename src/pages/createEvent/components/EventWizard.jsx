import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/system';
import eventsService from '../../../services/eventsService';
import useEventStore from '../../../stores/eventStore';
import StepOne from './StepOne';
import StepTwo from './StepTwo';

// Styled components
const FormCard = styled(Card)(({ theme }) => ({
  width: '100%',
  margin: '0 auto',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[1],
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  width: '100%',
  marginTop: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
}));

// Esquema de validación para el paso 1
const validationSchemaStep1 = Yup.object({
  titulo: Yup.string().required('El título es obligatorio'),
  descripcion: Yup.string().required('La descripción es obligatoria'),
  imagenes: Yup.array().min(1, 'Se requiere al menos una imagen'),
  subeventos: Yup.boolean()
});

// Esquema de validación para el paso 2
const validationSchemaStep2 = Yup.object({
  titulo: Yup.string().required('El título es obligatorio'),
  descripcion: Yup.string().required('La descripción es obligatoria'),
  imagenes: Yup.array().min(1, 'Se requiere al menos una imagen'),
  tipos_usuarios: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required(),
        nombre: Yup.string().required()
      })
    )
    .min(1, 'Selecciona al menos un tipo de usuario')
});

const EventWizard = ({ isEditing = false, eventData = null, eventId: propEventId = null }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Etiquetas para el stepper - definimos esto primero ya que no depende de formik
  const stepLabels = ['Información básica', 'Configuración adicional'];
  
  // Obtenemos el evento a editar del store global si estamos en modo edición
  const storeEventForEdit = useEventStore(state => state.eventForEdit);
  const clearEventForEdit = useEventStore(state => state.clearEventForEdit);
  
  // Usamos eventData de las props o del store, priorizando las props
  const eventForEdit = eventData || storeEventForEdit;
  
  // Determinar el modo en base a la ruta o prop
  const editingMode = isEditing || location.pathname.includes('/edit');
  const eventId = propEventId || (editingMode && eventForEdit ? eventForEdit.id : null);

  // Inicializar el paso actual según los datos del evento en modo edición
  useEffect(() => { 
    if (editingMode && eventForEdit) {
      // Si el evento tiene tipos_usuarios y no tiene subeventos, iniciamos en el paso 2
      if (Array.isArray(eventForEdit.tipos_usuarios) && 
          eventForEdit.tipos_usuarios.length > 0 && 
          !eventForEdit.tieneSubeventos) {
        setCurrentStep(1); // Iniciar en el paso 2 (índice 1)
      }
    }
  }, [editingMode, eventForEdit]);

  // Elegir esquema de validación según el paso actual
  const currentValidationSchema = currentStep === 0 ? validationSchemaStep1 : validationSchemaStep2;

  // Inicialización de Formik con valores iniciales del evento a editar si estamos en modo edición
  const formik = useFormik({
    initialValues: {
      titulo: editingMode && eventForEdit ? eventForEdit.titulo || '' : '',
      descripcion: editingMode && eventForEdit ? eventForEdit.descripcion || '' : '',
      imagenes: (editingMode && eventForEdit && eventForEdit.imagenes) ? eventForEdit.imagenes : [],
      subeventos: editingMode && eventForEdit ? !!(eventForEdit.tieneSubeventos || eventForEdit.subeventos) : false,
      tipos_usuarios: (editingMode && eventForEdit && eventForEdit.tipos_usuarios) ? eventForEdit.tipos_usuarios : []
    },
    validationSchema: currentValidationSchema,
    onSubmit: (values) => {
      // Validar según el paso actual
      const isLastStep = currentStep === stepComponents.length - 1;
      
      if (!isLastStep && !values.subeventos) {
        // Si estamos en el paso 1 y no tiene subeventos,
        // primero creamos el evento básico en el backend con subeventos=false
        setIsLoading(true);
        
        // Datos básicos para crear el evento
        const basicEventData = {
          titulo: values.titulo,
          descripcion: values.descripcion,
          imagenes: values.imagenes,
          subeventos: false // Importante: indicamos que NO tiene subevents
        };
        
        
        // Crear el evento en el backend
        eventsService.createEvent(basicEventData)
          .then(response => {
            
            // Obtenemos el ID del evento recién creado
            const createdEventId = response.id;
            
            if (!createdEventId) {
              throw new Error('No se pudo obtener el ID del evento creado');
            }
            
            // Hacemos un GET para obtener todos los datos del evento
            return eventsService.getEventById(createdEventId);
          })
          .then(fullEventData => {
            
            // Aseguramos que tenga la estructura completa que necesitamos
            const completeEventData = {
              ...fullEventData,
              // Aseguramos que estos campos existan incluso si el backend no los devuelve
              dressCode: fullEventData.dressCode || {
                id: null,
                nombre: ''
              },
              imagenesDressCode: fullEventData.imagenesDressCode || [],
              ImagenesDressCodeUpload: [],
              ubicacion: fullEventData.ubicacion || {
                lugar: '',
                direccion: '',
                enlace_maps: '',
                id_icono: null,
                como_llegar: [],
                aparcamientos: [],
                lugares_interes: [],
                imagenes: []
              },
              UbicacionImagenesUpload: [],
              DocumentosUpload: [],
              DocumentosFirmaUpload: []
            };
            
            // Guardar en el store global
            const storeActions = useEventStore.getState();
            storeActions.clearEventForEdit();
            storeActions.setEventForEdit(completeEventData);
            
            // Guardar también en sessionStorage como respaldo
            try {
              sessionStorage.setItem('eventInitialData', JSON.stringify(completeEventData));
            } catch (e) {
              console.error('Error al guardar en sessionStorage:', e);
            }
            
            setIsLoading(false);
            
            // Mostrar notificación de éxito
            setNotification({
              open: true,
              message: 'Evento creado exitosamente',
              severity: 'success'
            });
            
            // Redirigir al wizard completo para editar el evento
            // Usamos la ruta del wizard completo
            navigate('/eventos/crear/completo');
          })
          .catch(error => {
            console.error('Error en el flujo de creación de evento sin subevents:', error);
            setIsLoading(false);
            
            // Mostrar error
            setNotification({
              open: true,
              message: `Error al crear evento: ${error.message}`,
              severity: 'error'
            });
          });
        
        return;
      }
      
      // Si tiene subeventos o estamos en el último paso, enviamos la data
      setIsLoading(true);
      
      const eventData = {
        titulo: values.titulo,
        descripcion: values.descripcion,
        imagenes: values.imagenes,
        subeventos: values.subeventos  // Enviamos la propiedad subeventos al backend
      };
      
      // Si estamos en el paso 2 (sin subeventos), incluimos los tipos de usuario
      if (currentStep === 1 && !values.subeventos) {
        eventData.tipos_usuarios = values.tipos_usuarios || [];
      }

      // Dependiendo del modo, llamamos a crear o actualizar
      if (editingMode && eventId) {
        updateEventMutation.mutate(eventData);
      } else {
        createEventMutation.mutate(eventData);
      }
    },
    enableReinitialize: true // Permite reinicializar el formulario cuando cambian los valores iniciales
  });

  // Mutation para crear un evento
  const createEventMutation = useMutation({
    mutationFn: eventsService.createEvent,
    onSuccess: (response) => {
      setNotification({
        open: true,
        message: 'Evento creado exitosamente',
        severity: 'success'
      });

      // Obtener el ID del evento creado desde la respuesta
      const createdEventId = response?.id;

      // Si es un evento con subeventos, vamos directamente a la página del evento
      if (formik.values.subeventos && createdEventId) {
        setTimeout(() => {
          // Redirigir a la página del evento padre con el formulario y subeventos
          navigate(`/eventos/${createdEventId}/subeventos`);
        }, 1500);
      } else {
        // Si no tiene subeventos, avanzamos al siguiente paso
        setCurrentStep(currentStep + 1);
      }

      setIsLoading(false);
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Error al crear evento: ${error.message}`,
        severity: 'error'
      });
      setIsLoading(false);
    }
  });
  
  // Mutation para actualizar un evento existente
  const updateEventMutation = useMutation({
    mutationFn: (data) => eventsService.updateEvent(eventId, data),
    onSuccess: () => {
      setNotification({
        open: true,
        message: 'Evento actualizado exitosamente',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/eventos');
      }, 1500);
      
      setIsLoading(false);
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Error al actualizar evento: ${error.message}`,
        severity: 'error'
      });
      setIsLoading(false);
    }
  });

  // Definimos los componentes para cada paso después de que formik está disponible
  const stepComponents = [
    <StepOne formik={formik} isEditing={editingMode} key="step1" />,
    <StepTwo formik={formik} key="step2" />
  ];

  const handleBack = () => {
    // Si no estamos en el primer paso, volvemos al paso anterior
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      return;
    }
    
    // Si estamos en el primer paso, volvemos al listado
    // Si estamos editando, limpiar el evento del store
    if (editingMode) {
      clearEventForEdit();
    }
    navigate('/eventos');
  };

  const handleCloseNotification = () => {
  setNotification({ ...notification, open: false });
  };

  // Contenido para el paso actual
  const currentStepContent = stepComponents[currentStep];

  // Renderizar el contenido principal
  const renderContent = () => (
    <Box sx={{ width: '100%' }}>
      {/* Stepper para mostrar el progreso */}
      <Stepper 
        activeStep={currentStep} 
        alternativeLabel={!isMobile}
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        {stepLabels.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Contenido del paso actual */}
      {currentStepContent}
      
      {/* Botones de acción */}
      <ActionButtons>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          fullWidth={isMobile}
          sx={{ flex: { xs: 1, sm: 'auto' } }}
        >
          {currentStep > 0 ? 'Volver al paso anterior' : 'Volver al listado'}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={formik.handleSubmit}
          disabled={isLoading}
          fullWidth={isMobile}
          startIcon={editingMode ? <SaveIcon /> : null}
          sx={{ flex: { xs: 1, sm: 'auto' } }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : (
            editingMode ? 'Guardar cambios' : 
            formik.values.subeventos ? 'Crear evento principal' : 'Siguiente'
          )}
        </Button>
      </ActionButtons>
    </Box>
  );

  // Versión para móvil
  if (isMobile) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          {editingMode ? 'Editar Evento' : 'Crear Evento'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderContent()}

        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Versión para desktop con Card
  return (
    <FormCard>
      <CardHeader 
        title={editingMode ? 'Editar Evento' : 'Crear Evento'}
        sx={{ px: 3, py: 2 }}
      />
      <Divider />
      <CardContent sx={{ px: 3, py: 3 }}>
        {renderContent()}
      </CardContent>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </FormCard>
  );
};

export default EventWizard;
