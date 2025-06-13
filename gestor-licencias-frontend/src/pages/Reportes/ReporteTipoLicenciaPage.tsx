import { useEffect, useState } from 'react';
import { getReportePorTipoLicencia } from '../../services/reportes.service';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Select, MenuItem, TextField, Button } from '@mui/material';

const tiposLicencia = [
  { id: 1, nombre: 'Permiso personal con goce de salario' },
  { id: 2, nombre: 'Permiso personal sin goce de salario' },
  { id: 3, nombre: 'Licencia por enfermedad (certificación médica)' },
  { id: 4, nombre: 'Licencia por enfermedad gravísima de pariente' },
  { id: 5, nombre: 'Licencia por duelo' },
  { id: 6, nombre: 'Licencia por maternidad' },
  { id: 7, nombre: 'Licencia por lactancia materna' },
  { id: 8, nombre: 'Licencia por paternidad, nacimiento o adopción' },
  { id: 9, nombre: 'Permiso por matrimonio' },
  { id: 10, nombre: 'Licencia por vacaciones anuales' },
  { id: 11, nombre: 'Permiso por cargo en juntas receptoras de votos' },
  { id: 12, nombre: 'Permiso por ser llamado a conformar jurado' },
  { id: 13, nombre: 'Olvido de marcación de entrada' },
  { id: 14, nombre: 'Olvido de marcación de salida' },
  { id: 15, nombre: 'Cambio de turno' },
  { id: 16, nombre: 'Movimiento de recurso humano en plan de trabajo mensual' }
];

export default function ReporteTipoLicenciaPage() {
  const [reporte, setReporte] = useState<any[]>([]);
  const [tipoLicencia, setTipoLicencia] = useState<number>(1);
  const [fechaInicio, setFechaInicio] = useState('2025-06-01');
  const [fechaFin, setFechaFin] = useState('2025-12-31');
  const [loading, setLoading] = useState(false);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const res = await getReportePorTipoLicencia(tipoLicencia, fechaInicio, fechaFin);
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
      <Typography variant="h5" gutterBottom>Reporte por Tipo de Licencia</Typography>
      <Box display="flex" gap={2} mb={2}>
        <Select value={tipoLicencia} onChange={e => setTipoLicencia(Number(e.target.value))}>
          {tiposLicencia.map(t => (
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
              <TableCell>Tipo de Licencia</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Total Solicitudes</TableCell>
              <TableCell>Aprobadas</TableCell>
              <TableCell>Rechazadas</TableCell>
              <TableCell>Pendientes</TableCell>
              <TableCell>Días Utilizados</TableCell>
              <TableCell>Horas Utilizadas</TableCell>
              <TableCell>Tiempo Promedio Respuesta (h)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reporte.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.tipo_licencia}</TableCell>
                <TableCell>{row.departamento}</TableCell>
                <TableCell>{row.total_solicitudes}</TableCell>
                <TableCell>{row.solicitudes_aprobadas}</TableCell>
                <TableCell>{row.solicitudes_rechazadas}</TableCell>
                <TableCell>{row.solicitudes_pendientes}</TableCell>
                <TableCell>{row.total_dias_utilizados}</TableCell>
                <TableCell>{row.total_horas_utilizadas}</TableCell>
                <TableCell>{row.tiempo_promedio_respuesta_horas}</TableCell>
              </TableRow>
            ))}
            {reporte.length === 0 && !loading && (
              <TableRow><TableCell colSpan={9} align="center">Sin datos</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
} 