import { getAxiosInstance } from '../api';

/**
 * Utilidad para probar la conexión a la API y diagnosticar problemas
 */
export const testApiConnection = async (token) => {
  console.log('🧪 Iniciando pruebas de conexión API...');
  
  try {
    const axiosInstance = getAxiosInstance(token);
    
    console.log('🔑 Token disponible:', !!token);
    console.log('🌐 URL base:', axiosInstance.defaults.baseURL);
    console.log('📋 Headers por defecto:', axiosInstance.defaults.headers);
    
    // Test 1: Verificar que la API responde
    console.log('📡 Test 1: Verificando respuesta de la API...');
    const healthCheck = await axiosInstance.get('/');
    console.log('✅ API responde:', healthCheck.status, healthCheck.statusText);
    
    // Test 2: Verificar endpoint de floristerías
    console.log('🏪 Test 2: Verificando endpoint de floristerías...');
    const floristerias = await axiosInstance.get('/floristerias');
    console.log('✅ Floristerías obtenidas:', floristerias.data.length);
    
    // Test 3: Verificar endpoint de productos
    console.log('🌸 Test 3: Verificando endpoint de productos...');
    const productos = await axiosInstance.get('/flores');
    console.log('✅ Productos obtenidos:', productos.data.length);
    
    return {
      success: true,
      message: 'Todas las pruebas pasaron exitosamente',
      data: {
        floristerias: floristerias.data.length,
        productos: productos.data.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error en las pruebas de API:', error);
    
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    };
    
    console.error('📊 Detalles del error:', errorDetails);
    
    return {
      success: false,
      message: 'Error en las pruebas de API',
      error: errorDetails
    };
  }
};

/**
 * Probar la creación de un producto de prueba
 */
export const testProductCreation = async (token, testData) => {
  console.log('🧪 Probando creación de producto...');
  console.log('📋 Datos de prueba:', testData);
  
  try {
    const axiosInstance = getAxiosInstance(token);
    
    const formData = new FormData();
    Object.keys(testData).forEach(key => {
      formData.append(key, testData[key]);
    });
    
    console.log('📝 FormData creado:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await axiosInstance.post('/flores', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('✅ Producto creado exitosamente:', response.data);
    
    return {
      success: true,
      data: response.data
    };
    
  } catch (error) {
    console.error('❌ Error al crear producto de prueba:', error);
    
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};
