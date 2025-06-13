import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ReportesIndex() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Reportes</Typography>
      <List>
        <ListItem button component={Link} to="/reportes/departamento">
          <ListItemText primary="Reporte por Departamento" />
        </ListItem>
        <ListItem button component={Link} to="/reportes/trabajador">
          <ListItemText primary="Reporte por Trabajador" />
        </ListItem>
        <ListItem button component={Link} to="/reportes/tipo-licencia">
          <ListItemText primary="Reporte por Tipo de Licencia" />
        </ListItem>
        <ListItem button component={Link} to="/reportes/tendencias">
          <ListItemText primary="Reporte de Tendencias" />
        </ListItem>
      </List>
    </Box>
  );
} 