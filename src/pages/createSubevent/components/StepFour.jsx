import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import PersonIcon from '@mui/icons-material/Person';
import userTypesService from '../../../services/userTypesService';
import { TimePicker } from '@mui/x-date-pickers';
import { parseHourHHMMNNToDate } from '../../../utils/date';

const StepFour = ({ formik }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [selectedDay, setSelectedDay] = useState(0);
  const [tempProgram, setTempProgram] = useState({
    nombre: '',
    fecha_inicio: null,
    fecha_fin: null,
    descripcion: '',
    actividades: [],
    tipo_usuario: [],
    es_descanso: false,
    hora_inicio: "09:00:00",
    hora_fin: "10:00:00",
  });
  
  // Calcular días entre fecha inicio y fin
  const calculateDays = () => {
    const startDate = formik.values.fecha_inicio ? new Date(formik.values.fecha_inicio) : null;
    const endDate = formik.values.fecha_fin ? new Date(formik.values.fecha_fin) : null;
    
    if (!startDate || !endDate) return [];
    
    const daysArray = [];
    const currentDate = new Date(startDate);
    
    // Asegurarse de que estamos trabajando con fechas sin horas
    currentDate.setHours(0, 0, 0, 0);
    const endDateNoTime = new Date(endDate);
    endDateNoTime.setHours(23, 59, 59, 999);
    
    // Mientras la fecha actual sea menor o igual a la fecha fin
    while (currentDate <= endDateNoTime) {
      daysArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return daysArray;
  };
  
  // Obtener el array de días
  const days = calculateDays();
  
  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setSelectedDay(newValue);
  };
  
  // Filtrar programas por el día seleccionado
  const filteredPrograms = formik.values.programas.filter(program => {
    if (!program.fecha_inicio) return false;
    
    const programDate = new Date(program.fecha_inicio);
    programDate.setHours(0, 0, 0, 0);
    
    const selectedDayDate = days[selectedDay];
    if (!selectedDayDate) return false;
    
    return (
      programDate.getFullYear() === selectedDayDate.getFullYear() &&
      programDate.getMonth() === selectedDayDate.getMonth() &&
      programDate.getDate() === selectedDayDate.getDate()
    );
  });
  
  const [tempActivity, setTempActivity] = useState({
    nombre: '',
    descripcion: '',
    max_asistentes: 0,
    imagenes: [],
    imagenesUpload: []
  });
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState(-1);

  // Query to fetch user types
  const { data: userTypes = [] } = useQuery({
    queryKey: ['userTypes'],
    queryFn: () => userTypesService.getUserTypes(),
    refetchOnWindowFocus: false,
  });
  // Handle opening program dialog
  const handleOpenDialog = (index = -1) => {
    setEditingIndex(index);
    
    // Obtener la fecha del día seleccionado
    const selectedDate = days[selectedDay] || new Date();
    const startOfDay = new Date(selectedDate);
    const startOfHour= new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    startOfHour.setHours(10, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    const endOfHour = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59);
    endOfHour.setHours(12, 0, 0, 0);

    
    if (index === -1) {
      // Adding new program
      setTempProgram({
        id: '',
        nombre: '',
        fecha_inicio: startOfDay,
        fecha_fin: endOfDay,
        hora_inicio: startOfHour,
        hora_fin: endOfHour,
        descripcion: '',
        actividades: [],
        tipo_usuario: [],
        es_descanso: false
      });
    } else {
      // Editing existing program
      const existingProgram = formik.values.programas[index];
      const newState = {
        id: existingProgram.id || '',
        nombre: existingProgram.nombre || '',
        fecha_inicio: existingProgram.fecha_inicio ? new Date(existingProgram.fecha_inicio) : startOfDay,
        fecha_fin: existingProgram.fecha_fin ? new Date(existingProgram.fecha_fin) : endOfDay,
        hora_inicio: existingProgram.hora_inicio ? parseHourHHMMNNToDate(existingProgram.hora_inicio) : startOfHour,
        hora_fin: existingProgram.hora_fin ? parseHourHHMMNNToDate(existingProgram.hora_fin) : endOfHour,

        descripcion: existingProgram.descripcion || '',
        actividades: [...(existingProgram.actividades || [])],
        tipo_usuario: [...(existingProgram.tipo_usuario || [])],
        es_descanso: existingProgram.es_descanso || false
      }
      setTempProgram(newState);
    }
    
    setOpenDialog(true);
  };

  // Close program dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Save program from dialog
  const handleSaveProgram = () => {
    const updatedPrograms = [...formik.values.programas];
    const newProgram = {
      id: tempProgram.id || '',
      nombre: tempProgram.nombre,
      fecha_inicio: tempProgram.fecha_inicio,
      fecha_fin: tempProgram.fecha_fin,
      hora_inicio: tempProgram.hora_inicio || '09:00:00',
      hora_fin: tempProgram.hora_fin || '10:00:00',
      descripcion: tempProgram.descripcion,
      es_descanso: tempProgram.es_descanso || false,
      actividades: tempProgram.actividades.map(act => ({
        ...act,
        id: act.id || ''
      })),
      tipo_usuario: tempProgram.tipo_usuario
    };
    
    if (editingIndex >= 0) {
      updatedPrograms[editingIndex] = newProgram;
    } else {
      updatedPrograms.push(newProgram);
    }
    
    formik.setFieldValue('programas', updatedPrograms);
    handleCloseDialog();
  };

  // Delete program
  const handleDeleteProgram = (index) => {
    const updatedPrograms = [...formik.values.programas];
    updatedPrograms.splice(index, 1);
    formik.setFieldValue('programas', updatedPrograms);
  };

  // Handle opening activity dialog
  const handleOpenActivityDialog = (index = -1) => {
    setEditingActivityIndex(index);
    
    if (index === -1) {
      // Adding new activity
      setTempActivity({
        id: '',
        nombre: '',
        descripcion: '',
        max_asistentes: 0,
        imagenes: [],
        imagenesUpload: []
      });
    } else {
      // Editing existing activity
      const existingActivity = tempProgram.actividades[index];
      setTempActivity({
        id: existingActivity.id || '',
        nombre: existingActivity.nombre || '',
        descripcion: existingActivity.descripcion || '',
        max_asistentes: existingActivity.max_asistentes || 0,
        imagenes: existingActivity.imagenes || [],
        imagenesUpload: []
      });
    }
    
    setOpenActivityDialog(true);
  };

  // Close activity dialog
  const handleCloseActivityDialog = () => {
    setOpenActivityDialog(false);
  };

  // Save activity from dialog
  const handleSaveActivity = () => {
    const updatedActivities = [...tempProgram.actividades];
    const newActivity = {
      id: tempActivity.id || null,
      nombre: tempActivity.nombre,
      descripcion: tempActivity.descripcion,
      max_asistentes: tempActivity.max_asistentes,
      imagenes: tempActivity.imagenes || [],
      imagenesUpload: tempActivity.imagenesUpload || []
    };
    
    if (editingActivityIndex >= 0) {
      updatedActivities[editingActivityIndex] = newActivity;
    } else {
      updatedActivities.push(newActivity);
    }
    
    setTempProgram({
      ...tempProgram,
      actividades: updatedActivities
    });
    
    handleCloseActivityDialog();
  };

  // Delete activity
  const handleDeleteActivity = (index) => {
    const updatedActivities = [...tempProgram.actividades];
    updatedActivities.splice(index, 1);
    setTempProgram({
      ...tempProgram,
      actividades: updatedActivities
    });
  };

  // Format date for display
  const formatDateTime = (date) => {
    if(typeof(date) === "string"){
      return date.substring(0, 5)
    }
    if (!date) return '';
    
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return new Date(date).toLocaleTimeString('es-ES', options);
  };

  // Format date for tab labels
  const formatDayLabel = (date) => {
    if (!date) return '';
    
    const options = {
      day: 'numeric',
      month: 'short'
    };
    
    return new Date(date).toLocaleDateString('es-ES', options);
  };
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Programa / Agenda
      </Typography>

      {/* Pestañas de días */}
      {days.length > 0 ? (
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={selectedDay} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {days.map((day, index) => (
              <Tab 
                key={index} 
                label={`Día ${index + 1}: ${formatDayLabel(day)}`} 
                sx={{ minWidth: 120 }}
              />
            ))}
          </Tabs>
        </Paper>
      ) : (
        <Box sx={{ py: 2, mb: 2, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Para crear programas, primero debes definir las fechas de inicio y fin del evento.
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={days.length === 0}
        >
          Añadir Programa
        </Button>
      </Box>
      
      {/* Programs List */}
      <Grid container spacing={2}>
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program, index) => {     
            // Buscamos el índice real en el array completo de programas para edición/eliminación
            const originalIndex = formik.values.programas.findIndex(
              p => p === program || (p.id && p.id === program.id)
            );
            return (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardHeader
                avatar={<EventNoteIcon />}
                title={program.descripcion}
                subheader={`${formatDateTime(program.hora_inicio)} - ${formatDateTime(program.hora_fin)}`}
                action={
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(originalIndex)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteProgram(originalIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
              <CardContent>
                {program.es_descanso && (           <Typography sx={{backgroundColor: "green",width: "fit-content", color: "white", fontStyle: "italic", padding: "6px", borderRadius: "10px"}} variant="body2" paragraph>
                  {program.es_descanso ? "Es descanso" : ""} 
                </Typography>)}
     
                
                {program.actividades && program.actividades.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Actividades
                    </Typography>
                    <Box>
                      {program.actividades.map((activity, actIndex) => (
                        <Box key={actIndex} sx={{ mb: 1, pl: 2 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {activity.nombre}
                          </Typography>
                          {activity.descripcion && (
                            <Typography variant="body2" color="text.secondary">
                              {activity.descripcion}
                            </Typography>
                          )}
                          {activity.max_asistentes > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Máx. asistentes: {activity.max_asistentes}
                            </Typography>
                          )}
                          {activity.imagenes && activity.imagenes.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <ImageIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {activity.imagenes.length} {activity.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {activity.imagenes.map((imagen, imgIdx) => (
                                  <Box
                                    key={imgIdx}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                  >
                                    <img
                                      src={imagen.url_lectura_segura || imagen.url}
                                      alt={`${activity.nombre} - imagen ${imgIdx + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/40?text=Error';
                                      }}
                                    />
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {program.tipo_usuario && program.tipo_usuario.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tipos de usuario:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {program.tipo_usuario.map((typeId, typeIndex) => {
                        const userType = userTypes.find(type => type.id === typeId);
                        return (
                          <Box 
                            key={typeIndex} 
                            sx={{ 
                              backgroundColor: 'action.selected', 
                              borderRadius: 1, 
                              px: 1, 
                              py: 0.5, 
                              fontSize: '0.75rem' 
                            }}
                          >
                            {userType?.nombre || typeId}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                No hay programas para este día. Haz clic en "Añadir Programa" para crear uno.
              </Typography>
            </Box>
          </Grid>
        )}
        

      </Grid>
      
      {/* Program Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'Editar Programa' : 'Añadir Programa'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {/* <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del programa"
                value={tempProgram.nombre}
                onChange={(e) => setTempProgram({ ...tempProgram, nombre: e.target.value })}
              />
            </Grid> */}
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <TimePicker
                  label="Hora de inicio"
                  value={tempProgram.hora_inicio}
                  onChange={(newValue) =>  setTempProgram({ ...tempProgram, hora_inicio: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <TimePicker
                  label="Fecha y hora de fin"
                  value={tempProgram.hora_fin}
                  onChange={(newValue) => setTempProgram({ ...tempProgram, hora_fin: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={tempProgram.descripcion}
                onChange={(e) => setTempProgram({ ...tempProgram, descripcion: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempProgram.es_descanso || false}
                    onChange={(e) => setTempProgram({ ...tempProgram, es_descanso: e.target.checked })}
                    color="primary"
                  />
                }
                label="Es un período de descanso"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="tipos-usuario-label">Tipos de usuario</InputLabel>
                <Select
                  labelId="tipos-usuario-label"
                  multiple
                  value={tempProgram.tipo_usuario}
                  onChange={(e) => setTempProgram({ ...tempProgram, tipo_usuario: e.target.value })}
                  label="Tipos de usuario"
                >
                  {userTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Activities section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                  Actividades
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  size="small"
                  onClick={() => handleOpenActivityDialog()}
                >
                  Añadir Actividad
                </Button>
              </Box>
              <Box>
                {tempProgram.actividades && tempProgram.actividades.length > 0 ? (
                  <Box>
                    {tempProgram.actividades.map((activity, actIndex) => (
                      <Box key={actIndex} sx={{ mb: 1, pl: 2, pr: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {activity.nombre}
                          </Typography>
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenActivityDialog(actIndex)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteActivity(actIndex)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {activity.descripcion && (
                          <Typography variant="body2" color="text.secondary">
                            {activity.descripcion}
                          </Typography>
                        )}
                        {activity.max_asistentes > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                            Máx. asistentes: {activity.max_asistentes}
                          </Typography>
                        )}
                        {activity.imagenes && activity.imagenes.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <ImageIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {activity.imagenes.length} {activity.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {activity.imagenes.map((imagen, imgIdx) => (
                                <Box
                                  key={imgIdx}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <img
                                    src={imagen.url_lectura_segura || imagen.url}
                                    alt={`${activity.nombre} - imagen ${imgIdx + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/40?text=Error';
                                    }}
                                  />
                                </Box>
                              ))}
                              {activity.imagenesUpload?.map((file, imgIdx) => (
                                <Box
                                  key={`upload-${imgIdx}`}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    position: 'relative'
                                  }}
                                >
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`${activity.nombre} - nueva imagen ${imgIdx + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  <Box sx={{ position: 'absolute', bottom: 0, right: 0, left: 0, height: '4px', bgcolor: 'primary.main' }}></Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay actividades añadidas
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveProgram} 
            variant="contained"
            disabled={ !tempProgram.fecha_inicio || !tempProgram.fecha_fin}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Activity Dialog */}
      <Dialog 
        open={openActivityDialog} 
        onClose={handleCloseActivityDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editingActivityIndex >= 0 ? 'Editar Actividad' : 'Añadir Actividad'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la actividad"
                value={tempActivity.nombre}
                onChange={(e) => setTempActivity({ ...tempActivity, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={tempActivity.descripcion}
                onChange={(e) => setTempActivity({ ...tempActivity, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Número máximo de asistentes"
                value={tempActivity.max_asistentes}
                onChange={(e) => setTempActivity({ 
                  ...tempActivity, 
                  max_asistentes: e.target.value === '' ? 0 : parseInt(e.target.value, 10) 
                })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Imágenes de la actividad
              </Typography>
              
              {/* Mostrar imágenes existentes */}
              {tempActivity.imagenes && tempActivity.imagenes.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                  {tempActivity.imagenes.map((imagen, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        position: 'relative',
                        width: 80, 
                        height: 80, 
                        m: 0.5, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <img 
                        src={imagen.url_lectura_segura || imagen.url} 
                        alt={`Actividad ${idx}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=Error';
                        }}
                      />
                      <IconButton 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0, 
                          bgcolor: 'rgba(255,255,255,0.8)' 
                        }}
                        onClick={() => {
                          const updatedImages = [...tempActivity.imagenes];
                          updatedImages.splice(idx, 1);
                          setTempActivity({ ...tempActivity, imagenes: updatedImages });
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              
              {/* Mostrar imágenes nuevas seleccionadas */}
              {tempActivity.imagenesUpload && tempActivity.imagenesUpload.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                  {tempActivity.imagenesUpload.map((file, idx) => (
                    <Box 
                      key={`upload-${idx}`} 
                      sx={{ 
                        position: 'relative',
                        width: 80, 
                        height: 80, 
                        m: 0.5, 
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover'
                      }}
                    >
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Nueva ${idx}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <Typography variant="caption">{file.name}</Typography>
                      )}
                      <IconButton 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0, 
                          bgcolor: 'rgba(255,255,255,0.8)' 
                        }}
                        onClick={() => {
                          const updatedImages = [...tempActivity.imagenesUpload];
                          updatedImages.splice(idx, 1);
                          setTempActivity({ ...tempActivity, imagenesUpload: updatedImages });
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              
              {/* Botón para subir imágenes */}
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="activity-images-upload"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  setTempActivity({
                    ...tempActivity,
                    imagenesUpload: [...tempActivity.imagenesUpload, ...newFiles]
                  });
                  e.target.value = null; // Reset input
                }}
              />
              <label htmlFor="activity-images-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  size="small"
                  fullWidth
                >
                  Subir Imágenes
                </Button>
              </label>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActivityDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveActivity} 
            variant="contained"
            disabled={!tempActivity.nombre}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepFour;
