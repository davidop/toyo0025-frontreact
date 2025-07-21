import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Button,
  Paper,
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

// Import the wizard steps
import SubeventWizard from '../createSubevent/components/SubeventWizard';

const EditSubEvent = () => {
  const navigate = useNavigate();
  const { id: parentId, subeventId } = useParams();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [exitAfterSave, setExitAfterSave] = useState(false);

  // Fetch the existing subevent data
  const { data: subevent, isLoading: isLoadingSubevent, error: subeventError } = useQuery({
    queryKey: ['subevent', subeventId],
    queryFn: () => eventsService.getSubeventById(subeventId),
    enabled: !!subeventId,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Initialize formik with all fields needed for the subevent update
  const formik = useFormik({
    initialValues: {
      // Default empty values to be filled when data is loaded
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      imagenes: [],
      tipo_usuario: [],
      dressCode: { id: 0, nombre: '' },
      imagenesDressCode: [],
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
      idEventoPadre: parseInt(parentId, 10),
      subeventos: false
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
      imagenes: Yup.array().min(1, 'Se requiere al menos una imagen')
    }),
    onSubmit: (values) => {
      // Prepare the data for submission
      const subeventData = {
        ...values,
        id: parseInt(subeventId, 10),
        IdEventoPadre: parseInt(parentId, 10),
        // Convert File objects to appropriate format for API
        ImagenesUpload: values.imagenes.filter(img => img instanceof File),
        ImagenesDressCodeUpload: values.imagenesDressCode.filter(img => img instanceof File),
        // Handle other file uploads
        DocumentosUpload: values.documentos.filter(doc => doc.archivo instanceof File)
          .map(doc => doc.archivo),
        DocumentosFirmaUpload: values.documentos.filter(doc => doc.archivo_firmado instanceof File)
          .map(doc => doc.archivo_firmado),
      };

      // Call the mutation to update the subevent
      updateSubeventMutation.mutate(subeventData);
    },
    enableReinitialize: true
  });

  // Effect to populate form when subevent data is loaded
  useEffect(() => {
    if (subevent) {
      // Consola para depuración
      formik.setValues({
        id: subevent.id,
        titulo: subevent.titulo || '',
        descripcion: subevent.descripcion || '',
        fecha_inicio: subevent.fecha_inicio ? new Date(subevent.fecha_inicio) : '',
        fecha_fin: subevent.fecha_fin ? new Date(subevent.fecha_fin) : '',
        imagenes: subevent.imagenes || [],
        // Corregido: mapeo correcto para tipos_usuarios (array de IDs)
        tipo_usuario: subevent.tipos_usuarios?.map(tipo => tipo.id) || [],
        // Corregido: mapeo correcto para dress_code
        dressCode: subevent.dress_code || { id: 0, nombre: '' },
        // Mapeamos correctamente las imágenes del dress code
        imagenesDressCode: subevent.dress_code?.imagenes_dress_code || [],
        ubicacion: {
          id: subevent.ubicacion?.id || '',
          lugar: subevent.ubicacion?.lugar || '',
          direccion: subevent.ubicacion?.direccion || '',
          // Corregido: usar enlace_maps en lugar de enlaceMaps
          enlaceMaps: subevent.ubicacion?.enlace_maps || '',
          // Corregido: usar id_icono en lugar de idIcono
          idIcono: subevent.ubicacion?.id_icono || 0,
          // Añadido: cargar las imágenes de ubicación
          imagenes: subevent.ubicacion?.imagenes || [],
          // Conservamos el resto de campos con sus nombres actuales
          comoLlegar: subevent.ubicacion?.como_llegar || [],
          aparcamientos: subevent.ubicacion?.aparcamientos || [],
          lugaresInteres: subevent.ubicacion?.lugares_interes || []
        },
        programas: subevent.programas || [],
        documentos: subevent.documentos || [],
        documentosFirma: subevent.documentosFirma || [],
        contactos: subevent.contactos || [],
        estado: subevent.estado || 'Borrador',
        idEventoPadre: subevent.idEventoPadre || parseInt(parentId, 10),
        subeventos: false,
        // Mapear enlace de encuesta si existe
        enlace_encuesta: subevent.encuesta?.enlace || ''
      });
    }
  }, [subevent, parentId]);

  // Mutation for updating a subevent
  const updateSubeventMutation = useMutation({
    mutationFn: (subeventData) => eventsService.updateEvent(subeventData.id, subeventData),
    onSuccess: () => {
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries(['subeventos', parentId]);
      queryClient.invalidateQueries(['subevent', subeventId]);

      // Navigate back or stay depending on user choice
      if (exitAfterSave) {
        navigate(`/eventos/${parentId}/subeventos`);
      } else {
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

  const handleSaveAndExit = () => {
    setExitAfterSave(true);
    formik.handleSubmit();
  };

  if (isLoadingSubevent) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando datos del subevento...
        </Typography>
      </Container>
    );
  }

  if (subeventError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Error al cargar el subevento: {subeventError.message || 'Error desconocido'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(`/eventos/${parentId}/subeventos`)}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Container>
    );
  }

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
          Editar Subevento: {formik.values.titulo}
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
          isSubmitting={updateSubeventMutation.isLoading}
          isEditing={true}
        />

        {/* Error alert */}
        {updateSubeventMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error al actualizar el subevento: {updateSubeventMutation.error?.message || 'Error desconocido'}
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

export default EditSubEvent;
