import React, { useEffect, useState } from 'react';
import { QueryClientProvider, QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import SubeventWizard from './createSubevent/components/SubeventWizard';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import eventsService from '../services/eventsService';
import useEventStore from '../stores/eventStore';
import { Box, CircularProgress, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Componente interno que maneja la lógica de carga
const EditEventContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [exitAfterSave, setExitAfterSave] = useState(false);
  
  // Obtener el estado y las acciones del store
  const eventForEdit = useEventStore(state => state.eventForEdit);
  const setEventForEdit = useEventStore(state => state.setEventForEdit);
  const clearEventForEdit = useEventStore(state => state.clearEventForEdit);

  // Caso especial para evento nuevo sin subeventos (desde CreateEvent)
  // Nota: no usamos ID especial, se maneja igual que los subeventos
  const isNewEvent = id === 'new';
  
  // Inicialización inmediata para evitar errores de carga
  useEffect(() => {
    // Caso 1: Es un evento nuevo (id === 'new')
    if (isNewEvent) {
      if (eventForEdit) {
        // Si hay datos en el store para el evento nuevo, estamos listos
        setLoading(false);
      } else {
        // En lugar de mostrar error, creamos un objeto plantilla para un nuevo evento
        const defaultEventData = {
          id: 0,
          titulo: '',
          descripcion: '',
          fecha_inicio: '',
          fecha_fin: '',
          imagenes: [],
          ImagenesUpload: [],
          tipos_usuarios: [],
          dress_code: { id: 0, nombre: '' },
          imagenes_dress_code: [],
          ImagenesDressCodeUpload: [],
          ubicacion: {
            lugar: '',
            direccion: '',
            enlace_maps: '',
            id_icono: 0,
            como_llegar: [],
            aparcamientos: [],
            lugares_interes: []
          },
          programas: [],
          documentos: [],
          contactos: [],
          estado: 'Borrador',
          subeventos: false
        };
        
        // Guardamos esta plantilla en el store
        setEventForEdit(defaultEventData);
        setLoading(false);
      }
      return;
    }

    // Caso 2: No hay ID válido
    if (!id) {
      setError('ID de evento no válido');
      setLoading(false);
      return;
    }

    // Caso 3: Tenemos un ID válido
    // Si ya tenemos datos en el store, estamos listos
    if (eventForEdit) {
      setLoading(false);
      return;
    }
    
    // Si no tenemos datos en el store, esperaremos a la consulta
    // La consulta se activa automáticamente y actualizará el estado cuando termine
  }, [id, isNewEvent, eventForEdit]);

  // Consulta para obtener los datos del evento si no están en el store y no es un evento nuevo
  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEventById(id),
    // Solo ejecutar si hay ID, no es 'new', y no hay evento en el store
    enabled: !!id && !isNewEvent && !eventForEdit,
    retry: 1,
    onSuccess: (data) => {
      setEventForEdit(data);
      setLoading(false);
    },
    onError: (err) => {
      setError('No se pudo cargar el evento. Por favor, inténtelo de nuevo.');
      setLoading(false);
      console.error('Error al cargar el evento:', err);
    }
  });
  
  // Usamos el evento del store o el cargado de la API
  // Para el caso 'new', garantizamos usar datos del store o un objeto vacío
  const event = isNewEvent ? (eventForEdit || {}) : (eventForEdit || eventData);

  // Initialize formik with all fields needed for the event update
  const formik = useFormik({
    initialValues: {
      id: event?.id || 0,
      titulo: event?.titulo || '',
      descripcion: event?.descripcion || '',
      fecha_inicio: event?.fecha_inicio || '',
      fecha_fin: event?.fecha_fin || '',
      imagenes: event?.imagenes || [],
      ImagenesUpload: [],
      tipo_usuario: event?.tipos_usuarios || [],
      dressCode: event?.dress_code || { id: 0, nombre: '' },
      imagenes_dress_code: event?.imagenes_dress_code || [],
      ImagenesDressCodeUpload: [],
      ubicacion: event?.ubicacion ? {
        lugar: event.ubicacion.lugar || '',
        direccion: event.ubicacion.direccion || '',
        enlace_maps: event.ubicacion.enlace_maps || '',
        id_icono: event.ubicacion.id_icono || 0,
        como_llegar: event.ubicacion.como_llegar || [],
        aparcamientos: event.ubicacion.aparcamientos || [],
        lugares_interes: event.ubicacion.lugares_interes || []
      } : {
        lugar: '',
        direccion: '',
        enlace_maps: '',
        id_icono: 0,
        como_llegar: [],
        aparcamientos: [],
        lugares_interes: []
      },
      programas: event?.programas || [],
      documentos: event?.documentos || [],
      documentosFirma: event?.documentos?.filter(doc => doc.necesita_firma) || [],
      DocumentosUpload: [],
      DocumentosFirmaUpload: [],
      contactos: event?.contactos || [],
      estado: event?.estado || 'Borrador',
      id_evento_padre: event?.id_evento_padre || null,
      subeventos: event?.subeventos || false,
      // Mapear enlace de encuesta si existe
      enlace_encuesta: event?.encuesta?.enlace || ''
    },
    validationSchema: Yup.object({
      titulo: Yup.string().required('El título es obligatorio'),
      descripcion: Yup.string().required('La descripción es obligatoria'),
      fecha_inicio: Yup.date().required('La fecha de inicio es obligatoria'),
      fecha_fin: Yup.date()
        .required('La fecha de fin es obligatoria')
        .min(
          Yup.ref('fecha_inicio'),
          'La fecha de fin debe ser posterior a la fecha de inicio'
        ),
      ubicacion: Yup.object().shape({
        lugar: Yup.string().required('El lugar es obligatorio')
      })
    }),
    onSubmit: async (values) => {
      try {
        await updateEventMutation.mutateAsync(values);
        if (exitAfterSave) {
          navigate('/eventos');
        }
      } catch (error) {
        console.error('Error al actualizar el evento:', error);
      }
    },
    enableReinitialize: true
  });

  // Si ya tenemos el evento en el store o recibimos los datos de la consulta, no necesitamos esperar
  useEffect(() => {
    // Siempre verificamos primero si tenemos datos en el store
    if (eventForEdit) {
      setLoading(false);
      return;
    }

    // Caso especial para 'new' - cuando no hay datos en el store
    if (id === 'new') {
      // Si llegamos aquí, no hay datos en el store para el evento nuevo
      setError('No se encontraron datos para el nuevo evento. Intente crear el evento nuevamente.');
      setLoading(false);
      return;
    }
    
    // Para casos normales (no 'new') donde no hay datos en el store
    // Si no hay ID, mostramos error
    if (!id) {
      setError('ID de evento no válido');
      setLoading(false);
    }
    // Si hay datos de la API, finalizamos la carga
    else if (eventData) {
      setLoading(false);
    }
    // Si no hay datos aún, esperamos a la respuesta de la API
  }, [id, eventData, eventForEdit]);

  // Mutation para actualizar evento o crear nuevo evento sin subeventos
  const updateEventMutation = useMutation({
    mutationFn: (data) => {
      // Caso especial: nuevo evento desde el flujo de evento sin subeventos
      if (isNewEvent) {
        return eventsService.createEvent(data);
      }
      // Para cualquier actualización, siempre usar updateEvent
      else {
        return eventsService.updateEvent(id, data);
      }
    },
    onSuccess: (data) => {
      // Si es un nuevo evento, después de crearlo, navegar a la edición con el ID real
      if (isNewEvent) {
        // Mostrar notificación de éxito
        clearEventForEdit();
        navigate(`/eventos`);
      } else {
        // Para actualizaciones normales
        queryClient.invalidateQueries(['event', id]);
        clearEventForEdit();
      }
    }
  });

  const handleSaveAndExit = () => {
    setExitAfterSave(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmSaveAndExit = () => {
    handleCloseDialog();
    formik.handleSubmit();
  };

  const handleBackToEvents = () => {
    clearEventForEdit();
    navigate('/eventos');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Typography variant="body1" sx={{ mt: 2, cursor: 'pointer', color: 'primary.main' }} onClick={() => navigate('/eventos')}>
          Volver al listado de eventos
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pt: 10 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToEvents}
          sx={{ mb: 2 }}
        >
          Volver a Eventos
        </Button>
        <Typography variant="h5" component="h1" gutterBottom>
          {isNewEvent ? 'Crear Nuevo Evento' : `Editar Evento: ${event?.titulo}`}
        </Typography>
      </Box>
      
      <SubeventWizard
        formik={formik}
        isEditing={true}
        onSaveAndExit={handleSaveAndExit}
        isSubmitting={updateEventMutation.isLoading}
      />
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Guardar y salir</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas guardar los cambios y volver al listado de eventos?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmSaveAndExit} autoFocus>
            Guardar y salir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/**
 * Componente principal para la edición de eventos
 * Utiliza el mismo componente EventWizard pero en modo edición
 * Si el evento no está en el store, lo carga desde la API
 */
const EditEvent = () => {
  // Crear una instancia de QueryClient para permitir las mutaciones
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <EditEventContent />
    </QueryClientProvider>
  );
};

export default EditEvent;
