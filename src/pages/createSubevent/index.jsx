import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import eventsService from '../../services/eventsService';
import useEventStore from '../../stores/eventStore';

// Import the wizard steps
import SubeventWizard from './components/SubeventWizard';

const CreateSubEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: parentId } = useParams();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [exitAfterSave, setExitAfterSave] = useState(false);

  // Determinar si estamos creando un evento completo (sin padre) o un subevento
  const isCreatingEvent = location.pathname === '/eventos/crear/completo';

  // Obtener datos del store si estamos creando un evento completo
  const eventDataFromStore = useEventStore(state => state.eventForEdit);
  const clearEventStore = useEventStore(state => state.clearEventForEdit);



  // Intentar recuperar datos del sessionStorage como respaldo
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (isCreatingEvent) {
      try {
        const savedData = sessionStorage.getItem('eventInitialData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setSessionData(parsedData);
        }
      } catch (e) {
        console.error('Error al recuperar datos de sessionStorage:', e);
      }
    }
  }, [isCreatingEvent]);

  // Determinar los valores iniciales basados en si es evento completo o subevento
  const getInitialValues = () => {
    // Si estamos creando un evento completo
    if (isCreatingEvent) {

      // Intentar obtener datos de cualquier fuente disponible (store o sessionStorage)
      const dataSource = eventDataFromStore || sessionData;



      // Si tenemos datos de cualquier fuente
      if (dataSource) {
        // Mostrar los datos encontrados para depuración


        // Crear objeto con datos iniciales
        const initialValues = {
          // Datos que vienen del primer paso
          titulo: dataSource.titulo || '',
          descripcion: dataSource.descripcion || '',
          imagenes: Array.isArray(dataSource.imagenes) ? dataSource.imagenes : [],

          // El resto de los campos con valores por defecto
          fecha_inicio: '',
          fecha_fin: '',
          tipo_usuario: [],
          dressCode: { id: 0, nombre: '' },
          imagenesDressCode: [],
          enlace_encuesta: dataSource.enlace_encuesta || '',
          ubicacion: {
            lugar: '',
            direccion: '',
            enlaceMaps: '',
            idIcono: 0,
            comoLlegar: [],
            aparcamientos: [],
            lugaresInteres: []
          },
          programas: [],
          documentos: [],
          documentosFirma: [],
          contactos: [],
          estado: 'Borrador',
          // Es un evento normal, no un subevento
          idEventoPadre: null,
          subeventos: false
        };
        return initialValues;
      }
    }

    // Si estamos creando un subevento (flujo normal)
    return {
      // General info - Step 1
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      imagenes: [],
      tipo_usuario: [],

      // Dress Code - Step 2
      dressCode: { id: 0, nombre: '' },
      imagenesDressCode: [],

      // Location - Step 3
      ubicacion: {
        lugar: '',
        direccion: '',
        enlaceMaps: '',
        idIcono: 0,
        comoLlegar: [],
        aparcamientos: [],
        lugaresInteres: []
      },

      // Program/Agenda - Step 4
      programas: [],

      // Documents - Step 5
      documentos: [],
      documentosFirma: [],

      // Contacts - Step 6
      contactos: [],

      // Status - Step 7
      estado: 'Borrador',

      // Always set for subevents
      idEventoPadre: parentId ? parseInt(parentId, 10) : null,
      subeventos: false // Subevents can't have subevents
    };
  };

  // Initialize formik with all fields needed for the event/subevent creation
  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validationSchema: Yup.object({
      titulo: Yup.string().required('El título es obligatorio'),
      descripcion: Yup.string().required('La descripción es obligatoria'),
      enlace_encuesta: Yup.string()
        .url('Debe ser una URL válida')
        .nullable(),
      fecha_inicio: Yup.date().required('La fecha de inicio es obligatoria'),
      fecha_fin: Yup.date()
        .required('La fecha de fin es obligatoria')
        .min(
          Yup.ref('fecha_inicio'),
          'La fecha de fin debe ser posterior a la fecha de inicio'
        ),
      imagenes: Yup.array().min(1, 'Se requiere al menos una imagen'),
      // Location validation
      ubicacion: Yup.object({
        lugar: Yup.string().required('El lugar es obligatorio'),
        direccion: Yup.string(),
        enlaceMaps: Yup.string(),
        idIcono: Yup.number()
      }),
      // Status validation
      estado: Yup.string().required('El estado es obligatorio')
    }),
    onSubmit: (values) => {
      // Prepare the data for submission
      const eventData = {
        ...values,
        // Convert File objects to appropriate format for API
        ImagenesUpload: values.imagenes.filter(img => img instanceof File),
        ImagenesDressCodeUpload: values.imagenesDressCode.filter(img => img instanceof File),
        // Handle other file uploads
        DocumentosUpload: values.documentos.filter(doc => doc instanceof File),
        DocumentosFirmaUpload: values.documentosFirma.filter(doc => doc instanceof File),
      };



      // Decidir si enviar como evento regular o como subevento
      if (isCreatingEvent) {
        createEventMutation.mutate(eventData);
      } else {
        // Asegurarse de que tenga el ID del evento padre para subeventos
        setExitAfterSave(true)
        const subeventData = {
          ...eventData,
          IdEventoPadre: parseInt(parentId, 10),
        };
        createSubeventMutation.mutate(subeventData);
      }
    }
  });

  // Efecto para limpiar el store después de inicializar
  useEffect(() => {
    if (isCreatingEvent && eventDataFromStore) {
      // Limpiamos el store después de obtener los datos para evitar problemas en futuras navegaciones
      setTimeout(() => {
        clearEventStore();
      }, 200);
    }
  }, [isCreatingEvent, eventDataFromStore, clearEventStore]);

  // Mutación para crear un evento regular
  const createEventMutation = useMutation({
    mutationFn: (eventData) => eventsService.createEvent(eventData),
    onSuccess: () => {
      // Invalidate queries to refresh the list of events
      queryClient.invalidateQueries(['eventos']);

      // Navigate back to events list or stay depending on user choice
      if (exitAfterSave) {
        navigate('/eventos');
      } else {
        // Reset the form for a new event
        formik.resetForm();

        // Show success notification
        // We could use a toast notification here
      }
    }
  });

  // Mutation for creating a subevent
  const createSubeventMutation = useMutation({
    mutationFn: (subeventData) => eventsService.createSubevent(subeventData),
    onSuccess: () => {
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries(['subeventos', parentId]);

      // Navigate back or stay depending on user choice
      if (exitAfterSave) {
        navigate(`/eventos/${parentId}/subeventos`);
      } else {
        // Reset the form for a new subevent
        formik.resetForm();

        // Show success message
        // We could use a toast notification here
      }
    }
  });

  const handleBack = () => {
    if (formik.dirty) {
      setOpenDialog(true);
    } else {
      navigate(`/eventos/${parentId}/subeventos`);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDiscardChanges = () => {
    setOpenDialog(false);
    navigate(`/eventos/${parentId}/subeventos`);
  };

  // Handle save and exit button
  const handleSaveAndExit = () => {
    setExitAfterSave(true);

    // Guardar como borrador sin validar todos los campos
    const eventData = {
      ...formik.values,
      estado: 'Borrador', // Asegurar que se guarda como borrador
      // Convertir archivos para API
      ImagenesUpload: formik.values.imagenes.filter(img => img instanceof File),
      ImagenesDressCodeUpload: formik.values.imagenesDressCode.filter(img => img instanceof File),
      // Imágenes de ubicación (pueden estar en formik.values.UbicacionImagenesUpload o necesitar extracción)
      UbicacionImagenesUpload: formik.values.UbicacionImagenesUpload ||
        (formik.values.ubicacion && Array.isArray(formik.values.ubicacion.imagenes)
          ? formik.values.ubicacion.imagenes.filter(img => img instanceof File)
          : []),
      DocumentosUpload: formik.values.documentos.filter(doc => doc instanceof File),
      DocumentosFirmaUpload: formik.values.documentosFirma.filter(doc => doc instanceof File),
    };



    // Comprobar si ya tenemos un ID de evento (lo que significa que ya existe y debemos usar PUT)
    const eventId = sessionData?.id || eventDataFromStore?.id;

    // Enviar directamente sin validar
    if (isCreatingEvent && eventId) {
      // Si estamos en el wizard completo y ya tenemos un ID, actualizamos el evento existente (PUT)

      // Asegurar que tenemos todos los campos obligatorios
      const eventDataCompleto = {
        ...eventData,
        id: eventId, // Asegurar que el ID está presente
        // Asegurar campos obligatorios
        titulo: eventData.titulo || '',
        descripcion: eventData.descripcion || '',
        fecha_inicio: eventData.fecha_inicio || '',
        fecha_fin: eventData.fecha_fin || '',
        // Convertir tipos_usuarios a formato correcto si existe
        tipos_usuarios: Array.isArray(eventData.tipo_usuario) ?
          eventData.tipo_usuario.map(tipo => ({
            id: typeof tipo.id === 'number' ? tipo.id : parseInt(tipo.id, 10),
            nombre: tipo.nombre
          })) : [],
        // Asegurar que las imágenes existentes (no Files) se mantienen
        // imagenes: [
        //   ...eventData.imagenes.filter(img => typeof img === 'object' && !(img instanceof File) && img.url) //TODO VER SI ROMPIO ALGO 
        // ],
      };


      // Usar directamente el servicio eventsService.updateEvent con useJsonFormat=true
      eventsService.updateEvent(eventId, eventDataCompleto, true)
        .then(() => {
          queryClient.invalidateQueries(['eventos']);

          if (exitAfterSave) {
            navigate('/eventos');
          }
        })
        .catch((error) => {
          console.error('Error al actualizar evento:', error);
          // Mostrar mensaje de error al usuario
        });
    } else if (isCreatingEvent) {
      // Si estamos en el wizard completo pero es un evento nuevo (no tiene ID), usamos POST
      createEventMutation.mutate(eventData);
    } else {
      // Flujo de subevento normal - Asegurar ID del evento padre para subeventos
      const subeventData = {
        ...eventData,
        IdEventoPadre: parseInt(parentId, 10),
      };
      createSubeventMutation.mutate(subeventData);
    }
  };



  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      {/* Header with back button */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: { xs: 0, sm: 2 } }}
        >
          Volver
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            flexGrow: 1,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Crear sub-evento
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          mb: 4
        }}
      >
        {/* Main wizard component */}
        <SubeventWizard
          formik={formik}
          parentId={parentId}
          onSaveAndExit={handleSaveAndExit}
          isSubmitting={createSubeventMutation.isLoading}
        />

        {/* Error alert */}
        {createSubeventMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error al crear el subevento: {createSubeventMutation.error?.message || 'Error desconocido'}
          </Alert>
        )}
      </Paper>

      {/* Confirmation dialog when navigating away */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
      >
        <DialogTitle>Cambios sin guardar</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleDiscardChanges} color="error">
            Descartar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateSubEvent;
