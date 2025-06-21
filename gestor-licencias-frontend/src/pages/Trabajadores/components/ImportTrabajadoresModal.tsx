import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { trabajadoresService } from '../../../services/trabajadores.service';
import * as XLSX from 'xlsx';

interface ImportTrabajadoresModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  total: number;
  success: number;
  errors: Array<{ row: number; error: string }>;
  duplicates: number;
}

const ImportTrabajadoresModal: React.FC<ImportTrabajadoresModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 5MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setImportResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.xlsx') && !droppedFile.name.endsWith('.xls')) {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 5MB');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setImportResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      console.log('🚀 Iniciando importación desde modal...');
      console.log('Archivo seleccionado:', file.name, file.size, file.type);
      
      const result = await trabajadoresService.importFromExcel(file);
      console.log('✅ Importación exitosa:', result);
      
      setImportResult(result.data);
      onSuccess();
    } catch (err: unknown) {
      console.error('❌ Error en importación desde modal:', err);
      
      let errorMessage = 'Error al importar el archivo';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ['Código', 'Nombre Completo', 'Email', 'Teléfono', 'Departamento', 'Puesto', 'Tipo Personal', 'Fecha Ingreso', 'Activo'],
      ['EMP001', 'Juan Pérez', 'juan.perez@empresa.com', '123456789', 'RRHH', 'Analista', 'ADMINISTRATIVO', '2024-01-15', 'Sí'],
      ['EMP002', 'María García', 'maria.garcia@empresa.com', '987654321', 'IT', 'Desarrollador', 'OPERATIVO', '2024-02-01', 'Sí']
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const columnWidths = [
      { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ];
    ws['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_trabajadores.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>Importar Trabajadores</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {!importResult ? (
          <Box>
            <Paper elevation={0} sx={{ background: '#f8fafc', border: '1px solid #e0e7ef', borderRadius: 2, p: 3, mb: 3 }}>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                Sube un archivo Excel con los datos de los trabajadores. El archivo debe contener las siguientes columnas:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 24, fontSize: 15 }}>
                <li><b>Código</b> <span style={{ color: '#1976d2' }}>(obligatorio)</span></li>
                <li><b>Nombre Completo</b> <span style={{ color: '#1976d2' }}>(obligatorio)</span></li>
                <li><b>Email</b> <span style={{ color: '#1976d2' }}>(obligatorio)</span></li>
                <li><b>Teléfono</b> (opcional)</li>
                <li><b>Departamento</b> (opcional)</li>
                <li><b>Puesto</b> (opcional)</li>
                <li><b>Tipo Personal</b> <span style={{ color: '#1976d2' }}>(OPERATIVO o ADMINISTRATIVO)</span></li>
                <li><b>Fecha Ingreso</b> <span style={{ color: '#1976d2' }}>(formato: YYYY-MM-DD)</span></li>
                <li><b>Activo</b> <span style={{ color: '#1976d2' }}>(Sí/No)</span></li>
              </ul>
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                  sx={{ fontWeight: 600, fontSize: 15, px: 3, py: 1.2 }}
                >
                  Descargar Template
                </Button>
              </Box>
            </Paper>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box
              sx={{
                border: '2px dashed',
                borderColor: file ? 'success.main' : 'grey.400',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                backgroundColor: file ? 'success.50' : '#f4f6fa',
                transition: 'background 0.2s, border 0.2s',
                cursor: 'pointer',
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180
              }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: file ? '#43a04722' : '#e3eafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <UploadIcon sx={{ fontSize: 40, color: file ? 'success.main' : 'primary.light' }} />
              </Box>
              {file ? (
                <Box>
                  <Typography variant="h6" color="success.main" fontWeight={700}>
                    Archivo seleccionado
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" color="textSecondary" fontWeight={600}>
                    Arrastra y suelta un archivo Excel aquí
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    o haz clic para seleccionar un archivo
                  </Typography>
                </Box>
              )}
            </Box>
            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Importando trabajadores...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Alert
              severity={importResult.success > 0 ? "success" : "error"}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">
                Importación completada
              </Typography>
              <Typography variant="body2">
                {importResult.success} de {importResult.total} trabajadores importados exitosamente
                {importResult.duplicates > 0 && ` (${importResult.duplicates} duplicados omitidos)`}
              </Typography>
            </Alert>
            {importResult.errors.length > 0 && (
              <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto', background: '#fff8f6', border: '1px solid #ffe0e0' }}>
                <Typography variant="h6" sx={{ mb: 1 }} color="error">
                  Errores encontrados ({importResult.errors.length}):
                </Typography>
                <List dense>
                  {importResult.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Fila ${error.row}: ${error.error}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!importResult ? (
          <>
            <Button onClick={handleClose} variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isUploading}
              variant="contained"
              color="primary"
              sx={{
                fontWeight: 700,
                fontSize: 16,
                px: 4,
                py: 1.2,
                backgroundColor: !file || isUploading ? '#e3eafc' : undefined,
                color: !file || isUploading ? '#b0b8c9' : undefined,
                boxShadow: 'none',
                border: !file || isUploading ? '1px solid #b0b8c9' : undefined
              }}
            >
              {isUploading ? 'Importando...' : 'Importar'}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained" color="primary" sx={{ fontWeight: 700, fontSize: 16, px: 4, py: 1.2 }}>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportTrabajadoresModal; 