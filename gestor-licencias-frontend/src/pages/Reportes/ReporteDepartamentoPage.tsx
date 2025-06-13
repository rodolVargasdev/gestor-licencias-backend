import { useEffect, useState } from 'react';
import { getReportePorDepartamento } from '../../services/reportes.service';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Select, MenuItem, TextField, Button } from '@mui/material';

const departamentos = [
  { id: 1, nombre: 'MEDICOS' },
  { id: 2, nombre: 'CALL CENTER' },
  { id: 3, nombre: 'ENFERMERÍA' },
  { id: 4, nombre: 'ADMINISTRACIÓN' },
  { id: 5, nombre: 'RECURSOS HUMANOS' },
  { id: 6, nombre: 'LABORATORIO' },
  { id: 7, nombre: 'FARMACIA' }
];

export default function ReporteDepartamentoPage() {
  const [reporte, setReporte] = useState<any[]>([]);
  const [departamento, setDepartamento] = useState<number>(1);
  const [fechaInicio, setFechaInicio] = useState('2025-06-01');
  const [fechaFin, setFechaFin] = useState('2025-12-31');
  const [loading, setLoading] = useState(false);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const res = await getReportePorDepartamento(departamento, fechaInicio, fechaFin);
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
      <Typography variant="h5" gutterBottom>Reporte de Licencias por Departamento</Typography>
      <Box display="flex" gap={2} mb={2}>
        <Select value={departamento} onChange={e => setDepartamento(Number(e.target.value))}>
          {departamentos.map(dep => (
            <MenuItem key={dep.id} value={dep.id}>{dep.nombre}</MenuItem>
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
              <TableCell>Departamento</TableCell>
              <TableCell>Tipo de Licencia</TableCell>
              <TableCell>Total Solicitudes</TableCell>
              <TableCell>Aprobadas</TableCell>
              <TableCell>Rechazadas</TableCell>
              <TableCell>Pendientes</TableCell>
              <TableCell>Días Utilizados</TableCell>
              <TableCell>Horas Utilizadas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reporte.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.departamento}</TableCell>
                <TableCell>{row.tipo_licencia}</TableCell>
                <TableCell>{row.total_solicitudes}</TableCell>
                <TableCell>{row.solicitudes_aprobadas}</TableCell>
                <TableCell>{row.solicitudes_rechazadas}</TableCell>
                <TableCell>{row.solicitudes_pendientes}</TableCell>
                <TableCell>{row.total_dias_utilizados}</TableCell>
                <TableCell>{row.total_horas_utilizadas}</TableCell>
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