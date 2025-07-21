import * as Yup from 'yup'

// Validation schema for main event step
export const mainEventSchema = Yup.object({
  mainEvent: Yup.object({
    title: Yup.string().required('El título del evento es obligatorio'),
    hasSubevents: Yup.boolean(),
  }),
})

// Validation schema for general information step
export const generalInfoSchema = Yup.object({
  generalInfo: Yup.object({
    title: Yup.string().required('El título es obligatorio'),
    startDate: Yup.date().required('La fecha de inicio es obligatoria'),
    endDate: Yup.date()
      .required('La fecha de fin es obligatoria')
      .min(
        Yup.ref('startDate'),
        'La fecha de fin debe ser posterior a la fecha de inicio'
      ),
    description: Yup.string().required('La descripción es obligatoria'),
    images: Yup.array()
      .min(1, 'Debe subir al menos una imagen')
      .max(5, 'No puede subir más de 5 imágenes'),
    userType: Yup.string().required('El tipo de usuario es obligatorio'),
  }),
})

// Validation schema for dress code step
export const dressCodeSchema = Yup.object({
  dressCode: Yup.object({
    dressCodeId: Yup.number().required('Debe seleccionar un dress code'),
    name: Yup.string(),
    images: Yup.array()
      .min(1, 'Debe subir al menos una imagen')
      .max(5, 'No puede subir más de 5 imágenes'),
  }),
})

// Validation schema for location step
export const locationSchema = Yup.object({
  location: Yup.object({
    place: Yup.string().required('El lugar es obligatorio'),
    address: Yup.string().required('La dirección es obligatoria'),
    mapsUrl: Yup.string().url('Debe ser una URL válida').required('El enlace de Google Maps es obligatorio'),
    directions: Yup.array().of(
      Yup.object({
        name: Yup.string().required('El nombre de la indicación es obligatorio'),
        description: Yup.string().required('La descripción de la indicación es obligatoria'),
      })
    ),
    parkings: Yup.array().of(
      Yup.object({
        name: Yup.string().required('El nombre del aparcamiento es obligatorio'),
        description: Yup.string().required('La descripción del aparcamiento es obligatoria'),
        mapsUrl: Yup.string().url('Debe ser una URL válida'),
      })
    ),
    interestPoints: Yup.array().of(
      Yup.object({
        name: Yup.string().required('El nombre del lugar de interés es obligatorio'),
        description: Yup.string().required('La descripción del lugar de interés es obligatoria'),
        mapsUrl: Yup.string().url('Debe ser una URL válida'),
      })
    ),
  }),
})

// Validation schema for program step
export const programSchema = Yup.object({
  program: Yup.object({
    programas: Yup.array(),
    actividades: Yup.array()
  }),
})

// Validation schema for documents step
export const documentsSchema = Yup.object({
  documents: Yup.object({
    files: Yup.array(),
    requiresSignature: Yup.array(),
    documentUrls: Yup.array()
  }),
})

// Validation schema for contact step
export const contactSchema = Yup.object({
  contacto: Yup.object({
    nombre_completo: Yup.string(),
    email: Yup.string().email('Debe ser un email válido'),
    telefono: Yup.string(),
  }),
})

// Validation schema for survey step
export const encuestaSchema = Yup.object({
  encuesta: Yup.object({
    enlace: Yup.string()
      .url('Debe ser una URL válida')
      .required('El enlace de la encuesta es obligatorio'),
  }),
})

export const validationSchemas = [
  mainEventSchema,
  generalInfoSchema,
  dressCodeSchema,
  locationSchema,
  programSchema,
  documentsSchema,
  contactSchema,
  encuestaSchema
]
