import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkIcon from '@mui/icons-material/Work';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Licencias', icon: <EventNoteIcon />, path: '/licencias' },
    { text: 'Disponibilidad', icon: <AccessTimeIcon />, path: '/disponibilidad' },
    { text: 'Trabajadores', icon: <PeopleIcon />, path: '/trabajadores' },
    { text: 'Tipos de Licencias', icon: <AssignmentIcon />, path: '/tipos-licencias' },
    { text: 'Departamentos', icon: <BusinessIcon />, path: '/departamentos' },
    { text: 'Puestos', icon: <WorkIcon />, path: '/puestos' },
    // { text: 'Validaciones', icon: <CheckCircleIcon />, path: '/validaciones' },
    // { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' }
  ];

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Gestor de Licencias 
          </Typography>
          <img src="/favicon.ico" alt="Logo" style={{ width: 32, height: 32, marginLeft: 10 }} />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: open ? drawerWidth : 10 }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="persistent"
            open={open}
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 