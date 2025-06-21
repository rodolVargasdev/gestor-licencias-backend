const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configuración que simula el frontend
const API_URL = 'http://localhost:3000';
const TEST_FILE_PATH = path.join(__dirname, 'test-frontend.xlsx');

// Crear un archivo Excel de prueba
const XLSX = require('xlsx');

function createTestFile() {
  const testData = [
    ['Código', 'Nombre Completo', 'Email', 'Teléfono', 'Departamento', 'Puesto', 'Tipo Personal', 'Fecha Ingreso', 'Activo'],
    ['FRONT001', 'Ana López Frontend', 'ana.frontend@empresa.com', '111222333', 'RRHH', 'Analista', 'ADMINISTRATIVO', '2024-01-15', 'Sí'],
    ['FRONT002', 'Carlos Ruiz Frontend', 'carlos.frontend@empresa.com', '444555666', 'IT', 'Desarrollador', 'OPERATIVO', '2024-02-01', 'Sí']
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(testData);
  XLSX.utils.book_append_sheet(wb, ws, 'Frontend Test');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  fs.writeFileSync(TEST_FILE_PATH, excelBuffer);
  console.log('✅ Archivo de prueba frontend creado:', TEST_FILE_PATH);
}

async function testFrontendImport() {
  try {
    console.log('🚀 Iniciando prueba de importación (simulando frontend)...');
    
    // Crear archivo de prueba
    createTestFile();
    
    // Simular exactamente lo que hace el frontend
    const formData = new FormData();
    formData.append('file', fs.createReadStream(TEST_FILE_PATH));
    
    console.log('📤 Enviando archivo a la API (simulando frontend)...');
    console.log('URL:', `${API_URL}/api/trabajadores/import`);
    console.log('Headers:', {
      'Content-Type': 'multipart/form-data',
      ...formData.getHeaders()
    });
    
    // Hacer la petición exactamente como el frontend
    const response = await axios.post(`${API_URL}/api/trabajadores/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...formData.getHeaders()
      },
      timeout: 30000,
      withCredentials: true // Simular withCredentials del frontend
    });
    
    console.log('✅ Respuesta exitosa (frontend):');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error en la prueba (frontend):');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    // Limpiar archivo de prueba
    if (fs.existsSync(TEST_FILE_PATH)) {
      fs.unlinkSync(TEST_FILE_PATH);
      console.log('🧹 Archivo de prueba frontend eliminado');
    }
  }
}

// Ejecutar la prueba
testFrontendImport(); 