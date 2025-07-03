const { renovarDisponibilidad } = require('./src/scripts/renovar-disponibilidad');

async function testRenovacionDisponibilidad() {
  console.log('🧪 Iniciando prueba de renovación de disponibilidad...');
  
  try {
    await renovarDisponibilidad();
    console.log('✅ Prueba completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar la prueba
testRenovacionDisponibilidad(); 