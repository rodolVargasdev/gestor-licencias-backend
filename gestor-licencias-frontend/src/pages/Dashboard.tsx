import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { fetchDepartamentos } from '../store/slices/departamentosSlice';
import { fetchTrabajadores } from '../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../store/slices/tiposLicenciasSlice';
import { fetchValidaciones } from '../store/slices/validacionesSlice';
import { fetchLicencias } from '../store/slices/licenciasSlice';
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
import SettingsIcon from '@mui/icons-material/Settings';
import type { Licencia } from '../types/licencia';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const departamentos = useSelector((state: RootState) => state.departamentos.items);
  const trabajadores = useSelector((state: RootState) => state.trabajadores.items);
  const tiposLicencias = useSelector((state: RootState) => state.tiposLicencias.items);
  const validaciones = useSelector((state: RootState) => state.validaciones.items);
  const licencias = useSelector((state: RootState) => (state.licencias as { items: Licencia[] }).items);

  useEffect(() => {
    dispatch(fetchDepartamentos());
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
    dispatch(fetchValidaciones());
    dispatch(fetchLicencias());
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
      title: 'Configuración',
      count: 0,
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      path: '/configuracion',
      color: '#0288d1'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card>
              <CardActionArea onClick={() => navigate(item.path)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: item.color,
                        borderRadius: '50%',
                        p: 1,
                        mr: 2,
                        color: 'white'
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant="h6">{item.title}</Typography>
                  </Box>
                  <Typography variant="h4" align="center">
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