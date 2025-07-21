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
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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

const StepFour = ({ formik }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [selectedDay, setSelectedDay] = useState(0);
  const [tempProgram, setTempProgram] = useState({
    nombre: '',
    fecha_inicio: null,
    fecha_fin: null,
    hora_inicio: '09:00:00',
    hora_fin: '10:00:00',
    descripcion: '',
    actividades: [],
    tipo_usuario: [],
    es_descanso: false
  });
  
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState(-1);
  const [tempActivity, setTempActivity] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    max_asistentes: 0,
    imagenes: [],
    imagenesUpload: []
  });

  // Consulta para obtener tipos de usuario
  const { data: userTypes = [] } = useQuery({
    queryKey: ['userTypes'],
    queryFn: userTypesService.getUserTypes,
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

  // Open dialog to add/edit program
  const handleOpenDialog = (index = -1) => {
    setEditingIndex(index);
    
    if (index === -1) {
      // Añadir nuevo programa
      // Si hay días disponibles, usar la fecha del día seleccionado
      let startDate = null;
      let endDate = null;
      
      if (days.length > 0 && selectedDay < days.length) {
        startDate = new Date(days[selectedDay]);
        endDate = new Date(days[selectedDay]);
        
        // Establecer horas predeterminadas para inicio y fin
        startDate.setHours(9, 0, 0);
        endDate.setHours(10, 0, 0);
      }
      
      setTempProgram({
        id: '',
        nombre: '',
        fecha_inicio: startDate,
        fecha_fin: endDate,
        hora_inicio: '09:00:00',
        hora_fin: '10:00:00',
        descripcion: '',
        actividades: [],
        tipo_usuario: [],
        es_descanso: false
      });
    } else {
      // Editar programa existente
      const existingProgram = formik.values.programas[index];
      setTempProgram({
        id: existingProgram.id || '',
        nombre: existingProgram.nombre || '',
        fecha_inicio: existingProgram.fecha_inicio ? new Date(existingProgram.fecha_inicio) : null,
        fecha_fin: existingProgram.fecha_fin ? new Date(existingProgram.fecha_fin) : null,
        hora_inicio: existingProgram.hora_inicio || '09:00:00',
        hora_fin: existingProgram.hora_fin || '10:00:00',
        descripcion: existingProgram.descripcion || '',
        actividades: existingProgram.actividades || [],
        tipo_usuario: existingProgram.tipo_usuario || [],
        es_descanso: existingProgram.es_descanso || false
      });
    }
    
    setOpenDialog(true);
  };

  // Close dialog
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

  // Open activity dialog
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
      id: tempActivity.id || '',
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
    
    setTempProgram({ ...tempProgram, actividades: updatedActivities });
    setOpenActivityDialog(false);
  };

  // Delete activity
  const handleDeleteActivity = (index) => {
    const updatedActivities = [...tempProgram.actividades];
    updatedActivities.splice(index, 1);
    setTempProgram({ ...tempProgram, actividades: updatedActivities });
  };
