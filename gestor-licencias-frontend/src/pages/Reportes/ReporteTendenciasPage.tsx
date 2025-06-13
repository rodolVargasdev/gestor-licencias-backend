import { useEffect, useState } from 'react';
import { getReporteTendencias } from '../../services/reportes.service';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField, Button } from '@mui/material';

export default function ReporteTendenciasPage() {
  const [reporte, setReporte] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState('2025-06-01');
  const [fechaFin, setFechaFin] = useState('2025-12-31');
  const [loading, setLoading] = useState(false);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const res = await getReporteTendencias(fechaInicio, fechaFin);
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
      <Typography variant="h5" gutterBottom>Reporte de Tendencias de Uso</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField type="date" label="Desde" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField type="date" label="Hasta" value={fechaFin} onChange={e => setFechaFin(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" onClick={fetchReporte} disabled={loading}>Buscar</Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mes</TableCell>
              <TableCell>Tipo de Licencia</TableCell>
              <TableCell>Total Solicitudes</TableCell>
              <TableCell>Aprobadas</TableCell>
              <TableCell>Rechazadas</TableCell>
              <TableCell>Días Utilizados</TableCell>
              <TableCell>Horas Utilizadas</TableCell>
              <TableCell>Tiempo Promedio Respuesta (h)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reporte.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.mes?.slice(0, 7)}</TableCell>
                <TableCell>{row.tipo_licencia}</TableCell>
                <TableCell>{row.total_solicitudes}</TableCell>
                <TableCell>{row.solicitudes_aprobadas}</TableCell>
                <TableCell>{row.solicitudes_rechazadas}</TableCell>
                <TableCell>{row.total_dias_utilizados}</TableCell>
                <TableCell>{row.total_horas_utilizadas}</TableCell>
                <TableCell>{row.tiempo_promedio_respuesta_horas}</TableCell>
              </TableRow>
            ))}
            {reporte.length === 0 && !loading && (
              <TableRow><TableCell colSpan={8} align="center">Sin datos</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
} 