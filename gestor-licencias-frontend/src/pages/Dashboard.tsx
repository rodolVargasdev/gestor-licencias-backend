import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { fetchDepartamentos } from '../store/slices/departamentosSlice';
import { fetchTrabajadores } from '../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../store/slices/tiposLicenciasSlice';
import { fetchValidaciones } from '../store/slices/validacionesSlice';
import { fetchLicencias } from '../store/slices/licenciasSlice';
import { fetchDisponibilidadByAnio } from '../store/slices/disponibilidadSlice';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Licencia } from '../types/licencia';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const departamentos = useSelector((state: RootState) => state.departamentos.items);
  const trabajadores = useSelector((state: RootState) => state.trabajadores.items);
  const tiposLicencias = useSelector((state: RootState) => state.tiposLicencias.items);
  const validaciones = useSelector((state: RootState) => state.validaciones.items);
  const licencias = useSelector((state: RootState) => (state.licencias as { items: Licencia[] }).items);
  const disponibilidad = useSelector((state: RootState) => state.disponibilidad.items);

  useEffect(() => {
    dispatch(fetchDepartamentos());
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
    dispatch(fetchValidaciones());
    dispatch(fetchLicencias());
    dispatch(fetchDisponibilidadByAnio(new Date().getFullYear()));
  }, [dispatch]);

  const menuItems = [
    {
      title: 'Departamentos',
      count: departamentos.length,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      path: '/departamentos',
      color: '#1976d2'
    },
    {
      title: 'Trabajadores',
      count: trabajadores.length,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/trabajadores',
      color: '#2e7d32'
    },
    {
      title: 'Tipos de Licencias',
      count: tiposLicencias.length,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      path: '/tipos-licencias',
      color: '#ed6c02'
    },
    {
      title: 'Validaciones',
      count: validaciones.length,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      path: '/validaciones',
      color: '#9c27b0'
    },
    {
      title: 'Licencias',
      count: licencias.length,
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      path: '/licencias',
      color: '#d32f2f'
    },
    {
      title: 'Disponibilidad',
      count: disponibilidad.length,
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      path: '/disponibilidad',
      color: '#7b1fa2'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: 'box-shadow 0.3s',
                '&:hover': {
                  boxShadow: 8,
                },
                bgcolor: '#f8f9fa',
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2
              }}
            >
              <CardActionArea onClick={() => navigate(item.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                  <Box
                    sx={{
                      backgroundColor: item.color,
                      borderRadius: '50%',
                      p: 1.5,
                      mb: 2,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center', mb: 1, fontSize: 18, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: item.color, fontSize: 40 }}>
                    {item.count}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 