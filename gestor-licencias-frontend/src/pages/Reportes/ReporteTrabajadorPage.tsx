import { useEffect, useState } from 'react';
import { getReportePorTrabajador } from '../../services/reportes.service';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Select, MenuItem, TextField, Button } from '@mui/material';

const trabajadores = [
  { id: 1, nombre: 'PLATERO DIAZ ZOILA ALEXANDRA' },
  { id: 2, nombre: 'LOPEZ HUEZO YENICEL ZOBEYDA' },
  { id: 3, nombre: 'NAVAS DELGADO DANIEL ERNESTO' },
  { id: 4, nombre: 'MARTINEZ GARCIA LUIS ALBERTO' },
  { id: 5, nombre: 'RAMIREZ PEREZ ANA SOFIA' },
  { id: 6, nombre: 'CASTILLO MENDEZ JORGE ENRIQUE' },
  { id: 7, nombre: 'MENDEZ LOPEZ MARIA JOSE' },
  { id: 8, nombre: 'GONZALEZ RIVERA SANDRA ELENA' }
];

export default function ReporteTrabajadorPage() {
  const [reporte, setReporte] = useState<any[]>([]);
  const [trabajador, setTrabajador] = useState<number>(1);
  const [fechaInicio, setFechaInicio] = useState('2025-06-01');
  const [fechaFin, setFechaFin] = useState('2025-12-31');
  const [loading, setLoading] = useState(false);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const res = await getReportePorTrabajador(trabajador, fechaInicio, fechaFin);
      setReporte(res.data.data || []);
    } catch (e) {
      setReporte([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReporte();
    // eslint-disable-next-line
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Reporte de Licencias por Trabajador</Typography>
      <Box display="flex" gap={2} mb={2}>
        <Select value={trabajador} onChange={e => setTrabajador(Number(e.target.value))}>
          {trabajadores.map(t => (
            <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
          ))}
        </Select>
        <TextField type="date" label="Desde" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField type="date" label="Hasta" value={fechaFin} onChange={e => setFechaFin(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" onClick={fetchReporte} disabled={loading}>Buscar</Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Trabajador</TableCell>
              <TableCell>Tipo de Licencia</TableCell>
              <TableCell>Total Solicitudes</TableCell>
              <TableCell>Aprobadas</TableCell>
              <TableCell>Rechazadas</TableCell>
              <TableCell>Pendientes</TableCell>
              <TableCell>Días Utilizados</TableCell>
              <TableCell>Horas Utilizadas</TableCell>
              <TableCell>Motivos Rechazo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reporte.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.codigo_trabajador}</TableCell>
                <TableCell>{row.nombre_completo}</TableCell>
                <TableCell>{row.tipo_licencia}</TableCell>
                <TableCell>{row.total_solicitudes}</TableCell>
                <TableCell>{row.solicitudes_aprobadas}</TableCell>
                <TableCell>{row.solicitudes_rechazadas}</TableCell>
                <TableCell>{row.solicitudes_pendientes}</TableCell>
                <TableCell>{row.total_dias_utilizados}</TableCell>
                <TableCell>{row.total_horas_utilizadas}</TableCell>
                <TableCell>{row.motivos_rechazo}</TableCell>
              </TableRow>
            ))}
            {reporte.length === 0 && !loading && (
              <TableRow><TableCell colSpan={10} align="center">Sin datos</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
} 