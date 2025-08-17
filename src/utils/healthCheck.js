/**
 * Verificación de salud del backend
 */
export const healthCheck = async () => {
  console.log('🏥 === VERIFICACIÓN DE SALUD DEL BACKEND ===');
  
  const baseUrl = 'https://flores-backend-px2c.onrender.com/api';
  
  try {
    // Test 1: Endpoint raíz
    console.log('📡 Test 1: Endpoint raíz...');
    const rootResponse = await fetch(`${baseUrl}/`);
    console.log('✅ Endpoint raíz:', rootResponse.status, rootResponse.statusText);
    
    // Test 2: Endpoint de floristerías
    console.log('🏪 Test 2: Endpoint de floristerías...');
    const floristeriasResponse = await fetch(`${baseUrl}/floristerias`);
    console.log('✅ Floristerías:', floristeriasResponse.status, floristeriasResponse.statusText);
    
    // Test 3: Endpoint de productos (GET)
    console.log('🌸 Test 3: Endpoint de productos (GET)...');
    const productosResponse = await fetch(`${baseUrl}/flores`);
    console.log('✅ Productos GET:', productosResponse.status, productosResponse.statusText);
    
    // Test 4: Endpoint de productos (POST) sin datos
    console.log('➕ Test 4: Endpoint de productos (POST) sin datos...');
    const postResponse = await fetch(`${baseUrl}/flores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    console.log('✅ Productos POST:', postResponse.status, postResponse.statusText);
    
    // Test 5: Verificar si el servidor está vivo
    console.log('💓 Test 5: Verificar si el servidor está vivo...');
    const pingResponse = await fetch(`${baseUrl}/ping`);
    console.log('✅ Ping:', pingResponse.status, pingResponse.statusText);
    
    return {
      success: true,
      message: 'Verificación completada',
      results: {
        root: rootResponse.status,
        floristerias: floristeriasResponse.status,
        productosGet: productosResponse.status,
        productosPost: postResponse.status,
        ping: pingResponse.status
      }
    };
    
  } catch (error) {
    console.error('❌ Error en verificación de salud:', error);
    return {
      success: false,
      message: 'Error en la verificación',
      error: error.message
    };
  }
};

/**
 * Probar endpoint específico
 */
export const testEndpoint = async (endpoint, method = 'GET', data = null) => {
  console.log(`🧪 Probando ${method} ${endpoint}...`);
  
  const baseUrl = 'https://flores-backend-px2c.onrender.com/api';
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    console.log(`📡 Respuesta de ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      try {
        const responseData = await response.json();
        console.log('✅ Datos de respuesta:', responseData);
      } catch {
        console.log('✅ Respuesta exitosa (sin datos JSON)');
      }
    } else {
      try {
        const errorData = await response.text();
        console.log('❌ Error del servidor:', errorData);
      } catch {
        console.log('❌ Error del servidor (sin detalles)');
      }
    }
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };
    
  } catch (error) {
    console.error(`❌ Error probando ${endpoint}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};
