import { formatHour, formatLocalDate, formatLocalDateAtMidnight } from '../utils/date';
import apiClient from './api';

const eventsService = {
  // Get all events
  getEvents: async (params = {}) => {
    try {
      const response = await apiClient.get('/Evento', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get subevents for a parent event
  getSubevents: async (parentId) => {
    try {
      const response = await apiClient.get(`/Evento/${parentId}/subeventos`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subevents for parent ID ${parentId}:`, error);
      throw error;
    }
  },

  // Upload files to Azure by container type
  uploadFiles: async (files, containerType) => {
    try {
      if (!files || !files.length) return [];
      const formData = new FormData();
      // Append all files to formData
      files.forEach(file => {
        formData.append('files', file);
      });

      // Send files to the upload endpoint
      const response = await apiClient.post(`/Evento/Upload?containerType=${containerType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Return the array of URLs
      return response.data;
    } catch (error) {
      console.error(`Error uploading files with containerType ${containerType}:`, error);
      throw error;
    }
  },

  createSubevent: async (subeventData) => {
    try {
      // Container types according to API docs
      const CONTAINER_TYPES = {
        EVENT_IMAGES: 2,
        DOCUMENTS: 3,
        DRESS_CODE_IMAGES: 4,
        ACTIVITY_IMAGES: 5,
        LOCATION_IMAGES: 6
      };

      // Step 1: Upload all files and get URLs

      // 1.1 Upload event images if any
      let imageUrls = [];
      if (subeventData.ImagenesUpload?.length) {
        imageUrls = await eventsService.uploadFiles(subeventData.ImagenesUpload, CONTAINER_TYPES.EVENT_IMAGES);
      }

      // 1.2 Upload dress code images if any
      let dressCodeImageUrls = [];
      if (subeventData.ImagenesDressCodeUpload?.length) {
        dressCodeImageUrls = await eventsService.uploadFiles(subeventData.ImagenesDressCodeUpload, CONTAINER_TYPES.DRESS_CODE_IMAGES);
      }

      // 1.3 Upload documents if any
      let documentUrls = [];
      if (subeventData.documentos?.length) {
        const files = subeventData.documentos.map((item) => item.archivo)
        documentUrls = await eventsService.uploadFiles(files, CONTAINER_TYPES.DOCUMENTS);
        
      }

      // 1.4 Upload signature documents if any
      let signatureDocUrls = [];
      if (subeventData.DocumentosFirmaUpload?.length) {
        signatureDocUrls = await eventsService.uploadFiles(subeventData.DocumentosFirmaUpload, CONTAINER_TYPES.DOCUMENTS);
      }

      // 1.5 Upload location images if any
      let locationImageUrls = [];
      if (subeventData.UbicacionImagenesUpload?.length) {
        locationImageUrls = await eventsService.uploadFiles(subeventData.UbicacionImagenesUpload, CONTAINER_TYPES.LOCATION_IMAGES);
      }
      
      // 1.6 Upload activity images if any
      let activityImageUrls = [];
      // Recolectar todas las imágenes de actividades de todos los programas
      const activityImages = [];
      let activityImagesMappings = []; // Para guardar a qué actividad pertenece cada imagen
      
      // Recorremos todos los programas y actividades para recopilar las imágenes
      if (subeventData.programas?.length) {
        subeventData.programas.forEach((programa, programaIndex) => {
          if (programa.actividades?.length) {
            programa.actividades.forEach((actividad, actividadIndex) => {
              if (actividad.imagenesUpload?.length) {
                // Guardar información de cada imagen para luego asignarla a la actividad correcta
                actividad.imagenesUpload.forEach(img => {
                  activityImages.push(img);
                  activityImagesMappings.push({
                    programaIndex,
                    actividadIndex,
                    originalLength: actividad.imagenes ? actividad.imagenes.length : 0
                  });
                });
              }
            });
          }
        });
      }
      
      // Subir las imágenes si existen
      if (activityImages.length > 0) {
        activityImageUrls = await eventsService.uploadFiles(activityImages, CONTAINER_TYPES.ACTIVITY_IMAGES);
      }

      // Step 2: Prepare JSON payload matching the API schema
      const eventPayload = {
        // Basic event info
        titulo: subeventData.titulo,
        descripcion: subeventData.descripcion,
        fecha_inicio: subeventData.fecha_inicio instanceof Date ?
          formatLocalDate(subeventData.fecha_inicio) : subeventData.fecha_inicio,
        fecha_fin: subeventData.fecha_fin instanceof Date ?
          formatLocalDate(subeventData.fecha_fin) : subeventData.fecha_fin,
        id_evento_padre: parseInt(subeventData.IdEventoPadre, 10),
        estado: subeventData.estado || 'Borrador',
        subeventos: false,
        // Incluir enlace de encuesta si existe - como objeto con propiedad enlace
        ...(subeventData.enlace_encuesta ? { encuesta: { enlace: subeventData.enlace_encuesta } } : {}),

        // Event images como array de strings
        imagenes: [
          // Incluir URLs de imágenes existentes como strings
          ...subeventData.imagenes?.filter(img => typeof img === 'object' && img.url)
            .map(img => {
              // Si url es un objeto anidado, obtener el string url
              if (typeof img.url === 'object' && img.url && img.url.url) {
                return img.url.url;
              }
              // Si url es un string directo
              if (typeof img.url === 'string') {
                return img.url;
              }
              return null;
            }).filter(url => url !== null) || [],

          // Añadir URLs nuevas directamente
          ...imageUrls
        ],

        // User types
        tipos_usuarios: subeventData.tipo_usuario?.map(userType => {
          if (typeof userType === 'object' && userType !== null) {
            return {
              id: parseInt(userType.id, 10),
              nombre: userType.nombre || ''
            };
          } else {
            // Para casos donde solo tenemos el ID
            return {
              id: parseInt(userType, 10),
              nombre: ''
            };
          }
        }) || [],

        // Dress code and its images
        dress_code: subeventData.dressCode?.id ? {
          id: subeventData.dressCode.id,
          nombre: subeventData.dressCode.nombre,
          imagenes_dress_code: [
            // Incluir URLs de imágenes existentes como strings
            ...subeventData.imagenesDressCode?.filter(img => typeof img === 'object' && img.url)
              .map(img => {
                // Si url es un objeto anidado, obtener el string url
                if (typeof img.url === 'object' && img.url && img.url.url) {
                  return img.url.url;
                }
                // Si url es un string directo
                if (typeof img.url === 'string') {
                  return img.url;
                }
                return null;
              }).filter(url => url !== null) || [],

            // Añadir URLs nuevas directamente
            ...dressCodeImageUrls
          ]
        } : null,

        // Location
        ubicacion: subeventData.ubicacion ? {
          lugar: subeventData.ubicacion.lugar,
          direccion: subeventData.ubicacion.direccion,
          enlace_maps: subeventData.ubicacion.enlaceMaps || subeventData.ubicacion.enlace_maps,
          id_icono: subeventData.ubicacion.idIcono || subeventData.ubicacion.id_icono,
          // Imágenes de ubicación como array de strings
          imagenes: [
            // Incluir URLs de imágenes existentes como strings
            ...(subeventData.ubicacion.imagenes || [])
              .map(img => {
                // Si es un objeto con url
                if (typeof img === 'object' && img !== null) {
                  // Si url es un objeto anidado
                  if (typeof img.url === 'object' && img.url && img.url.url) {
                    return img.url.url;
                  }
                  // Si url es un string directo
                  if (typeof img.url === 'string') {
                    return img.url;
                  }
                }
                // Si es un string directo
                if (typeof img === 'string') {
                  return img;
                }
                return null;
              }).filter(url => url !== null),

            // Añadir nuevas URLs de imágenes directamente
            ...locationImageUrls
          ],
          como_llegar: (subeventData.ubicacion.comoLlegar || []).map(item => {
            // Si ya es un objeto, asegurarse de que id sea un entero o null
            if (typeof item === 'object' && item !== null) {
              return {
                ...item,
                ...(item.id !== undefined && item.id !== null ? { id: parseInt(item.id, 10), id_ubicacion: null } : {})
              };
            }
            // Si no es un objeto, devolver el item como está (no debería ocurrir)
            return item;
          }),
          aparcamientos: (subeventData.ubicacion.aparcamientos || []).map(item => {
            if (typeof item === 'object' && item !== null) {
              return {
                ...item,
                id: item.id === '' ? null : item.id,
                id_ubicacion: item.id_ubicacion === '' ? null : item.id_ubicacion
              };
            }
            return item;
          }),
          lugares_interes: (subeventData.ubicacion.lugaresInteres || []).map(item => {
            if (typeof item === 'object' && item !== null) {
              return {
                ...item,
                id: item.id === '' ? null : item.id,
                id_ubicacion: item.id_ubicacion === '' ? null : item.id_ubicacion
              };
            }
            return item;
          })
        } : null,

        // Programs/Agenda
        programas: subeventData.programas?.map((programa, programaIndex) => ({
          ...(programa.id ? { id: programa.id } : {}),
          // Formatear las fechas siempre a las 00:00 (medianoche)
          fecha_inicio: programa.fecha_inicio instanceof Date ?
            formatLocalDateAtMidnight(programa.fecha_inicio) : formatLocalDateAtMidnight(programa.fecha_inicio),
          fecha_fin: programa.fecha_fin instanceof Date ?
            formatLocalDateAtMidnight(programa.fecha_fin) : formatLocalDateAtMidnight(programa.fecha_fin),
          hora_inicio: programa.hora_inicio ? formatHour(programa.hora_inicio) : '',
          hora_fin: programa.hora_fin ? formatHour(programa.hora_fin) : '',
          descripcion: programa.descripcion || '',
          es_descanso: programa.es_descanso || false,
          actividades: programa.actividades?.map((actividad, actividadIndex) => {
            // Construimos el array de imágenes combinando las existentes y las recién subidas
            let imagenesCombinadas = [];
            
            // 1. Añadir imágenes existentes (convertidas a strings si son objetos)
            if (actividad.imagenes && actividad.imagenes.length > 0) {
              imagenesCombinadas = actividad.imagenes.map(img => {
                if (typeof img === 'object' && img !== null && img.url) {
                  return img.url;
                }
                return img;
              });
            }
            
            // 2. Añadir nuevas imágenes subidas para esta actividad
            if (activityImageUrls && activityImageUrls.length > 0) {
              // Buscar imágenes que correspondan a esta actividad
              activityImagesMappings.forEach((mapping, index) => {
                if (mapping.programaIndex === programaIndex && mapping.actividadIndex === actividadIndex) {
                  // Esta URL pertenece a esta actividad
                  if (activityImageUrls[index]) {
                    imagenesCombinadas.push(activityImageUrls[index]);
                  }
                }
              });
            }
            
            return {
              id: actividad.id === '' ? null : actividad.id,
              nombre: actividad.nombre || '',
              descripcion: actividad.descripcion || '',
              max_asistentes: actividad.max_asistentes || 0,
              id_programa: actividad.id_programa,
              imagenes: imagenesCombinadas
            };
          }) || []
        })) || [],
        
        // Documents - objetos completos con url, url_lectura_segura y nombre
        documentos: [
          
          // Añadir nuevos documentos como objetos completos
          ...documentUrls.map((url, index) => {
            // Asegurar que url sea un string
            const urlStr = typeof url === 'string' ? url : 
                         (typeof url === 'object' && url !== null && typeof url.url === 'string' ? url.url : 
                         (typeof url === 'object' && url !== null && url.toString ? url.toString() : ''));
            
            return {
              url: urlStr,
              url_lectura_segura: urlStr,
              nombre: urlStr && typeof urlStr === 'string' ? urlStr.split('/').pop() : 'documento',
              necesita_firma: subeventData?.documentos?.[index].requiere_firma || false ,  //Se obtiene por posicion del array original
              firmado: false
            };
          }),
          
          // Añadir documentos de firma como objetos completos
          ...signatureDocUrls.map(url => {
            // Asegurar que url sea un string
            const urlStr = typeof url === 'string' ? url : 
                         (typeof url === 'object' && url !== null && typeof url.url === 'string' ? url.url : 
                         (typeof url === 'object' && url !== null && url.toString ? url.toString() : ''));
            
            return {
              url: urlStr,
              url_lectura_segura: urlStr,
              nombre: urlStr && typeof urlStr === 'string' ? urlStr.split('/').pop() : 'documento',
              necesita_firma: true,
              firmado: false
            };
          })
        ],

        // Contacts
        contactos: subeventData.contactos?.map(contacto => ({
          ...(contacto.id ? { id: contacto.id } : {}),
          nombre_completo: contacto.nombre_completo || '',
          email: contacto.email || '',
          telefono: contacto.telefono || ''
        })) || []
      };


      // Enviar el payload JSON a la API directamente, sin envoltorio dto
      const response = await apiClient.post('/Evento/CreateSubevento', eventPayload);
      return response.data;
    } catch (error) {
      console.error('Error creating subevent:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await apiClient.get(`/Evento/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      // Container types according to API docs
      const CONTAINER_TYPES = {
        EVENT_IMAGES: 2,
        DOCUMENTS: 3,
        DRESS_CODE_IMAGES: 4,
        ACTIVITY_IMAGES: 5,
        LOCATION_IMAGES: 6
      };

      // Determinar si es un evento padre con subevents o un evento principal sin subevents
      const hasSubevents = eventData.subeventos === true;

      // Para ambos casos usamos FormData con el endpoint /Evento
      const formData = new FormData();

      // Agregar título y descripción
      formData.append('Titulo', eventData.titulo);
      formData.append('Descripcion', eventData.descripcion);

      // Indicar si tiene o no subevents
      formData.append('Subeventos', hasSubevents);

      // Agregar imágenes si existen
      if (eventData.imagenes && Array.isArray(eventData.imagenes)) {
        eventData.imagenes.forEach((image) => {
          formData.append('Imagenes', image);
        });
      }

      const response = await apiClient.post('/Evento', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update an existing event
  updateEvent: async (id, eventData, useJsonFormat = true) => {
    try {


      // Container types according to API docs
      const CONTAINER_TYPES = {
        EVENT_IMAGES: 2,
        DOCUMENTS: 3,
        DRESS_CODE_IMAGES: 4,
        ACTIVITY_IMAGES: 5,
        LOCATION_IMAGES: 6,
      };

      // Paso 1: Subir imágenes del evento si hay nuevas (File objects)
      let eventImageUrls = [];
      if (eventData.ImagenesUpload && eventData.ImagenesUpload.length > 0) {
        eventImageUrls = await eventsService.uploadFiles(
          eventData.ImagenesUpload,
          CONTAINER_TYPES.EVENT_IMAGES
        );
      }

      // Paso 2: Subir imágenes de dress code si hay nuevas
      let dressCodeImageUrls = [];
      if (eventData.ImagenesDressCodeUpload && eventData.ImagenesDressCodeUpload.length > 0) {
        const imgString = await eventsService.uploadFiles(
          eventData.ImagenesDressCodeUpload,
          CONTAINER_TYPES.DRESS_CODE_IMAGES
        )

        dressCodeImageUrls = imgString.map((img) => ({ url: img.url, url_lectura_segura: img.url }))
      }

      // Paso 3: Subir imágenes de ubicación si hay nuevas
      let locationImageUrls = [];
      if (eventData.UbicacionImagenesUpload && eventData.UbicacionImagenesUpload.length > 0) {
        locationImageUrls = await eventsService.uploadFiles(
          eventData.UbicacionImagenesUpload,
          CONTAINER_TYPES.LOCATION_IMAGES
        );
      }

      // Paso 4: Subir documentos si hay nuevos
      let documentUrls = [];
      if (eventData.DocumentosUpload && eventData.DocumentosUpload.length > 0) {
        documentUrls = await eventsService.uploadFiles(
          eventData.DocumentosUpload,
          CONTAINER_TYPES.DOCUMENTS
        );
      }

      // Paso 5: Subir documentos de firma si hay nuevos
      let signatureDocumentUrls = [];
      if (eventData.DocumentosFirmaUpload && eventData.DocumentosFirmaUpload.length > 0) {
        signatureDocumentUrls = await eventsService.uploadFiles(
          eventData.DocumentosFirmaUpload,
          CONTAINER_TYPES.DOCUMENT_SIGNATURE
        );
      }

      // Imágenes existentes + nuevas URLs como strings
      const imagenes = [
        // Convertir imágenes existentes a strings
        ...(Array.isArray(eventData.imagenes) ? eventData.imagenes : []),
        // Añadir nuevas URLs directamente
        ...eventImageUrls
      ];

      // Imágenes de dress code existentes + nuevas URLs como strings
      const imagenesDressCode = [
        // Convertir imágenes existentes a strings
        ...(Array.isArray(eventData.imagenesDressCode) ?
          eventData.imagenesDressCode: []),
        // Añadir nuevas URLs directamente
        ...dressCodeImageUrls
      ];


      // Ubicación con imágenes como array de strings
      let ubicacion = null;
      if (eventData.ubicacion) {
        // Convertir imágenes a array de strings
        const imagenesUbicacion = [
          // Imágenes existentes como strings
          ...(Array.isArray(eventData.ubicacion.imagenes) ?
            eventData.ubicacion.imagenes
              .filter(img => {
                if (typeof img === 'object' && img !== null) return img.url;
                if (typeof img === 'string') return true;
                return false;
              })
              .map(img => {
                // Si es un objeto con url
                if (typeof img === 'object' && img !== null && img.url) {
                  // Si url es un objeto anidado
                  if (typeof img.url === 'object' && img.url && img.url.url) {
                    return img.url.url;
                  }
                  // Si url es un string directo
                  if (typeof img.url === 'string') {
                    return img.url;
                  }
                }
                // Si ya es un string
                if (typeof img === 'string') return img;
                return null;
              })
              .filter(url => url !== null)
            : []),
          // Nuevas URLs directamente
          ...locationImageUrls
        ];

        ubicacion = {
          ...eventData.ubicacion,
          id_icono: eventData.ubicacion.idIcono || eventData.ubicacion.id_icono,
          enlace_maps: eventData.ubicacion.enlaceMaps || eventData.ubicacion.enlace_maps,
          imagenes: imagenesUbicacion
        };
      }

      // Documentos existentes + nuevos URLs
      const documentos = [
        ...(Array.isArray(eventData.documentos) ? eventData.documentos.filter(doc => typeof doc === 'object' && 'url' in doc).map(doc => {
          // Crear un objeto base sin ID
          const cleanedDoc = {
            // Si url es un objeto con propiedad url, extraer el string
            url: typeof doc.url === 'object' && doc.url && doc.url.url ? doc.url.url : doc.url,
            // Si url_lectura_segura es un objeto con propiedad url, extraer el string
            url_lectura_segura: typeof doc.url_lectura_segura === 'object' && doc.url_lectura_segura && doc.url_lectura_segura.url ? doc.url_lectura_segura.url : doc.url_lectura_segura,
            // Mantener otras propiedades no ID
            nombre: doc.nombre,
            necesita_firma: doc.necesita_firma || false,
            firmado: doc.firmado || false
          };
          
          // Añadir IDs solo si existen
          if (doc.id !== undefined && doc.id !== null) cleanedDoc.id = doc.id;
          if (doc.id_evento !== undefined && doc.id_evento !== null) cleanedDoc.id_evento = doc.id_evento;
          if (doc.id_invitado !== undefined && doc.id_invitado !== null) cleanedDoc.id_invitado = doc.id_invitado;
          
          return cleanedDoc;
        }) : []),
        ...documentUrls.map(url => {
          // Asegurar que url sea un string
          const urlStr = typeof url === 'string' ? url : 
                       (typeof url === 'object' && url !== null && typeof url.url === 'string' ? url.url : 
                       (typeof url === 'object' && url !== null && url.toString ? url.toString() : ''));
          
          return {
            url: urlStr,
            url_lectura_segura: urlStr,
            nombre: urlStr && typeof urlStr === 'string' ? urlStr.split('/').pop() : 'documento',
            necesita_firma: false,
            firmado: false
          };
        })
      ];

      // Documentos de firma existentes + nuevos URLs
      const documentosFirma = [
        ...(Array.isArray(eventData.documentosFirma) ? eventData.documentosFirma.filter(doc => typeof doc === 'object' && 'url' in doc).map(doc => {
          // Crear un objeto base sin ID
          const cleanedDoc = {
            // Si url es un objeto con propiedad url, extraer el string
            url: typeof doc.url === 'object' && doc.url && doc.url.url ? doc.url.url : doc.url,
            // Si url_lectura_segura es un objeto con propiedad url, extraer el string
            url_lectura_segura: typeof doc.url_lectura_segura === 'object' && doc.url_lectura_segura && doc.url_lectura_segura.url ? doc.url_lectura_segura.url : doc.url_lectura_segura,
            // Mantener otras propiedades no ID
            nombre: doc.nombre,
            necesita_firma: true,
            firmado: doc.firmado || false
          };
          
          // Añadir IDs solo si existen
          if (doc.id !== undefined && doc.id !== null) cleanedDoc.id = doc.id;
          if (doc.id_evento !== undefined && doc.id_evento !== null) cleanedDoc.id_evento = doc.id_evento;
          if (doc.id_invitado !== undefined && doc.id_invitado !== null) cleanedDoc.id_invitado = doc.id_invitado;
          
          return cleanedDoc;
        }) : []),
        ...signatureDocumentUrls.map(url => {
          // Asegurar que url sea un string
          const urlStr = typeof url === 'string' ? url : 
                       (typeof url === 'object' && url !== null && typeof url.url === 'string' ? url.url : 
                       (typeof url === 'object' && url !== null && url.toString ? url.toString() : ''));
          
          return {
            url: urlStr,
            url_lectura_segura: urlStr,
            nombre: urlStr && typeof urlStr === 'string' ? urlStr.split('/').pop() : 'documento',
            necesita_firma: true,
            firmado: false
          };
        })
      ];

      let response;

      // Elegir entre formato JSON o multipart/form-data
      if (useJsonFormat) {
        // Mantener estructura de objetos para ubicacion.imagenes
        let ubicacionModificada = ubicacion;
        if (ubicacion && ubicacion.imagenes && Array.isArray(ubicacion.imagenes)) {
          ubicacionModificada = {
            ...ubicacion,
            // Mantener o convertir a estructura de objetos {url, fileName}
            imagenes: ubicacion.imagenes.map(img => {
              // Si ya es un objeto con url
              if (typeof img === 'object' && img !== null) {
                if (img.url) {
                  // Asegurar que url sea un string
                  const urlStr = typeof img.url === 'string' ? img.url : 
                               (typeof img.url === 'object' && img.url && img.url.url ? img.url.url : '');
                  
                  // Mantener estructura de objeto con url y fileName
                  return {
                    url: urlStr,
                    fileName: img.fileName || urlStr.split('/').pop() || 'image'
                  };
                }
                return null;
              }
              // Si es un string, convertir a objeto
              if (typeof img === 'string') {
                return {
                  url: img,
                  fileName: img.split('/').pop() || 'image'
                };
              }
              // Si no es ninguno de los anteriores, ignorarlo
              return null;
            }).filter(img => img !== null) // Filtrar valores nulos
          };
        }

        // Formato JSON para el flujo de guardar y salir en wizard completo
        const eventPayload = {
          id,  // Incluir ID en el payload
          titulo: eventData.titulo,
          descripcion: eventData.descripcion,
          fecha_inicio: eventData.fecha_inicio,
          fecha_fin: eventData.fecha_fin,
          imagenes,
          tipos_usuarios: Array.isArray(eventData.tipos_usuarios) ?
            eventData.tipos_usuarios
              .map(tipo => {
                if (!tipo) return null;

                // Solo incluir ID si ya existe y es válido (no nulo)
                const tieneIdValido = tipo.id &&
                  (typeof tipo.id === 'number' ||
                    (typeof tipo.id === 'string' && !isNaN(parseInt(tipo.id))));

                if (tieneIdValido) {
                  // Caso de edición: incluir ID existente
                  return {
                    id: typeof tipo.id === 'string' ? parseInt(tipo.id) : tipo.id,
                    nombre: tipo.nombre || ''
                  };
                } else {
                  // Caso de creación: solo enviar nombre, el backend asignará ID
                  return {
                    nombre: tipo.nombre || ''
                  };
                }
              })
              .filter(tipo => tipo !== null) : [],
          dressCode: eventData.dressCode ? {
            id: eventData.dressCode.id,
            nombre: eventData.dressCode.nombre,
            // Imágenes convertidas a array de strings directamente en dress_code
            imagenes_dress_code: imagenesDressCode
          } : null,
          // Ya no enviamos imágenes de dress code por separado
          ubicacion: ubicacionModificada, // Usar la versión modificada
          documentos,
          documentosFirma,
          programas: Array.isArray(eventData.programas) ? eventData.programas.map(programa => {
            // Crear objeto base sin ID
            const cleanedPrograma = {
              fecha_inicio: programa.fecha_inicio,
              fecha_fin: programa.fecha_fin,
              hora_inicio: programa.hora_inicio || '',
              hora_fin: programa.hora_fin || '',
              descripcion: programa.descripcion || '',
              es_descanso: programa.es_descanso || false,
              actividades: (programa.actividades || []).map(actividad => {
                // Crear objeto base de actividad sin ID
                const cleanedActividad = {
                  nombre: actividad.nombre || '',
                  descripcion: actividad.descripcion || '',
                  max_asistentes: actividad.max_asistentes || 0,
                  imagenes: actividad.imagenes || []
                };
                
                // Añadir IDs solo si existen y no están vacíos
                if (actividad.id !== undefined && actividad.id !== null && actividad.id !== '') {
                  cleanedActividad.id = actividad.id;
                }
                if (actividad.id_programa !== undefined && actividad.id_programa !== null && actividad.id_programa !== '') {
                  cleanedActividad.id_programa = actividad.id_programa;
                }
                
                return cleanedActividad;
              })
            };
            
            // Añadir ID del programa solo si existe y no está vacío
            if (programa.id !== undefined && programa.id !== null && programa.id !== '') {
              cleanedPrograma.id = programa.id;
            }
            
            return cleanedPrograma;
          }) : [],
          contactos: Array.isArray(eventData.contactos) ? eventData.contactos : [],
          estado: eventData.estado
        };

        // Agregar la propiedad subeventos si existe
        if (eventData.subeventos !== undefined) {
          eventPayload.subeventos = eventData.subeventos;
        }

        // Enviar el payload directamente sin envoltorio dto

        response = await apiClient.put(`/Evento/`, eventPayload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Formato multipart/form-data para el flujo estándar
        const formData = new FormData();
        formData.append('Id', id); // Incluir ID en el payload
        formData.append('Titulo', eventData.titulo);
        formData.append('Descripcion', eventData.descripcion);

        // Agregar fecha inicio y fin si existen
        if (eventData.fecha_inicio) {
          formData.append('Fecha_inicio', eventData.fecha_inicio);
        }

        if (eventData.fecha_fin) {
          formData.append('Fecha_fin', eventData.fecha_fin);
        }

        // Agregar tipos de usuario si existen
        if (Array.isArray(eventData.tipos_usuarios) && eventData.tipos_usuarios.length > 0) {
          formData.append('Tipos_usuarios', JSON.stringify(eventData.tipos_usuarios));
        }

        // Agregar la propiedad subeventos (importante para eventos principales)
        if (eventData.subeventos !== undefined) {
          formData.append('Subeventos', eventData.subeventos);
        }

        // Dress code
        if (eventData.dressCode) {
          formData.append('DressCode', JSON.stringify({
            id: eventData.dressCode.id,
            nombre: eventData.dressCode.nombre
          }));
        }

        // Agregar imágenes
        formData.append('Imagenes', JSON.stringify(imagenes));

        // Agregar imágenes dress code
        formData.append('ImagenesDressCode', JSON.stringify(imagenesDressCode));

        // Agregar ubicación
        if (ubicacion) {
          formData.append('Ubicacion', JSON.stringify(ubicacion));
        }

        // Agregar documentos
        formData.append('Documentos', JSON.stringify(documentos));

        // Agregar documentos firma
        formData.append('DocumentosFirma', JSON.stringify(documentosFirma));

        // Programas y actividades
        if (Array.isArray(eventData.programas) && eventData.programas.length > 0) {
          formData.append('Programas', JSON.stringify(eventData.programas));
        }

        // Contactos
        if (Array.isArray(eventData.contactos) && eventData.contactos.length > 0) {
          formData.append('Contactos', JSON.stringify(eventData.contactos));
        }

        // Estado
        if (eventData.estado) {
          formData.append('Estado', eventData.estado);
        }

        response = await apiClient.put(`/Evento/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error(`Error al actualizar evento con ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (id) => {
    try {
      const response = await apiClient.delete(`/Evento/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting event with ID ${id}:`, error);
      throw error;
    }
  },

  // Actualizar el estado de un evento
  updateEventStatus: async (id, estado) => {
    try {
      const response = await apiClient.patch(`/Evento/${id}/estado`, {
        estado: estado
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado del evento con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Actualizar un evento padre
  updateParentEvent: async (id, eventData) => {
    try {
      const formData = new FormData();
      
      // Datos básicos
      formData.append('Id', id);
      if (eventData.titulo) formData.append('Titulo', eventData.titulo);
      if (eventData.descripcion) formData.append('Descripcion', eventData.descripcion);
      
      // Imágenes existentes ya están en el formValues.imagenes, no necesitamos enviarlas por separado
      
      // Nuevas imágenes para subir - igual que en createEvent
      if (Array.isArray(eventData.imagenesUpload) && eventData.imagenesUpload.length > 0) {
        eventData.imagenesUpload.forEach((image) => {
          formData.append('Imagenes', image);
        });
      }
      
      const response = await apiClient.put('/Evento/UpdatePadre', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar evento padre con ID ${id}:`, error);
      throw error;
    }
  },

  // Get subevent by ID
  getSubeventById: async (id) => {
    try {
      const response = await apiClient.get(`/Evento/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subevent with ID ${id}:`, error);
      throw error;
    }
  },

  // Update an existing subevent
  // Delete a subevent
  deleteSubevent: async (id) => {
    try {
      const response = await apiClient.delete(`/Evento/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subevent with ID ${id}:`, error);
      throw error;
    }
  },

  updateSubevent: async (subeventData) => {
    try {
      // Container types according to API docs
      const CONTAINER_TYPES = {
        EVENT_IMAGES: 2,
        DOCUMENTS: 4,
        DRESS_CODE_IMAGES: 6,
        ACTIVITY_IMAGES: 8
      };

      // Step 1: Upload all files and get URLs

      // 1.1 Upload event images if any
      let imageUrls = [];
      if (subeventData.ImagenesUpload?.length) {
        imageUrls = await eventsService.uploadFiles(subeventData.ImagenesUpload, CONTAINER_TYPES.EVENT_IMAGES);
      }

      // 1.2 Upload dress code images if any
      let dressCodeImageUrls = [];
      if (subeventData.ImagenesDressCodeUpload?.length) {
        dressCodeImageUrls = await eventsService.uploadFiles(subeventData.ImagenesDressCodeUpload, CONTAINER_TYPES.DRESS_CODE_IMAGES);
      }

      // 1.3 Upload documents if any
      let documentUrls = [];
      if (subeventData.DocumentosUpload?.length) {
        documentUrls = await eventsService.uploadFiles(subeventData.DocumentosUpload, CONTAINER_TYPES.DOCUMENTS);
      }

      // 1.4 Upload signature documents if any
      let signatureDocUrls = [];
      if (subeventData.DocumentosFirmaUpload?.length) {
        signatureDocUrls = await eventsService.uploadFiles(subeventData.DocumentosFirmaUpload, CONTAINER_TYPES.DOCUMENTS);
      }

      // 1.5 Upload location images if any
      let locationImageUrls = [];
      if (subeventData.UbicacionImagenesUpload?.length) {
        locationImageUrls = await eventsService.uploadFiles(subeventData.UbicacionImagenesUpload, CONTAINER_TYPES.LOCATION_IMAGES);
      }

      // Step 2: Prepare JSON payload matching the API schema
      const jsonPayload = {
        // Basic event info with ID for update
        id: parseInt(subeventData.id, 10),
        titulo: subeventData.titulo,
        descripcion: subeventData.descripcion,
        fecha_inicio: subeventData.fecha_inicio instanceof Date ?
          subeventData.fecha_inicio.toISOString() : subeventData.fecha_inicio,
        fecha_fin: subeventData.fecha_fin instanceof Date ?
          subeventData.fecha_fin.toISOString() : subeventData.fecha_fin,
        id_evento_padre: parseInt(subeventData.IdEventoPadre, 10),
        estado: subeventData.estado || 'Borrador',
        subeventos: false,

        // Event images - combine existing and new ones
        imagenes: [
          // Include existing images
          ...subeventData.imagenes?.filter(img => typeof img === 'object' && img.id).map(img => ({
            id: img.id,
            id_evento: img.id_evento,
            url: img.url,
            url_lectura_segura: img.url_lectura_segura
          })) || [],

          // Add new image URLs
          ...imageUrls.map(url => ({
            url: url,
            url_lectura_segura: url
          }))
        ],

        // User types
        tipos_usuarios: subeventData.tipo_usuario?.map(userType => {
          if (typeof userType === 'object' && userType !== null) {
            return {
              id: parseInt(userType.id, 10),
              nombre: userType.nombre || ''
            };
          } else {
            // Para casos donde solo tenemos el ID, necesitamos obtener el nombre desde otro lado
            // Podríamos añadir lógica para buscar el nombre correspondiente si es necesario
            return {
              id: parseInt(userType, 10),
              nombre: ''
            };
          }
        }) || [],

        // Dress code and its images
        dress_code: subeventData.dressCode?.id ? {
          id: subeventData.dressCode.id,
          nombre: subeventData.dressCode.nombre,
          imagenes_dress_code: [
            // Include existing dress code images
            ...subeventData.imagenesDressCode?.filter(img => typeof img === 'object' && img.id).map(img => ({
              id: img.id,
              id_evento: img.id_evento,
              id_dress_code: img.id_dress_code,
              url: img.url,
              url_lectura_segura: img.url_lectura_segura
            })) || [],

            // Add new dress code image URLs
            ...dressCodeImageUrls.map(url => ({
              url: url,
              url_lectura_segura: url
            }))
          ]
        } : null,

        // Location
        ubicacion: subeventData.ubicacion ? {
          ...(subeventData.ubicacion.id ? { id: subeventData.ubicacion.id } : {}),
          lugar: subeventData.ubicacion.lugar,
          direccion: subeventData.ubicacion.direccion,
          enlace_maps: subeventData.ubicacion.enlaceMaps || subeventData.ubicacion.enlace_maps,
          id_icono: subeventData.ubicacion.idIcono || subeventData.ubicacion.id_icono,
          // Añadido: imágenes de ubicación - combina imágenes existentes y nuevas
          imagenes: [
            // Incluir imágenes existentes
            ...(subeventData.ubicacion.imagenes || []).map(img => ({
              url: img.url,
              url_lectura_segura: img.url_lectura_segura
            })),

            // Añadir nuevas URLs de imágenes
            ...locationImageUrls.map(url => ({
              url: url,
              url_lectura_segura: url
            }))
          ],
          como_llegar: (subeventData.ubicacion.comoLlegar || []).map(item => {
            // Si ya es un objeto, asegurarse de que id sea un entero o null
            if (typeof item === 'object' && item !== null) {
              return {
                ...item,
                id: item.id !== undefined && item.id !== null ? parseInt(item.id, 10) : null
              };
            }
            // Si no es un objeto, devolver el item como está (no debería ocurrir)
            return item;
          }),
          aparcamientos: subeventData.ubicacion.aparcamientos || [],
          lugares_interes: subeventData.ubicacion.lugares_interes || []
        } : null,

        // Programs/Agenda
        programas: subeventData.programas?.map(programa => ({
          ...(programa.id ? { id: programa.id } : {}),
          fecha_inicio: programa.fecha_inicio instanceof Date ? 
            programa.fecha_inicio.toISOString() : programa.fecha_inicio,
          fecha_fin: programa.fecha_fin instanceof Date ?
            programa.fecha_fin.toISOString() : programa.fecha_fin,
          hora_inicio: programa.hora_inicio || '',
          hora_fin: programa.hora_fin || '',
          descripcion: programa.descripcion || '',
          es_descanso: programa.es_descanso || false,
          actividades: programa.actividades?.map(actividad => ({
            ...(actividad.id ? { id: actividad.id } : {}),
            nombre: actividad.nombre || '',
            descripcion: actividad.descripcion || '',
            max_asistentes: actividad.max_asistentes || 0,
            id_programa: actividad.id_programa,
            imagenes: actividad.imagenes || []
          })) || []
        })) || [],

        // Documents - combine existing and new ones
        documentos: [
          // Include existing documents
          ...subeventData.documentos?.filter(doc => typeof doc === 'object' && doc.id).map(doc => ({
            ...(doc.id ? { id: doc.id } : {}),
            id_evento: doc.id_evento,
            url: doc.url,
            url_lectura_segura: doc.url_lectura_segura,
            necesita_firma: doc.necesita_firma || false,
            firmado: doc.firmado || false,
            id_invitado: doc.id_invitado
          })) || [],

          // Add new document URLs
          ...documentUrls.map(url => {
            // Asegurar que url sea un string
            const urlStr = typeof url === 'string' ? url : 
                         (typeof url === 'object' && url !== null && typeof url.url === 'string' ? url.url : 
                         (typeof url === 'object' && url !== null && url.toString ? url.toString() : ''));
            
            return {
              url: urlStr,
              url_lectura_segura: urlStr,
              nombre: urlStr && typeof urlStr === 'string' ? urlStr.split('/').pop() : 'documento',
              necesita_firma: false,
              firmado: false
            };
          }),
          
          // Add new signature documents
          ...signatureDocUrls.map(url => {
            // Asegurar que url sea un string
            const urlStr = typeof url === 'string' ? url : 
                         (typeof url === 'object' && url !== null && typeof url.url === 'string' ? url.url : 
                         (typeof url === 'object' && url !== null && url.toString ? url.toString() : ''));
            
            return {
              url: urlStr,
              url_lectura_segura: urlStr,
              nombre: urlStr && typeof urlStr === 'string' ? urlStr.split('/').pop() : 'documento',
              necesita_firma: true,
              firmado: false
            };
          })
        ],

        // Contacts
        contactos: subeventData.contactos?.map(contacto => ({
          ...(contacto.id ? { id: contacto.id } : {}),
          nombre_completo: contacto.nombre_completo || '',
          email: contacto.email || '',
          telefono: contacto.telefono || ''
        })) || []
      };

      // Send JSON payload to the API
      const response = await apiClient.put(`/Evento`, jsonPayload);
      return response.data;
    } catch (error) {
      console.error(`Error updating subevent with ID ${subeventData.id}:`, error);
      throw error;
    }
  },
};

export default eventsService;
