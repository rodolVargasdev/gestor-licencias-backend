import * as yup from 'yup';
import { EstadoValidacion } from '../types/validacion';

export const validacionSchema = yup.object().shape({
  tipoLicenciaId: yup
    .number()
    .required('El tipo de licencia es requerido')
    .min(1, 'Debe seleccionar un tipo de licencia válido'),
  
  trabajadorId: yup
    .number()
    .required('El trabajador es requerido')
    .min(1, 'Debe seleccionar un trabajador válido'),
  
  fechaInicio: yup
    .string()
    .required('La fecha de inicio es requerida')
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      'La fecha debe tener el formato YYYY-MM-DD'
    ),
  
  fechaFin: yup
    .string()
    .required('La fecha de fin es requerida')
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      'La fecha debe tener el formato YYYY-MM-DD'
    )
    .test(
      'fecha-posterior',
      'La fecha de fin debe ser posterior a la fecha de inicio',
      function(value) {
        const { fechaInicio } = this.parent;
        if (!fechaInicio || !value) return true;
        return new Date(value) > new Date(fechaInicio);
      }
    ),
  
  estado: yup
    .string()
    .required('El estado es requerido')
    .oneOf(
      ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'],
      'Estado no válido'
    ),
  
  observaciones: yup
    .string()
    .max(500, 'Las observaciones no pueden exceder los 500 caracteres')
}); 