/**
 * Pruebas simples del backend para identificar el error 500
 */
export const testBackendSimple = async () => {
  console.log('🧪 === PRUEBA SIMPLE DEL BACKEND ===');
  
  const baseUrl = 'https://flores-backend-px2c.onrender.com/api';
  
  try {
    // Test 1: Verificar si el servidor responde
    console.log('📡 Test 1: Verificar si el servidor responde...');
    const response = await fetch(baseUrl);
    console.log('✅ Servidor responde:', response.status, response.statusText);
    
    // Test 2: Probar endpoint de floristerías
    console.log('🏪 Test 2: Probar endpoint de floristerías...');
    const floristeriasResponse = await fetch(`${baseUrl}/floristerias`);
    console.log('✅ Floristerías:', floristeriasResponse.status, floristeriasResponse.statusText);
    
    // Test 3: Probar GET de productos
    console.log('🌸 Test 3: Probar GET de productos...');
    const productosGetResponse = await fetch(`${baseUrl}/flores`);
    console.log('✅ Productos GET:', productosGetResponse.status, productosGetResponse.statusText);
    
    // Test 4: Probar POST de productos con datos mínimos
    console.log('➕ Test 4: Probar POST de productos con datos mínimos...');
    const postResponse = await fetch(`${baseUrl}/flores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: 'TEST_MINIMO',
        descripcion: 'Test',
        precio: '1',
        stock: '1',
        categoria: 'Flores',
        floristeria: 'test'
      })
    });
    
    console.log('✅ Productos POST:', postResponse.status, postResponse.statusText);
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.log('❌ Error del servidor:', errorText);
    }
    
    return {
      success: true,
      message: 'Pruebas completadas',
      results: {
        server: response.status,
        floristerias: floristeriasResponse.status,
        productosGet: productosGetResponse.status,
        productosPost: postResponse.status
      }
    };
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    return {
      success: false,
      message: 'Error en las pruebas',
      error: error.message
    };
  }
};

/**
 * Probar POST con diferentes tipos de datos
 */
export const testPostVariations = async () => {
  console.log('🧪 === PRUEBAS DE POST CON VARIACIONES ===');
  
  const baseUrl = 'https://flores-backend-px2c.onrender.com/api';
  
  const tests = [
    {
      name: 'Datos completos sin imagen',
      data: {
        nombre: 'TEST_COMPLETO',
        descripcion: 'Descripción completa',
        precio: '10.50',
        stock: '5',
        categoria: 'Canastas con vino',
        floristeria: 'test'
      }
    },
    {
      name: 'Datos mínimos',
      data: {
        nombre: 'TEST_MINIMO',
        precio: '1',
        stock: '1',
        categoria: 'Flores',
        floristeria: 'test'
      }
    },
    {
      name: 'Solo nombre (debería fallar)',
      data: {
        nombre: 'TEST_SOLO_NOMBRE'
      }
    }
  ];
  
  for (const test of tests) {
    console.log(`\n🧪 Probando: ${test.name}`);
    console.log('📋 Datos:', test.data);
    
    try {
      const response = await fetch(`${baseUrl}/flores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.data)
      });
      
      console.log(`📡 Respuesta: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Éxito:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ Error:', errorText);
      }
      
    } catch (error) {
      console.error('❌ Error de red:', error.message);
    }
  }
};

/**
 * Probar con FormData simple
 */
export const testFormData = async () => {
  console.log('🧪 === PRUEBA CON FORMDATA ===');
  
  const baseUrl = 'https://flores-backend-px2c.onrender.com/api';
  
  try {
    const formData = new FormData();
    formData.append('nombre', 'TEST_FORMDATA');
    formData.append('descripcion', 'Test con FormData');
    formData.append('precio', '1');
    formData.append('stock', '1');
    formData.append('categoria', 'Flores');
    formData.append('floristeria', 'test');
    
    console.log('📋 FormData creado');
    
    const response = await fetch(`${baseUrl}/flores`, {
      method: 'POST',
      body: formData
    });
    
    console.log('📡 Respuesta FormData:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error del servidor:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Éxito FormData:', data);
    }
    
  } catch (error) {
    console.error('❌ Error con FormData:', error);
  }
};
