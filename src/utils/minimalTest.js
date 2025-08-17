/**
 * Test mínimo para identificar el error 500
 */
export const minimalTest = async () => {
  console.log('🧪 === TEST MÍNIMO PARA ERROR 500 ===');
  
  const baseUrl = 'https://flores-backend-px2c.onrender.com/api';
  
  try {
    // Test 1: Solo verificar si el servidor responde
    console.log('📡 Test 1: Servidor responde...');
    const response = await fetch(baseUrl);
    console.log('✅ Servidor:', response.status, response.statusText);
    
    // Test 2: POST con solo nombre (debería fallar pero no con 500)
    console.log('📝 Test 2: POST con solo nombre...');
    const postResponse = await fetch(`${baseUrl}/flores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: 'TEST_SOLO_NOMBRE'
      })
    });
    
    console.log('📡 Respuesta POST:', postResponse.status, postResponse.statusText);
    
    if (postResponse.status === 500) {
      console.log('🚨 ERROR 500 DETECTADO!');
      const errorText = await postResponse.text();
      console.log('📋 Error completo:', errorText);
      
      // Intentar obtener más detalles
      try {
        const errorJson = JSON.parse(errorText);
        console.log('🔍 Error parseado:', errorJson);
      } catch (e) {
        console.log('📝 Error como texto:', errorText);
      }
    } else if (postResponse.status === 400) {
      console.log('✅ Error 400 (esperado para datos incompletos)');
      const errorText = await postResponse.text();
      console.log('📋 Mensaje de validación:', errorText);
    } else {
      console.log('❓ Estado inesperado:', postResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
};

/**
 * Test de conexión a MongoDB
 */
export const testMongoConnection = async () => {
  console.log('🗄️ === TEST DE CONEXIÓN MONGODB ===');
  
  const baseUrl = 'https://flores-backend-px2c.onrender.com/api';
  
  try {
    // Intentar acceder a un endpoint que use MongoDB
    console.log('📡 Probando conexión a MongoDB...');
    
    const response = await fetch(`${baseUrl}/floristerias`);
    console.log('📊 Floristerías:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:', data.length, 'floristerías');
      console.log('🔍 Primera floristería:', data[0]);
    } else {
      console.log('❌ Error al obtener floristerías');
    }
    
  } catch (error) {
    console.error('❌ Error en test de MongoDB:', error);
  }
};
