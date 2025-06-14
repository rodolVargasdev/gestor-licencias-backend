import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { fetchDisponibilidadByTrabajador } from '../store/slices/disponibilidadSlice';

export const useDisponibilidadUpdate = (trabajadorId: number | null) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!trabajadorId) return;

    const checkLicenciasActivas = async () => {
      try {
        // Actualizar disponibilidad
        dispatch(fetchDisponibilidadByTrabajador(trabajadorId));
      } catch (error) {
        console.error('Error al verificar licencias activas:', error);
      }
    };

    // Verificar inmediatamente al montar el componente
    checkLicenciasActivas();

    // Configurar intervalo para verificar cada 5 minutos
    const intervalId = setInterval(checkLicenciasActivas, 5 * 60 * 1000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [trabajadorId, dispatch]);
}; 