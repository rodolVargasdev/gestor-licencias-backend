import { configureStore } from '@reduxjs/toolkit';
import departamentosReducer from './slices/departamentosSlice';
import puestosReducer from './slices/puestosSlice';
import trabajadoresReducer from './slices/trabajadoresSlice';
import tiposLicenciasReducer from './slices/tiposLicenciasSlice';
import validacionesReducer from './slices/validacionesSlice';
import licenciasReducer from './slices/licenciasSlice';

export const store = configureStore({
  reducer: {
    departamentos: departamentosReducer,
    puestos: puestosReducer,
    trabajadores: trabajadoresReducer,
    tiposLicencias: tiposLicenciasReducer,
    validaciones: validacionesReducer,
    licencias: licenciasReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 