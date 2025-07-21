import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
// Asegúrate de importar el adaptador correcto según los componentes que estés utilizando
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const ProgramStep = ({ formik }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados para controlar la interfaz y los formularios
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState(null);
  const [currentProgram, setCurrentProgram] = useState({
    descripcion: '',
    fecha_inicio: null,
    fecha_fin: null,
    hora_inicio: '',
    hora_fin: '',
    es_descanso: false,
    actividades: []
  });
  const [currentActivity, setCurrentActivity] = useState({
    nombre: '',
    descripcion: '',
    max_asistentes: '',
    tipo_usuario: ''
  });
  
  useEffect(() => {
    // Inicializar el campo del programa en el formulario si no existe
    if (!formik.values.program) {
      formik.setFieldValue('program', { programas: [], actividades: [] });
    }
  }, [formik]);
  
  // Manejadores de eventos
  const handleAddProgram = () => {
    // Validación básica
    if (!currentProgram.descripcion || !currentProgram.fecha_inicio || !currentProgram.fecha_fin ||
        !currentProgram.hora_inicio || !currentProgram.hora_fin) {
      return; // Implementar validación visual después
    }
    
    // Generar ID único para el programa
    const programId = `prog${Date.now()}`;
    const newProgram = {
      ...currentProgram,
      id: programId
    };
    
    // Agregar al formik
    const updatedPrograms = [...(formik.values.program?.programas || []), newProgram];
    formik.setFieldValue('program.programas', updatedPrograms);
    
    // Reiniciar formulario
    setCurrentProgram({
      descripcion: '',
      fecha_inicio: null,
      fecha_fin: null,
      hora_inicio: '',
      hora_fin: '',
      es_descanso: false,
      actividades: []
    });
  };
  
  // Renderizado del componente
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Programa / Agenda
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Define el programa y las actividades para tu evento
      </Typography>
      
      {/* Formulario para añadir programa */}
      <Paper elevation={isMobile ? 0 : 1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Añadir nuevo horario
        </Typography>
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={2}>
            {/* Fecha de inicio */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de inicio"
                value={currentProgram.fecha_inicio}
                onChange={(newDate) => setCurrentProgram({...currentProgram, fecha_inicio: newDate})}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined" 
                    error={!currentProgram.fecha_inicio && formik.submitCount > 0}
                    helperText={!currentProgram.fecha_inicio && formik.submitCount > 0 ? 'La fecha de inicio es obligatoria' : ''}
                  />
                )}
              />
            </Grid>
            
            {/* Fecha de fin */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de fin"
                value={currentProgram.fecha_fin}
                onChange={(newDate) => setCurrentProgram({...currentProgram, fecha_fin: newDate})}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined" 
                    error={!currentProgram.fecha_fin && formik.submitCount > 0}
                    helperText={!currentProgram.fecha_fin && formik.submitCount > 0 ? 'La fecha de fin es obligatoria' : ''}
                  />
                )}
              />
            </Grid>
            
            {/* Hora de inicio */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Hora de inicio"
                value={currentProgram.hora_inicio ? new Date(`2022-01-01T${currentProgram.hora_inicio}`) : null}
                onChange={(newTime) => {
                  if (newTime) {
                    const hours = newTime.getHours().toString().padStart(2, '0');
                    const minutes = newTime.getMinutes().toString().padStart(2, '0');
                    setCurrentProgram({...currentProgram, hora_inicio: `${hours}:${minutes}`});
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined" 
                    error={!currentProgram.hora_inicio && formik.submitCount > 0}
                    helperText={!currentProgram.hora_inicio && formik.submitCount > 0 ? 'La hora de inicio es obligatoria' : ''}
                  />
                )}
              />
            </Grid>
            
            {/* Hora de fin */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Hora de fin"
                value={currentProgram.hora_fin ? new Date(`2022-01-01T${currentProgram.hora_fin}`) : null}
                onChange={(newTime) => {
                  if (newTime) {
                    const hours = newTime.getHours().toString().padStart(2, '0');
                    const minutes = newTime.getMinutes().toString().padStart(2, '0');
                    setCurrentProgram({...currentProgram, hora_fin: `${hours}:${minutes}`});
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined" 
                    error={!currentProgram.hora_fin && formik.submitCount > 0}
                    helperText={!currentProgram.hora_fin && formik.submitCount > 0 ? 'La hora de fin es obligatoria' : ''}
                  />
                )}
              />
            </Grid>
            
            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                variant="outlined"
                value={currentProgram.descripcion}
                onChange={(e) => setCurrentProgram({...currentProgram, descripcion: e.target.value})}
                error={!currentProgram.descripcion && formik.submitCount > 0}
                helperText={!currentProgram.descripcion && formik.submitCount > 0 ? 'La descripción es obligatoria' : ''}
              />
            </Grid>
            
            {/* Es descanso */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={currentProgram.es_descanso} 
                    onChange={(e) => setCurrentProgram({...currentProgram, es_descanso: e.target.checked})}
                  />
                }
                label="Es periodo de descanso"
              />
            </Grid>
            
            {/* Botón para añadir */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddProgram}
                fullWidth={isMobile}
              >
                Añadir horario
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Lista de programas añadidos */}
      {formik.values.program?.programas?.length > 0 && (
        <Paper elevation={isMobile ? 0 : 1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Programas añadidos
          </Typography>
          
          <List>
            {formik.values.program.programas.map((program, index) => (
              <Paper 
                key={program.id} 
                elevation={1} 
                sx={{ p: 2, mb: 2, border: program.id === currentProgramId ? `2px solid ${theme.palette.primary.main}` : 'none' }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={9}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {program.descripcion}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha:</strong> {new Date(program.fecha_inicio).toLocaleDateString()} - {new Date(program.fecha_fin).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Horario:</strong> {program.hora_inicio} - {program.hora_fin}
                    </Typography>
                    {program.es_descanso && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Periodo de descanso
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 2, sm: 0 } }}>
                    <Button
                      variant={currentProgramId === program.id && showActivityForm ? "contained" : "outlined"}
                      color="primary"
                      size="small"
                      onClick={() => {
                        setCurrentProgramId(program.id);
                        setShowActivityForm(!showActivityForm);
                      }}
                      sx={{ mr: 1 }}
                    >
                      {currentProgramId === program.id && showActivityForm ? "Ocultar" : "Añadir actividad"}
                    </Button>
                    <IconButton 
                      color="error" 
                      onClick={() => {
                        const newPrograms = formik.values.program.programas.filter(p => p.id !== program.id);
                        formik.setFieldValue('program.programas', newPrograms);
                        
                        // También filtramos las actividades asociadas con este programa
                        const newActivities = formik.values.program.actividades.filter(a => a.id_programa !== program.id);
                        formik.setFieldValue('program.actividades', newActivities);
                        
                        if (currentProgramId === program.id) {
                          setCurrentProgramId(null);
                          setShowActivityForm(false);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  
                  {/* Actividades del programa */}
                  {formik.values.program.actividades.filter(a => a.id_programa === program.id).length > 0 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Actividades:
                      </Typography>
                      <List dense>
                        {formik.values.program.actividades
                          .filter(a => a.id_programa === program.id)
                          .map((activity, actIndex) => (
                            <ListItem key={`activity-${program.id}-${actIndex}`}>
                              <ListItemText 
                                primary={activity.nombre}
                                secondary={`${activity.descripcion} - Max. asistentes: ${activity.max_asistentes}`}
                              />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  edge="end" 
                                  color="error"
                                  onClick={() => {
                                    const newActivities = formik.values.program.actividades.filter((_, i) => 
                                      !(formik.values.program.actividades[i].nombre === activity.nombre && 
                                        formik.values.program.actividades[i].id_programa === program.id)
                                    );
                                    formik.setFieldValue('program.actividades', newActivities);
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))
                        }
                      </List>
                    </Grid>
                  )}
                  
                  {/* Formulario para añadir actividad */}
                  {currentProgramId === program.id && showActivityForm && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Nueva actividad
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {/* Nombre actividad */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Nombre"
                            variant="outlined"
                            value={currentActivity.nombre}
                            onChange={(e) => setCurrentActivity({...currentActivity, nombre: e.target.value})}
                          />
                        </Grid>
                        
                        {/* Máximo asistentes */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Máximo asistentes"
                            variant="outlined"
                            type="number"
                            value={currentActivity.max_asistentes}
                            onChange={(e) => setCurrentActivity({...currentActivity, max_asistentes: e.target.value})}
                          />
                        </Grid>
                        
                        {/* Descripción actividad */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Descripción"
                            variant="outlined"
                            multiline
                            rows={2}
                            value={currentActivity.descripcion}
                            onChange={(e) => setCurrentActivity({...currentActivity, descripcion: e.target.value})}
                          />
                        </Grid>
                        
                        {/* Botones para actividad */}
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                // Validación básica
                                if (!currentActivity.nombre || !currentActivity.descripcion || !currentActivity.max_asistentes) {
                                  return;
                                }
                                
                                // Añadir actividad al programa actual
                                const newActivity = {
                                  ...currentActivity,
                                  id_programa: currentProgramId
                                };
                                
                                const updatedActivities = [...(formik.values.program?.actividades || []), newActivity];
                                formik.setFieldValue('program.actividades', updatedActivities);
                                
                                // Reset form
                                setCurrentActivity({
                                  nombre: '',
                                  descripcion: '',
                                  max_asistentes: '',
                                  tipo_usuario: ''
                                });
                              }}
                              fullWidth={isMobile}
                            >
                              Añadir actividad
                            </Button>
                            
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                setShowActivityForm(false);
                                setCurrentProgramId(null);
                                setCurrentActivity({
                                  nombre: '',
                                  descripcion: '',
                                  max_asistentes: '',
                                  tipo_usuario: ''
                                });
                              }}
                              fullWidth={isMobile}
                            >
                              Finalizar actividades
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

ProgramStep.propTypes = {
  formik: PropTypes.object.isRequired
};

export default ProgramStep;
